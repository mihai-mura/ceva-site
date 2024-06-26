import type { User } from "@prisma/client";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import UserService from "./services/UserService";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: Omit<User, "password">;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		userId?: string;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Email",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, req): Promise<Omit<User, "password"> | null> {
				if (credentials) return UserService.authorizeUser(credentials.email, credentials.password);
				else return null;
			},
		}),
	],
	callbacks: {
		jwt({ token, user, account, profile }) {
			if (user) {
				token.userId = user.id;
			}
			return token;
		},
		session: async ({ session, token }) => {
			const user = await UserService.getUserById(token.userId ?? "");

			return {
				...session,
				user: {
					...user,
				},
			};
		},
	},
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
