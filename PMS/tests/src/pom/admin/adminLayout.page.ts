import type { Locator, Page } from "@playwright/test";
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
    this.signOutButton = page.getByRole("button", { name: "Sign Out" });

    this.error = page.getByRole("alert");
  }

  async clickUsers() {
    await this.usersNav.click();
  }

  async clickSupervision() {
    await this.supervisionNav.click();
  }

  async clickSignOut() {
    await this.signOutButton.click();
  }

  users() {
    return new AdminUsersPage(this.page);
  }

  supervision() {
    return new AdminSupervisionPage(this.page);
  }
}
