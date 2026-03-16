import type { Locator, Page } from "@playwright/test";
import CollectionPOM from "../components/collection.pom";

export default class ProjectsPOM {
  readonly page: Page;
  readonly header: Locator;
  readonly list: CollectionPOM;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /My Projects/i });
    this.list = new CollectionPOM(page, "list");
  }

  async waitForLoaded() {
    await this.header.waitFor({ state: "visible" });
  }
}
