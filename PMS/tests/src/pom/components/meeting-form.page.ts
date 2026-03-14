import type { Locator, Page } from "@playwright/test";

export default class MeetingFormPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly descriptionInput: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly projectSelect: Locator;
  readonly taskSelect: Locator;
  readonly attendeeDisplay: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog");
    this.descriptionInput = page.getByLabel("Meeting Description");
    this.startTimeInput = page.getByLabel("Start Time");
    this.endTimeInput = page.getByLabel("End Time");
    this.projectSelect = page.getByLabel("Select Project");
    this.taskSelect = page.getByLabel("Select Associated Task");
    this.attendeeDisplay = page.getByLabel("Attendee");
    this.submitButton = page.getByRole("button", { name: "Book Meeting" });
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: "visible" });
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: "hidden" });
  }

  async fillDescription(value: string) {
    await this.descriptionInput.fill(value);
  }

  async setStartTime(value: string) {
    await this.startTimeInput.fill(value);
  }

  async setEndTime(value: string) {
    await this.endTimeInput.fill(value);
  }

  async selectProject(projectTitle: string) {
    await this.projectSelect.click();
    await this.page.getByRole("option", { name: projectTitle }).click();
  }

  async selectTask(taskTitle: string) {
    await this.taskSelect.click();
    await this.page.getByRole("option", { name: taskTitle }).click();
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async getAttendeeText() {
    return this.attendeeDisplay.inputValue();
  }
}
