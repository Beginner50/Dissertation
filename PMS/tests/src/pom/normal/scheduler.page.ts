import type { Locator, Page } from "@playwright/test";

export default class SchedulerPage {
  readonly page: Page;
  readonly calendar: Locator;
  readonly bookMeetingHeader: Locator;
  readonly eventDetailsHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.calendar = page.locator(".fc");
    this.bookMeetingHeader = page.getByRole("heading", { name: /Book Meeting/i });
    this.eventDetailsHeader = page.getByRole("heading", { name: /Event Details/i });
  }

  async waitForCalendar() {
    await this.calendar.first().waitFor({ state: "visible" });
  }
}
