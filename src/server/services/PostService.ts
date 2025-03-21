import { Post, User } from "@prisma/client";
import { db } from "../../lib/db";

export enum PostServiceError {
	ServerError,
	PostNotFound,
	UserNotFound,
	AccessDenied,
}

export interface PostWithAuthor extends Post {
	author: Pick<User, "username">;
}

class PostService {
	private constructor() {
		// This is a static class
	}

	static async createPost(imageUrl: string, authorId: string) {
		try {
			const post = await db.post.create({
				data: {
					imageUrl,
					authorId,
				},
			});
			return post;
		} catch (error) {
			return PostServiceError.ServerError;
		}
	}

	static async getUserPosts(
		identifier: string,
		type: "id" | "username",
	): Promise<{ posts: PostWithAuthor[] | null; error: PostServiceError | null }> {
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
			if (!user) return { posts: null, error: PostServiceError.UserNotFound };
			return { posts: user.posts, error: null };
		} catch (error) {
			return { posts: null, error: PostServiceError.ServerError };
		}
	}

	static async getAllPosts(): Promise<{ posts: PostWithAuthor[] | null; error: PostServiceError | null }> {
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
			return { posts, error: null };
		} catch (error) {
			return { posts: null, error: PostServiceError.ServerError };
		}
	}

	static async likePost(postId: string, userId: string): Promise<PostServiceError | Post> {
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
			if (!post) return PostServiceError.PostNotFound;
			return post;
		} catch (error) {
			console.log(error);
			return PostServiceError.ServerError;
		}
	}

	static async unlikePost(postId: string, userId: string): Promise<PostServiceError | Post> {
		try {
			const post = await db.post.findUnique({
				where: {
					id: postId,
				},
				select: {
					likedBy: true,
				},
			});

			if (!post) return PostServiceError.PostNotFound;

			const newLikedBy = await db.post.update({
				where: {
					id: postId,
				},
				data: {
					likedBy: {
						set: post?.likedBy.filter((id) => id !== userId),
					},
				},
			});

			return newLikedBy;
		} catch (error) {
			return PostServiceError.ServerError;
		}
	}

	static async deletePost(postId: string, userId: string): Promise<Post | PostServiceError> {
		try {
			const post = await db.post.findUnique({
				where: {
					id: postId,
				},
			});
			if (!post) return PostServiceError.PostNotFound;
			if (post.authorId !== userId) return PostServiceError.AccessDenied;
			await db.post.delete({
				where: {
					id: postId,
				},
			});
			return post;
		} catch (error) {
			return PostServiceError.ServerError;
		}
	}

	static async updateDescription(postId: string, userId: string, newDescription: string): Promise<Post | PostServiceError> {
		try {
			let post = await db.post.findUnique({
				where: {
					id: postId,
				},
			});
			if (!post) return PostServiceError.PostNotFound;
			if (post.authorId !== userId) return PostServiceError.AccessDenied;
			post = await db.post.update({
				where: {
					id: postId,
				},
				data: {
					description: newDescription,
				},
			});
			return post;
		} catch (error) {
			return PostServiceError.ServerError;
		}
	}
}
export default PostService;
