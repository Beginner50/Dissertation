import type { Locator, Page } from "@playwright/test";

export default class AdminSupervisionPage {
  readonly page: Page;
  readonly tableHeader: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableHeader = page.getByRole("columnheader", { name: /ID/i });
    this.emptyState = page.getByText(/No projects found\./i);
  }

  async waitForLoaded() {
    await this.tableHeader.waitFor({ state: "visible" });
  }
}
