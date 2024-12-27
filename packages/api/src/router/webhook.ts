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
import { z } from "zod";

import { publicProcedure } from "../middlewares/publicRoutes";
import { createTRPCRouter } from "../trpc";

export const webhookRouter = createTRPCRouter({
  userCreated: publicProcedure
    .input(insertUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [newUser] = await ctx.db.insert(user).values(input).returning();

        analytics.track("user:create", {
          properties: newUser,
        });

        if (newUser?.email) {
          analytics.alias(newUser.email, newUser.id);
        }
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
        analytics.track("user:delete", {
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
        analytics.track("organizationMember:create", {
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

        analytics.track("organizationMember:delete", {
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
        analytics.track("organization:delete", {
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
    .input(insertOrganizationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const [data] = await ctx.db
          .insert(organization)
          .values(input)
          .returning();
        analytics.track("organization:create", {
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
