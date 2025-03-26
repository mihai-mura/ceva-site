import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, type ErrorConfig, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import UserService, { UserServiceError } from "~/server/services/UserService";

const errorMap: Record<UserServiceError, ErrorConfig> = {
	[UserServiceError.UserNotFound]: {
		code: "NOT_FOUND",
		message: "User not found",
	},
	[UserServiceError.UsernameAlreadyExists]: {
		code: "CONFLICT",
		message: "Username already exists",
	},
	[UserServiceError.EmailAlreadyExists]: {
		code: "CONFLICT",
		message: "Email already exists",
	},
	[UserServiceError.PasswordMismatch]: {
		code: "UNAUTHORIZED",
		message: "Password mismatch",
	},
	[UserServiceError.ServerError]: {
		code: "INTERNAL_SERVER_ERROR",
		message: "An unexpected error occurred.",
	},
} as const;

export const userRouter = createTRPCRouter({
	register: publicProcedure
		.input(z.object({ name: z.string(), email: z.string(), password: z.string() }))
		.mutation(async ({ ctx: _, input }) => {
			const { data: user, error } = await UserService.createUser(input.name, input.email, input.password);

			if (error) throw new TRPCError(errorMap[error]);
			return user;
		}),

	getByUsername: publicProcedure.input(z.object({ username: z.string() })).query(async ({ ctx: _, input }) => {
		const { data: user, error } = await UserService.getUserByUsername(input.username);
		if (error) throw new TRPCError(errorMap[error]);
		return user;
	}),

	getByIDs: protectedProcedure.input(z.object({ userIDs: z.array(z.string()) })).query(async ({ ctx: _, input }) => {
		const { data: users, error } = await UserService.getUsersFromIDs(input.userIDs);
		if (error) throw new TRPCError(errorMap[error]);
		return users;
	}),

	update: protectedProcedure
		.input(z.object({ imageUrl: z.string().optional(), password: z.string().optional(), name: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			const { data: user, error } = await UserService.updateUser(ctx.session.user.id, {
				image: input.imageUrl,
				password: input.password,
				name: input.name,
			});

			if (error) throw new TRPCError(errorMap[error]);

			return user;
		}),
});
