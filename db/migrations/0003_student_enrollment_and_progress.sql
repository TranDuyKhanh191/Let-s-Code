-- Tạo bảng enrollments (Ghi danh khóa học cho học sinh)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Tạo bảng lesson_progress (Theo dõi tiến độ học tập và nộp bài)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'chưa học', -- chưa học, đang học, đã nộp bài
    submitted_file_url TEXT,
    score INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- Bật RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLICIES CHO BẢNG ENROLLMENTS
-- ==========================================

-- Admin toàn quyền
CREATE POLICY "Admin can do all on enrollments" ON public.enrollments 
  FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');

-- Giáo viên được xem học sinh nào ghi danh vào khóa do mình phụ trách
CREATE POLICY "Teacher can view enrollments for assigned courses" ON public.enrollments 
  FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM assignments 
    WHERE assignments.resource_id = enrollments.course_id 
      AND assignments.resource_type = 'course' 
      AND assignments.teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Học sinh chỉ xem được danh sách ghi danh của chính mình
CREATE POLICY "Student can view own enrollments" ON public.enrollments 
  FOR SELECT TO public USING (
  student_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
);

-- ==========================================
-- POLICIES CHO BẢNG LESSON_PROGRESS
-- ==========================================

-- Admin toàn quyền
CREATE POLICY "Admin can do all on lesson_progress" ON public.lesson_progress 
  FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');

-- Giáo viên được quyền xem và cập nhật (chấm điểm) cho các bài tập thuộc khóa mình phụ trách
CREATE POLICY "Teacher can view and grade progress" ON public.lesson_progress 
  FOR ALL TO public USING (
  EXISTS (
    SELECT 1 FROM lessons
    JOIN assignments ON assignments.resource_id = lessons.course_id
    WHERE lessons.id = lesson_progress.lesson_id
      AND assignments.resource_type = 'course' 
      AND assignments.teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Học sinh được xem, tạo mới và cập nhật trạng thái học tập (nộp bài) của chính mình
CREATE POLICY "Student can view and update own progress" ON public.lesson_progress 
  FOR ALL TO public USING (
  student_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
);

-- ==========================================
-- BỔ SUNG POLICIES CHO BẢNG COURSES & LESSONS (Cho học sinh)
-- ==========================================

-- Học sinh chỉ xem được các KHÓA HỌC mà mình đã được ghi danh
CREATE POLICY "Student can view enrolled courses" ON public.courses 
  FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = courses.id
      AND enrollments.student_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Học sinh chỉ xem được các BÀI HỌC thuộc khóa học mà mình đã được ghi danh
CREATE POLICY "Student can view enrolled lessons" ON public.lessons 
  FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.course_id = lessons.course_id
      AND enrollments.student_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);
