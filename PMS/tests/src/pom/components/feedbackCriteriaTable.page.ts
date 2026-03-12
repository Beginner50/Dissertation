import type { Locator, Page } from "@playwright/test";

export default class FeedbackCriteriaTablePage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator("table");
  }

  rowForCriterion(description: string) {
    return this.table.locator("tr", { hasText: description }).first();
  }

  async expandCriterion(description: string) {
    const row = this.rowForCriterion(description);
    await row.locator("button").first().click();
  }

  async clickEditCriterion(description: string) {
    await this.expandCriterion(description);
    await this.page.getByRole("menuitem", { name: "Edit Criterion" }).click();
  }

  async clickDeleteCriterion(description: string) {
    await this.expandCriterion(description);
    await this.page.getByRole("menuitem", { name: "Delete Criterion" }).click();
  }

  async clickOverrideCriterion(description: string) {
    await this.expandCriterion(description);
    await this.page.getByRole("menuitem", { name: /Override|Restore/ }).click();
  }

  async isEmptyStateVisible() {
    return this.page.getByText(/No feedback criteria have been added/).isVisible();
  }
}
