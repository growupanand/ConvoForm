import { describe, expect, it } from "bun:test";

import { isMobileAllowedPath } from "./isMobileAllowedPath";

describe("isMobileAllowedPath", () => {
  it("allows sign-up, sign-in, and workspace setup", () => {
    expect(isMobileAllowedPath("/auth/register")).toBe(true);
    expect(isMobileAllowedPath("/auth/register/verify-email-address")).toBe(
      true,
    );
    expect(isMobileAllowedPath("/auth/sign-in")).toBe(true);
    expect(isMobileAllowedPath("/auth/sign-in/factor-one")).toBe(true);
    expect(isMobileAllowedPath("/organizations")).toBe(true);
  });

  it("keeps the editor and dashboard on the desktop gate", () => {
    expect(isMobileAllowedPath("/forms")).toBe(false);
    expect(isMobileAllowedPath("/forms/form_123")).toBe(false);
    expect(isMobileAllowedPath("/dashboard")).toBe(false);
    expect(isMobileAllowedPath("/auth/register-extra")).toBe(false);
    expect(isMobileAllowedPath("/organizationsettings")).toBe(false);
  });
});
