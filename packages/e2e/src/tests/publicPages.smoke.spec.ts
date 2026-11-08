import { existsSync } from "node:fs";
import path from "node:path";
import { type Page, expect, test } from "@playwright/test";

// Runs in the `landing-smoke` project: signed out, no auth `setup` dependency.
// The unpublished-form metadata test opts into the auth state written by the
// `setup` project and skips when it is absent (e.g. `e2e:smoke` alone).
// The public pages below are allowed through `proxy.ts`; a not-found URL must
// live under a public prefix, otherwise Clerk redirects before Next renders 404.

const AUTH_STATE_PATH = path.resolve(
  __dirname,
  "../../playwright/.auth/user.json",
);
const HAS_AUTH_STATE = existsSync(AUTH_STATE_PATH);

const PRIVATE_FORM_NAME = "E2E Private Form";
const PRIVATE_FORM_OVERVIEW =
  "E2E private overview that must not leak into metadata.";

const PUBLIC_PAGES = [
  { path: "/use-cases", heading: /start with the work/i },
  { path: "/use-cases/study-abroad", heading: /start counselling/i },
  {
    path: "/use-cases/job-application",
    heading: /start the screening call/i,
  },
  {
    path: "/articles/study-abroad-conversational-intake",
    heading: /branching picks a path/i,
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

type JsonLdNode = {
  "@type"?: string;
  description?: string;
  mainEntity?: unknown;
  [key: string]: unknown;
};

async function readJsonLd(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  return blocks.map((block) => JSON.parse(block) as JsonLdNode);
}

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

async function expectFaqJsonLdMatchesRenderedFaq(page: Page) {
  const faqSection = page.locator('section[aria-labelledby="faq-heading"]');
  const faqJsonLd = (await readJsonLd(page)).find(
    (block) => block["@type"] === "FAQPage",
  );

  expect(faqJsonLd, "FAQPage JSON-LD is missing").toBeDefined();
  if (!faqJsonLd) {
    return;
  }

  const questions = faqJsonLd.mainEntity as Array<{
    name: string;
    acceptedAnswer: { text: string };
  }>;

  const renderedFaqs = await faqSection
    .locator("details")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        question: node.querySelector("summary")?.textContent ?? "",
        answer: node.querySelector("summary + div")?.textContent ?? "",
      })),
    );

  expect(questions).toHaveLength(renderedFaqs.length);

  for (const [index, question] of questions.entries()) {
    const rendered = renderedFaqs[index];

    expect(rendered, "rendered FAQ is missing").toBeDefined();
    if (!rendered) {
      continue;
    }

    expect(normalizeText(rendered.question)).toContain(
      normalizeText(question.name),
    );
    expect(normalizeText(rendered.answer)).toBe(
      normalizeText(question.acceptedAnswer.text),
    );
  }
}

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

  test("study-abroad page links to the follow-up article", async ({ page }) => {
    await page.goto("/use-cases/study-abroad");

    await expect(
      page.getByRole("link", {
        name: /why a follow-up is not a conditional branch/i,
      }),
    ).toHaveAttribute("href", "/articles/study-abroad-conversational-intake");
  });

  test("the article links back to the use case, demo and docs", async ({
    page,
  }) => {
    await page.goto("/articles/study-abroad-conversational-intake");

    await expect(
      page.getByRole("link", { name: /see the study-abroad use case/i }),
    ).toHaveAttribute("href", "/use-cases/study-abroad");
    await expect(
      page.getByRole("link", { name: /try the demo form/i }),
    ).toHaveAttribute("href", "/view/demo");
    await expect(page.getByRole("link", { name: /^docs$/i })).toHaveAttribute(
      "href",
      "https://docs.convoform.com",
    );
  });

  test("the article ships Article JSON-LD", async ({ page }) => {
    await page.goto("/articles/study-abroad-conversational-intake");

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(jsonLd ?? "{}");

    expect(data["@type"]).toBe("Article");
    expect(data.headline).toMatch(/branching picks a path/i);
    expect(data.description).toMatch(/scripted branching/i);
    expect(data.datePublished).toBe("2026-11-08");
    expect(data.author.name).toBe("Utkarsh Anand");
  });

  test("the sitemap includes the article", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(await response.text()).toContain(
      "/articles/study-abroad-conversational-intake",
    );
  });

  test("/llms.txt lists the public pages and documentation", async ({
    request,
  }) => {
    const response = await request.get("/llms.txt");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");

    const body = await response.text();
    for (const url of [
      "https://www.convoform.com/",
      "https://www.convoform.com/use-cases",
      "https://www.convoform.com/use-cases/study-abroad",
      "https://www.convoform.com/use-cases/job-application",
      "https://www.convoform.com/articles/study-abroad-conversational-intake",
      "https://www.convoform.com/changelog",
      "https://docs.convoform.com",
    ]) {
      expect(body).toContain(url);
    }
  });

  test("the homepage ships SoftwareApplication and FAQPage JSON-LD", async ({
    page,
  }) => {
    await page.goto("/");

    const blocks = await readJsonLd(page);
    const softwareApplication = blocks.find(
      (block) => block["@type"] === "SoftwareApplication",
    );

    expect(softwareApplication).toMatchObject({
      "@context": "https://schema.org",
      name: "ConvoForm",
      url: "https://www.convoform.com/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
    });
    expect(softwareApplication?.description).toMatch(
      /static form into a short conversation/i,
    );
    expect(softwareApplication).not.toHaveProperty("aggregateRating");
    expect(softwareApplication).not.toHaveProperty("review");
    expect(softwareApplication).not.toHaveProperty("offers");

    await expectFaqJsonLdMatchesRenderedFaq(page);
  });

  for (const path of [
    "/use-cases/study-abroad",
    "/use-cases/job-application",
  ]) {
    test(`${path} ships FAQPage JSON-LD matching the rendered FAQs`, async ({
      page,
    }) => {
      await page.goto(path);

      await expectFaqJsonLdMatchesRenderedFaq(page);
    });
  }

  test("/view/demo uses the form name as its title", async ({ page }) => {
    const response = await page.goto("/view/demo");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/ \| ConvoForm$/);
    await expect(page).not.toHaveTitle("Submit Form | ConvoForm");
  });

  test.describe("unpublished form metadata", () => {
    test.use({
      storageState: HAS_AUTH_STATE ? AUTH_STATE_PATH : undefined,
    });
    test.skip(
      !HAS_AUTH_STATE,
      "requires the auth state written by the e2e `setup` project",
    );

    test("hides the form name and overview from the head", async ({
      browser,
      page,
    }) => {
      await page.goto("/forms");
      await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible({
        timeout: 30000,
      });
      await page.waitForFunction(
        () =>
          (window as unknown as { Clerk?: { loaded?: boolean } }).Clerk
            ?.loaded === true,
        undefined,
        { timeout: 30000 },
      );

      const formId = await page.evaluate(
        async ({ name, overview }) => {
          const clerk = (
            window as unknown as {
              Clerk?: {
                organization?: { id?: string };
                user?: {
                  organizationMemberships?: Array<{
                    organization: { id: string };
                  }>;
                };
              };
            }
          ).Clerk;
          const organizationId =
            clerk?.organization?.id ??
            clerk?.user?.organizationMemberships?.[0]?.organization.id;

          if (!organizationId) {
            throw new Error("Authenticated test user has no organization");
          }

          const response = await fetch("/api/trpc/form.create?batch=1", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              "0": {
                json: {
                  name,
                  overview,
                  welcomeScreenTitle: "Welcome",
                  welcomeScreenMessage: "Message",
                  welcomeScreenCTALabel: "Start",
                  isPublished: false,
                  formFieldsOrders: [],
                  formFields: [
                    {
                      fieldName: "Name",
                      fieldDescription: "Your name",
                      fieldConfiguration: {
                        inputType: "text",
                        inputConfiguration: {},
                      },
                    },
                  ],
                  organizationId,
                },
              },
            }),
          });

          const payload = (await response.json()) as Array<{
            result?: { data?: { json?: { id?: string } } };
          }>;
          const id = payload[0]?.result?.data?.json?.id;

          if (!response.ok || !id) {
            throw new Error(
              `Failed to create the unpublished test form (${response.status})`,
            );
          }

          return id;
        },
        { name: PRIVATE_FORM_NAME, overview: PRIVATE_FORM_OVERVIEW },
      );

      const publicPage = await browser.newPage();

      try {
        const response = await publicPage.goto(`/view/${formId}`);

        expect(response?.status()).toBe(200);
        await expect(publicPage).toHaveTitle("Submit Form | ConvoForm");

        const html = await publicPage.content();
        expect(html).not.toContain(PRIVATE_FORM_NAME);
        expect(html).not.toContain(PRIVATE_FORM_OVERVIEW);
      } finally {
        await publicPage.close();
        await page.evaluate(async (id) => {
          await fetch("/api/trpc/form.delete?batch=1", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ "0": { json: { id } } }),
          });
        }, formId);
      }
    });
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
