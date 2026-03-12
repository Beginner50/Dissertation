import type { Locator, Page } from "@playwright/test";

export default class ProjectsPage {
  readonly page: Page;
  readonly header: Locator;
  readonly noProjectsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /My Projects/i });
    this.noProjectsMessage = page.getByText("You are not a member of any projects yet.");
  }

  async waitForLoaded() {
    await this.header.waitFor({ state: "visible" });
  }
}
