import type { Page, Locator } from "@playwright/test";

export default class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly error: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email Address");
    this.passwordInput = page.getByLabel("Password");
    this.signInButton = page.getByTestId("sign-in-button");
    this.error = page.getByRole("alert");
    this.heading = page.getByRole("heading", { name: /Sign In/i });
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/users/login") && response.status() === 200,
    );

    await this.signInButton.click();
    const response = await responsePromise;
    return await response.json();
  }
}
