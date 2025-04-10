import { z } from "zod";
import { desc, eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { data } from "@/server/db/schema";

export const dataRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        weight: z.number().int().positive(),
        date: z
          .number()
          .int()
          .positive()
          .default(() => Date.now()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(data).values({
        weight: input.weight,
        date: input.date,
        userId: "1",
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.data.findMany({
      where: eq(data.userId, ctx.session.user.id),
      orderBy: [desc(data.date)],
    });
  }),
});
