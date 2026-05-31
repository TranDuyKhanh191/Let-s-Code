-- Kích hoạt RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Drop các policy cũ nếu có (để script idempotent)
DROP POLICY IF EXISTS "Admin can do all on users" ON public.users;
DROP POLICY IF EXISTS "Users can update own info" ON public.users;
DROP POLICY IF EXISTS "Users can view own info" ON public.users;

DROP POLICY IF EXISTS "Admin can do all on programs" ON public.programs;
DROP POLICY IF EXISTS "Teacher can view assigned programs" ON public.programs;

DROP POLICY IF EXISTS "Admin can do all on courses" ON public.courses;
DROP POLICY IF EXISTS "Teacher can view assigned courses" ON public.courses;
DROP POLICY IF EXISTS "full access" ON public.courses;

DROP POLICY IF EXISTS "Admin can do all on lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teacher can view assigned lessons" ON public.lessons;

DROP POLICY IF EXISTS "Admin can do all on assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teacher can view own assignments" ON public.assignments;

-- Policies cho bảng `users`
-- Admin có toàn quyền trên bảng users
CREATE POLICY "Admin can do all on users" ON public.users FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');
-- Người dùng (giáo viên, học sinh) chỉ được xem và cập nhật thông tin của chính mình
CREATE POLICY "Users can update own info" ON public.users FOR UPDATE TO public USING (id = (NULLIF(auth.jwt() ->> 'id', '')::bigint));
CREATE POLICY "Users can view own info" ON public.users FOR SELECT TO public USING (id = (NULLIF(auth.jwt() ->> 'id', '')::bigint));

-- Policies cho bảng `programs`
CREATE POLICY "Admin can do all on programs" ON public.programs FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Teacher can view assigned programs" ON public.programs FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM assignments 
    WHERE assignments.resource_id = programs.id 
      AND assignments.resource_type = 'program' 
      AND assignments.teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Policies cho bảng `courses`
CREATE POLICY "Admin can do all on courses" ON public.courses FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Teacher can view assigned courses" ON public.courses FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM assignments 
    WHERE assignments.resource_id = courses.id 
      AND assignments.resource_type = 'course' 
      AND assignments.teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Policies cho bảng `lessons`
CREATE POLICY "Admin can do all on lessons" ON public.lessons FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Teacher can view assigned lessons" ON public.lessons FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM assignments 
    WHERE assignments.resource_id = lessons.course_id 
      AND assignments.resource_type = 'course' 
      AND assignments.teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint
  )
);

-- Policies cho bảng `assignments`
CREATE POLICY "Admin can do all on assignments" ON public.assignments FOR ALL TO public USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Teacher can view own assignments" ON public.assignments FOR SELECT TO public USING (
  (auth.jwt() ->> 'role' = 'teacher') AND 
  (teacher_id = NULLIF(auth.jwt() ->> 'id', '')::bigint)
);
