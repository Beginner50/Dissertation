import { ProjectList } from '../../components/project.components/project-list.component';
import { ReminderList } from '../../components/reminder-list.components/reminder-list.component';
import type { Project } from '../../lib/types';

const mockProjects: Project[] = [
    { id: 101, name: "PMS Dissertation", student: "John Doe" },
    { id: 102, name: "E-Commerce Platform Redesign", student: "Jane Smith" },
];

export default function DashboardProjectsRoute() {
    return (
        <>
            <ProjectList sx={{
                flexGrow: 3,
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