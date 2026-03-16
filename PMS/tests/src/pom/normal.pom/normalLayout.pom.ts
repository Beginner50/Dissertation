import { expect, type Locator, type Page } from "@playwright/test";
import ProjectsPOM from "./projects.pom";
import SchedulerPOM from "./scheduler.pom";
import TasksPage from "./tasks.page";
import TaskDetailsPage from "./taskDetails.page";

export default class NormalLayoutPOM {
  readonly page: Page;

  readonly brandLink: Locator;
  readonly projectsNav: Locator;
  readonly schedulerNav: Locator;
  readonly signOutButton: Locator;
  readonly breadcrumbs: Locator;

  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;

    this.brandLink = page.getByRole("link", { name: /Project Management System/i });
    this.projectsNav = page.getByRole("link", { name: "Projects" });
    this.schedulerNav = page.getByRole("link", { name: "Scheduler" });
    this.signOutButton = page.getByRole("button", { name: "Sign Out" });
    this.breadcrumbs = page.getByRole("navigation");

    this.error = page.getByRole("alert");
  }

  async waitUntilLoaded() {
    await this.page.waitForURL(/(projects|scheduler)/);
  }

  async clickProjects() {
    await this.projectsNav.click();
    await this.page.waitForURL(/projects/i);
    return new ProjectsPOM(this.page);
  }

  async clickScheduler() {
    await this.schedulerNav.click();
    await this.page.waitForURL(/scheduler/i);
    return new SchedulerPOM(this.page);
  }

  async clickSignOut() {
    await this.signOutButton.click();
  }

  async expectErrorValueAndCloseError(value: RegExp) {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(value);
    await this.error.getByRole("button", { name: /close/i }).click();
  }

  async getBreadcrumbText() {
    return this.breadcrumbs.textContent();
  }
}
