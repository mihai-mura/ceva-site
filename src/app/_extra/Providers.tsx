"use client";
import { MantineProvider } from "@mantine/core";
import { NextUIProvider } from "@nextui-org/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<NextUIProvider navigate={(path) => router.push(path)}>
			<SessionProvider>
				<MantineProvider>
					<TRPCReactProvider>
						{children}
						{env.NEXT_PUBLIC_NODE_ENV === "development" && <ReactQueryDevtools />}
					</TRPCReactProvider>
				</MantineProvider>
			</SessionProvider>
		</NextUIProvider>
	);
}

export default Providers;
