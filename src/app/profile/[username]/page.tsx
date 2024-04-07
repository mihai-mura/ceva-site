import { Avatar, Chip } from "@nextui-org/react";
import { redirect } from "next/navigation";
import WeirdGrid from "~/app/Extra/components/WeirdGrid";
import UserService, { UserServiceError } from "~/server/services/UserService";

interface Props {
	params: {
		username: string;
	};
}

const Profile = async ({ params }: Props) => {
	const res = await UserService.getUserByUsername(params.username);
	if (res.error === UserServiceError.UserNotFound) {
		redirect("/404");
	}

	return (
		<div className="page flex flex-col items-center justify-center gap-20 pt-16">
			<div className="flex items-center justify-center gap-4">
				<Avatar
					className="h-20 w-20 text-large"
					color="secondary"
					isBordered
					name={res.user?.username}
					src={res.user?.image ?? ""}
				/>
				<Chip variant="light" className="h-[38px] text-2xl">
					@{res.user?.username}
				</Chip>
			</div>
			<WeirdGrid posts={res.user?.posts ?? null} />
		</div>
	);
};

export default Profile;
