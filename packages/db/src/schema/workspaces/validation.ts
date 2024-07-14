import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { workspace } from "./workspace";

export const insertWorkspaceSchema = createInsertSchema(workspace, {
  name: z.string().min(1),
});
export const selectWorkspaceSchema = createSelectSchema(workspace);

export const updateWorkspaceSchema = insertWorkspaceSchema
  .omit({
    organizationId: true,
    userId: true,
  })
  .extend({
    id: z.string().min(1),
  });

export type Workspace = z.infer<typeof selectWorkspaceSchema>;
