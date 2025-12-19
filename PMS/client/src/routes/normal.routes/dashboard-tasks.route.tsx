
import { ProjectDetails } from '../../components/project.components/project-details.component';
import { TaskList } from '../../components/task.components/task-list.component';

export interface ProjectDetailsData {
    projectId?: string | number;
    projectTitle?: string;
    projectDescription?: string;
    student: {
        id: number,
        name: string,
        role: string,
    };
    supervisor: {
        id: number,
        name: string,
        role: string,
    };
}

const mockProjectData: ProjectDetailsData = {
    projectId: 123,
    projectTitle: "Advanced Component Decomposition Project",
    projectDescription: "This project focuses on translating complex legacy HTML/CSS structures into modern, maintainable React/MUI components using the sx prop for styling encapsulation.",
    student: {
        role: "Student",
        name: "John Doe",
        id: 2311146
    },
    supervisor: {
        role: "Supervisor",
        name: "Dr. John Doe",
        id: 1
    }
};

export default function DashboardTasksRoute() {
    return (
        <>
            <TaskList
                sx={{
                    flexGrow: 3,
                    overflowY: 'auto',
                    flexDirection: 'column',
                }}
            />

            <ProjectDetails
                sx={{
                    flexGrow: 1,
                    maxWidth: "30vw",
                    height: "fit-content"
                }}
                data={mockProjectData} />
        </>
    );
}