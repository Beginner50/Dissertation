import { test, expect } from "@playwright/test";
import SignInPage from "../pom/signIn.page";
import NormalLayoutPage from "../pom/normal/normalLayout.page";
import TasksPage from "../pom/normal/tasks.page";
import SchedulerPage from "../pom/normal/scheduler.page";
import MeetingFormPage from "../pom/components/meetingForm.page";
import MeetingDetailsPage from "../pom/components/meetingDetails.page";

const STUDENT_EMAIL = process.env.STUDENT_EMAIL ?? "prashant.jatoo@umail.uom.ac.mu";
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD ?? "password1234";

test.describe("Student role – project view, deliverables, AI feedback, meetings, notifications", () => {
  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    await page.goto("http://localhost:3000/sign-in");
    await signIn.signIn(STUDENT_EMAIL, STUDENT_PASSWORD);
  });

  test("FR6/FR11/FR12/FR13/FR15/FR16 – student project view and deliverable workflow", async ({
    page,
  }) => {
    const layout = new NormalLayoutPage(page);
    await layout.clickProjects();

    // Navigate to first project tasks page
    await page
      .getByRole("link", { name: /View Tasks/i })
      .first()
      .click();
    const tasksPage = new TasksPage(page);
    await tasksPage.waitForLoaded();

    // Open first task details
    await page.getByRole("link").first().click();

    // Deliverable upload (staging area)
    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles({
      name: "demo.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n%EOF\n"),
    });

    // Staged deliverable card should appear
    await expect(
      page.getByText(/Staged Deliverable|Submitted Deliverable/i),
    ).toBeVisible();
  });

  test("FR17/FR18/FR19 – student can view shared calendar and book meeting with own supervisor", async ({
    page,
  }) => {
    const layout = new NormalLayoutPage(page);
    await layout.clickScheduler();
    const scheduler = new SchedulerPage(page);
    await scheduler.waitForCalendar();

    // Click a slot on the calendar to open booking form
    await scheduler.calendar.first().click();

    const meetingForm = new MeetingFormPage(page);
    await meetingForm.waitForOpen();

    // Select first project and associated task
    await meetingForm.selectProject("");
    await meetingForm.selectTask("");

    await meetingForm.fillDescription("Playwright meeting booking test");

    // Submit booking
    await meetingForm.clickSubmit();
    await meetingForm.waitForClose();

    // Select newly created event on calendar
    await scheduler.calendar.first().click();
    const meetingDetails = new MeetingDetailsPage(page);
    await expect(meetingDetails.header).toBeVisible();
  });
});
