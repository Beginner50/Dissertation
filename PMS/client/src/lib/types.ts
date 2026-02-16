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
  assignedDate: Date;
  dueDate: Date;
  assignedBy?: User;
  feedbackCriterias?: FeedbackCriterion[];
};

export type TaskFormData = Pick<Task, "taskID" | "title" | "description" | "dueDate">;

export type Deliverable = {
  deliverableID: number;
  filename: string;
  submissionTimestamp: Date;
  taskID: number;
  submittedBy: User;
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

export type FeedbackCriterionModal = Pick<
  FeedbackCriterion,
  "feedbackCriterionID" | "description"
> & {
  updateStatus: "unchanged" | "created" | "updated" | "deleted";
};

export type Meeting = {
  meetingID: number;
  start: Date;
  end: Date;
  description: string;
  task: { taskID: number; title: string };
  organizer: { userID: number; name: string; email: string };
  attendee: { userID: number; name: string; email: string };
  status: "accepted" | "pending" | "missed";
};

export type MeetingFormData = {
  description: string;
  start: Date;
  end: Date;
  attendeeID: number;
  projectID: number;
  taskID: number;
};

export type Reminder = {
  reminderID: number;
  type: "meeting" | "task";
  remindAt: Date;
  message: string;
  recipientID: number;
};

export type Notification = {
  notificationID: number;
  type: "meeting" | "task";
  description: string;
  timestamp: Date;
  recipientID: number;
};
