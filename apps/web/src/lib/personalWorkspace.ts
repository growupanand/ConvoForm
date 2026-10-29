declare global {
  interface UserPrivateMetadata {
    personalWorkspaceOrganizationId?: string;
  }
}

const PERSONAL_WORKSPACE_NAME_LIMIT = 80;
const PERSONAL_WORKSPACE_SUFFIX = "'s workspace";

export function personalWorkspaceName(
  firstName: string | null | undefined,
): string {
  const name = firstName?.trim();
  if (!name) {
    return "Personal workspace";
  }

  return `${name.slice(0, PERSONAL_WORKSPACE_NAME_LIMIT)}${PERSONAL_WORKSPACE_SUFFIX}`;
}

export function personalWorkspaceSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${base || "workspace"}-${suffix}`;
}

export function readPersonalWorkspaceOrganizationId(
  privateMetadata:
    | {
        personalWorkspaceOrganizationId?: unknown;
      }
    | null
    | undefined,
): string | undefined {
  const value = privateMetadata?.personalWorkspaceOrganizationId;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
