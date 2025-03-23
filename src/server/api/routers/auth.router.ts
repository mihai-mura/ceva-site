import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import UserService from "~/server/services/UserService";

export const authRouter = createTRPCRouter({
	register: publicProcedure
		.input(z.object({ name: z.string(), email: z.string(), password: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await UserService.createUser(input.name, input.email, input.password);
		}),
});
