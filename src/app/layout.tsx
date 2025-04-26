import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "~/styles/globals.css";
import Providers from "./_extra/Providers";
import Navbar from "./_extra/components/Navbar";

export const metadata: Metadata = {
	title: "Pixelog",
	description: "Modern social platform for sharing visuals",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${GeistSans.className} dark`}>
			<body>
				<Providers>
					<Navbar />
					{children}
				</Providers>
			</body>
		</html>
	);
}
