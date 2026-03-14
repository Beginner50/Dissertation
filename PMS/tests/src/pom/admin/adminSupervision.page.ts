import type { Locator, Page } from "@playwright/test";

export default class AdminSupervisionPage {
  readonly page: Page;
  readonly tableHeader: Locator;
  readonly emptyState: Locator;
  readonly ingestButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableHeader = page.getByRole("columnheader", { name: /ID/i });
    this.emptyState = page.getByText(/No projects found/i);
    this.ingestButton = page.getByText(/Ingest/i);
  }

  async waitForLoaded() {
    await this.tableHeader.waitFor({ state: "visible" });
  }

  // https://playwright.dev/docs/api/class-filechooser
  async ingestFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");

    await this.ingestButton.click();

    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(filePath);
  }
}
