import type { Locator, Page } from "@playwright/test";
import ProjectsPage from "./projects.page";
import SchedulerPage from "./scheduler.page";
import TasksPage from "./tasks.page";
import TaskDetailsPage from "./taskDetails.page";

/*
  To more accurately represent the has-a relationship between a layout
  route and the actual page routes, composition has been used to model this.

  The individual pages can then be accessed from the layout route by the
  corresponding methods to access them.
*/
export default class NormalLayoutPage {
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

  async clickProjects() {
    await this.projectsNav.click();
  }

  async clickScheduler() {
    await this.schedulerNav.click();
  }

  async clickSignOut() {
    await this.signOutButton.click();
  }

  async getBreadcrumbText() {
    return this.breadcrumbs.textContent();
  }

  projects() {
    return new ProjectsPage(this.page);
  }

  scheduler() {
    return new SchedulerPage(this.page);
  }

  tasks() {
    return new TasksPage(this.page);
  }

  taskDetails() {
    return new TaskDetailsPage(this.page);
  }
}
