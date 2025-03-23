import { Prisma, type User } from "@prisma/client";
import bcrypt from "bcrypt";
import { db } from "../db";
import type { PostWithAuthor } from "./PostService";

export enum UserServiceError {
	EmailAlreadyExists,
	UsernameAlreadyExists,
	ServerError,
	UserNotFound,
	WrongInput,
}

export interface UserWithPost extends User {
	posts: PostWithAuthor[];
}

class UserService {
	private constructor() {
		// This class is not meant to be instantiated
	}

	public static async createUser(
		name: string,
		email: string,
		plainPassword: string,
	): Promise<Omit<User, "password"> | UserServiceError> {
		try {
			const hashedPassword = await bcrypt.hash(plainPassword, 10);

			const user = await db.user.create({
				data: {
					username: name,
					email: email,
					password: hashedPassword,
				},
			});

			const { password: _, ...userWithoutPassword } = user;
			return userWithoutPassword;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				return UserServiceError.EmailAlreadyExists;
			}
			// Handle any other errors
			return UserServiceError.ServerError;
		}
	}

	public static async getUserById(userId: string): Promise<User | null> {
		return await db.user.findUnique({
			where: {
				id: userId,
			},
		});
	}

	public static async authorizeUser(email: string, password: string): Promise<Omit<User, "password"> | null> {
		const user = await db.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return null;
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return null;
		}

		const { password: _, ...userWithoutPassword } = user;

		return userWithoutPassword;
	}

	static async updateUser(
		userId: string,
		{ image, name, password }: { image?: string; name?: string; password?: string },
	): Promise<UserServiceError | User> {
		try {
			let user: User | null = null;
			if (image) {
				user = await db.user.update({
					where: {
						id: userId,
					},
					data: {
						image,
					},
				});
			}
			if (name) {
				user = await db.user.update({
					where: {
						id: userId,
					},
					data: {
						username: name,
					},
				});
			}
			if (password) {
				const hashedPassword = await bcrypt.hash(password, 10);
				user = await db.user.update({
					where: {
						id: userId,
					},
					data: {
						password: hashedPassword,
					},
				});
			}

			if (!user) return UserServiceError.UserNotFound;
			return user;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
				return UserServiceError.UsernameAlreadyExists;
			return UserServiceError.ServerError;
		}
	}

	static async getUsersFromIDs(userIds: string[]): Promise<Omit<User, "password">[] | UserServiceError> {
		try {
			return await db.user.findMany({
				where: {
					id: {
						in: userIds,
					},
				},
				select: {
					id: true,
					username: true,
					image: true,
					email: true,
				},
			});
		} catch (error) {
			return UserServiceError.ServerError;
		}
	}

	static async getUserByUsername(username: string): Promise<{ user: UserWithPost | null; error: UserServiceError | null }> {
		try {
			const user = await db.user.findUnique({
				where: {
					username,
				},
				include: {
					posts: {
						orderBy: {
							createdAt: "desc",
						},
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
			if (!user) return { user: null, error: UserServiceError.UserNotFound };
			return { user, error: null };
		} catch (error) {
			return { user: null, error: UserServiceError.ServerError };
		}
	}
}

export default UserService;
