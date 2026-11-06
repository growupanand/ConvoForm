import type { Buffer } from "node:buffer";
import { type Page, expect, test } from "@playwright/test";

// Runs in the `landing-smoke` project: signed out, no auth setup. The stages
// animate only while visible, so every test scrolls the stage into view first.

const VIEWPORT = { width: 360, height: 1000 };

const STAGES = [
  // Design durations from DESIGN.md (`run-hero` / `run-how`).
  { name: "hero", duration: 16_000, path: "/" },
  { name: "how", duration: 18_000, path: "/" },
  { name: "job", duration: 9_000, path: "/use-cases/job-application" },
] as const;

type StageName = (typeof STAGES)[number]["name"];

// Both screenshots use the same viewport offset so text antialiasing lines up.
const STAGE_TOP: Record<StageName, number> = { hero: 100, how: 20, job: 100 };

const stageShell = (page: Page, name: StageName) =>
  page.locator(`.stage-shell--${name}`);

const stageControl = (page: Page, name: StageName) =>
  stageShell(page, name).locator("xpath=..").getByRole("button");

async function alignStage(page: Page, name: StageName) {
  const selector = `.stage-shell--${name}`;
  const top = STAGE_TOP[name];
  await page.evaluate(
    ({ selector, top }) => {
      const shell = document.querySelector(selector);
      if (!shell) throw new Error(`missing ${selector}`);
      const y = shell.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, y - top));
    },
    { selector, top },
  );
  await page.waitForTimeout(300);
}

async function screenshotStage(page: Page, name: StageName) {
  await alignStage(page, name);
  const box = await stageShell(page, name).boundingBox();
  if (!box) throw new Error(`missing a box for ${name}`);
  return await page.screenshot({ clip: box });
}

const horizontalScroll = (page: Page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

const IGNORED_CONSOLE = [/ws:\/\/localhost:8787/, /clerk/i];

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (error) => {
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(error.message))) return;
    errors.push(error.message);
  });
  return errors;
}

async function openLiveStage(page: Page, name: StageName) {
  const stage = STAGES.find((item) => item.name === name);
  await page.goto(stage?.path ?? "/");
  const shell = stageShell(page, name);
  await expect(shell.locator(".ss-stage")).toBeAttached({ timeout: 30_000 });
  await shell.scrollIntoViewIfNeeded();
  const control = stageControl(page, name);
  await expect(control).toHaveAttribute("aria-label", "Pause animation", {
    timeout: 30_000,
  });
  return { shell, control };
}

async function staticPoster(page: Page, name: StageName) {
  const stage = STAGES.find((item) => item.name === name);
  const posterPage = await page.context().newPage();
  try {
    await posterPage.setViewportSize(VIEWPORT);
    await posterPage.goto(`${stage?.path ?? "/"}?static=1`);
    const shell = stageShell(posterPage, name);
    await expect(shell).toBeVisible();
    await expect(shell.locator(".stage-layer--final")).toBeVisible();
    await expect(stageControl(posterPage, name)).toHaveCount(0);
    await posterPage.evaluate(() => document.fonts.ready);
    await posterPage.waitForTimeout(200);
    return await screenshotStage(posterPage, name);
  } finally {
    await posterPage.close();
  }
}

type FrameDiff = {
  width: number;
  height: number;
  sameSize: boolean;
  different: number;
  meaningful: number;
  maxChannelSum: number;
  ratio: number;
};

async function compareFrames(
  page: Page,
  first: Buffer,
  second: Buffer,
): Promise<FrameDiff> {
  return page.evaluate(
    async ({ first, second }) => {
      const load = (base64: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () =>
            reject(new Error("could not decode a stage screenshot"));
          image.src = `data:image/png;base64,${base64}`;
        });

      const [a, b] = await Promise.all([load(first), load(second)]);
      const width = Math.min(a.width, b.width);
      const height = Math.min(a.height, b.height);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("could not create a 2d canvas context");

      context.drawImage(a, 0, 0);
      const aData = context.getImageData(0, 0, width, height).data;
      context.clearRect(0, 0, width, height);
      context.drawImage(b, 0, 0);
      const bData = context.getImageData(0, 0, width, height).data;

      let different = 0;
      let meaningful = 0;
      let maxChannelSum = 0;
      for (let i = 0; i < aData.length; i += 4) {
        const delta =
          Math.abs((aData[i] ?? 0) - (bData[i] ?? 0)) +
          Math.abs((aData[i + 1] ?? 0) - (bData[i + 1] ?? 0)) +
          Math.abs((aData[i + 2] ?? 0) - (bData[i + 2] ?? 0)) +
          Math.abs((aData[i + 3] ?? 0) - (bData[i + 3] ?? 0));
        if (delta > 0) different += 1;
        if (delta > 240) meaningful += 1;
        if (delta > maxChannelSum) maxChannelSum = delta;
      }

      return {
        width: a.width,
        height: a.height,
        sameSize: a.width === b.width && a.height === b.height,
        different,
        meaningful,
        maxChannelSum,
        ratio: different / (width * height),
      };
    },
    { first: first.toString("base64"), second: second.toString("base64") },
  );
}

