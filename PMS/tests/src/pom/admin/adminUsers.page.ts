import { expect, type Locator, type Page } from "@playwright/test";
import TablePOM from "../components/table.pom";
import ModalPOM from "../components/modal.pom";

export default class AdminUsersPage {
  readonly page: Page;
  readonly modal: ModalPOM;
  readonly table: TablePOM;
  readonly addUserButton: Locator;
  readonly ingestButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = new ModalPOM(page);
    this.table = new TablePOM(page);
    this.addUserButton = page.getByRole("button", { name: /Add User/i });
    this.ingestButton = page.getByText(/Ingest User List/i);
  }

  async navigate() {
    await this.page.goto("/admin-dashboard/users");
  }

  async clickAddUserButton() {
    await this.addUserButton.click();
    await this.modal.waitForVisible();
    return this.modal;
  }

  // https://playwright.dev/docs/api/class-filechooser
  async ingestFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.ingestButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }
}
