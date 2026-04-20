import { LoginShell } from "@/components/auth/LoginShell";

const AdminLogin = () => (
  <LoginShell
    role="admin"
    title="Admin sign in"
    subtitle="Manage students, teachers and the platform"
    redirectPath="/admin/dashboard"
    showBackToStudent
  />
);

export default AdminLogin;
