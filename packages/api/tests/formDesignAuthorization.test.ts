import { describe, expect, it, mock } from "bun:test";
import { formDesignRouter } from "../src/router/formDesign";

function createDb({
  isPublished,
  isMember = false,
}: {
  isPublished: boolean;
  isMember?: boolean;
}) {
  return {
    query: {
      form: {
        findFirst: mock(() =>
          Promise.resolve({
            id: "form_1",
            organizationId: "org_1",
            isPublished,
          }),
        ),
      },
      formDesign: {
        findMany: mock(() => Promise.resolve([])),
        findFirst: mock(() => Promise.resolve(undefined)),
      },
      organizationMember: {
        findFirst: mock(() =>
          Promise.resolve(isMember ? { id: "member_1" } : undefined),
        ),
      },
    },
  } as any;
}

function createContext(db: any, userId: string | null = null) {
  return {
    db,
    auth: { userId, orgId: null },
    user: null,
    headers: new Headers(),
  } as any;
}

describe("formDesignRouter public reads", () => {
  it("allows anonymous reads of a published form's design", async () => {
    const db = createDb({ isPublished: true });
    const caller = formDesignRouter.createCaller(createContext(db));

    await expect(caller.getAll({ formId: "form_1" })).resolves.toEqual([]);
    expect(db.query.formDesign.findMany).toHaveBeenCalledTimes(1);
  });

  it("rejects anonymous reads of an unpublished form's design", async () => {
    const db = createDb({ isPublished: false });
    const caller = formDesignRouter.createCaller(createContext(db));

    await expect(caller.getAll({ formId: "form_1" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(db.query.formDesign.findMany).not.toHaveBeenCalled();
  });

  it("allows an organization member to preview an unpublished form", async () => {
    const db = createDb({ isPublished: false, isMember: true });
    const caller = formDesignRouter.createCaller(createContext(db, "user_1"));

    await expect(caller.getAll({ formId: "form_1" })).resolves.toEqual([]);
  });
});
