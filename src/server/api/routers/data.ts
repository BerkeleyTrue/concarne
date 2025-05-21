import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { data } from "@/server/db/schema";

export const dataRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        weight: z.number().positive("Weight must be greater than 0"),
        date: z.date().default(() => new Date()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .insert(data)
        .values({
          weight: input.weight,
          date: input.date.toISOString(),
          userId: ctx.session.user.id,
        })
        .returning();

      return res[0] ?? null;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.data.findMany({
      where: eq(data.userId, ctx.session.user.id),
      orderBy: [desc(data.date)],
    });

    return res;
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.query.data.findFirst({
      where: eq(data.userId, ctx.session.user.id),
      orderBy: [desc(data.date)],
    });

    return res ?? null;
  }),
});
