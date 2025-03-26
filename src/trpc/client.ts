import { createTRPCClient, httpBatchStreamLink, loggerLink, TRPCClientError } from "@trpc/client";
import SuperJSON from "superjson";
import { type AppRouter } from "~/server/api/root";

export const api = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: (op) => process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error),
		}),
		httpBatchStreamLink({
			transformer: SuperJSON,
			url: getBaseUrl() + "/api/trpc",
			headers: () => {
				const headers = new Headers();
				headers.set("x-trpc-source", "nextjs-react");
				return headers;
			},
		}),
	],
});

function getBaseUrl() {
	if (typeof window !== "undefined") return window.location.origin;
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function isTRPCClientError(cause: unknown): cause is TRPCClientError<AppRouter> {
	return cause instanceof TRPCClientError;
}
