import { expect, type Locator, type Page } from "@playwright/test";

export default class UserTablePage {
  readonly page: Page;
  readonly container: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByRole("table");
    this.emptyState = page.getByText(/No users found/i);
  }

  getRow(identifier: string | number) {
    return this.container.locator("tr").filter({ hasText: identifier.toString() });
  }

  async openActions(identifier: string | number) {
    const row = this.getRow(identifier);
    await row.getByRole("button").first().click();
  }

  async selectAction(action: "Edit User" | "Delete User") {
    await this.page.getByRole("menuitem", { name: action }).click();
  }

  async expectUserVisible(email: string) {
    await expect(this.getRow(email)).toBeVisible();
  }
}
