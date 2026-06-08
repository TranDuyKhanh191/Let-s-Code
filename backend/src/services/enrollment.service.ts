import { supabase } from '../config/supabase';

export class EnrollmentService {
  /**
   * Enroll a student in a course
   */
  async assignCourseToStudent(studentId: number, courseId: number, startAt?: string | null, endAt?: string | null) {
    // Check if user is a student
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', studentId)
      .single();

    if (userError || !user) throw new Error('Student not found');
    if (user.role !== 'student') throw new Error('User is not a student');

    const upsertData: any = { 
      student_id: studentId, 
      course_id: courseId, 
      status: 'active', 
      updated_at: new Date().toISOString() 
    };
    if (startAt !== undefined) upsertData.start_at = startAt;
    if (endAt !== undefined) upsertData.end_at = endAt;

    // Insert or update enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .upsert(upsertData, { onConflict: 'student_id, course_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Revoke/Unenroll a student from a course
   */
  async revokeCourseFromStudent(studentId: number, courseId: number) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .match({ student_id: studentId, course_id: courseId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update enrollment (status, start_at, end_at)
   */
  async updateEnrollment(id: number, updateData: { status?: 'active' | 'revoked', start_at?: string | null, end_at?: string | null }) {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all enrollments for admin
   */
  async getAllEnrollments() {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        users!enrollments_student_id_fkey (id, full_name, email, username),
        courses!enrollments_course_id_fkey (id, name, status)
      `)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all active courses for a student
   */
  async getStudentCourses(studentId: number) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses!enrollments_course_id_fkey (
          *,
          lessons (id, status)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) throw error;
    
    const now = new Date().toISOString();
    return data
      .filter((enr: any) => {
        if (!enr.courses || enr.courses.status !== 'published') return false;
        if (enr.start_at && enr.start_at > now) return false;
        if (enr.end_at && enr.end_at <= now) return false;
        return true;
      })
      .map((enr: any) => {
        const course = enr.courses;
        // Count only published lessons
        const publishedLessons = course.lessons ? course.lessons.filter((l: any) => l.status === 'published') : [];
        course.lesson_count = publishedLessons.length;
        delete course.lessons;
        return course;
      });
  }
}
