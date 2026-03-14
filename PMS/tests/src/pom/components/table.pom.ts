import { expect, type Locator, type Page } from "@playwright/test";
import TableEntryPOM from "./table-entry.pom";

export default class TablePOM {
  readonly page: Page;
  readonly container: Locator;
  readonly menu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByRole("table");
    this.menu = page.getByRole("menu");
  }

  async getColumnIndex(column: string) {
    const headers = this.container.locator("th");
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text?.toLowerCase() === column.toLowerCase()) {
        return i;
      }
    }
    throw new Error(`Column "${column}" Not Found!`);
  }

  async getFirstTableEntry(...identifiers: (string | number)[]): Promise<TableEntryPOM> {
    let rows = this.container.locator("tr");

    for (const id of identifiers) {
      rows = rows.filter({ hasText: id.toString() });
    }

    const row = rows.first();

    await row.waitFor({ state: "visible", timeout: 10000 });

    return new TableEntryPOM(row, this);
  }
}
