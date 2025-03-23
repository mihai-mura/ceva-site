import { Comment, User } from "@prisma/client";
import { db } from "../db";

export enum CommentServiceError {
	ServerError,
	PostNotFound,
}

export type CommentWithAuthor = Comment & {
	author: Pick<User, "username" | "image">;
};

export default class CommentService {
	static async createComment(postId: string, userId: string, content: string) {
		try {
			const post = await db.post.findUnique({
				where: { id: postId },
			});

			if (!post) return CommentServiceError.PostNotFound;

			const comment = await db.comment.create({
				data: {
					content,
					author: { connect: { id: userId } },
					post: { connect: { id: postId } },
				},
				include: {
					author: {
						select: { username: true, image: true },
					},
				},
			});

			return comment;
		} catch (error) {
			console.error("Error creating comment:", error);
			return CommentServiceError.ServerError;
		}
	}

	static async getPostComments(postId: string): Promise<CommentWithAuthor[] | CommentServiceError> {
		try {
			const comments = await db.comment.findMany({
				where: { postId },
				include: {
					author: {
						select: { username: true, image: true },
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return comments;
		} catch (error) {
			console.error("Error fetching comments:", error);
			return CommentServiceError.ServerError;
		}
	}
}
