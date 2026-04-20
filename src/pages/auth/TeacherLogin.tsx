import { LoginShell } from "@/components/auth/LoginShell";

const TeacherLogin = () => (
  <LoginShell
    role="teacher"
    title="Teacher sign in"
    subtitle="Access your classes, exams and students"
    redirectPath="/teacher/dashboard"
    showBackToStudent
  />
);

export default TeacherLogin;
