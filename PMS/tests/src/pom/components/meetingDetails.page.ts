import type { Locator, Page } from "@playwright/test";

export default class MeetingDetailsPage {
  readonly page: Page;
  readonly header: Locator;
  readonly statusRow: Locator;
  readonly organizerRow: Locator;
  readonly attendeeRow: Locator;
  readonly timeRow: Locator;
  readonly descriptionText: Locator;
  readonly editDescriptionButton: Locator;
  readonly descriptionTextarea: Locator;
  readonly saveDescriptionButton: Locator;
  readonly cancelDescriptionButton: Locator;
  readonly acceptButton: Locator;
  readonly rejectButton: Locator;
  readonly cancelMeetingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole("heading", { level: 6 });
    this.statusRow = page.getByText(/Status:/i);
    this.organizerRow = page.getByText(/Organizer:/i);
    this.attendeeRow = page.getByText(/Attendee:/i);
    this.timeRow = page.getByText(/Time:/i);
    this.descriptionText = page.getByText(/No description provided\.|/i);
    this.editDescriptionButton = page.getByRole("button", { name: /edit/i });
    this.descriptionTextarea = page.getByRole("textbox", { name: /description/i });
    this.saveDescriptionButton = page.getByRole("button", { name: /save/i });
    this.cancelDescriptionButton = page.getByRole("button", { name: /cancel/i });
    this.acceptButton = page.getByRole("button", { name: /Accept/i });
    this.rejectButton = page.getByRole("button", { name: /Reject/i });
    this.cancelMeetingButton = page.getByRole("button", { name: /Cancel Meeting/i });
  }

  async getHeaderText() {
    return this.header.textContent();
  }

  async clickEditDescription() {
    await this.editDescriptionButton.click();
  }

  async editDescription(value: string) {
    await this.descriptionTextarea.fill(value);
  }

  async saveDescription() {
    await this.saveDescriptionButton.click();
  }

  async cancelDescription() {
    await this.cancelDescriptionButton.click();
  }

  async clickAccept() {
    await this.acceptButton.click();
  }

  async clickReject() {
    await this.rejectButton.click();
  }

  async clickCancelMeeting() {
    await this.cancelMeetingButton.click();
  }
}
