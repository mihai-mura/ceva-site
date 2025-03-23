import { redirect } from "next/navigation";
import WeirdGrid from "~/app/_extra/components/WeirdGrid";
import UserService, { UserServiceError } from "~/server/services/UserService";
import Header from "./_components/Header";

interface PageProps {
	params: Promise<{ username: string }>;
}

const Profile = async ({ params }: PageProps) => {
	const { username } = await params;
	const res = await UserService.getUserByUsername(username);
	if (res.error === UserServiceError.UserNotFound) {
		redirect("/404");
	}

	return (
		<div className="page flex flex-col items-center justify-center gap-20 pt-16">
			<Header username={res.user?.username ?? ""} profileImg={res.user?.image ?? ""} />
			<WeirdGrid posts={res.user?.posts ?? null} />
		</div>
	);
};

export default Profile;
