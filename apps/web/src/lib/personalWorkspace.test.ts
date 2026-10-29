import { describe, expect, it } from "bun:test";

import {
  personalWorkspaceName,
  personalWorkspaceSlug,
  readPersonalWorkspaceOrganizationId,
} from "./personalWorkspace";

describe("personalWorkspaceName", () => {
  it("uses the person's first name", () => {
    expect(personalWorkspaceName("Ava")).toBe("Ava's workspace");
  });

  it("falls back when the first name is missing", () => {
    expect(personalWorkspaceName(null)).toBe("Personal workspace");
    expect(personalWorkspaceName("   ")).toBe("Personal workspace");
  });
});

describe("personalWorkspaceSlug", () => {
  it("builds a lowercase slug from the workspace name", () => {
    const slug = personalWorkspaceSlug("Ava's workspace");

    expect(slug.startsWith("avas-workspace-")).toBe(true);
    expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});

describe("readPersonalWorkspaceOrganizationId", () => {
  it("reads a stored organization id", () => {
    expect(
      readPersonalWorkspaceOrganizationId({
        personalWorkspaceOrganizationId: "org_123",
      }),
    ).toBe("org_123");
  });

  it("ignores empty metadata", () => {
    expect(readPersonalWorkspaceOrganizationId(null)).toBeUndefined();
    expect(
      readPersonalWorkspaceOrganizationId({
        personalWorkspaceOrganizationId: "",
      }),
    ).toBeUndefined();
  });
});
