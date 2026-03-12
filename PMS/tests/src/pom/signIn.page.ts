import type { Page, Locator } from "@playwright/test";

export default class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly error: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email Address");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Sign In" });
    this.error = page.getByRole("alert");
    this.heading = page.getByRole("heading", { name: "Sign In" });
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
