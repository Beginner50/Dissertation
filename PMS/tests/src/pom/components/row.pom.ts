import { expect, Page, type Locator } from "@playwright/test";
import ModalPOM from "./modal.pom";

export default class RowPOM {
  readonly row: Locator;
  readonly menuButton: Locator;
  readonly modal: ModalPOM;

  constructor(page: Page, row: Locator) {
    this.row = row;
    this.menuButton = this.row.getByRole("button");
    this.modal = new ModalPOM(page);
  }

  async getItemID() {
    const id = await this.row.getAttribute("data-item-id");
    return id;
  }

  async getMenuItemLocator(item: RegExp) {
    await this.menuButton.click();
    return this.row
      .page()
      .getByRole("menu")
      .getByRole("menuitem")
      .filter({ hasText: item });
  }

  async performAction(action: "Edit" | "Delete" | "Archive" | "Restore") {
    await this.menuButton.click();
    const menu = this.row.page().getByRole("menu");
    await menu.getByRole("menuitem", { name: new RegExp(action, "i") }).click();

    await this.modal.waitForVisible();
    return this.modal;
  }
}
