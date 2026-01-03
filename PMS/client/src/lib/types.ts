export type User = {
  userID: number;
  role: string;
  name: string;
  email: string;
};

export type Project = {
  projectID: number;
  title: string;
  description?: string;
  status: string;
  student?: User;
  supervisor?: User;
};

export type ProjectFormData = Pick<
  Project,
  "projectID" | "title" | "description"
>;

export type Task = {
  taskID: number;
  title: string;
  description?: string;
  status: "pending" | "completed" | "missing";
  assignedDate: string;
  dueDate: string;
};

export type TaskFormData = Pick<
  Task,
  "taskID" | "title" | "description" | "dueDate"
>;

export type Deliverable = {
  deliverableID: number;
  filename: string;
  submissionTimestamp: string;
  taskID: number;
  submittedBy: User;
  feedbackCriterias?: FeedbackCriteria[];
};

export type DeliverableFile = {
  filename: string;
  file: string;
  contentType: string;
};

export type FeedbackCriteria = {
  feedbackCriteriaID: number;
  description: string;
  status: "met" | "unmet" | "overridden";
};

export type Meeting = {
  meetingID: number;
  start: Date;
  end: Date;
  description: string;
  project: { projectID: number; title: string };
  organizer: { userID: number; name: string; email: string };
  attendee: { userID: number; name: string; email: string };
  status: "accepted" | "pending";
};

export type MeetingFormData = {
  description: string;
  start: Date;
  end: Date;
  attendeeID: number;
  projectID: number;
  projectTitle: string;
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
