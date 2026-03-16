import { expect, type Locator, type Page } from "@playwright/test";

export default class ModalPOM {
  readonly page: Page;
  readonly dialog: Locator;
  readonly primaryButton: Locator;
  readonly cancelButton: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole("dialog");
    this.title = this.dialog.getByRole("heading", { level: 2 });
    this.cancelButton = this.dialog.getByRole("button", { name: /Cancel/i });
    this.primaryButton = this.dialog.getByRole("button", {
      name: /Create|Save|Edit|Delete|Submit|Archive|Restore/i,
    });
  }

  getField(label: string | RegExp) {
    return this.dialog.getByLabel(label);
  }

  async setField(label: string | RegExp, value: string) {
    const field = this.getField(label);
    await field.fill(value);
  }

  async selectOption(label: string | RegExp, option: string) {
    const selectTrigger = this.dialog.getByLabel(label);
    await selectTrigger.click();

    const listbox = this.page.getByRole("listbox");
    await listbox.getByRole("option", { name: new RegExp(option, "i") }).click();

    await expect(listbox).not.toBeVisible();
  }

  async submit() {
    await expect(this.primaryButton).toBeEnabled();
    await this.primaryButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async waitForVisible() {
    await this.dialog.waitFor({ state: "visible" });
  }
}
