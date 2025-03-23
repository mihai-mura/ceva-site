"use client";

import {
	Avatar,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Link,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
	Navbar as NavbarNextUI,
	useDisclosure,
} from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthModal from "./AuthModal/AuthModal";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const AuthModalState = useDisclosure();
	const [authModalType, setAuthModalType] = useState<"login" | "register">("login");

	const { data: session, status } = useSession();
	const pathname = usePathname();

	const menuItems = [
		"Profile",
		"Dashboard",
		"Activity",
		"Analytics",
		"System",
		"Deployments",
		"My Settings",
		"Team Settings",
		"Help & Feedback",
		"Log Out",
	];

	return (
		<NavbarNextUI className="sticky" onMenuOpenChange={setIsMenuOpen}>
			<NavbarContent>
				<NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} className="sm:hidden" />
				<NavbarBrand>
					<p className="font-bold text-inherit">CEVA-SITE</p>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 sm:flex" justify="center">
				<NavbarItem isActive={pathname === "/"}>
					<Link color={pathname === "/" ? "primary" : "foreground"} href="/">
						Posts
					</Link>
				</NavbarItem>
				<NavbarItem isActive={pathname === "/my-posts"}>
					{session ? (
						<Link color={pathname === "/my-posts" ? "primary" : "foreground"} href={session ? "/my-posts" : ""}>
							My Posts
						</Link>
					) : (
						<Link
							className="cursor-pointer"
							color="foreground"
							onPress={() => {
								setAuthModalType("login");
								AuthModalState.onOpen();
							}}>
							My Posts
						</Link>
					)}
				</NavbarItem>
			</NavbarContent>

			{session?.user ? (
				<NavbarContent as="div" justify="end">
					<NavbarItem>
						<Button href="/new" as={Link} variant="light" radius="full">
							New Post
						</Button>
					</NavbarItem>
					<NavbarItem>
						<Dropdown backdrop="blur" placement="bottom-end">
							<DropdownTrigger>
								<Avatar
									isBordered
									as="button"
									className="text-black transition-transform"
									color="primary"
									name={session.user?.username ?? ""}
									showFallback
									size="sm"
									src={session.user?.image ?? ""}
								/>
							</DropdownTrigger>
							<DropdownMenu aria-label="Profile Actions" variant="flat">
								<DropdownItem key="profile" className="h-14 gap-2">
									<p className="font-semibold">Signed in as</p>
									<p className="font-semibold">{session.user?.email}</p>
								</DropdownItem>
								<DropdownItem key="settings" href="/settings">
									My Settings
								</DropdownItem>
								<DropdownItem key="logout" color="danger" className="text-danger" onPress={async () => await signOut()}>
									Log Out
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</NavbarItem>
				</NavbarContent>
			) : (
				<NavbarContent justify="end">
					<NavbarItem>
						<Button
							color="primary"
							onPress={() => {
								setAuthModalType("register");
								AuthModalState.onOpen();
							}}
							variant="light"
							radius="full">
							Sign Up
						</Button>
					</NavbarItem>
					<NavbarItem>
						<Button
							color="primary"
							onPress={() => {
								setAuthModalType("login");
								AuthModalState.onOpen();
							}}
							variant="flat"
							radius="full">
							Login
						</Button>
					</NavbarItem>
				</NavbarContent>
			)}

			<NavbarMenu>
				{menuItems.map((item, index) => (
					<NavbarMenuItem key={`${item}-${index}`}>
						<Link
							color={index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"}
							className="w-full"
							href="#"
							size="lg">
							{item}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
			<AuthModal
				isOpen={AuthModalState.isOpen}
				onOpenChange={AuthModalState.onClose}
				type={authModalType}
				setType={setAuthModalType}
			/>
		</NavbarNextUI>
	);
};

export default Navbar;
