import type { Locator, Page } from "@playwright/test";

export default class ProjectModalPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly projectTitleInput: Locator;
  readonly projectDescriptionInput: Locator;
  readonly studentSelect: Locator;
  readonly supervisorSelect: Locator;
  readonly cancelButton: Locator;
  readonly primaryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog");
    this.title = page.getByRole("heading", { level: 2 });
    this.projectTitleInput = page.getByLabel("Title");
    this.projectDescriptionInput = page.getByLabel("Description");
    this.studentSelect = page.getByLabel("Student");
    this.supervisorSelect = page.getByLabel("Supervisor");
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.primaryButton = page.getByRole("button", {
      name: /Create|Save|Archive|Restore/,
    });
  }

  async waitForOpen() {
    await this.dialog.waitFor({ state: "visible" });
  }

  async waitForClose() {
    await this.dialog.waitFor({ state: "hidden" });
  }

  async fillTitle(value: string) {
    await this.projectTitleInput.fill(value);
  }

  async fillDescription(value: string) {
    await this.projectDescriptionInput.fill(value);
  }

  async selectStudent(name: string) {
    await this.studentSelect.click();
    await this.page.getByRole("option", { name }).click();
  }

  async selectSupervisor(name: string) {
    await this.supervisorSelect.click();
    await this.page.getByRole("option", { name }).click();
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
