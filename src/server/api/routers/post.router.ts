import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import PostService from "~/server/services/PostService";

export const postRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ url: z.string() })).mutation(async ({ ctx, input }) => {
		return await PostService.createPost(input.url, ctx.session.user.id);
	}),

	delete: protectedProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
		return await PostService.deletePost(input.postId, ctx.session.user.id);
	}),

	updateDescription: protectedProcedure
		.input(z.object({ postId: z.string(), description: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await PostService.updateDescription(input.postId, ctx.session.user.id, input.description);
		}),

	like: protectedProcedure
		.input(z.object({ postId: z.string(), action: z.union([z.literal("like"), z.literal("unlike")]) }))
		.mutation(async ({ ctx, input }) => {
			if (input.action === "like") return await PostService.likePost(input.postId, ctx.session.user.id);
			else return await PostService.unlikePost(input.postId, ctx.session.user.id);
		}),
});
