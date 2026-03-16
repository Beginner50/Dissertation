import path from "path";
import type { Locator, Page } from "@playwright/test";
import ModalPOM from "../components/modal.pom";
import CollectionPOM from "../components/collection.pom";

export default class AdminSupervisionPage {
  readonly page: Page;
  readonly modal: ModalPOM;
  readonly table: CollectionPOM;
  readonly ingestButton: Locator;
  readonly addProjectButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = new ModalPOM(page);
    this.table = new CollectionPOM(page, "table");
    this.ingestButton = page.getByRole("button", { name: "Ingest Project List" });
    this.addProjectButton = page.getByRole("button", { name: "Add Project" });
  }

  async clickAddProjectButton() {
    await this.addProjectButton.click();
    await this.modal.waitForVisible();
    return this.modal;
  }

  // https://playwright.dev/docs/api/class-filechooser
  async ingestFile(filePath: string) {
    const absolutePath = path.resolve(__dirname, "../../..", filePath);

    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.ingestButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(absolutePath);
  }
}
