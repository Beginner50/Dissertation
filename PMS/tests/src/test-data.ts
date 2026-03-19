export const USERS_TO_CREATE = [
  {
    name: "userA.2.3",
    email: "userA.2_deleted_user@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userA.2.4",
    email: "userA.2_existing_user@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userA.3.2",
    email: "userA.3_same_email@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userA.3.3",
    email: "userA.3_change_to_original@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userA.3.4",
    email: "userA.3_change_to_deleted@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userA.3.4",
    email: "userA.3_deleted_user@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userA.3_unsuccessful_updates",
    email: "userA.3_unsuccessful_updates@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userA.3_existing_user",
    email: "userA.3_existing_user@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userA.4_to_delete",
    email: "userA.4_to_delete@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userB_student1",
    email: "userB_student1@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userB_student2",
    email: "userB_student2@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userB_student3",
    email: "userB_student3@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userB_student_deleted",
    email: "userB_student_deleted@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userB_student_to_delete",
    email: "userB_student_to_delete@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "userB_supervisor1",
    email: "userB_supervisor1@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userB_supervisor2",
    email: "userB_supervisor2@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "userB_supervisor_deleted",
    email: "userB_supervisor_deleted@uni.com",
    password: "password",
    role: "supervisor",
  },
  {
    name: "user_main_student",
    email: "user_main_student@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "user_side_student",
    email: "user_side_student@uni.com",
    password: "password",
    role: "student",
  },
  {
    name: "user_main_supervisor",
    email: "user_main_supervisor@uni.com",
    password: "password",
    role: "supervisor",
  },
];

export const USERS_TO_DELETE = [
  "userA.2_deleted_user@uni.com",
  "userA.3_deleted_user@uni.com",
  "userB_student_deleted@uni.com",
  "userB_supervisor_deleted@uni.com",
];

export const PROJECTS_TO_CREATE = [
  {
    title: "projectB.3_unsuccessful_updates",
    description: "Project B Unsuccessful Updates",
    studentEmail: "userB_student3@uni.com",
    supervisorEmail: "userB_supervisor2@uni.com",
  },
  {
    title: "projectB.3_same_members",
    description: "Project B Same User",
    studentEmail: "userB_student3@uni.com",
    supervisorEmail: "userB_supervisor2@uni.com",
  },
  {
    title: "projectB.4_to_archive",
    description: "Project B To Archive",
    studentEmail: "userB_student3@uni.com",
    supervisorEmail: "userB_supervisor2@uni.com",
  },
  {
    title: "projectB.4_to_restore",
    description: "Project B To Restore",
    studentEmail: "userB_student3@uni.com",
    supervisorEmail: "userB_supervisor2@uni.com",
  },
  {
    title: "projectB.4_deleted_member",
    description: "Project B Deleted Member",
    studentEmail: "userB_student_to_delete@uni.com",
    supervisorEmail: "userB_supervisor2@uni.com",
  },
  {
    title: "project_unsuccessful_updates",
    description: "Project View Only",
    studentEmail: "user_main_student@uni.com",
    supervisorEmail: "user_main_supervisor@uni.com",
  },
  {
    title: "projectC_to_update",
    description: "Project C To Update",
    studentEmail: "user_side_student@uni.com",
    supervisorEmail: "user_main_supervisor@uni.com",
  },
  {
    title: "projectC_to_archive",
    description: "Project C To Archive",
    studentEmail: "user_side_student@uni.com",
    supervisorEmail: "user_main_supervisor@uni.com",
  },
];

export const TASKS_TO_CREATE = [
  {
    title: "task_to_update",
    description: "This task will be renamed",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(), // Tomorrow
  },
  {
    title: "task_unsuccessful_updates",
    description: "Attempting to set this to a past date",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
  },
  {
    title: "task_delete_successful",
    description: "This task should be removed successfully",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
  },
  {
    title: "task_delete_unsuccessful",
    description: "This task has associated meeting records",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
  },
  {
    title: "task_overdue",
    description: "Deadline is exactly now",
    dueDate: new Date(Date.now() + 5000).toISOString(),
  },
  {
    title: "task_completed",
    description: "Task submitted",
    dueDate: new Date(Date.now() + 5000).toISOString(),
  },
  {
    title: "task_for_submission",
    description: "Pending task awaiting file upload",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
  },
  {
    title: "task_has_meeting",
    description: "Pending task awaiting file upload",
    dueDate: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
  },
];
