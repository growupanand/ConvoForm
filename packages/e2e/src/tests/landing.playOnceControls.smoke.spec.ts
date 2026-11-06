import { type Locator, type Page, expect, test } from "@playwright/test";

// Runs in the `landing-smoke` project: signed out, no auth setup. These
// sections play once and settle on their final frame, so the control shows
// Pause/Play while running and Replay once done.

const VIEWPORT = { width: 360, height: 1000 };
const SETTLE_TIMEOUT = 15_000;

const SECTIONS = [
  { path: "/", selector: "#why-a-conversation", name: "why a conversation" },
  { path: "/", selector: "#get-started", name: "get started" },
  {
    path: "/use-cases/study-abroad",
    selector: "#why",
    name: "study abroad",
  },
] as const;

const horizontalScroll = (page: Page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

async function openSection(
  page: Page,
  path: string,
  selector: string,
): Promise<void> {
  await page.goto(path);
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await expect(
    section.getByRole("button", { name: "Pause animation" }),
  ).toBeVisible({ timeout: 30_000 });
}

async function expectStaticFrame(section: Locator) {
  const stage = section.locator('[role="img"]').first();
  const layers = stage.locator(":scope > div");

  if ((await layers.count()) > 1) {
    await expect(layers.nth(0)).toHaveCSS("visibility", "hidden");
    await expect(layers.nth(1)).toHaveCSS("visibility", "visible");
    return;
  }

  await expect(layers.first()).toHaveCSS("opacity", "1");
}

async function expectControlHitArea(button: Locator) {
  const hitArea = await button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const pseudo = getComputedStyle(element, "::before");
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const hits = [
      [0, 0],
      [-21, 0],
      [21, 0],
      [0, -21],
      [0, 21],
    ].map(([dx, dy]) => {
      const hit = document.elementFromPoint(
        centerX + (dx ?? 0),
        centerY + (dy ?? 0),
      );
      return hit === element || element.contains(hit);
    });
    return {
      width: Number.parseFloat(pseudo.width),
      height: Number.parseFloat(pseudo.height),
      hits,
    };
  });

  expect(hitArea.width).toBeGreaterThanOrEqual(44);
  expect(hitArea.height).toBeGreaterThanOrEqual(44);
  expect(hitArea.hits.every(Boolean)).toBe(true);
}

test.describe("Section controls at 360px", () => {
  test.use({ viewport: VIEWPORT });

  for (const item of SECTIONS) {
    test(`${item.name} plays once, pauses and replays`, async ({ page }) => {
      await openSection(page, item.path, item.selector);
      const section = page.locator(item.selector);
      const pause = section.getByRole("button", { name: "Pause animation" });

      // The control sits beside the scene, never inside its role=img shell.
      await expect(section.locator('[role="img"] button')).toHaveCount(0);

      // Keyboard activation keeps focus on the same control.
      await pause.focus();
      await page.keyboard.press("Enter");
      const play = section.getByRole("button", { name: "Play animation" });
      await expect(play).toBeVisible();
      await expect(play).toBeFocused();

      await page.keyboard.press("Enter");
      await expect(pause).toBeVisible();

      await expectControlHitArea(pause);

      const { scrollWidth, clientWidth } = await horizontalScroll(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // The run settles on the final frame and offers Replay.
      const replay = section.getByRole("button", {
        name: "Replay animation",
      });
      await expect(replay).toBeVisible({ timeout: SETTLE_TIMEOUT });
      await expect(pause).toHaveCount(0);

      // Replay resets to the initial frame and runs once more.
      await replay.click();
      await expect(pause).toBeVisible();
      await expect(replay).toBeVisible({ timeout: SETTLE_TIMEOUT });
    });
  }
});

test.describe("Section fallbacks", () => {
  test.use({ viewport: VIEWPORT });

  test("?static=1 shows the final frame and no control", async ({ page }) => {
    for (const item of SECTIONS) {
      await page.goto(`${item.path}?static=1`);
      const section = page.locator(item.selector);
      await expect(
        section.getByRole("button", { name: "Pause animation" }),
      ).toHaveCount(0);
      await expect(
        section.getByRole("button", { name: "Replay animation" }),
      ).toHaveCount(0);
      await expectStaticFrame(section);
    }
  });

  test("reduced motion shows the final frame and no control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const item of SECTIONS) {
      await page.goto(item.path);
      const section = page.locator(item.selector);
      await expect(
        section.getByRole("button", { name: "Pause animation" }),
      ).toHaveCount(0);
      await expect(
        section.getByRole("button", { name: "Replay animation" }),
      ).toHaveCount(0);
      await expectStaticFrame(section);
    }
  });
});

test.describe("Section controls without JavaScript", () => {
  test.use({ viewport: VIEWPORT, javaScriptEnabled: false });

  test("show the final frame and no control", async ({ page }) => {
    for (const item of SECTIONS) {
      await page.goto(item.path);
      const section = page.locator(item.selector);
      await expect(
        section.getByRole("button", { name: "Pause animation" }),
      ).toHaveCount(0);
      await expect(
        section.getByRole("button", { name: "Replay animation" }),
      ).toHaveCount(0);
      await expectStaticFrame(section);
    }
  });
});
