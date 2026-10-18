import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCustomerQuery,
  deleteCustomerQuery,
  listCustomerQueries,
  updateCustomerQuery,
} from "./db";

const queryStatus = z.enum(["new", "in_progress", "resolved"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  queries: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().trim().min(2, "Please enter your name.").max(140),
        phone: z.string().trim().min(7, "Please enter a valid phone number.").max(40),
        email: z.string().trim().email("Please enter a valid email.").max(320).optional().or(z.literal("")),
        queryType: z.string().trim().min(2).max(80),
        message: z.string().trim().min(10, "Please add a little more detail.").max(4000),
        consentGiven: z.literal(true),
      }))
      .mutation(async ({ input }) => {
        const id = await createCustomerQuery({
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          queryType: input.queryType,
          message: input.message,
          consentGiven: 1,
          status: "new",
        });
        return { success: true, id } as const;
      }),
    adminList: adminProcedure
      .input(z.object({ status: queryStatus.optional() }).optional())
      .query(({ input }) => listCustomerQueries(input?.status)),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: queryStatus,
        internalNotes: z.string().max(4000).optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        await updateCustomerQuery(input.id, {
          status: input.status,
          internalNotes: input.internalNotes ?? null,
        });
        return { success: true } as const;
      }),
    adminDelete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteCustomerQuery(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
