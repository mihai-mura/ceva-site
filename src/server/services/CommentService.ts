import { Comment, User } from "@prisma/client";
import { db } from "../db";

export enum CommentServiceError {
	ServerError = "SERVER_ERROR",
	PostNotFound = "POST_NOT_FOUND",
}

type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = CommentServiceError> = Success<T> | Failure<E>;

export type CommentWithAuthor = Comment & {
	author: Pick<User, "username" | "image">;
};

export default class CommentService {
	static async createComment(postId: string, userId: string, content: string): Promise<Result<CommentWithAuthor>> {
		try {
			const post = await db.post.findUnique({
				where: { id: postId },
			});

			if (!post) return { data: null, error: CommentServiceError.PostNotFound };

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

			return { data: comment, error: null };
		} catch (error) {
			console.error("Error creating comment:", error);
			return { data: null, error: CommentServiceError.ServerError };
		}
	}

	static async getPostComments(postId: string): Promise<Result<CommentWithAuthor[]>> {
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

			return { data: comments, error: null };
		} catch (error) {
			console.error("Error fetching comments:", error);
			return { data: null, error: CommentServiceError.ServerError };
		}
	}
}
