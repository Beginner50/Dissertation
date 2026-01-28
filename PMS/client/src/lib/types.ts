import type ky from "ky";

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
};

export type AuthContextType = {
  authState: AuthState;
  authorizedAPI: typeof ky;
  signIn: (userData: Record<string, any>) => Promise<AuthState>;
  signOut: () => Promise<void>;
};

export type User = {
  userID: number;
  role: string;
  name: string;
  email: string;
};

export type UserFormData = Pick<User, "userID" | "name" | "email" | "role">;

export type Project = {
  projectID: number;
  title: string;
  description?: string;
  status: string;
  student?: User;
  supervisor?: User;
  tasks?: Pick<Task, "taskID" | "title">[];
};

export type ProjectFormData = Pick<Project, "projectID" | "title" | "description">;

export type Task = {
  taskID: number;
  title: string;
  description?: string;
  status: "pending" | "completed" | "missing";
  isLocked?: boolean;
  assignedDate: string;
  dueDate: string;
  assignedBy?: User;
};

export type TaskFormData = Pick<Task, "taskID" | "title" | "description" | "dueDate">;

export type Deliverable = {
  deliverableID: number;
  filename: string;
  submissionTimestamp: string;
  taskID: number;
  submittedBy: User;
  feedbackCriterias?: FeedbackCriterion[];
};

export type DeliverableFile = {
  filename: string;
  file: string;
  contentType: string;
};

export type FeedbackCriterion = {
  feedbackCriterionID: number;
  description: string;
  status: "met" | "unmet" | "overridden";
  changeObserved: string;
};

export type Meeting = {
  meetingID: number;
  start: string;
  end: string;
  description: string;
  task: { taskID: number; title: string };
  organizer: { userID: number; name: string; email: string };
  attendee: { userID: number; name: string; email: string };
  status: "accepted" | "pending";
};

export type MeetingFormData = {
  description: string;
  start: string;
  end: string;
  attendeeID: number;
  projectID: number;
  taskID: number;
};

export type Reminder = {
  reminderID: number;
  type: "meeting" | "task";
  remindAt: string;
  message: string;
  recipientID: number;
};

export type Notification = {
  notificationID: number;
  type: "meeting" | "task";
  description: string;
  timestamp: string;
  recipientID: number;
};
