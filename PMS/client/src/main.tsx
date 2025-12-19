import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './providers/auth.provider'
import NormalLayout from './components/layout.components/normal.layout.component'
import IndexRoute from './routes/index.route'
import DashboardProjectsRoute from './routes/normal.routes/dashboard-projects.route'
import DashboardTasksRoute from './routes/normal.routes/dashboard-tasks.route'
import TaskRoute from './routes/normal.routes/task.route'
import SchedulerRoute from './routes/normal.routes/scheduler.route'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SignInRoute from './routes/sign-in.route'

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<IndexRoute />} />
            <Route element={<NormalLayout />}>
              <Route path="projects" element={< DashboardProjectsRoute />} />
              <Route path="scheduler" element={< SchedulerRoute />} />
              <Route path="projects/:projectID/tasks" element={< DashboardTasksRoute />} />
              <Route path="projects/:projectID/tasks/:taskID" element={< TaskRoute />} />
            </Route>
            <Route path="sign-in" element={<SignInRoute />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
