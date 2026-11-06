import { type Page, expect, test } from "@playwright/test";

// Runs in the `landing-smoke` project: signed out, no auth `setup` dependency.
// The public pages below are allowed through `proxy.ts`; a not-found URL must
// live under a public prefix, otherwise Clerk redirects before Next renders 404.

const PUBLIC_PAGES = [
  { path: "/use-cases", heading: /start with the work/i },
  { path: "/use-cases/study-abroad", heading: /start counselling/i },
  {
    path: "/use-cases/job-application",
    heading: /start the screening call/i,
  },
  { path: "/changelog", heading: /changelog/i },
  { path: "/privacy", heading: /privacy policy/i },
  { path: "/terms", heading: /terms and conditions/i },
] as const;

const horizontalScroll = (page: Page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

test.describe("Public pages", () => {
  for (const item of PUBLIC_PAGES) {
    test(`${item.path} loads with its heading`, async ({ page }) => {
      const response = await page.goto(item.path);

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: item.heading }),
      ).toBeVisible();
    });
  }

  test("use cases is linked from the header and footer", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("header").getByRole("link", { name: "Use cases" }),
    ).toHaveAttribute("href", "/use-cases");
    await expect(
      page.locator("footer").getByRole("link", { name: "Use cases" }),
    ).toHaveAttribute("href", "/use-cases");
  });

  test("use cases lists both use-case cards", async ({ page }) => {
    await page.goto("/use-cases");

    await expect(
      page.getByRole("link", { name: /see the study-abroad use case/i }),
    ).toHaveAttribute("href", "/use-cases/study-abroad");
    await expect(
      page.getByRole("link", { name: /see the job application use case/i }),
    ).toHaveAttribute("href", "/use-cases/job-application");
  });

  test("study-abroad CTA registers a new user", async ({ page }) => {
    await page.goto("/use-cases/study-abroad");

    await expect(
      page.getByRole("link", { name: /create a student intake form/i }).first(),
    ).toHaveAttribute("href", "/auth/register");
  });

  test("job-application CTA registers a new user", async ({ page }) => {
    await page.goto("/use-cases/job-application");

    await expect(
      page
        .getByRole("link", { name: /create a job application form/i })
        .first(),
    ).toHaveAttribute("href", "/auth/register");
  });

  test("the landing use-case section links to job applications", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page
        .locator("#use-cases")
        .getByRole("link", { name: /job applications/i }),
    ).toHaveAttribute("href", "/use-cases/job-application");
  });

  test("the landing Job application tab links to the use case", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Job application" }).click();
    const link = page.getByRole("link", {
      name: /see the job application use case/i,
    });
    await expect(link).toHaveAttribute("href", "/use-cases/job-application");

    await link.click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /start the screening call/i,
      }),
    ).toBeVisible();
  });

  test("changelog release anchors deep-link to a release", async ({ page }) => {
    await page.goto("/changelog#v0-18-0");

    const release = page.locator("#v0-18-0");
    await expect(release).toBeVisible();
    await expect(release.getByRole("link", { name: "v0.18.0" })).toBeVisible();
  });

  test("changelog 'Load older releases' reveals the older entries", async ({
    page,
  }) => {
    await page.goto("/changelog");

    const older = page.locator("#older-releases");
    await expect(older).toBeHidden();

    const button = page.getByRole("button", {
      name: /older releases/i,
    });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();

    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(older).toBeVisible();
    await expect(page.locator("#v0-11-0")).toBeVisible();
    await expect(
      page
        .locator("#v0-11-0")
        .getByRole("link", { name: /added submission progress bar/i }),
    ).toBeVisible();
  });

  test("changelog deep-links expand older releases", async ({ page }) => {
    await page.goto("/changelog#v0-11-0");

    await expect(page.locator("#older-releases")).toBeVisible();
    await expect(page.locator("#v0-11-0")).toBeVisible();
  });

  test("changelog page HTML stays under 100 KB", async ({ request }) => {
    const response = await request.get("/changelog");
    const html = await response.text();
    const markup = html.replace(/<script[\s\S]*?<\/script>/g, "");

    expect(markup.length).toBeLessThan(100_000);
  });

  test("privacy table of contents tracks the scroll position", async ({
    page,
  }) => {
    await page.goto("/privacy");

    const toc = page.getByRole("navigation", { name: "On this page" });
    const dataSecurity = toc.getByRole("link", { name: /data security/i });

    await dataSecurity.click();
    await expect(dataSecurity).toHaveAttribute("aria-current", "true");
  });

  test("unknown public URLs render the new 404 shell", async ({ page }) => {
    const response = await page.goto("/use-cases/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: /wrong turn/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to home/i }),
    ).toBeVisible();
  });

  test("unknown top-level URLs render the 404 shell instead of sign-in", async ({
    page,
  }) => {
    const response = await page.goto("/pricing");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { level: 1, name: /wrong turn/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to home/i }),
    ).toBeVisible();
  });
});

test.describe("Public header at common widths", () => {
  for (const width of [360, 390, 1440]) {
    test(`shows the logo and Sign in without horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");

      const header = page.locator("header");
      await expect(
        header.getByRole("link", { name: "ConvoForm home" }),
      ).toBeVisible();
      await expect(
        header.getByRole("link", { name: /sign in/i }),
      ).toBeVisible();

      const { scrollWidth, clientWidth } = await horizontalScroll(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});

test.describe("Public pages at 360px", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  for (const item of PUBLIC_PAGES) {
    test(`${item.path} has no horizontal scroll`, async ({ page }) => {
      await page.goto(item.path);

      const { scrollWidth, clientWidth } = await horizontalScroll(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("the 404 page has no horizontal scroll", async ({ page }) => {
    await page.goto("/use-cases/this-page-does-not-exist");

    const { scrollWidth, clientWidth } = await horizontalScroll(page);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("privacy's mobile table of contents expands and closes", async ({
    page,
  }) => {
    await page.goto("/privacy");

    await page.locator("summary").first().click();

    const dataSecurity = page
      .locator("details a")
      .filter({ hasText: "Data Security" });
    await expect(dataSecurity).toBeVisible();

    await dataSecurity.click();

    await expect(page).toHaveURL(/#data-security$/);
    await expect(page.locator("details[open]")).toHaveCount(0);
  });
});

test.describe("Public pages without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the before/after stage shows its static final frame", async ({
    page,
  }) => {
    await page.goto("/use-cases/study-abroad");

    const stage = page.locator('main [role="img"]').first();
    const layers = stage.locator(":scope > div");

    await expect(layers.nth(0)).toBeHidden();
    await expect(layers.nth(1)).toBeVisible();
    await expect(
      layers.nth(1).getByText("₹20 lakh per year, tuition + living").first(),
    ).toBeVisible();
  });
});
