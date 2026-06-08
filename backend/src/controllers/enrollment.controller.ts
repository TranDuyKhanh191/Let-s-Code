import { Request, Response } from 'express';
import { EnrollmentService } from '../services/enrollment.service';

const enrollmentService = new EnrollmentService();

export class EnrollmentController {
  
  async assignCourse(req: Request, res: Response) {
    try {
      const { student_id, course_id, start_at, end_at } = req.body;
      if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Missing student_id or course_id' });
      }
      
      const enrollment = await enrollmentService.assignCourseToStudent(
        Number(student_id), 
        Number(course_id),
        start_at ? new Date(start_at).toISOString() : null,
        end_at ? new Date(end_at).toISOString() : null
      );
      res.status(201).json({ message: 'Assigned successfully', enrollment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async revokeCourse(req: Request, res: Response) {
    try {
      const { student_id, course_id } = req.body;
      if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Missing student_id or course_id' });
      }

      const enrollment = await enrollmentService.revokeCourseFromStudent(Number(student_id), Number(course_id));
      res.json({ message: 'Revoked successfully', enrollment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEnrollment(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status, start_at, end_at } = req.body;

      const updated = await enrollmentService.updateEnrollment(id, {
        status,
        start_at: start_at ? new Date(start_at).toISOString() : null,
        end_at: end_at ? new Date(end_at).toISOString() : null
      });

      res.json({ success: true, updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllEnrollments(req: Request, res: Response) {
    try {
      const enrollments = await enrollmentService.getAllEnrollments();
      res.json({ enrollments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyCourses(req: Request, res: Response) {
    try {
      const studentId = (req as any).user?.id;
      if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

      const courses = await enrollmentService.getStudentCourses(Number(studentId));
      res.json({ success: true, courses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
