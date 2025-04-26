import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { fasts } from "@/server/db/schema";

export const fastRouter = createTRPCRouter({
  createFast: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        duration: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(fasts).values({
        userId: "1",
        targetHours: input.duration,
        fastType: "16:8 INTERMITTENT",
      });
    }),

  startFast: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        userId: z.string().min(1),
        startTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fasts)
        .set({
          startTime: input.startTime,
        })
        .where(eq(fasts.id, input.id));
    }),

  endFast: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        userId: z.string().min(1),
        endTime: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(fasts)
        .set({
          endTime: input.endTime,
        })
        .where(eq(fasts.id, input.id));
    }),

  getCurrentFast: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.fasts.findFirst({
        where: and(eq(fasts.userId, input.userId), isNull(fasts.endTime)),
        orderBy: [desc(fasts.startTime)],
      });
      return res ?? null;
    }),
});
