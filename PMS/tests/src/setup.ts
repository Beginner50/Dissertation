import { APIRequestContext, FullConfig, request } from "@playwright/test";
import { Project, User } from "../../client/src/lib/types";
import { PROJECTS_TO_CREATE, USERS_TO_CREATE, USERS_TO_DELETE } from "./test-data";

async function getAuthorizedAPI() {
  const api = await request.newContext({ baseURL: "http://localhost:5081" });
  const response = await api.post("api/users/login", {
    data: {
      email: "admin@uni.com",
      password: "password",
    },
  });
  await api.dispose();
  const { token: accessToken, user } = await response.json();

  return await request.newContext({
    baseURL: "http://localhost:5081",
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function getDataWithCount<T>(authorizedAPI: APIRequestContext, url: string) {
  const data: { items: T[]; count: number } = await (
    await authorizedAPI?.get(url, {
      params: {
        offset: 0,
        limit: 100,
      },
    })
  ).json();
  return data;
}

export default async function globalSetup(config: FullConfig) {
  const authorizedAPI = await getAuthorizedAPI();

  const setupComplete =
    (await getDataWithCount<User>(authorizedAPI, "api/users")).count > 1;

  if (!setupComplete) {
    // Create All Users
    await Promise.all(
      USERS_TO_CREATE.map((user) => authorizedAPI?.post("api/users", { data: user })),
    );

    // Get Users and create HashMap (email: User)
    const emailUserMap = new Map<string, User>();
    const userData = await getDataWithCount<User>(authorizedAPI, "api/users");
    userData.items.map((user) => {
      emailUserMap.set(user.email, user);
    });

    // Delete Users for Test Cases
    await Promise.all(
      USERS_TO_DELETE.map((email) =>
        authorizedAPI.delete(`api/users/${emailUserMap.get(email)?.userID}`),
      ),
    );

    // Create Projects
    await Promise.all(
      PROJECTS_TO_CREATE.map((project) =>
        authorizedAPI.post(`api/projects`, {
          data: project,
        }),
      ),
    );

    // Get projects and create HashMap (title: Project)
    const projectData = await getDataWithCount<Project>(authorizedAPI, "api/projects");
    const titleProjectMap = new Map<string, Project>();
    projectData.items.map((project) => {
      titleProjectMap.set(project.title, project);
    });

    // Delete User to create permanently archived project
    await authorizedAPI.delete(
      `api/users/${emailUserMap.get("userB_student_to_delete@uni.com")?.userID}`,
    );

    // Archive Project
    await authorizedAPI.delete(
      `api/projects/${titleProjectMap.get("projectB.4_to_restore")?.projectID}`,
    );

    await authorizedAPI.dispose();
  }
}
