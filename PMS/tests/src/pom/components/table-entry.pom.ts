import { expect, type Locator } from "@playwright/test";
import TablePOM from "./table.pom";

export default class TableEntryPOM {
  readonly row: Locator;
  readonly table: TablePOM;
  readonly menuButton: Locator;

  constructor(row: Locator, table: TablePOM) {
    this.row = row;
    this.table = table;
    this.menuButton = this.row.getByRole("button");
  }

  async performAction(action: "Edit" | "Delete" | "Archive" | "Restore") {
    await this.menuButton.click();
    const menu = this.row.page().getByRole("menu");
    await menu.getByRole("menuitem", { name: new RegExp(action, "i") }).click();
  }

  async getColumnValue(column: string) {
    const index = await this.table.getColumnIndex(column);
    return this.row.locator("td").nth(index);
  }

  async expectColumnValue(column: string, value: string | RegExp) {
    const columnValue = await this.getColumnValue(column);
    await expect(columnValue).toHaveText(value);
  }

  async expectVisible() {
    await expect(this.row).toBeVisible();
  }
}
