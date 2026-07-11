import { Navigate } from "react-router-dom";

const AdminLogin = () => {
  return <Navigate to="/?role=admin" replace />;
};

export default AdminLogin;
