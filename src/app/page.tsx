import { connection } from "next/server";
import { api } from "~/trpc/server";
import WeirdGrid from "./_extra/components/WeirdGrid";

const Home = async () => {
	connection();
	const posts = await api.post.getAll();

	return (
		<div className="page flex items-center justify-center pt-16">
			<WeirdGrid posts={posts} />
		</div>
	);
};

export default Home;
