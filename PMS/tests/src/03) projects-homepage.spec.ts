import test, { expect, request } from "@playwright/test";
import SignInPage from "./pom/signIn.pom";
import NormalLayoutPOM from "./pom/normal.pom/normalLayout.pom";

/* 
  FR5/FR6
  C. Supervisors shall be authorized to view, update, and archive multiple projects within
     their assigned scope. Students shall have view-only access to their assigned project.
    C.1. Supervisor - CRUD Projects
      C.1.1. Supervisor can view projects + Menu Button Visible
      C.1.3. Successful Project Update
      C.1.4. Successful Project Archive

    C.2. Student - View-Only Projects
      C.1.1. Student can view project + Menu Button Disabled
      C.1.2. Unsuccessful Project Update
      C.1.3. Unsuccessful Project Archive

    C.3. Navigation 
      C.3.1. Successful Navigation on Project Click
*/
test.describe("Supervisor/Student - Projects Homepage (Project List)", () => {
  test.describe("C.1. Supervisor - CRUD Projects", () => {
    let normalLayout: NormalLayoutPOM;
    let accessToken: string;

    test.beforeEach(async ({ page }) => {
      const signIn = new SignInPage(page);
      normalLayout = new NormalLayoutPOM(page);

      await page.goto("/sign-in?page-size=100");
      const responseBody = await signIn.signIn(
        "user_main_supervisor@uni.com",
        "password",
      );
      accessToken = responseBody.token;

      await normalLayout.waitUntilLoaded();
    });

    test("C.1.1. Supervisor can view projects + Menu Button Visible", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      await projectsDashboard.list.getFirstCollectionEntry(
        "project_unsuccessful_updates",
      );
    });

    test("C.1.2. Successful Project Update", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      const row =
        await projectsDashboard.list.getFirstCollectionEntry("projectC_to_update");
      const modal = await row.performAction("Edit");
      await modal.setField(/Title/i, "projectC_updated");
      await modal.submit();

      await projectsDashboard.list.getFirstCollectionEntry("projectC_updated");
      await expect(
        projectsDashboard.list.getFirstCollectionEntryLocator("projectC_to_update"),
      ).not.toBeVisible();
    });

    test("C.1.3. Successful Project Archive", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      const row =
        await projectsDashboard.list.getFirstCollectionEntry("projectC_to_archive");
      const modal = await row.performAction("Archive");
      await modal.submit();

      await expect(
        projectsDashboard.list.getFirstCollectionEntryLocator("projectC_to_archive"),
      ).not.toBeVisible();
    });
  });

  test.describe("C.1. Student - View-Only Projects", () => {
    let normalLayout: NormalLayoutPOM;
    let accessToken: string;
    let userID: number;

    test.beforeEach(async ({ page }) => {
      const signIn = new SignInPage(page);
      normalLayout = new NormalLayoutPOM(page);

      await page.goto("/sign-in?page-size=100");
      const responseBody = await signIn.signIn("user_main_student@uni.com", "password");
      accessToken = responseBody.token;
      userID = responseBody.user.userID;

      await normalLayout.waitUntilLoaded();
    });

    test("C.2.1. Student can view project + Menu Button Disabled", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      await projectsDashboard.list.getFirstCollectionEntry(
        "projectC_unsuccessful_updates",
      );
    });

    test("C.2.2. Unsuccessful Project Update", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      const row = await projectsDashboard.list.getFirstCollectionEntry(
        "projectC_unsuccessful_updates",
      );
      const projectID = await row.getItemID();
      const authorizedAPI = await request.newContext();

      const response = await authorizedAPI.put(
        `http://localhost:5081/api/users/${userID}/projects/${projectID}`,
        {
          data: { title: "projectC.2.2" },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      expect(response.status()).toBe(400);

      await authorizedAPI.dispose();
    });

    test("C.2.3. Unsuccessful Project Archive", async () => {
      const projectsDashboard = await normalLayout.clickProjects();

      const row = await projectsDashboard.list.getFirstCollectionEntry(
        "projectC_unsuccessful_updates",
      );
      const projectID = await row.getItemID();
      const authorizedAPI = await request.newContext();

      const response = await authorizedAPI.delete(
        `http://localhost:5081/api/users/${userID}/projects/${projectID}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      expect(response.status()).toBe(400);

      await authorizedAPI.dispose();
    });

    test("C.3.1. Successful Navigation on Project Click", async ({ page }) => {
      const projectsDashboard = await normalLayout.clickProjects();

      const row = await projectsDashboard.list.getFirstCollectionInteractiveEntry(
        "projectC_unsuccessful_updates",
      );
      await row.clickProjectLink();
    });
  });
});
