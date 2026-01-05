import { Navigate } from "react-router";
import { useAuth } from "../providers/auth.provider";

export default function IndexRoute() {
  const { authState } = useAuth();

  if (!authState.user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (authState.user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/projects" replace />;
}
