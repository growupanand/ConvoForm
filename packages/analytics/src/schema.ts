import { z } from "zod/v4";

export const userIdentity = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type UserIdentity = z.infer<typeof userIdentity>;

export const eventAction = z.enum(["create", "delete", "update", "view"]);
export type EventAction = z.infer<typeof eventAction>;

export const eventObject = z.enum([
  "form",
  "conversation",
  "formField",
  "formDesign",
  "organization",
  "user",
  "collectData",
  "organizationMember",
  "fileUpload",
]);
export type EventObject = z.infer<typeof eventObject>;

export type EventName = `${EventObject}:${EventAction}`;

export const eventGroupName = z.enum(["organization"]);

export type EventGroupName = z.infer<typeof eventGroupName>;

export const eventProperties = z
  .object({
    appVersion: z.string().min(1).optional(),
  })
  .catchall(z.any());

export type EventProperties = z.infer<typeof eventProperties>;
