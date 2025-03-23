"use client";
import { MantineProvider } from "@mantine/core";
import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

function Providers({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	return (
		<NextUIProvider navigate={(path) => router.push(path)}>
			<SessionProvider>
				<MantineProvider>{children}</MantineProvider>
			</SessionProvider>
		</NextUIProvider>
	);
}

export default Providers;
