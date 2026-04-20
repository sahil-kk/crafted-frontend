import { LoginShell } from "@/components/auth/LoginShell";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const StudentLogin = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user && role === "student") navigate("/dashboard", { replace: true });
    if (user && role === "teacher") navigate("/teacher/dashboard", { replace: true });
    if (user && role === "admin") navigate("/admin/dashboard", { replace: true });
  }, [user, role, loading, navigate]);

  return (
    <LoginShell
      role="student"
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
      redirectPath="/dashboard"
    />
  );
};

export default StudentLogin;
