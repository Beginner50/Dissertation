import { test, expect, Page } from "@playwright/test";
import "node";
import path from "path";
import SignInPage from "../pom/signIn.page";
import AdminLayoutPage from "../pom/admin/adminLayout.page";
import UserTablePage from "../pom/components/userTable.page";
import UserModalPage from "../pom/components/userModal.page";
import ProjectSupervisionTablePage from "../pom/components/projectSupervisionTable.page";

test.describe("Admin role - user & project management", () => {
  let page: Page;
  let adminLayout: AdminLayoutPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const signIn = new SignInPage(page);
    await page.goto("http://localhost:3000/sign-in");
    await signIn.signIn("admin@uni.com", "password");

    adminLayout = new AdminLayoutPage(page);
  });

  /*
    FR2/FR3 
    A. The system shall allow Administrators to create, edit, and delete user accounts.
      A.1. User List Ingestion
        A.1.1. Complete List Ingestion (no existing users)
        A.1.2. Partial List Ingestion (some existing users)
        A.1.3. Unsucessful Ingestion (invalid file format)
        A.1.4. Unsucessful Ingestion (missing columns)
        A.1.5. Unsucessful Ingestion (invalid data)

      A.2. Manual User Creation
        A.2.1. Submit Button disabled for empty fields
        A.2.2. Successful User Creation (normal)
        A.2.3. Successful User Creation (deleted user email)
        A.2.4. Unsuccessful User Creation (invalid email format)
        A.2.5. Unsuccessful User Creation (invalid role format)
        A.2.6. Unsuccessful User Creation (existing user email)
      
      A.3. Manual User Edit
        A.3.1. Edit Button disabled for empty fields
        A.3.2. Edit Menu Button disabled for deleted user
        A.3.3. Successful User Update (same email)
        A.3.4. Successful User Update (changed email to new original email)
        A.3.5. Successful User Update (changed email to deleted user email)
        A.3.6. Unsuccessful User Update (invalid email format)
        A.3.7. Unsuccessful User Update (invalid email format)
        A.3.8. Unsuccessful User Update (changed email to existing user email)

      A.4. Manual User Delete
        A.4.1. Successful User Delete (check deleted user + archived projects)
        A.4.2. Delete Menu Button disabled for deleted user

    B. The system shall allow Administrators to create, edit, and archive projects
       (including the specification of supervisor-student pairings).
      B.1. Project List Ingestion
         B.1.1. Complete List Ingestion (no existing projects)
         B.1.2. Partial List Ingestion (some existing projects)
         B.1.3. Unsucessful Ingestion (invalid file format)
         B.1.4. Unsucessful Ingestion (missing columns)
         B.1.5. Unsucessful Ingestion (invalid data)
        
      B.2. Manual Project Creation
        B.2.1. Submit Button disabled for empty fields
        B.2.2. Successful Project Creation
        B.2.3. Unsuccessful Project Creation (deleted student)
        B.2.4. Unsuccessful Project Creation (deleted supervisor)
      
      B.3. Manual Project Edit
        B.3.1. Submit Button disabled for empty fields
        B.3.2. Successful Project Update
        B.3.3. Unsuccessful Project Update (deleted student)
        B.3.4. Unsuccessful Project Update (deleted supervisor)
        B.3.5. Edit Menu Button disabled for archived project
      
      B.4. Archive Project
        B.4.1. Successful Project Archived
        B.4.2. Successful Project Restored
   */

  test("A.1.1 Complete List Ingestion (no existing users)", async ({ page }) => {
    const filePath = path.resolve(__dirname, "../test-assets/valid_users.xlsx");

    // Playwright's file chooser listener
    const fileChooserPromise = page.waitForEvent("filechooser");
    await adminLayout.users().ingestButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await expect(adminLayout.users().table.getRow("ingest_one@uni.com")).toBeVisible();
    await expect(adminLayout.users().table.getRow("ingest_two@uni.com")).toBeVisible();
  });

  test("A.1.2 Partial List Ingestion (some existing users)", async ({ page }) => {
    const filePath = path.resolve(__dirname, "../test-assets/partial_existing.xlsx");

    await page.setInputFiles("input[type='file']", filePath);

    // If your backend merges users, check that the existing user data is updated/intact
    await expect(adminLayout.users().table.getRow("existing_user@uni.com")).toBeVisible();
  });

  test("A.1.3 Unsuccessful Ingestion (invalid file format)", async ({ page }) => {
    const filePath = path.resolve(__dirname, "../test-assets/wrong_format.txt");

    await page.setInputFiles("input[type='file']", filePath);

    await expect(adminLayout.error).toBeVisible();
    await expect(adminLayout.error).toContainText(/invalid file format|unsupported/i);
  });

  test("A.1.4 Unsuccessful Ingestion (missing columns)", async ({ page }) => {
    const filePath = path.resolve(__dirname, "../test-assets/missing_columns.xlsx");

    await page.setInputFiles("input[type='file']", filePath);

    await expect(adminLayout.error).toBeVisible();
    await expect(adminLayout.error).toContainText(/missing required columns/i);
  });

  test("A.1.5 Unsuccessful Ingestion (invalid data)", async ({ page }) => {
    const filePath = path.resolve(__dirname, "../test-assets/invalid_data.xlsx");

    await page.setInputFiles("input[type='file']", filePath);

    await expect(adminLayout.error).toBeVisible();
    // This will use your extractErrorMessage logic to show the nested validation errors
    await expect(adminLayout.error).toContainText(/invalid/i);
  });
});
