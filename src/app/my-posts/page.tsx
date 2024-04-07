import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import PostService from "~/server/services/PostService";
import WeirdGrid from "../Extra/components/WeirdGrid";

const MyPosts = async () => {
	const session = await getServerAuthSession();
	if (!session) return redirect("/");

	const getPostsRes = await PostService.getUserPosts(session.user.id, "id");

	return (
		<div className="page flex flex-col items-center">
			<WeirdGrid isPrivate posts={getPostsRes.posts} />
		</div>
	);
};

export default MyPosts;
