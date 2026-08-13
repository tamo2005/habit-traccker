import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import * as habitDb from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const habitInput = z.object({
  name: z.string().trim().min(1, "Give the habit a name first.").max(140),
  cadence: z.string().trim().min(1).max(48),
  color: z.enum(["saffron", "moss", "clay", "ink"]),
});

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
  habits: router({
    list: protectedProcedure.query(({ ctx }) => habitDb.listUserHabits(ctx.user.id)),
    create: protectedProcedure.input(habitInput).mutation(({ ctx, input }) => habitDb.createUserHabit(ctx.user.id, input)),
    toggleCompletion: protectedProcedure
      .input(z.object({ habitId: z.number().int().positive(), completedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
      .mutation(({ ctx, input }) => habitDb.toggleUserHabitCompletion(ctx.user.id, input.habitId, input.completedOn)),
    remove: protectedProcedure
      .input(z.object({ habitId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => habitDb.deleteUserHabit(ctx.user.id, input.habitId)),
  }),
});

export type AppRouter = typeof appRouter;
