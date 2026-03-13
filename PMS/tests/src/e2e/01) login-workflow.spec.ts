import { test, expect } from "@playwright/test";
import SignInPage from "../pom/signIn.page";
import AdminLayoutPage from "../pom/admin/adminLayout.page";

/*
    The following tests are intended to cover the login workflow, including:
        - Successful login with valid credentials
        - Unsuccessful login with invalid credentials
        - Validation errors for empty fields
*/
test.describe("Login Workflow", () => {
  test("Successful login with valid credentials", async ({ page }) => {
    const signInPage = new SignInPage(page);
    const adminLayoutPage = new AdminLayoutPage(page);

    await page.screenshot({ path: "debug-screenshot.png" });

    await page.goto("/sign-in");
    await signInPage.signIn("admin@uni.com", "password");

    await expect(adminLayoutPage.signOutButton).toBeVisible();
  });

  test("Submit Button disabled for empty fields", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await page.goto("/sign-in");

    await expect(signInPage.signInButton).toBeDisabled();

    await signInPage.emailInput.fill("notexists@uni.com");
    await signInPage.passwordInput.fill("");
    await expect(signInPage.signInButton).toBeDisabled();

    await signInPage.emailInput.fill("");
    await signInPage.passwordInput.fill("password");
    await expect(signInPage.signInButton).toBeDisabled();
  });

  test("Unsuccessful login with invalid credentials", async ({ page }) => {
    const signInPage = new SignInPage(page);

    await page.goto("/sign-in");
    await signInPage.signIn("notexists@uni.com", "password");

    await expect(signInPage.error).toBeVisible();
    await expect(signInPage.error).toHaveText("Sign-in failed. Check your credentials.");
  });
});
