import type { Locator, Page } from "@playwright/test";

export default class TaskModalPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly taskTitleInput: Locator;
  readonly taskDescriptionInput: Locator;
  readonly dueDateInput: Locator;
  readonly dueTimeInput: Locator;
  readonly cancelButton: Locator;
  readonly primaryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog");
    this.title = page.getByRole("heading", { level: 2 });
    this.taskTitleInput = page.getByLabel("Title");
    this.taskDescriptionInput = page.getByLabel("Description");
    this.dueDateInput = page.getByLabel("Due Date");
    this.dueTimeInput = page.getByLabel("Due Time");
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.primaryButton = page.getByRole("button", { name: /Create|Save|Delete/ });
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: "visible" });
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: "hidden" });
  }

  async fillTitle(value: string) {
    await this.taskTitleInput.fill(value);
  }

  async fillDescription(value: string) {
    await this.taskDescriptionInput.fill(value);
  }

  async setDueDate(value: string) {
    await this.dueDateInput.fill(value);
  }

  async setDueTime(value: string) {
    await this.dueTimeInput.fill(value);
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  async clickPrimaryAction() {
    await this.primaryButton.click();
  }

  async getTitleText() {
    return this.title.textContent();
  }
}
