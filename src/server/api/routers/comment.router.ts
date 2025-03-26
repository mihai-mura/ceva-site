import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, type ErrorConfig, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import CommentService, { CommentServiceError } from "~/server/services/CommentService";

const errorMap: Record<CommentServiceError, ErrorConfig> = {
	[CommentServiceError.PostNotFound]: {
		code: "NOT_FOUND",
		message: "Post not found",
	},
	[CommentServiceError.ServerError]: {
		code: "INTERNAL_SERVER_ERROR",
		message: "Server error",
	},
};

export const commentRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ postId: z.string(), content: z.string() })).mutation(async ({ ctx, input }) => {
		const { data: comment, error } = await CommentService.createComment(input.postId, ctx.session.user.id, input.content);

		if (error) throw new TRPCError(errorMap[error]);
		return comment;
	}),

	list: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx: _, input }) => {
		const { data: comments, error } = await CommentService.getPostComments(input.postId);

		if (error) throw new TRPCError(errorMap[error]);
		return comments;
	}),
});
