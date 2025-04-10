import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hash } from "@node-rs/argon2";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const { username, password } = input;

      // Find user by username
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      const passwordHash = await hash(password);

      const res = await db
        .insert(users)
        .values({
          username,
          password: passwordHash,
        })
        .returning({
          id: users.id,
          username: users.username,
        });

      return res[0];
    }),
  getUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const userId = input.userId;
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      return user;
    }),
  updateUserHeight: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        height: z.number().min(1).max(108),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, height } = input;

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify the current user has permission to update this user
      // if (ctx.session.user.id !== userId) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You can only update your own height",
      //   });
      // }

      // Update the user's height
      const updatedUser = await db
        .update(users)
        .set({ height })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          username: users.username,
          height: users.height,
        });

      if (!updatedUser.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update height",
        });
      }

      return updatedUser[0];
    }),
});
