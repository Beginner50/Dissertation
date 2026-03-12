import type { Locator, Page } from "@playwright/test";
import UserModalPage from "../components/userModal.page";
import UserTablePage from "../components/userTable.page";

export default class AdminUsersPage {
  readonly page: Page;
  readonly modal: UserModalPage;
  readonly table: UserTablePage;
  readonly addUserButton: Locator;
  readonly ingestButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = new UserModalPage(page);
    this.table = new UserTablePage(page);
    this.addUserButton = page.getByRole("button", { name: /Add User/i });
    this.ingestButton = page.getByRole("button", { name: /Ingest User List/i });
  }

  async navigate() {
    await this.page.goto("/admin-dashboard/users");
  }

  async startAddUser() {
    await this.addUserButton.click();
    await this.modal.container.waitFor({ state: "visible" });
  }
}
