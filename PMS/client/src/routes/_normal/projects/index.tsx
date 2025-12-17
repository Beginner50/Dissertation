import { createFileRoute } from '@tanstack/react-router';
import type { Project } from '@/lib/types';
import { ProjectList } from '@/components/project.components/project-list.component';
import { ReminderList } from '@/components/reminder-list.components/reminder-list.component';

const mockProjects: Project[] = [
  { id: 101, name: "PMS Dissertation", student: "John Doe" },
  { id: 102, name: "E-Commerce Platform Redesign", student: "Jane Smith" },
];

export const Route = createFileRoute('/_normal/projects/')(
  { component: RouteComponent }
);


function RouteComponent() {
  return (
    <>
      <ProjectList sx={{
        flexGrow: 3,
        height: '100%',
        overflowY: 'auto',
        flexDirection: 'column',
      }}
        projectList={mockProjects}
      />

      <ReminderList sx={{
        flexGrow: 1
      }} />
    </>
  );
}