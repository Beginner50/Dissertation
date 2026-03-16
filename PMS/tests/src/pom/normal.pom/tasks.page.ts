import type { Locator, Page } from "@playwright/test";

export default class TasksPage {
  readonly page: Page;
  readonly header: Locator;
  readonly createTaskButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /Project Tasks/i });
    this.createTaskButton = page.getByRole("button", { name: /Create Task/i });
  }

  async waitForLoaded() {
    await this.header.waitFor({ state: "visible" });
  }
}
