import path from "path";
import fs from "fs";
import base64js from "base64-js";
import { APIRequestContext, FullConfig, request } from "@playwright/test";
import {
  Deliverable,
  DeliverableFile,
  Project,
  Task,
  User,
} from "../../client/src/lib/types";
import {
  PROJECTS_TO_CREATE,
  TASKS_TO_CREATE,
  USERS_TO_CREATE,
  USERS_TO_DELETE,
} from "./test-data";

async function getAuthorizedAPI(email: string) {
  const api = await request.newContext({ baseURL: "http://localhost:5081" });
  const response = await api.post("api/users/login", {
    data: {
      email: email,
      password: "password",
    },
  });

  const { token: accessToken, user } = await response.json();
  await api.dispose();

  return await request.newContext({
    baseURL: "http://localhost:5081",
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function getDataWithCount<T>(authorizedAPI: APIRequestContext, url: string) {
  const response = await authorizedAPI.get(url, {
    params: {
      offset: 0,
      limit: 100,
    },
  });
  const data: { items: T[]; count: number } = await response.json();
  return data;
}

export default async function globalSetup(config: FullConfig) {
  const adminAPI = await getAuthorizedAPI("admin@uni.com");

  const setupComplete = (await getDataWithCount<User>(adminAPI, "api/users")).count > 1;

  if (!setupComplete) {
    // Create All Users
    await Promise.all(
      USERS_TO_CREATE.map((user) => adminAPI.post("api/users", { data: user })),
    );

    // Get Users and create HashMap (email: User)
    const emailUserMap = new Map<string, User>();
    const userData = await getDataWithCount<User>(adminAPI, "api/users");
    userData.items.map((user) => {
      emailUserMap.set(user.email, user);
    });

    // Delete Users for Test Cases
    await Promise.all(
      USERS_TO_DELETE.map((email) =>
        adminAPI.delete(`api/users/${emailUserMap.get(email)?.userID}`),
      ),
    );

    // Create Projects
    await Promise.all(
      PROJECTS_TO_CREATE.map((project) =>
        adminAPI.post(`api/projects`, {
          data: project,
        }),
      ),
    );

    // Get projects and create HashMap (title: Project)
    const projectData = await getDataWithCount<Project>(adminAPI, "api/projects");
    const titleProjectMap = new Map<string, Project>();
    projectData?.items.map((project) => {
      titleProjectMap.set(project.title, project);
    });

    // Delete User to create permanently archived project
    await adminAPI.delete(
      `api/users/${emailUserMap.get("userB_student_to_delete@uni.com")?.userID}`,
    );

    // Archive Project
    await adminAPI.delete(
      `api/projects/${titleProjectMap.get("projectB.4_to_restore")?.projectID}`,
    );

    await adminAPI.dispose();

    // Create Tasks
    const supervisorAPI = await getAuthorizedAPI("user_main_supervisor@uni.com");
    let supervisorID = emailUserMap.get("user_main_supervisor@uni.com")?.userID;
    let studentID = emailUserMap.get("user_main_student@uni.com")?.userID;
    let projectID = titleProjectMap.get("project_unsuccessful_updates")?.projectID;

    await Promise.all(
      TASKS_TO_CREATE.map((task) =>
        supervisorAPI.post(`api/users/${supervisorID}/projects/${projectID}/tasks`, {
          data: task,
        }),
      ),
    );

    // Get Tasks and create hashmap
    const taskData = await getDataWithCount<Task>(
      supervisorAPI,
      `api/users/${supervisorID}/projects/${projectID}/tasks`,
    );
    const titleTaskMap = new Map<string, Task>();
    taskData?.items.map((task) => titleTaskMap.set(task.title, task));

    // Assign & Submit Deliverable to completed_task
    const stubDeliverable: DeliverableFile = {
      filename: "stub",
      contentType: "application/json",
      file: base64js.fromByteArray(
        new Uint8Array(
          fs.readFileSync(
            path.resolve(
              __dirname,
              "../test-assets/deliverables/DataCollectionReport.pdf",
            ),
          ),
        ),
      ),
    };

    await supervisorAPI.post(
      `api/users/${studentID}/projects/${projectID}/tasks/${titleTaskMap.get("task_completed_before_deadline")?.taskID}/staged-deliverable`,
      { data: stubDeliverable },
    );
    await supervisorAPI.post(
      `api/users/${studentID}/projects/${projectID}/tasks/${titleTaskMap.get("task_completed_before_deadline")?.taskID}/staged-deliverable/submit`,
    );

    // Assign Deliverable & Meeting to task with meeting
    await supervisorAPI.post(
      `api/users/${studentID}/projects/${projectID}/tasks/${titleTaskMap.get("task_has_meeting")?.taskID}/staged-deliverable`,
      { data: stubDeliverable },
    );
    await supervisorAPI.post(
      `api/users/${supervisorID}/projects/${projectID}/tasks/${titleTaskMap.get("task_has_meeting")?.taskID}/meetings`,
      {
        data: {
          start: new Date(Date.now() + 1000 * 3600),
          end: new Date(Date.now() + 1000 * 3600),
          attendeeID: studentID,
          organizerID: supervisorID,
        },
      },
    );

    await supervisorAPI.dispose();
  }
}
