import type { Locator, Page } from "@playwright/test";

export default class UserModalPage {
  readonly page: Page;
  readonly container: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly primaryButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByRole("dialog");
    this.nameInput = this.container.getByLabel(/Full Name/i);
    this.emailInput = this.container.getByLabel(/Email Address/i);
    this.passwordInput = this.container.getByLabel(/Password/i);
    this.roleSelect = this.container.getByLabel(/User Role/i);
    this.primaryButton = this.container.getByRole("button", {
      name: /Create|Edit|Delete/i,
    });
    this.cancelButton = this.container.getByRole("button", { name: /Cancel/i });
  }

  async fillForm(data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }) {
    if (data.name) await this.nameInput.fill(data.name);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.password) await this.passwordInput.fill(data.password);
    if (data.role) {
      await this.roleSelect.click();
      await this.page.getByRole("option", { name: new RegExp(data.role, "i") }).click();
    }
  }

  async submit() {
    await this.primaryButton.click();
    await this.container.waitFor({ state: "hidden" });
  }
}
