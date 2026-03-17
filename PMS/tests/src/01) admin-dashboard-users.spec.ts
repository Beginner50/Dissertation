import test, { expect, Page, request } from "@playwright/test";
import AdminLayoutPage from "./pom/admin.pom/adminLayout.pom";
import SignInPage from "./pom/signIn.pom";
import AdminUsersPage from "./pom/admin.pom/adminUsers.pom";

/*
  FR1/FR3 
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
      A.2.4. Unsuccessful User Creation (existing user email)
      A.2.5. Unsuccessful User Creation (invalid email format)
      A.2.6: Unsuccessful User Creation (invalid role)
    
    A.3. Manual User Edit
      A.3.1. Edit Button disabled for empty fields
      A.3.2. Successful User Update (same email)
      A.3.3. Successful User Update (changed email to new original email)
      A.3.4. Successful User Update (changed email to deleted user email)
      A.3.5. Unsuccessful User Update (invalid email format)
      A.3.6. Unsuccessful User Update (changed email to existing user email)
      A.3.7: Unsuccessful User Update (invalid role)

    A.4. Manual User Delete
      A.4.1. Successful User Delete (check deleted user + archived projects)
      A.4.2. Menu Button disabled for deleted user
*/
test.describe("Admin Dashboard - Users", () => {
  let accessToken: string;
  let adminLayout: AdminLayoutPage;

  test.slow();

  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    adminLayout = new AdminLayoutPage(page);

    await page.goto("/sign-in?page-size=100");
    const authData = await signIn.signIn("admin@uni.com", "password");
    accessToken = authData.token;

    await adminLayout.waitUntilLoaded();
  });

  test.describe("A.1. User List Ingestion", () => {
    test.describe.serial(() => {
      test.slow();
      // A.1.1.
      test("A.1.1. Complete List Ingestion (no existing users)", async ({ page }) => {
        const usersDashboard = await adminLayout.clickUsers();
        await usersDashboard.ingestFile("./test-assets/user-list/no_existing.xlsx");

        await usersDashboard.table.getFirstCollectionEntry("ingest1@uni.com");
        await usersDashboard.table.getFirstCollectionEntry("ingest2@uni.com");
        await usersDashboard.table.getFirstCollectionEntry("ingest3@uni.com");
      });

      // A.1.2.
      test("A.1.2. Partial List Ingestion (some existing users)", async ({ page }) => {
        const usersDashboard = new AdminUsersPage(page);
        await usersDashboard.ingestFile("./test-assets/user-list/partial_existing.xlsx");

        // Will fail if there are more than 1 ingest3@uni.com entry
        await expect(
          usersDashboard.table.getFirstCollectionEntryLocator("ingest1@uni.com"),
        ).toBeVisible();
        await usersDashboard.table.getFirstCollectionEntry("ingest4@uni.com");
      });
    });

    // A.1.3
    test("A.1.3. Unsuccessful Ingestion (invalid file format)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("./test-assets/user-list/wrong_format.txt");

      await adminLayout.expectErrorValueAndCloseError(/File Is Not Valid Excel/i);
    });

    // A.1.4
    test("A.1.4. Unsuccessful Ingestion (missing columns)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("./test-assets/user-list/missing_columns.xlsx");

      await adminLayout.expectErrorValueAndCloseError(
        /Excel is missing required columns: Password/i,
      );
    });

    // A.1.5
    test("A.1.5. Unsuccessful Ingestion (invalid data)", async ({ page }) => {
      const usersDashboard = await adminLayout.clickUsers();
      await usersDashboard.ingestFile("./test-assets/user-list/invalid_data.xlsx");

      await adminLayout.expectErrorValueAndCloseError(/Row 2: Invalid Email Format!/i);
    });
  });

  test.describe("A.2. Manual User Creation + Deletion", () => {
    // A.2.1.
    test("A.2.1. Submit Button Disabled for Empty Fields", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Name/i, "userA.2.1");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Email/i, "userA.2.1@uni.com");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Password/i, "password");
      await expect(modal.primaryButton).toBeEnabled();
    });

    // A.2.2.
    test("A.2.2. Successful User Creation", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await modal.setField(/Name/i, "userA.2.2");
      await modal.setField(/Email/i, "userA.2.2@uni.com");
      await modal.setField(/Password/i, "password");
      await modal.selectOption(/Role/i, "Supervisor");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry("userA.2.2@uni.com");
    });

    // A.2.3.
    test("A.2.3. Successful User Creation (Deleted User)", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await modal.setField(/Name/i, "userA.2.3");
      await modal.setField(/Email/i, "userA.2_deleted_user@uni.com");
      await modal.setField(/Password/i, "password");
      await modal.selectOption(/Role/i, "Student");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry(
        "userA.2_deleted_user@uni.com",
        "Deleted",
      );
      await usersDashboard.table.getFirstCollectionEntry(
        "userA.2_deleted_user@uni.com",
        "Active",
      );
    });

    // A.2.4.
    test("A.2.4. Unsuccessful User Creation (existing user email)", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await modal.setField(/Name/i, "userA.2.4");
      await modal.setField(/Email/i, "userA.2_existing_user@uni.com");
      await modal.setField(/Password/i, "password");
      await modal.selectOption(/Role/i, "student");
      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Email.*In.*Use/i);
    });

    // A.2.5.
    test("A.2.5. Unsuccessful User Creation (invalid email format)", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const modal = await usersDashboard.clickAddUserButton();

      await modal.setField(/Name/i, "userA.2.4");
      await modal.setField(/Email/i, "gibberish");
      await modal.setField(/Password/i, "password");
      await modal.selectOption(/Role/i, "Student");
      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/E.*mail/i);
    });

    test("A.2.6. Unsuccessful User Creation (invalid role)", async () => {
      const invalidUser = {
        name: "userA.2.6",
        email: "userA.2.6@uni.com",
        password: "password",
        role: "penguin",
      };

      const api = await request.newContext();

      const response = await api.post("http://localhost:5081/api/users", {
        data: invalidUser,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseText = await response.text();
      expect(response.status()).toBe(400);
      expect(responseText).toContain("Role Not Valid");

      await api.dispose();
    });
  });

  test.describe("A.3. Manual User Edit", () => {
    // A.3.1.
    test("A.3.1. Edit Button Disabled for Empty Fields", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_unsuccessful_updates@uni.com",
      );
      const modal = await row.performAction("Edit");

      await expect(modal.primaryButton).toBeEnabled();

      await modal.setField(/Name/i, "");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Name/i, "Mog");
      await modal.setField(/Email/i, "");
      await expect(modal.primaryButton).toBeDisabled();
    });

    // A.3.2.
    test("A.3.2. Successful User Update (Same Email)", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      const row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_same_email@uni.com",
      );

      const modal = await row.performAction("Edit");
      await modal.setField(/Name/i, "Ninja");
      await modal.selectOption(/Role/i, "supervisor");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_same_email@uni.com",
        "Ninja",
        "supervisor",
      );
      await expect(
        usersDashboard.table.getFirstCollectionEntryLocator(
          "userA.3_same_email@uni.com",
          "student",
        ),
      ).not.toBeVisible();
    });

    // A.3.3.
    test("A.3.3. Successful User Update (changed email to new original email)", async () => {
      const usersDashboard = await adminLayout.clickUsers();
      let row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_change_to_original@uni.com",
      );

      let modal = await row.performAction("Edit");
      await modal.setField(/Email/i, "userA.3_original_email@uni.com");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_original_email@uni.com",
      );
      await expect(
        usersDashboard.table.getFirstCollectionEntryLocator(
          "userA.3_change_to_original@uni.com",
        ),
      ).not.toBeVisible();
    });

    // A.3.4.
    test("A.3.4. Successful User Update (changed email to deleted user email)", async () => {
      const usersDashboard = await adminLayout.clickUsers();

      const row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_change_to_deleted@uni.com",
      );
      const modal = await row.performAction("Edit");
      await modal.setField(/Email/i, "userA.3_deleted_user@uni.com");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_deleted_user@uni.com",
        "active",
      );
      await expect(
        usersDashboard.table.getFirstCollectionEntryLocator(
          "userA.3_change_to_deleted@uni.com",
        ),
      ).not.toBeVisible();
    });

    // A.3.5.
    test("A.3.5. Unsuccessful User Update (invalid email format)", async () => {
      const usersDashboard = await adminLayout.clickUsers();

      let row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_unsuccessful_updates@uni.com",
      );
      let modal = await row.performAction("Edit");
      await modal.setField(/Email/i, "ada");
      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/E.*mail/i);
      await expect(
        usersDashboard.table.getFirstCollectionEntryLocator("ada"),
      ).not.toBeVisible();
    });

    // A.3.6.
    test("A.3.6. Unsuccessful User Update (changed email to existing user email)", async () => {
      const usersDashboard = await adminLayout.clickUsers();

      let row = await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_unsuccessful_updates@uni.com",
      );
      let modal = await row.performAction("Edit");
      await modal.setField(/Email/i, "userA.3_existing_user@uni.com");
      await modal.submit();

      await usersDashboard.table.getFirstCollectionEntry(
        "userA.3_unsuccessful_updates@uni.com",
      );
      await adminLayout.expectErrorValueAndCloseError(/Email.*In.*Use/i);
    });

    // A.3.7.
    test("A.3.7. Unsuccessful User Edit (invalid role)", async () => {
      const api = await request.newContext();

      const response = await api.put("http://localhost:5081/api/users/2", {
        data: { role: "penguin" },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      expect(response.status()).toBe(400);
      expect(responseText).toContain("Role Not Valid");

      await api.dispose();
    });
  });

  test("A.4.1. Delete User + A.4.2. Menu Button Disabled", async () => {
    const usersDashboard = await adminLayout.clickUsers();

    const row = await usersDashboard.table.getFirstCollectionEntry(
      "userA.4_to_delete@uni.com",
    );
    const modal = await row.performAction("Delete");
    await modal.submit();

    await expect(
      usersDashboard.table.getFirstCollectionEntryLocator(
        "userA.4_to_delete@uni.com",
        "active",
      ),
    ).not.toBeVisible();
    await usersDashboard.table.getFirstCollectionEntry(
      "userA.4_to_delete@uni.com",
      "deleted",
    );
    await expect(row.menuButton).not.toBeVisible();
  });
});
