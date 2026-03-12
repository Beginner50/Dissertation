import type { Locator, Page } from "@playwright/test";

export default class FeedbackModalPage {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly descriptionInput: Locator;
  readonly metToggle: Locator;
  readonly unmetToggle: Locator;
  readonly overriddenToggle: Locator;
  readonly cancelButton: Locator;
  readonly primaryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog");
    this.title = page.getByRole("heading", { level: 2 });
    this.descriptionInput = page.getByLabel("Description");
    this.metToggle = page.getByRole("button", { name: /Met/i });
    this.unmetToggle = page.getByRole("button", { name: /Unmet/i });
    this.overriddenToggle = page.getByRole("button", { name: /Overridden/i });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.primaryButton = page.getByRole("button", { name: /Create|Save/ });
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

  async setStatus(status: "met" | "unmet" | "overridden") {
    if (status === "met") await this.metToggle.click();
    if (status === "unmet") await this.unmetToggle.click();
    if (status === "overridden") await this.overriddenToggle.click();
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
