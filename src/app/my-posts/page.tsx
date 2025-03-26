import { redirect } from "next/navigation";
import { tryCatch } from "~/lib/try-catch";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import WeirdGrid from "../_extra/components/WeirdGrid";

const MyPosts = async () => {
	const session = await getServerAuthSession();
	if (!session) return redirect("/");

	const { data: posts, error } = await tryCatch(api.post.getByUser({ value: session.user.id, type: "id" }));

	return (
		<div className="page flex flex-col items-center">
			<WeirdGrid isPrivate posts={posts} />
		</div>
	);
};

export default MyPosts;
