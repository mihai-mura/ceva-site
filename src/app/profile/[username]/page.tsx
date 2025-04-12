import { redirect } from "next/navigation";
import WeirdGrid from "~/app/_extra/components/WeirdGrid";
import { tryCatch } from "~/lib/try-catch";
import { api, isTRPCError } from "~/trpc/server";
import Header from "../../_extra/components/Header";

interface PageProps {
	params: Promise<{ username: string }>;
}

const Profile = async ({ params }: PageProps) => {
	const { username } = await params;
	const { data: user, error } = await tryCatch(api.user.getByUsername({ username }));
	if (error && isTRPCError(error)) {
		switch (error.code) {
			case "NOT_FOUND":
				redirect("/404");
		}
	}

	return (
		<div className="page flex flex-col items-center justify-center gap-20 pt-16">
			<Header username={user?.username ?? ""} profileImg={user?.image ?? ""} />
			<WeirdGrid posts={user?.posts ?? null} />
		</div>
	);
};

export default Profile;