async function expectNoFocusableDescendants(page: Page, name: StageName) {
  const count = await stageShell(page, name).evaluate(
    (shell) =>
      shell.querySelectorAll(
        'a[href], area[href], button, input, select, textarea, iframe, summary, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      ).length,
  );
  expect(count, "the role=img stage must not contain focusable elements").toBe(
    0,
  );
}

async function expectFinalFallback(page: Page, name: StageName) {
  const shell = stageShell(page, name);
  await expect(shell.locator(".stage-layer--final")).toBeVisible();
  await expect(stageControl(page, name)).toHaveCount(0);
  await expectNoFocusableDescendants(page, name);
}

test.describe("Landing stages at 360px", () => {
  test.use({ viewport: VIEWPORT });

  for (const { name, duration } of STAGES) {
    test(`the ${name} stage plays once and settles on the poster`, async ({
      page,
    }) => {
      test.slow();
      const consoleErrors = collectConsoleErrors(page);
      const { shell, control } = await openLiveStage(page, name);

      // Tab reaches the control, Enter pauses and resumes it.
      await page.evaluate(() =>
        (document.activeElement as HTMLElement | null)?.blur(),
      );
      let reachedWithTab = false;
      for (let i = 0; i < 80; i += 1) {
        await page.keyboard.press("Tab");
        if (
          await control.evaluate((button) => button === document.activeElement)
        ) {
          reachedWithTab = true;
          break;
        }
      }
      expect(
        reachedWithTab,
        "the stage control should be reachable with Tab",
      ).toBe(true);
      await expect(control).toBeFocused();

      await page.keyboard.press("Enter");
      await expect(control).toHaveAttribute("aria-label", "Play animation");
      await page.keyboard.press("Enter");
      await expect(control).toHaveAttribute("aria-label", "Pause animation");

      // Pausing and resuming restarts the run, so measure the 2x wait from here.
      const runStartedAt = Date.now();
      await expect(control).toHaveAttribute("aria-label", "Replay animation", {
        timeout: 45_000,
      });
      // Let the idle cursor fade out before comparing with the static poster.
      await page.waitForTimeout(1000);

      const doneShot = await screenshotStage(page, name);

      // The visible face stays 32px, but the pseudo-element hit area is 44px+.
      await control.scrollIntoViewIfNeeded();
      const hitArea = await control.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const pseudo = getComputedStyle(button, "::before");
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const hits = [
          [0, 0],
          [-21, 0],
          [21, 0],
          [0, -21],
          [0, 21],
        ].map(([dx, dy]) => {
          const element = document.elementFromPoint(
            centerX + (dx ?? 0),
            centerY + (dy ?? 0),
          );
          return element === button || button.contains(element);
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

      const { scrollWidth, clientWidth } = await horizontalScroll(page);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      await expectNoFocusableDescendants(page, name);

      // The final live frame must match the CSS poster shown by `?static=1`.
      const poster = await staticPoster(page, name);
      const posterDiff = await compareFrames(page, doneShot, poster);
      expect(posterDiff.sameSize).toBe(true);
      expect(
        posterDiff.meaningful,
        `live and static frames differ at ${posterDiff.meaningful} pixels`,
      ).toBe(0);
      expect(posterDiff.ratio).toBeLessThan(0.03);

      // Scrolling away and back keeps the finished frame; it never resets.
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight),
      );
      await page.waitForTimeout(600);
      await expect(shell.locator(".ss-stage")).toHaveAttribute(
        "data-offscreen",
        "",
      );
      await expect(control).toHaveAttribute("aria-label", "Replay animation");
      await alignStage(page, name);
      await expect(shell.locator(".ss-stage")).not.toHaveAttribute(
        "data-offscreen",
        "",
      );
      await expect(control).toHaveAttribute("aria-label", "Replay animation");
      await expect(shell.locator(".ss-stage")).toHaveAttribute(
        "data-mark",
        "payoff",
      );
      const backShot = await screenshotStage(page, name);
      const backDiff = await compareFrames(page, doneShot, backShot);
      expect(backDiff.sameSize).toBe(true);
      expect(backDiff.meaningful).toBe(0);
      // Scrolling can shift text by a subpixel; no visible pixel may change.
      expect(backDiff.ratio).toBeLessThan(0.03);

      // No loop: well past twice the design duration the run is still done.
      const remaining = runStartedAt + duration * 2 - Date.now();
      if (remaining > 0) await page.waitForTimeout(remaining);
      await expect(control).toHaveAttribute("aria-label", "Replay animation");
      const laterShot = await screenshotStage(page, name);
      const laterDiff = await compareFrames(page, doneShot, laterShot);
      expect(laterDiff.sameSize).toBe(true);
      expect(laterDiff.meaningful).toBe(0);
      expect(laterDiff.ratio).toBeLessThan(0.03);

      // Enter on the finished control replays, keeps focus, and starts a new run.
      await control.focus();
      await page.keyboard.press("Enter");
      await expect(control).toHaveAttribute("aria-label", "Pause animation");
      await expect(control).toBeFocused();
      await expect(shell.locator(".ss-stage")).not.toHaveAttribute(
        "data-mark",
        "payoff",
      );
      await page.keyboard.press("Enter");
      await expect(control).toHaveAttribute("aria-label", "Play animation");

      expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
    });
  }
});

test.describe("Landing stage fallbacks", () => {
  test.use({ viewport: VIEWPORT });

  test("?static=1 shows the final frame and no control", async ({ page }) => {
    for (const { name, path } of STAGES) {
      await page.goto(`${path}?static=1`);
      await expect(page.locator("html")).toHaveAttribute("data-static", "1");
      await expectFinalFallback(page, name);
    }
  });

  test("reduced motion shows the final frame and no control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const { name, path } of STAGES) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-js", "1");
      await page.waitForTimeout(1000);
      await expectFinalFallback(page, name);
    }
  });
});

test.describe("Landing stages without JavaScript", () => {
  test.use({ viewport: VIEWPORT, javaScriptEnabled: false });

  test("show the final frame and no control", async ({ page }) => {
    for (const { name, path } of STAGES) {
      await page.goto(path);
      await expect(page.locator("html")).not.toHaveAttribute("data-js", "1");
      await expectFinalFallback(page, name);
    }
  });
});
