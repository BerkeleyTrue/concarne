import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { fasts } from "@/server/db/schema";

export const fastRouter = createTRPCRouter({
  createFast: protectedProcedure
    .input(
      z.object({
        duration: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(fasts).values({
        userId: ctx.session.user.id,
        targetHours: input.duration,
        fastType: "16:8 INTERMITTENT",
      });
    }),

  startFast: protectedProcedure
    .input(
      z.object({
        fastId: z.number().int().positive(),
        startTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fasts)
        .set({
          startTime: input.startTime,
        })
        .where(
          and(
            eq(fasts.id, input.fastId),
            eq(fasts.userId, ctx.session.user.id),
          ),
        );
    }),

  endFast: protectedProcedure
    .input(
      z.object({
        fastId: z.number().int().positive(),
        endTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fasts)
        .set({
          endTime: input.endTime,
        })
        .where(
          and(
            eq(fasts.userId, ctx.session.user.id),
            eq(fasts.id, input.fastId),
          ),
        );
    }),

  getCurrentFast: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.fasts.findFirst({
      where: and(eq(fasts.userId, ctx.session.user.id), isNull(fasts.endTime)),
      orderBy: [desc(fasts.startTime)],
    });
    return res ?? null;
  }),
});
