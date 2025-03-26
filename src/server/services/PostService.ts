import { Post, User } from "@prisma/client";
import { db } from "../db";

export enum PostServiceError {
	ServerError = "SERVER_ERROR",
	PostNotFound = "POST_NOT_FOUND",
	UserNotFound = "USER_NOT_FOUND",
	AccessDenied = "ACCESS_DENIED",
}

type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = PostServiceError> = Success<T> | Failure<E>;

export interface PostWithAuthor extends Post {
	author: Pick<User, "username">;
}

class PostService {
	private constructor() {
		// This is a static class
	}

	static async createPost(imageUrl: string, authorId: string): Promise<Result<Post>> {
		try {
			const post = await db.post.create({
				data: {
					imageUrl,
					authorId,
				},
			});
			return { data: post, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async getUserPosts(identifier: string, type: "id" | "username"): Promise<Result<PostWithAuthor[]>> {
		try {
			const user = await db.user.findUnique({
				where: type === "id" ? { id: identifier } : { username: identifier },
				select: {
					posts: {
						orderBy: { createdAt: "desc" },
						include: {
							author: {
								select: {
									username: true,
								},
							},
						},
					},
				},
			});
			if (!user) return { data: null, error: PostServiceError.UserNotFound };
			return { data: user.posts, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async getAllPosts(): Promise<Result<PostWithAuthor[]>> {
		try {
			const posts = await db.post.findMany({
				orderBy: { createdAt: "desc" },
				include: {
					author: {
						select: {
							username: true,
						},
					},
				},
			});
			return { data: posts, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async likePost(postId: string, userId: string): Promise<Result<boolean>> {
		try {
			const post = await db.post.update({
				where: {
					id: postId,
				},
				data: {
					likedBy: {
						push: userId,
					},
				},
			});
			if (!post) return { data: null, error: PostServiceError.PostNotFound };
			return { data: true, error: null };
		} catch (error) {
			console.log(error);
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async unlikePost(postId: string, userId: string): Promise<Result<boolean>> {
		try {
			const post = await db.post.findUnique({
				where: {
					id: postId,
				},
				select: {
					likedBy: true,
				},
			});

			if (!post) return { data: null, error: PostServiceError.PostNotFound };

			await db.post.update({
				where: {
					id: postId,
				},
				data: {
					likedBy: {
						set: post?.likedBy.filter((id) => id !== userId),
					},
				},
			});

			return { data: true, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async deletePost(postId: string, userId: string): Promise<Result<boolean>> {
		try {
			const post = await db.post.findUnique({
				where: {
					id: postId,
				},
			});
			if (!post) return { data: null, error: PostServiceError.PostNotFound };
			if (post.authorId !== userId) return { data: null, error: PostServiceError.AccessDenied };
			await db.post.delete({
				where: {
					id: postId,
				},
			});
			return { data: true, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}

	static async updateDescription(postId: string, userId: string, newDescription: string): Promise<Result<Post>> {
		try {
			let post = await db.post.findUnique({
				where: {
					id: postId,
				},
			});
			if (!post) return { data: null, error: PostServiceError.PostNotFound };
			if (post.authorId !== userId) return { data: null, error: PostServiceError.AccessDenied };
			post = await db.post.update({
				where: {
					id: postId,
				},
				data: {
					description: newDescription,
				},
			});
			return { data: post, error: null };
		} catch (error) {
			return { data: null, error: PostServiceError.ServerError };
		}
	}
}
export default PostService;
