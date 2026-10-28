import { analytics } from "@convoform/analytics";
import { eq } from "@convoform/db";
import {
  insertOrganizationMemberSchema,
  insertOrganizationSchema,
  insertUserSchema,
  organization,
  organizationMember,
  user,
} from "@convoform/db/src/schema";
import { z } from "zod/v4";

import { publicProcedure } from "../procedures/publicProcedure";
import { createTRPCRouter } from "../trpc";

const userCreatedInputSchema = insertUserSchema.extend({
  signupMethod: z.string().optional(),
});

export const webhookRouter = createTRPCRouter({
  userCreated: publicProcedure
    .input(userCreatedInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { signupMethod, ...userInput } = input;
      try {
        const [newUser] = await ctx.db
          .insert(user)
          .values(userInput)
          .returning();

        await analytics.track("user:create", {
          distinctId: newUser?.userId,
          properties: {
            ...newUser,
            method: signupMethod,
          },
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to save user data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
  userDeleted: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [deletedUser] = await ctx.db
          .delete(user)
          .where(eq(user.id, input.userId))
          .returning();
        await analytics.track("user:delete", {
          distinctId: deletedUser?.userId,
          properties: deletedUser,
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to delete user data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
  organizationMembershipCreated: publicProcedure
    .input(insertOrganizationMemberSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [data] = await ctx.db
          .insert(organizationMember)
          .values(input)
          .returning();
        await analytics.track("organizationMember:create", {
          distinctId: data?.userId,
          properties: data,
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to save organization data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
  organizationMembershipDeleted: publicProcedure
    .input(
      z.object({
        membershipId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [data] = await ctx.db
          .delete(organizationMember)
          .where(eq(organizationMember.memberId, input.membershipId))
          .returning();

        await analytics.track("organizationMember:delete", {
          distinctId: data?.userId,
          properties: data,
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to delete organization data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),

  organizationDeleted: publicProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // delete memberships between the users and the organization
        await ctx.db
          .delete(organizationMember)
          .where(eq(organizationMember.organizationId, input.organizationId));

        // delete the organization
        const [data] = await ctx.db
          .delete(organization)
          .where(eq(organization.organizationId, input.organizationId))
          .returning();
        await analytics.track("organization:delete", {
          properties: data,
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to save organization data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
  organizationCreated: publicProcedure
    .input(
      insertOrganizationSchema.extend({
        createdByClerkUserId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { createdByClerkUserId, ...organizationInput } = input;
      try {
        const [data] = await ctx.db
          .insert(organization)
          .values(organizationInput)
          .returning();
        await analytics.track("organization:create", {
          distinctId: createdByClerkUserId,
          properties: data,
        });
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to save organization data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
});
