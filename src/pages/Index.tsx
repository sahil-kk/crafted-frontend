import { LoginShell } from "@/components/auth/LoginShell";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const StudentLogin = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (role === "student") navigate("/dashboard", { replace: true });
      else if (role === "teacher") navigate("/teacher/dashboard", { replace: true });
      else if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "parent") navigate("/parent/dashboard", { replace: true });
    }
  }, [user, role, loading, navigate]);

  return <LoginShell />;
};

export default StudentLogin;
