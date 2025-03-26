import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, type ErrorConfig, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import PostService, { PostServiceError } from "~/server/services/PostService";

const errorMap: Record<PostServiceError, ErrorConfig> = {
	[PostServiceError.UserNotFound]: {
		code: "NOT_FOUND",
		message: "User not found",
	},
	[PostServiceError.PostNotFound]: {
		code: "NOT_FOUND",
		message: "Post not found",
	},
	[PostServiceError.AccessDenied]: {
		code: "FORBIDDEN",
		message: "Access denied",
	},
	[PostServiceError.ServerError]: {
		code: "INTERNAL_SERVER_ERROR",
		message: "Server error",
	},
};

export const postRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx: _ }) => {
		const { data: posts, error } = await PostService.getAllPosts();

		if (error) throw new TRPCError(errorMap[error]);
		return posts;
	}),

	getByUser: publicProcedure
		.input(z.object({ value: z.string(), type: z.union([z.literal("username"), z.literal("id")]) }))
		.query(async ({ ctx: _, input }) => {
			const { data: posts, error } = await PostService.getUserPosts(input.value, input.type);

			if (error) throw new TRPCError(errorMap[error]);
			return posts;
		}),

	create: protectedProcedure.input(z.object({ url: z.string() })).mutation(async ({ ctx, input }) => {
		const { data: post, error } = await PostService.createPost(input.url, ctx.session.user.id);

		if (error) throw new TRPCError(errorMap[error]);
		return post;
	}),

	delete: protectedProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
		const { data: success, error } = await PostService.deletePost(input.postId, ctx.session.user.id);
		if (error) throw new TRPCError(errorMap[error]);
		return success;
	}),

	updateDescription: protectedProcedure
		.input(z.object({ postId: z.string(), description: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { data: updatedPost, error } = await PostService.updateDescription(
				input.postId,
				ctx.session.user.id,
				input.description,
			);

			if (error) throw new TRPCError(errorMap[error]);
			return updatedPost;
		}),

	like: protectedProcedure
		.input(z.object({ postId: z.string(), action: z.union([z.literal("like"), z.literal("unlike")]) }))
		.mutation(async ({ ctx, input }) => {
			const { data: success, error } =
				input.action === "like"
					? await PostService.likePost(input.postId, ctx.session.user.id)
					: await PostService.unlikePost(input.postId, ctx.session.user.id);

			if (error) throw new TRPCError(errorMap[error]);
			return success;
		}),
});
