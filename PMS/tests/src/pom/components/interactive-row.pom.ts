import { Locator, Page } from "@playwright/test";
import RowPOM from "./row.pom";
import TasksPage from "../normal.pom/tasks.page";
import TaskDetailsPage from "../normal.pom/taskDetails.page";

export default class InteractiveRowPOM extends RowPOM {
  readonly page;

  constructor(page: Page, row: Locator) {
    super(page, row);
    this.page = page;
  }

  async clickProjectLink() {
    await this.row.getByRole("link").first().click();
    await this.page.waitForURL(/tasks/i);
    return new TasksPage(this.page);
  }

  async clickTaskLink() {
    await this.row.getByRole("link").first().click();
    await this.page.waitForURL(/tasks\/[0-9]+/i);
    return new TaskDetailsPage(this.page);
  }
}
