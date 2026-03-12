import type { Locator, Page } from "@playwright/test";

export default class ProjectSupervisionTablePage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator("table");
  }

  rowForProjectId(projectId: number) {
    return this.table.locator("tr", { hasText: projectId.toString() }).first();
  }

  async openActionsForProject(projectId: number) {
    const row = this.rowForProjectId(projectId);
    await row.locator("button").first().click();
  }

  async clickEditProject(projectId: number) {
    await this.openActionsForProject(projectId);
    await this.page.getByRole("menuitem", { name: "Edit Project" }).click();
  }

  async clickArchiveProject(projectId: number) {
    await this.openActionsForProject(projectId);
    await this.page.getByRole("menuitem", { name: "Archive Project" }).click();
  }

  async clickRestoreProject(projectId: number) {
    await this.openActionsForProject(projectId);
    await this.page.getByRole("menuitem", { name: "Restore Project" }).click();
  }

  async isEmptyStateVisible() {
    return this.page.getByText(/No projects found\./i).isVisible();
  }
}
