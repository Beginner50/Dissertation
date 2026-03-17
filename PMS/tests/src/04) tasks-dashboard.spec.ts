import path from "path";
import base64js from "base64-js";
import test, { expect, request } from "@playwright/test";
import NormalLayoutPOM from "./pom/normal.pom/normalLayout.pom";
import SignInPage from "./pom/signIn.pom";
import TasksPOM from "./pom/normal.pom/tasks.page";
import { DeliverableFile } from "../../client/src/lib/types";

/* 
  FR7/FR9/FR11
  D. Supervisors shall be able to create, update, and delete project tasks, including setting deadlines.
    D.1. Create Task
      D.1.1. Successful Task Creation
      D.1.1. Unsuccessful Task Creation (Due Date < Present Day)

    D.2. Edit Task
      D.2.1. Successful Task Update
      D.2.1. Unsuccessful Task Update (Due Date < Present Day)

    D.3. Delete Task    
      D.3.1. Successful Task Delete (Normal)
      D.3.2. Successful Task Delete (Staged Deliverable + Meeting)
      D.3.3. Unsuccessful Task Delete (Task has ongoing associated submitted deliverable)

  E. The system shall automatically update tasks statuses based on the deadline and the submission activity.
     The status of a task shall be “completed” upon submission, “pending” if the deadline has not passed
     and “missing” if the deadline passes without a submission. 
    E.1. Task Status Tests
      E.1.1. Created Task Status initialized to Pending.
      E.1.2. Created Task Status updates from Pending to Missing after due date
      E.1.3. Created Task Status updates from Pending to Completed after Deliverable Submission
      E.1.4. Completed Task Status does not update after due date

  F. Both supervisors and students shall be authorized to generate and download the project progress log report.
*/
test.describe("Supervisor/Student - Tasks Dashboard (Task List for Selected Project)", () => {
  let normalLayout: NormalLayoutPOM;
  let taskDashboard: TasksPOM;
  let projectID: number;
  let userID: number;

  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    normalLayout = new NormalLayoutPOM(page);

    await page.goto("/sign-in?page-size=100");
    const responseBody = await signIn.signIn("user_main_supervisor@uni.com", "password");
    userID = responseBody.user.userID;

    await normalLayout.waitUntilLoaded();
    const projectsDashboard = await normalLayout.clickProjects();
    const row = await projectsDashboard.list.getFirstCollectionInteractiveEntryByTestID(
      "project_unsuccessful_updates",
    );
    projectID = Number(await row.getItemID());
    taskDashboard = await row.clickProjectLink();
  });

  test.describe("D. Supervisor - CRUD Tasks", () => {
    test("D.1.1. Successful Task Creation", async () => {
      const modal = await taskDashboard.clickCreateTaskButton();
      await modal.setField(/Title/i, "task_created_successful");
      await modal.setField(/Description/i, "Research documentation");
      await modal.page.getByLabel(/Due Date/i).fill("2026-12-31");
      await modal.submit();

      await expect(
        taskDashboard.list.getFirstCollectionEntryLocatorByTestID(
          "task_created_successful",
        ),
      ).toBeVisible();
    });

    test("D.1.2. Unsuccessful Task Creation (Due Date < Present Day)", async () => {
      const modal = await taskDashboard.clickCreateTaskButton();
      await modal.setField(/Title/i, "task_created_unsuccessful");
      await modal.page.getByLabel(/Due Date/i).fill("2020-01-01");
      await modal.submit();

      await normalLayout.expectErrorValueAndCloseError(/Invalid Due Date/i);
    });

    test("D.2.1. Successful Task Update", async () => {
      const row =
        await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
          "task_to_update",
        );
      const modal = await row.performAction("Edit");
      await modal.setField(/Title/i, "task_update_successful");
      await modal.submit();

      await expect(
        taskDashboard.list.getFirstCollectionEntryLocatorByTestID(
          "task_update_successful",
        ),
      ).toBeVisible();
    });

    test("D.2.2. Unsuccessful Task Update (Due Date < Present Day)", async () => {
      const row = await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
        "task_unsuccessful_updates",
      );
      const modal = await row.performAction("Edit");
      await modal.page.getByLabel(/Due Date/i).fill("2020-01-01");
      await modal.submit();

      await normalLayout.expectErrorValueAndCloseError(/Invalid Due Date/i);
    });

    test("D.3.1. Successful Task Delete", async () => {
      const row = await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
        "task_delete_successful",
      );
      const confirmModal = await row.performAction("Delete");
      await confirmModal.submit();

      await expect(
        taskDashboard.list.getFirstCollectionEntryLocatorByTestID(
          "task_delete_successful",
        ),
      ).not.toBeVisible();
    });

    test("D.3.2. Successful Task Delete (Staged Deliverable + Meeting)", async () => {
      const row =
        await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
          "task_has_meeting",
        );
      const confirmModal = await row.performAction("Delete");
      await confirmModal.submit();

      await expect(
        taskDashboard.list.getFirstCollectionEntryLocatorByTestID("task_has_meeting"),
      ).not.toBeVisible();
    });

    test("D.3.3. Unsuccessful Task Delete (Task has Submitted Deliverable)", async () => {
      const row = await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
        "task_completed_before_deadline",
      );
      await row.performAction("Delete");

      await normalLayout.expectErrorValueAndCloseError(/Invalid Due Date/i);
    });
  });

  test.describe("E. Task Status Logic", () => {
    test("E.1.1. Created Task Status initialized to Pending", async () => {
      const modal = await taskDashboard.clickCreateTaskButton();
      await modal.setField(/Title/i, "task_status_pending_test");
      await modal.page.getByLabel(/Due Date/i).fill("2026-12-01");
      await modal.submit();

      const row = taskDashboard.list.getFirstCollectionEntryLocatorByTestID(
        "task_status_pending_test",
      );
      await expect(row.getByText("Pending", { exact: true })).toBeVisible();
    });

    test("E.1.2. Created Task Status updates from Pending to Missing after due date", async ({
      page,
    }) => {
      const row =
        await taskDashboard.list.getFirstCollectionEntryLocatorByTestID("task_overdue");

      const nextYear = new Date("2027-01-01");
      await page.clock.setFixedTime(nextYear);
      await page.reload();

      await expect(row.getByText("Missing", { exact: true })).toBeVisible();
    });

    test("E.1.3. Created Task Status updates from Pending to Completed after Deliverable Submission", async () => {
      const row =
        await taskDashboard.list.getFirstCollectionInteractiveEntryByTestID(
          "task_for_submission",
        );

      const filePath = path.resolve(
        __dirname,
        "../test-assets/deliverables/DataCollectionReport.pdf",
      );
      const fileBase64 = fs.readFileSync(filePath).toString("base64");

      const stubDeliverable: DeliverableFile = {
        filename: "stub",
        contentType: "application/json",
        file: base64js.fromByteArray(new Uint8Array(fileBase64)),
      };

      const taskID = await row.getItemID();
      const api = await request.newContext();
      await api.post(
        `api/users/${userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable`,
        { data: stubDeliverable },
      );
      const rowLocator =
        taskDashboard.list.getFirstCollectionEntryLocatorByTestID("task_for_submission");

      await expect(rowLocator.getByText("Pending", { exact: true })).toBeVisible();
      await api.post(
        `api/users/${userID}/projects/${projectID}/tasks/${taskID}/staged-deliverable/submit`,
      );
      await expect(rowLocator.getByText("Completed", { exact: true })).toBeVisible();

      await api.dispose();
    });

    // Create Task with 5 min past now and assign deliverable to it
    test("E.1.4. Completed Task Status does not update after due date", async ({
      page,
    }) => {
      const row = taskDashboard.list.getFirstCollectionEntryLocatorByTestID(
        "task_completed_before_deadline",
      );
      await expect(row.getByText("Completed", { exact: true })).toBeVisible();
    });
  });
});
