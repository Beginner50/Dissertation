import { expect, type Locator, type Page } from "@playwright/test";
import RowPOM from "./row.pom";
import InteractiveRowPOM from "./interactive-row.pom";

export default class CollectionPOM {
  readonly page: Page;
  readonly container: Locator;
  readonly itemSelectorRole: "tr" | "listitem";

  constructor(page: Page, role: "table" | "list") {
    this.page = page;
    this.container = page.getByRole(role);
    this.itemSelectorRole = role == "table" ? "tr" : "listitem";
  }

  getFirstCollectionEntryLocatorByTestID(testID: string | number) {
    const rows = this.page.getByTestId(testID.toString());
    return rows.first();
  }

  async getFirstCollectionInteractiveEntryByTestID(testID: string | number) {
    const row = this.getFirstCollectionEntryLocatorByTestID(testID);
    await row.waitFor({ state: "visible", timeout: 10000 });

    return new InteractiveRowPOM(this.page, row);
  }

  getFirstCollectionEntryLocator(...identifiers: (string | number)[]): Locator {
    let rows = this.container.locator(this.itemSelectorRole);

    for (const id of identifiers) {
      rows = rows.filter({ hasText: id.toString() });
    }

    return rows.first();
  }

  async getFirstCollectionEntry(...identifiers: (string | number)[]): Promise<RowPOM> {
    const row = this.getFirstCollectionEntryLocator(...identifiers);
    await row.waitFor({ state: "visible", timeout: 10000 });

    return new RowPOM(this.page, row);
  }

  async getFirstCollectionInteractiveEntry(
    ...identifiers: (string | number)[]
  ): Promise<InteractiveRowPOM> {
    const row = this.getFirstCollectionEntryLocator(...identifiers);
    await row.waitFor({ state: "visible", timeout: 10000 });

    return new InteractiveRowPOM(this.page, row);
  }
}
