import { Navigate } from "react-router";
import { useAuth } from "../providers/auth.provider";

/*
  React uses a lightweight version of the browser's DOM known as the Virtual DOM, in order to
  optimize performance by minimizing expensive browser DOM re-renders.

  RENDER CYCLE:
    A render cycle occurs whenever a component's state changes.

    For a component (expressed as the Functional Component below), whenever its state changes,
    the React runtime executes the function again to generate a new virtual DOM tree. It then
    uses a 'diffing' algorithm to determine the minimum set of changes required to update the
    real DOM (reconciliation). 
  
      For instance, if a component's color changes from red -> green -> purple within 
      a single render cycle, the actual DOM change will be from red -> purple.

  REACT HOOKS:
    Since functional components are re-executed on every re-render, standard local variables are
    reset. Therefore, in order to persist data across re-renders, React Hooks - functions which
    operate outside the lifecycle of the components, are used instead.

    useAuth is an example of a custom hook defined that manages authentication & authorization
    globally.


  The role of IndexRoute here is to handle basic routing, redirecting the user to any one of the
  routes based on the user's role or whether they have been authenticated into the system.
*/
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
