import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext.jsx";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
