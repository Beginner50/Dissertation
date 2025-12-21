export type User = {
    userID: number;
    role: string;
    name: string;
    email: string;
    projectIDs?: number[];
};

export interface Project {
    projectID: number;
    title: string;
    description: string;
    student?: User;
    supervisor?: User;
}

// Aligned with server/src/DTOs/GetMeetings.DTO.cs
export interface Meeting {
    meetingID: number;
    start: Date;
    end: Date;
    description: string;
    project: { projectID: number, title: string };
    organizer: { userID: number, name: string, email: string };
    attendee: { userID: number, name: string, email: string };
    status: "accepted" | "pending"
}

export type MeetingFormData = {
    description: string,
    start: Date,
    end: Date,
    attendeeID: number,
    projectID: number,
    projectTitle: string,
};

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
    projectID: number;
}

export interface Stakeholder {
    role: string;
    name: string;
    id: number;
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

