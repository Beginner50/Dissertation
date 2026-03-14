import test, { expect, Page } from "@playwright/test";
import AdminLayoutPage from "./pom/admin/adminLayout.page";
import SignInPage from "./pom/signIn.page";
import AdminUsersPage from "./pom/admin/adminUsers.page";

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
test.describe("Admin Dashboard - Users", () => {
  let adminLayout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    adminLayout = new AdminLayoutPage(page);

    await page.goto("/sign-in");
    await signIn.signIn("admin@uni.com", "password");
    await adminLayout.waitUntilLoaded();
  });

  test.describe("A.1. User List Ingestion", () => {
    // A.1.1 & A.1.2
    test.describe.serial("Successive Ingestion (1 & 2)", () => {
      test("A.1.1. Complete List Ingestion (no existing users)", async ({ page }) => {
        const usersDashboard = await adminLayout.clickUsers();
        await usersDashboard.ingestFile("tests/test-assets/user-list/no_existing.xlsx");

        await usersDashboard.table.getFirstTableEntry("ingest1@uni.com");
        await usersDashboard.table.getFirstTableEntry("ingest2@uni.com");
        await usersDashboard.table.getFirstTableEntry("ingest3@uni.com");
      });

      test("A.1.2. Partial List Ingestion (some existing users)", async ({ page }) => {
        const usersDashboard = new AdminUsersPage(page);
        await usersDashboard.ingestFile(
          "tests/test-assets/user-list/partial_existing.xlsx",
        );

        await usersDashboard.table.getFirstTableEntry("ingest3@uni.com");
        await usersDashboard.table.getFirstTableEntry("ingest4@uni.com");
      });
    });

    // A.1.3
    test("A.1.3. Unsuccessful Ingestion (invalid file format)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("tests/test-assets/user-list/wrong_format.txt");

      await adminLayout.expectErrorValueAndCloseError(/File Is Not Valid Excel/i);
    });

    // A.1.4
    test("A.1.4. Unsuccessful Ingestion (missing columns)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("tests/test-assets/user-list/missing_columns.xlsx");

      await adminLayout.expectErrorValueAndCloseError(
        /Excel is missing required columns: Password/i,
      );
    });

    // A.1.5
    test("A.1.5. Unsuccessful Ingestion (invalid data)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("tests/test-assets/user-list/invalid_data.xlsx");

      await adminLayout.expectErrorValueAndCloseError(/Row 2: Invalid Email Format!/i);
    });
  });

  test.describe("A.2. Manual User Creation + Deletion", () => {
    // A.2.1.
    test("A.2.1. Submit Button Disabled for Empty Fields", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Name/i, "create1");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Email/i, "create1@uni.com");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Password/i, "password");
      await expect(modal.primaryButton).toBeEnabled();
    });

    // A.2.2.
    test("A.2.2. Successful User Creation", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await modal.setField(/Name/i, "user1");
      await modal.setField(/Email/i, "user1@uni.com");
      await modal.setField(/Password/i, "password");
      await modal.selectOption(/Role/i, "Supervisor");
      await modal.submit();

      await usersDashboard.table.getFirstTableEntry("user1@uni.com");
    });

    // A.4.1. & A.2.3.
    test.describe
      .serial("A.4.1. & A.2.3. Successful User Creation (Deleted User)", () => {
      test("A.4.1. Create & Delete User", async () => {
        const usersDashboard = await adminLayout.clickUsers();
        const modal = await usersDashboard.clickAddUserButton();

        await modal.setField(/Name/i, "user2");
        await modal.setField(/Email/i, "user2@uni.com");
        await modal.setField(/Password/i, "password");
        await modal.selectOption(/Role/i, "Student");

        await modal.submit();

        const row = await usersDashboard.table.getFirstTableEntry("user2@uni.com");
        await row.performAction("Delete");
        await modal.submit();

        await expect(row.menuButton).not.toBeVisible();
        await row.expectColumnValue("Status", /Deleted/i);
      });

      test("A.2.3. Successful User Creation (Deleted User)", async () => {
        const usersDashboard = await adminLayout.clickUsers();
        const modal = await usersDashboard.clickAddUserButton();

        await modal.setField(/Name/i, "user2");
        await modal.setField(/Email/i, "user2@uni.com");
        await modal.setField(/Password/i, "password");
        await modal.selectOption(/Role/i, "Student");
        await modal.submit();

        await usersDashboard.table.getFirstTableEntry("user2@uni.com", "Deleted");
        await usersDashboard.table.getFirstTableEntry("user2@uni.com", "Active");
      });
    });

    // A.2.4.
    // test("A.2.4. Unsuccessful User Creation (invalid email format)", async () => {
    //   const usersDashboard = await adminLayout.clickUsers();
    //   const modal = await usersDashboard.clickAddUserButton();

    //   modal.setField(/Name/i, "user2");
    //   modal.setField(/Email/i, "user21");
    //   modal.setField(/Password/i, "password");
    //   modal.selectOption(/Role/i, "Student");
    //   await modal.submit();

    //   await adminLayout.expectErrorValueAndCloseError(/Invalid Email Format!/i);
    // });

    // // A.2.5.
    // test("A.2.5. Unsuccessful User Creation (invalid role format)", async () => {});

    // // A.2.6.
    // test("A.2.6. Unsuccessful User Creation (existing user email)", async () => {});
  });
});
