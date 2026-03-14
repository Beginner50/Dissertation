import { expect, type Locator, type Page } from "@playwright/test";
import AdminUsersPage from "./adminUsers.page";
import AdminSupervisionPage from "./adminSupervision.page";

/*
  To more accurately represent the has-a relationship between a layout
  route and the actual page routes, composition has been used to model this.

  The individual pages can then be accessed from the layout route by the
  corresponding methods to access them.
*/
export default class AdminLayoutPage {
  readonly page: Page;

  readonly brandLink: Locator;
  readonly usersNav: Locator;
  readonly supervisionNav: Locator;
  readonly signOutButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;

    this.brandLink = page.getByRole("link", { name: /Project Management System/i });
    this.usersNav = page.getByRole("link", { name: /Users/i });
    this.supervisionNav = page.getByRole("link", { name: /Supervision List/i });
    this.signOutButton = page.getByTestId("sign-out-button");
    this.error = page.getByRole("alert");
  }

  async waitUntilLoaded() {
    await this.page.waitForURL(/admin/);
  }

  async clickUsers() {
    await this.usersNav.click();
    await this.page.waitForURL(/users/i);
    return new AdminUsersPage(this.page);
  }

  async clickSupervision() {
    await this.supervisionNav.click();
    await this.page.waitForURL(/supervision/i);
    return new AdminSupervisionPage(this.page);
  }

  async clickSignOut() {
    await this.signOutButton.click();
  }

  async expectErrorValueAndCloseError(value: RegExp) {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(value);
    await this.error.getByRole("button", { name: /close/i }).click();
  }
}
