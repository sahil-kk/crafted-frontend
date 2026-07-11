import { Navigate } from "react-router-dom";

const TeacherLogin = () => {
  return <Navigate to="/?role=teacher" replace />;
};

export default TeacherLogin;
