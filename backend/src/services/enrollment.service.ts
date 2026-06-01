import { supabase } from '../config/supabase';

export class EnrollmentService {
  /**
   * Enroll a student in a course
   */
  async assignCourseToStudent(studentId: number, courseId: number) {
    // Check if user is a student
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', studentId)
      .single();

    if (userError || !user) throw new Error('Student not found');
    if (user.role !== 'student') throw new Error('User is not a student');

    // Insert or update enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        { student_id: studentId, course_id: courseId, status: 'active', updated_at: new Date().toISOString() },
        { onConflict: 'student_id, course_id' }
      )
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
    
    return data
      .filter((enr: any) => enr.courses && enr.courses.status === 'published')
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
