import { Prisma, type User } from "@prisma/client";
import bcrypt from "bcrypt";
import { db } from "../db";
import type { PostWithAuthor } from "./PostService";

export enum UserServiceError {
	EmailAlreadyExists = "EMAIL_ALREADY_EXISTS",
	UsernameAlreadyExists = "USERNAME_ALREADY_EXISTS",
	ServerError = "SERVER_ERROR",
	UserNotFound = "USER_NOT_FOUND",
	PasswordMismatch = "PASSWORD_MISMATCH",
}

type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = UserServiceError> = Success<T> | Failure<E>;

export interface UserWithPost extends User {
	posts: PostWithAuthor[];
}

class UserService {
	private constructor() {
		// This class is not meant to be instantiated
	}

	public static async createUser(name: string, email: string, plainPassword: string): Promise<Result<Omit<User, "password">>> {
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
			return { data: userWithoutPassword, error: null };
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				return { data: null, error: UserServiceError.EmailAlreadyExists };
			}
			// Handle any other errors
			return { data: null, error: UserServiceError.ServerError };
		}
	}

	public static async getUserById(userId: string): Promise<Result<User>> {
		try {
			const user = await db.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (!user) return { data: null, error: UserServiceError.UserNotFound };
			return { data: user, error: null };
		} catch (error) {
			return { data: null, error: UserServiceError.ServerError };
		}
	}

	public static async authorizeUser(email: string, password: string): Promise<Result<Omit<User, "password">>> {
		const user = await db.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return { data: null, error: UserServiceError.UserNotFound };
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return { data: null, error: UserServiceError.PasswordMismatch };
		}

		const { password: _, ...userWithoutPassword } = user;

		return { data: userWithoutPassword, error: null };
	}

	static async updateUser(
		userId: string,
		{ image, name, password }: { image?: string; name?: string; password?: string },
	): Promise<Result<Omit<User, "password">>> {
		try {
			const existingUser = await db.user.findUnique({
				where: { id: userId },
			});

			if (!existingUser) {
				return { data: null, error: UserServiceError.UserNotFound };
			}

			const updateData: Prisma.UserUpdateInput = {};
			if (image) updateData.image = image;
			if (name) updateData.username = name;
			if (password) {
				updateData.password = await bcrypt.hash(password, 10);
			}

			const user = await db.user.update({
				where: { id: userId },
				data: updateData,
			});

			const { password: _, ...userWithoutPassword } = user;
			return { data: userWithoutPassword, error: null };
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				return { data: null, error: UserServiceError.UsernameAlreadyExists };
			}
			return { data: null, error: UserServiceError.ServerError };
		}
	}

	static async getUsersFromIDs(userIds: string[]): Promise<Result<Omit<User, "password">[]>> {
		try {
			const users = await db.user.findMany({
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
			return { data: users, error: null };
		} catch (error) {
			return { data: null, error: UserServiceError.ServerError };
		}
	}

	static async getUserByUsername(username: string): Promise<Result<UserWithPost>> {
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
			if (!user) return { data: null, error: UserServiceError.UserNotFound };
			return { data: user, error: null };
		} catch (error) {
			return { data: null, error: UserServiceError.ServerError };
		}
	}
}

export default UserService;
