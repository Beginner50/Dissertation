import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./providers/auth.provider";
import IndexRoute from "./routes/index.route";
import DashboardProjectsRoute from "./routes/normal.routes/dashboard-projects.route";
import DashboardTasksRoute from "./routes/normal.routes/dashboard-tasks.route";
import TaskRoute from "./routes/normal.routes/task.route";
import SchedulerRoute from "./routes/normal.routes/scheduler.route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignInRoute from "./routes/sign-in.route";
import NormalRoutesLayout from "./routes/normal.routes/ normal-routes.layout";
import AdminRoutesLayout from "./routes/admin.routes/ admin-routes.layout";
import DashboardUsersRoute from "./routes/admin.routes/dashboard-users.route";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<IndexRoute />} />
            <Route path="sign-in" element={<SignInRoute />} />

            {/* Normal Routes */}
            <Route element={<NormalRoutesLayout />}>
              <Route path="projects" element={<DashboardProjectsRoute />} />
              <Route path="scheduler" element={<SchedulerRoute />} />
              <Route
                path="projects/:projectID/tasks"
                element={<DashboardTasksRoute />}
              />
              <Route
                path="projects/:projectID/tasks/:taskID"
                element={<TaskRoute />}
              />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoutesLayout />}>
              <Route
                path="admin-dashboard/users"
                element={<DashboardUsersRoute />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
