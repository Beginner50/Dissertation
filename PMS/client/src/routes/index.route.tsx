import { Navigate } from "react-router";
import { useAuth } from "../providers/auth.provider";

export default function IndexRoute() {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (authState.user?.role === "admin") {
    return <Navigate to="/admin-dashboard/users" replace />;
  }

  return <Navigate to="/projects" replace />;
}
