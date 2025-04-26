import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { data } from "@/server/db/schema";

export const dataRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        weight: z.number().int().positive(),
        date: z.date().default(() => new Date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(data).values({
        weight: input.weight,
        date: input.date.toISOString(),
        userId: "1",
      });
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.data.findMany({
        where: eq(data.userId, input.userId),
        orderBy: [desc(data.date)],
      });
    }),

  getLatest: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.data.findFirst({
        where: eq(data.userId, input.userId),
        orderBy: [desc(data.date)],
      });
    }),
});
