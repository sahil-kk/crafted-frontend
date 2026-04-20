-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES (separate table) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper to fetch primary role for a user
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'teacher' THEN 2 ELSE 3 END
  LIMIT 1
$$;

-- ============ COURSES ============
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ============ COURSE ENROLLMENTS ============
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ============ ANNOUNCEMENTS / NEWS ============
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES public.courses(id),
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============ RECORDED CLASSES (YouTube) ============
CREATE TABLE public.recorded_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recorded_classes ENABLE ROW LEVEL SECURITY;

-- ============ EXAMS ============
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id),
  duration_minutes INT NOT NULL DEFAULT 30,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  exam_type TEXT NOT NULL DEFAULT 'weekly',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- ============ QUESTIONS ============
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq', -- mcq | short | long | file
  options JSONB,
  correct_answer TEXT,
  marks NUMERIC NOT NULL DEFAULT 1,
  position INT NOT NULL DEFAULT 0
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- ============ EXAM ATTEMPTS ============
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  max_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | submitted | graded
  UNIQUE(exam_id, student_id)
);
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer TEXT,
  awarded_marks NUMERIC,
  UNIQUE(attempt_id, question_id)
);
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Default new users to student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- courses
CREATE POLICY "Anyone authenticated can view courses" ON public.courses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers/Admins manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- enrollments
CREATE POLICY "Students view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers/Admins manage enrollments" ON public.enrollments
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- announcements
CREATE POLICY "Auth users view announcements" ON public.announcements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers/Admins post announcements" ON public.announcements
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- recorded_classes
CREATE POLICY "Auth users view classes" ON public.recorded_classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers/Admins manage classes" ON public.recorded_classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- exams
CREATE POLICY "Auth users view exams" ON public.exams
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers/Admins manage exams" ON public.exams
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- questions: students should only see questions through their attempt; for simplicity allow read once attempt exists
CREATE POLICY "Teachers/Admins manage questions" ON public.questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students see questions of their attempts" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts a
      WHERE a.exam_id = questions.exam_id AND a.student_id = auth.uid()
    )
  );

-- exam_attempts: each student sees only their own
CREATE POLICY "Students view own attempts" ON public.exam_attempts
  FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Students create own attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own attempts" ON public.exam_attempts
  FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Teachers/Admins manage attempts" ON public.exam_attempts
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- attempt_answers: only owner of attempt
CREATE POLICY "Students view own answers" ON public.attempt_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.exam_attempts a WHERE a.id = attempt_answers.attempt_id AND (a.student_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher')))
  );
CREATE POLICY "Students write own answers" ON public.attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.exam_attempts a WHERE a.id = attempt_answers.attempt_id AND a.student_id = auth.uid())
  );
CREATE POLICY "Students update own answers" ON public.attempt_answers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.exam_attempts a WHERE a.id = attempt_answers.attempt_id AND a.student_id = auth.uid())
  );
CREATE POLICY "Teachers/Admins grade answers" ON public.attempt_answers
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- notifications: only owner
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/Admins create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') OR auth.uid() = user_id);
