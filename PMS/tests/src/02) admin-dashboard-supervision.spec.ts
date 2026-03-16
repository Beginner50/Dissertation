import test, { expect, Page } from "@playwright/test";
import AdminLayoutPage from "./pom/admin.pom/adminLayout.pom";
import SignInPage from "./pom/signIn.pom";
import CollectionPOM from "./pom/components/collection.pom";

/*
  FR2/FR4
  B. The system shall allow Administrators to create, edit, and archive projects
     (including the specification of supervisor-student pairings).
    B.1. Project List Ingestion
       B.1.1. Complete List Ingestion (no existing projects)
       B.1.2. Partial List Ingestion (some existing projects)
       B.1.3. Unsucessful Ingestion (invalid file format)
       B.1.4. Unsucessful Ingestion (missing columns)
       B.1.5. Unsucessful Ingestion (invalid data)
       B.1.6. Unsucessful Ingestion (missing users - deleted users count as missing)
       B.1.7. Unsucessful Ingestion (roles not respected)
      
    B.2. Manual Project Creation
      B.2.1. Submit Button disabled for empty fields
      B.2.2. Successful Project Creation
      B.2.3. Unsuccessful Project Creation (deleted student)
      B.2.4. Unsuccessful Project Creation (deleted supervisor)
      B.2.5. Unsuccessful Project Creation (roles not respected)
    
    B.3. Manual Project Edit
      B.3.1. Submit Button disabled for empty fields
      B.3.2. Successful Project Update
      B.3.3. Unsuccessful Project Update (deleted student)
      B.3.4. Unsuccessful Project Update (deleted supervisor)
      B.2.5. Unsuccessful Project Update (roles not respected)
    
    B.4. Archive Project
      B.4.1. Successful Project Archived
      B.4.3. Successful Project Restored
      B.4.4. Menu Button disabled for project with deleted user
*/
test.describe("Admin Dashboard - Supervision", () => {
  let accessToken: string;
  let adminLayout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    const signIn = new SignInPage(page);
    adminLayout = new AdminLayoutPage(page);

    await page.goto("/sign-in?page-size=100");
    const responseBody = await signIn.signIn("admin@uni.com", "password");
    accessToken = responseBody.token;

    await adminLayout.waitUntilLoaded();
  });

  test.describe("B.1. Project List Ingestion", () => {
    test.describe.serial(() => {
      test.slow();
      // B.1.1.
      test("B.1.1. Complete List Ingestion (no existing projects)", async ({ page }) => {
        const supervisionDashboard = await adminLayout.clickSupervision();
        await supervisionDashboard.ingestFile(
          "./test-assets/project-list/no_existing.xlsx",
        );

        await supervisionDashboard.table.getFirstCollectionEntry("ingest-project-1");
        await supervisionDashboard.table.getFirstCollectionEntry("ingest-project-2");
      });

      // B.1.2.
      test("B.1.2. Partial List Ingestion (some existing projects)", async ({ page }) => {
        const supervisionDashboard = await adminLayout.clickSupervision();
        await supervisionDashboard.ingestFile(
          "./test-assets/project-list/partial_existing.xlsx",
        );

        await expect(
          supervisionDashboard.table.getFirstCollectionEntryLocator("ingest-project-1"),
        ).toBeVisible();
        await supervisionDashboard.table.getFirstCollectionEntry("ingest-project-3");
      });
    });

    // B.1.3.
    test("B.1.3. Unsuccessful Ingestion (invalid file format)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();
      await supervisionDashboard.ingestFile(
        "./test-assets/project-list/wrong_format.txt",
      );

      await adminLayout.expectErrorValueAndCloseError(/File Is Not Valid Excel/i);
    });

    // B.1.4.
    test("B.1.4. Unsuccessful Ingestion (missing columns)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();
      await supervisionDashboard.ingestFile(
        "./test-assets/project-list/missing_columns.xlsx",
      );

      await adminLayout.expectErrorValueAndCloseError(
        /Excel is missing required columns/i,
      );
    });

    // B.1.5.
    test("B.1.5. Unsuccessful Ingestion (invalid data)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();
      await supervisionDashboard.ingestFile(
        "./test-assets/project-list/invalid_data.xlsx",
      );

      await adminLayout.expectErrorValueAndCloseError(
        /(Invalid Student Email Format|Invalid Supervisor Email Format|Not All Users In The List Exist!)/i,
      );
    });

    // B.1.6.
    test("B.1.6. Unsucessful Ingestion (missing users)", async () => {
      const supervisionDashboard = await adminLayout.clickSupervision();
      await supervisionDashboard.ingestFile(
        "./test-assets/project-list/missing_users.xlsx",
      );

      await adminLayout.expectErrorValueAndCloseError(/Not /i);
    });

    // B.1.7.
    test("B.1.7. Unsucessful Ingestion (roles not respected)", async () => {
      const supervisionDashboard = await adminLayout.clickSupervision();
      await supervisionDashboard.ingestFile(
        "./test-assets/project-list/invalid_roles.xlsx",
      );

      await adminLayout.expectErrorValueAndCloseError(
        /(Supervisor|Student).*Not.*Found/i,
      );
    });
  });

  test.describe("B.2. Manual Project Creation", () => {
    // B.2.1.
    test("B.2.1. Submit Button disabled for empty fields", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const modal = await supervisionDashboard.clickAddProjectButton();
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Title/i, "projectB.2.1");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Student Email/i, "userB_student1@uni.com");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Supervisor Email/i, "userB_supervisor1@uni.com");
      await expect(modal.primaryButton).toBeEnabled();
    });

    // B.2.2.
    test("B.2.2. Successful Project Creation", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const modal = await supervisionDashboard.clickAddProjectButton();

      await modal.setField(/Title/i, "projectB.2.2");
      await modal.setField(/Description/i, "Created via Playwright B.2.2.");
      await modal.setField(/Student Email/i, "userB_student3@uni.com");
      await modal.setField(/Supervisor Email/i, "userB_supervisor2@uni.com");

      await modal.submit();

      await supervisionDashboard.table.getFirstCollectionEntry("projectB.2.2");
    });

    // B.2.3.
    test("B.2.3. Unsuccessful Project Creation (deleted student)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const modal = await supervisionDashboard.clickAddProjectButton();

      await modal.setField(/Title/i, "projectB.2.3");
      await modal.setField(/Description/i, "Deleted B.2.3.");
      await modal.setField(/Student Email/i, "userB_student_deleted@uni.com");
      await modal.setField(/Supervisor Email/i, "userB_supervisor1@uni.com");

      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Student.*Not Found/i);
    });

    // B.2.4.
    test("B.2.4. Unsuccessful Project Creation (deleted supervisor)", async ({
      page,
    }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const modal = await supervisionDashboard.clickAddProjectButton();

      await modal.setField(/Title/i, "projectB.2.4");
      await modal.setField(/Description/i, "Deleted B.2.4.");
      await modal.setField(/Student Email/i, "userB_student1@uni.com");
      await modal.setField(/Supervisor Email/i, "userB_supervisor_deleted@uni.com");

      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Supervisor.*Not Found/i);
    });

    // B.2.5.
    test("B.2.5. Unsuccessful Project Creation (roles not respected)", async ({
      page,
    }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const modal = await supervisionDashboard.clickAddProjectButton();

      await modal.setField(/Title/i, "projectB.2.5");
      await modal.setField(/Description/i, "Deleted B.2.5.");
      await modal.setField(/Student Email/i, "userB_supervisor1@uni.com");
      await modal.setField(/Supervisor Email/i, "userB_student1@uni.com");

      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(
        /(Supervisor|Student).*Not.*Found/i,
      );
    });
  });

  test.describe("B.3. Manual Project Edit", () => {
    // B.3.1.
    test("B.3.1. Submit Button disabled for empty fields", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.3_unsuccessful_updates",
      );
      const modal = await row.performAction("Edit");

      await modal.setField(/Title/i, "");
      await expect(modal.primaryButton).toBeDisabled();

      await modal.setField(/Title/i, "Updated Title");
      await modal.setField(/Student Email/i, "");
      await expect(modal.primaryButton).toBeDisabled();
    });

    // B.3.2.
    test("B.3.2. Successful Project Update", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.3_same_members",
      );
      const modal = await row.performAction("Edit");

      await modal.setField(/Title/i, "projectB.3.2");

      await modal.submit();

      await supervisionDashboard.table.getFirstCollectionEntry("projectB.3.2");
    });

    // B.3.3.
    test("B.3.3. Unsuccessful Project Update (deleted student)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.3_unsuccessful_updates",
      );
      const modal = await row.performAction("Edit");

      await modal.setField(/Student Email/i, "userB_student_deleted@uni.com");

      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Student.*Not Found/i);
    });

    // B.3.4.
    test("B.3.4. Unsuccessful Project Update (deleted supervisor)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.3_unsuccessful_updates",
      );
      const modal = await row.performAction("Edit");

      await modal.setField(/Supervisor Email/i, "userB_supervisor_deleted@uni.com");
      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Supervisor.*Not Found/i);
    });

    // B.3.5.
    test("B.3.5. Unsuccessful Project Update (roles not respected)", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.3_unsuccessful_updates",
      );
      const modal = await row.performAction("Edit");

      await modal.setField(/Supervisor Email/i, "userB_student1@uni.com");
      await modal.submit();

      await adminLayout.expectErrorValueAndCloseError(/Supervisor.*Not.*Found/i);
    });
  });

  test.describe("B.4. Archive Project", () => {
    // B.4.1.
    test("B.4.1. Successful Project Archived", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.4_to_archive",
      );
      const modal = await row.performAction("Archive");
      await modal.submit();

      await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.4_to_archive",
        "archived",
      );
    });

    // B.4.2.
    test("B.4.2. Successful Project Restored", async ({ page }) => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.4_to_restore",
      );
      const modal = await row.performAction("Restore");
      await modal.submit();

      await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.4_to_restore",
        "active",
      );
    });

    // B.4.3.
    test("B.4.3. Menu Button disabled for project with deleted member", async () => {
      const supervisionDashboard = await adminLayout.clickSupervision();

      const row = await supervisionDashboard.table.getFirstCollectionEntry(
        "projectB.4_deleted_member",
      );
      await expect(row.menuButton).not.toBeVisible();
    });
  });
});
