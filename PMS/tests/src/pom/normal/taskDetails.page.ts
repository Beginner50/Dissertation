import type { Locator, Page } from "@playwright/test";

export default class TaskDetailsPage {
  readonly page: Page;
  readonly titleHeading: Locator;
  readonly dueDateLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleHeading = page.locator("h1");
    this.dueDateLabel = page.getByText(/Due Date:/i);
  }

  async waitForLoaded() {
    await this.titleHeading.waitFor({ state: "visible" });
  }
}
