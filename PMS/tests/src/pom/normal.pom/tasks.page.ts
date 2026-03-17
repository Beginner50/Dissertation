import type { Locator, Page } from "@playwright/test";
import CollectionPOM from "../components/collection.pom";
import ModalPOM from "../components/modal.pom";

export default class TasksPOM {
  readonly page: Page;
  readonly list: CollectionPOM;
  readonly modal: ModalPOM;
  readonly header: Locator;
  readonly createTaskButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { name: /Project Tasks/i });
    this.list = new CollectionPOM(page, "list");
    this.modal = new ModalPOM(page);
    this.createTaskButton = page.getByRole("button", { name: /Create Task/i });
  }

  async clickCreateTaskButton() {
    await this.createTaskButton.click();
    await this.modal.waitForVisible();
    return this.modal;
  }

  async waitForLoaded() {
    await this.header.waitFor({ state: "visible" });
  }
}
