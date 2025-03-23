import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import CommentService from "~/server/services/CommentService";

export const commentRouter = createTRPCRouter({
	create: protectedProcedure.input(z.object({ postId: z.string(), content: z.string() })).mutation(async ({ ctx, input }) => {
		return await CommentService.createComment(input.postId, ctx.session.user.id, input.content);
	}),

	list: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
		return await CommentService.getPostComments(input.postId);
	}),
});
