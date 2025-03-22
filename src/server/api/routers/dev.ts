import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const devRouter = createTRPCRouter({
  ping: publicProcedure.query(() => {
    return "pong";
  }),
});
