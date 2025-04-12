"use client";
import { Avatar, Chip } from "@nextui-org/react";

interface HeaderProps {
	username: string;
	profileImg: string;
}

const Header = (props: HeaderProps) => {
	return (
		<div className="flex items-center justify-center gap-4">
			<Avatar className="h-20 w-20 text-large" color="primary" isBordered name={props.username} src={props.profileImg} />
			<Chip variant="light" className="h-[38px] text-2xl">
				@{props.username}
			</Chip>
		</div>
	);
};

export default Header;
