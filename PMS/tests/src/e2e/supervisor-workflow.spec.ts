import { test, expect } from "@playwright/test";
import SignInPage from "../pom/signIn.page";
import NormalLayoutPage from "../pom/normal/normalLayout.page";
import TasksPage from "../pom/normal/tasks.page";
import TaskDetailsPage from "../pom/normal/taskDetails.page";

const SUPERVISOR_EMAIL = process.env.SUPERVISOR_EMAIL ?? "jatooprashant099@gmail.com";
const SUPERVISOR_PASSWORD = process.env.SUPERVISOR_PASSWORD ?? "password1234";

test.describe("Supervisor role – projects, tasks, feedback, meetings", () => {
  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    await page.goto("http://localhost:3000/sign-in");
    await signIn.signIn(SUPERVISOR_EMAIL, SUPERVISOR_PASSWORD);
  });

  test("FR5/FR10/FR11 – supervisor can view projects and generate progress log", async ({
    page,
  }) => {
    const layout = new NormalLayoutPage(page);
    await layout.clickProjects();
    const projects = layout.projects();
    await projects.waitForLoaded();

    // Navigate to first project tasks page
    await page
      .getByRole("link", { name: /View Tasks/i })
      .first()
      .click();
    const tasksPage = new TasksPage(page);
    await tasksPage.waitForLoaded();

    // Generate progress log report (opens new tab with PDF)
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: /Generate Progress Log Report/i }).click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    await expect(popup).toHaveURL(/progress-log/i);
  });

  test("FR7/FR8/FR9/FR13 – supervisor can manage tasks and see feedback table", async ({
    page,
  }) => {
    const layout = new NormalLayoutPage(page);
    await layout.clickProjects();

    // Go to tasks page for first project
    await page
      .getByRole("link", { name: /View Tasks/i })
      .first()
      .click();
    const tasksPage = new TasksPage(page);
    await tasksPage.waitForLoaded();

    // Open create task modal
    await tasksPage.createTaskButton.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByLabel("Title").fill("Supervisor Test Task");
    await page
      .getByLabel("Description")
      .fill("Task created by supervisor Playwright test.");
    await page.getByLabel("Due Date").fill("2099-12-31");
    await page.getByLabel("Due Time").fill("23:59");

    await page.getByRole("button", { name: "Create" }).click();
    await expect(dialog).toBeHidden();

    // Open the created task details
    await page
      .getByRole("link", { name: /Supervisor Test Task/i })
      .first()
      .click();
    const taskDetails = new TaskDetailsPage(page);
    await taskDetails.waitForLoaded();

    // Feedback table should be present (even if initially empty)
    await expect(page.locator("table")).toBeVisible();
  });
});
