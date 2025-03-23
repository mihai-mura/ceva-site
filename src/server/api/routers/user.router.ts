import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import UserService from "~/server/services/UserService";

export const userRouter = createTRPCRouter({
	getUsersFromIDs: protectedProcedure.input(z.object({ userIDs: z.array(z.string()) })).query(async ({ ctx, input }) => {
		return await UserService.getUsersFromIDs(input.userIDs);
	}),

	update: protectedProcedure
		.input(z.object({ imageUrl: z.string().optional(), password: z.string().optional(), name: z.string().optional() }))
		.mutation(async ({ ctx, input }) => {
			return await UserService.updateUser(ctx.session.user.id, {
				image: input.imageUrl,
				password: input.password,
				name: input.name,
			});
		}),
});
