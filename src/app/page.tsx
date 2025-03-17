import { connection } from "next/server";
import PostService from "~/server/services/PostService";
import WeirdGrid from "./Extra/components/WeirdGrid";

const Home = async () => {
	connection();
	const getPostsRes = await PostService.getAllPosts();

	return (
		<div className="page flex items-center justify-center pt-16">
			<WeirdGrid posts={getPostsRes.posts} />
		</div>
	);
};

export default Home;
