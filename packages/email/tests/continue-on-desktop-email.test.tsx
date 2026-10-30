import { describe, expect, it } from "bun:test";
import { render } from "@react-email/render";

import { CONTINUE_ON_DESKTOP_URL } from "../src/continueOnDesktop";
import { ContinueOnDesktopEmail } from "../src/templates/continue-on-desktop-email";

describe("ContinueOnDesktopEmail", () => {
  it("links to the desktop forms page and explains the next step", async () => {
    const html = await render(ContinueOnDesktopEmail());

    expect(html).toContain(CONTINUE_ON_DESKTOP_URL);
    expect(html).toContain("Open ConvoForm");
    expect(html).toContain("Create your first form in 2 minutes");
    expect(html).toContain(
      "ConvoForm turns a static form into a conversation people actually finish.",
    );
  });
});
