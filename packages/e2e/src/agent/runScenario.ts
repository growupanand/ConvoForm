import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { type Page, chromium } from "@playwright/test";
import dotenv from "dotenv";

import {
  getOrCreateTestOrganization,
  getOrCreateTestUser,
} from "../utils/clerk";
import type { AgentScenario, AgentScenarioContext, ShotOptions } from "./types";
import { MARKETING_SCREENSHOT_FRAME as FRAME } from "./types";

const VIEWPORT = { width: FRAME.width, height: FRAME.height };
const REPO_ROOT = path.resolve(__dirname, "../../../..");

function loadEnv() {
  dotenv.config({ path: path.join(REPO_ROOT, ".env") });
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "CLERK_SECRET_KEY is not set. Run via `pnpm agent` (loads ../../.env) or export Clerk keys from the repo root .env.",
    );
  }
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function assertPreconditions(baseURL: string) {
  if (process.env.E2E_MOCK_LLM === "1") {
    throw new Error(
      "Refusing to run agent scenarios with E2E_MOCK_LLM=1. Use `pnpm dev` (real model), not the e2e webServer.",
    );
  }

  try {
    const response = await fetch(baseURL, { method: "GET" });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Unexpected status ${response.status}`);
    }
  } catch {
    throw new Error(
      `Dev server not reachable at ${baseURL}. Start the app with \`pnpm dev\` first.`,
    );
  }
}

async function authenticate(page: Page, baseURL: string) {
  await clerkSetup();

  const { user, email, password } = await getOrCreateTestUser();
  await getOrCreateTestOrganization(user.id);

  console.log(`Authenticating test user: ${email}`);

  await page.goto(`${baseURL}/`);

  try {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: email,
        password,
      },
    });
  } catch {
    console.log("Sign-in helper returned; verifying dashboard access...");
  }

  await page.goto(`${baseURL}/dashboard`);
  await page.waitForURL("**/dashboard**", { timeout: 60_000 });

  const authDir = path.join(REPO_ROOT, "packages/e2e/playwright/.auth");
  fs.mkdirSync(authDir, { recursive: true });
  await page.context().storageState({ path: path.join(authDir, "user.json") });
}

function resolveOutputPath(out: string) {
  if (path.isAbsolute(out)) {
    return out;
  }
  return path.resolve(REPO_ROOT, out);
}

async function tightContentClip(
  page: Page,
  containerSelector: string,
): Promise<{ x: number; y: number; width: number; height: number }> {
  return page
    .locator(containerSelector)
    .first()
    .evaluate((container) => {
      const children = Array.from(container.children);
      let top = Number.POSITIVE_INFINITY;
      let left = Number.POSITIVE_INFINITY;
      let right = 0;
      let bottom = 0;

      for (const child of children) {
        const rect = child.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          continue;
        }
        top = Math.min(top, rect.top);
        left = Math.min(left, rect.left);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }

      if (!Number.isFinite(top)) {
        const rect = container.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }

      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      };
    });
}

const HIDE_NEXT_DEVTOOLS = `(() => {
  const nodes = document.querySelectorAll(
    "nextjs-portal, [data-nextjs-dev-tools-button], [data-next-badge], #__next-build-watcher",
  );
  nodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.setProperty("display", "none", "important");
    }
  });
})()`;

async function hideNextDevTools(page: Page) {
  await page.evaluate(HIDE_NEXT_DEVTOOLS);
}

function createShot(page: Page): AgentScenarioContext["shot"] {
  return async ({ name, out, selector, mode = "element" }: ShotOptions) => {
    const outputPath = resolveOutputPath(out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await page.evaluate(() => document.fonts?.ready);
    await page.setViewportSize(VIEWPORT);
    await hideNextDevTools(page);

    if (mode === "viewport") {
      await page.screenshot({
        path: outputPath,
        clip: {
          x: 0,
          y: 0,
          width: FRAME.width,
          height: FRAME.height,
        },
      });
      console.log(`[shot] ${name} -> ${outputPath}`);
      return;
    }

    if (mode === "tight") {
      if (!selector) {
        throw new Error(`[shot] ${name}: tight mode requires a selector`);
      }

      const locator = page.locator(selector).first();
      await locator.waitFor({ state: "visible", timeout: 60_000 });

      const content = await tightContentClip(page, selector);
      const clip = {
        x: Math.max(0, Math.floor(content.x)),
        y: Math.max(0, Math.floor(content.y)),
        width: Math.min(
          FRAME.width,
          Math.ceil(content.width),
          VIEWPORT.width - Math.max(0, Math.floor(content.x)),
        ),
        height: Math.min(
          FRAME.height,
          Math.ceil(content.height),
          VIEWPORT.height - Math.max(0, Math.floor(content.y)),
        ),
      };

      await page.screenshot({ path: outputPath, clip });
      console.log(`[shot] ${name} -> ${outputPath}`);
      return;
    }

    const target = selector
      ? page.locator(selector).first()
      : page.locator("body");

    await target.waitFor({ state: "visible", timeout: 60_000 });
    await target.screenshot({ path: outputPath });

    console.log(`[shot] ${name} -> ${outputPath}`);
  };
}

async function loadScenario(scenarioArg: string): Promise<AgentScenario> {
  const scenarioPath = path.isAbsolute(scenarioArg)
    ? scenarioArg
    : path.resolve(process.cwd(), scenarioArg);

  const module = await import(pathToFileURL(scenarioPath).href);
  const run = module.default as AgentScenario | undefined;

  if (typeof run !== "function") {
    throw new Error(
      `${scenarioPath} must export a default async function (AgentScenario).`,
    );
  }

  return run;
}

async function main() {
  const scenarioArg = process.argv[2];
  if (!scenarioArg) {
    console.error("Usage: pnpm agent <scenario-file.ts>");
    process.exit(1);
  }

  loadEnv();
  const baseURL = getBaseUrl();
  await assertPreconditions(baseURL);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    baseURL,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    extraHTTPHeaders: {
      "x-vercel-ip-country": "IN",
      "x-vercel-ip-city": "Mumbai",
      "x-vercel-ip-country-region": "MH",
    },
  });
  const page = await context.newPage();
  await page.addInitScript(`
    const hideNextDevToolsBadge = () => {
      document.querySelectorAll("nextjs-portal").forEach((node) => {
        if (node instanceof HTMLElement) {
          node.style.setProperty("display", "none", "important");
        }
      });
    };
    hideNextDevToolsBadge();
    new MutationObserver(hideNextDevToolsBadge).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  `);

  await authenticate(page, baseURL);

  const scenario = await loadScenario(scenarioArg);
  const ctx: AgentScenarioContext = {
    page,
    baseURL,
    repoRoot: REPO_ROOT,
    shot: createShot(page),
  };

  await scenario(ctx);
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
