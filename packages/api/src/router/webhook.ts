import {
  eq,
  insertOrganizationMemberSchema,
  insertOrganizationSchema,
  insertUserSchema,
  organization,
  organizationMember,
  user,
} from "@convoform/db";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const webhookRouter = createTRPCRouter({
  userCreated: publicProcedure
    .input(insertUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.insert(user).values(input);
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
        await ctx.db.delete(user).where(eq(user.id, input.userId));
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
        await ctx.db.insert(organizationMember).values(input);
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
        await ctx.db
          .delete(organizationMember)
          .where(eq(organizationMember.memberId, input.membershipId));
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
        await ctx.db
          .delete(organization)
          .where(eq(organization.organizationId, input.organizationId));
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
        await ctx.db.insert(organization).values(input);
      } catch (e: any) {
        console.error({
          message: "Webhook event error: Unable to save organization data",
          data: input,
          errorMessage: e.message,
        });
      }
    }),
});
