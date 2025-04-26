import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { fasts } from "@/server/db/schema";

export const fastRouter = createTRPCRouter({
  startFast: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        duration: z.number().int().positive(),
        startTime: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(fasts).values({
        userId: "1",
        startTime: input.startTime.toISOString(),
        targetHours: input.duration,
        fastType: "16:8 INTERMITTENT",
      });
    }),

  getCurrentFast: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.fasts.findFirst({
        where: eq(fasts.userId, input.userId),
        orderBy: [desc(fasts.startTime)],
      });
    }),
});
