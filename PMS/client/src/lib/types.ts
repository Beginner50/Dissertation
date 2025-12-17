export type User = {
    id: number;
    name: string;
    email: string;
    projectIDs: number[];
};

export interface Project {
    id: number;
    name: string;
    student: string;
}

export interface Reminder {
    id: number;
    date: string;
    time: string;
    description: string;
    status: "pending" | "completed" | "missing";
    readStatus: "read" | "unread"
}

export interface Task {
    id: number;
    title: string;
    status: 'pending' | 'completed' | 'missing';
    deadline: string;
    projectId: number;
}

export interface Stakeholder {
    role: string;
    name: string;
    id: string;
}

export interface ProjectDetailsData {
    projectId?: string | number;
    projectTitle?: string;
    projectDescription?: string;
    student: Stakeholder;
    supervisor: Stakeholder;
}

export interface FeedbackCriteria {
    id: number;
    text: string;
    status: 'met' | 'unmet' | 'overridden';
}

export interface TaskDetailData {
    taskTitle: string;
    taskDeadline: string;
    taskDescription: string;
    feedbackCriteria: FeedbackCriteria[];
}

export interface DeliverableFile {
    fileName: string;
    url: string;
    uploadedAt: string;
    sizeLabel: string;
}

