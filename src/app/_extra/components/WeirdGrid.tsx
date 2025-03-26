"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { type PostWithAuthor } from "~/server/services/PostService";
import ImageCard from "./ImageCard";

interface WeirdGridProps {
	posts: PostWithAuthor[] | null;
	isPrivate?: boolean;
}

export interface PositionPost extends PostWithAuthor {
	top: number;
	left: number;
	rotation: number;
}

//------ SOME RANDOM INFO ------
//2 posts / section
//1 section = some height

//public
const SECTION_HEIGHT = (isPrivate?: boolean) => (isPrivate ? 420 : 420);
const X_PADDING = (isPrivate?: boolean) => (isPrivate ? 9.5 : 8); // % of width
const Y_PADDING = (isPrivate?: boolean) => (isPrivate ? 0.4 : 0.28); // % of section height
//between [-15, -2] and [2, 15]
const MAX_ROTATION = (isPrivate?: boolean) => (isPrivate ? 15 : 15); //deg
const MIN_ROTATION = (isPrivate?: boolean) => (isPrivate ? 2 : 2); //deg

const WeirdGrid = ({ posts: postList, isPrivate }: WeirdGridProps) => {
	const { data: session } = useSession();

	const [posts, setPosts] = useState<PositionPost[] | null>([]);
	const [containerHeight, setContainerHeight] = useState(0);

	useEffect(() => {
		setContainerHeight(postList ? Math.ceil(postList.length / 4) * SECTION_HEIGHT(isPrivate) : 0);
		const postListPosition = postList as PositionPost[];
		setPosts((prev) => {
			//so that the posts don't move when the user likes a post
			if (!prev) return postListPosition;
			const difference1 = postListPosition?.filter((p1) => !prev?.some((p2) => p2.id === p1.id));
			const difference2 = prev?.filter((p2) => !postListPosition.some((p1) => p1.id === p2.id));
			const difference = [...difference1, ...difference2];

			return [...prev, ...difference];
		});
	}, [postList]);

	const handleDelete = (postId: string) => {
		if (!posts) return;
		setPosts(posts.filter((post) => post.id !== postId));
	};

	return (
		<div className="relative w-[60vw]" style={{ height: `${containerHeight}px` }}>
			{posts?.map((post, index) => {
				let isLiked = false;
				if (post.likedBy.includes(session?.user.id ?? "")) isLiked = true;

				let { top, left, rotation } = getRandomPosition(index, containerHeight, isPrivate);
				if (post.top && post.left && post.rotation) {
					top = post.top;
					left = post.left;
					rotation = post.rotation;
				} else {
					post.top = top;
					post.left = left;
					post.rotation = rotation;
				}

				return <ImageCard post={post} key={post.id} isLiked={isLiked} isPrivate={isPrivate} onDelete={handleDelete} />;
			})}
		</div>
	);
};

const getRandomPosition = (index: number, containerHeight: number, isPrivate?: boolean) => {
	//Math.floor(index / 4) = current section
	//top between -> [total height - (section height * (section count - current section), total height - (section height * (section count - current section - 1)]
	//start section / end section = Math.floor(index / 2)
	//left (working in percentage) between -> [0, 50] if ↑↑↑ == 0 and [50, 100] if ↑↑↑ == 1
	const currentSection = Math.floor(index / 4);
	const sectionCount = containerHeight / SECTION_HEIGHT(isPrivate);

	const lowerTopBound = containerHeight - SECTION_HEIGHT(isPrivate) * (sectionCount - currentSection);
	const upperTopBound = containerHeight - SECTION_HEIGHT(isPrivate) * (sectionCount - currentSection - 1);
	const lowerTopPadding = lowerTopBound + SECTION_HEIGHT(isPrivate) * Y_PADDING(isPrivate);
	const upperTopPadding = upperTopBound - SECTION_HEIGHT(isPrivate) * Y_PADDING(isPrivate);

	const top = Math.floor(Math.random() * (upperTopPadding - lowerTopPadding) + lowerTopPadding);

	const lowerLeftBound = (index % 4) * 25;
	const upperLeftBound = lowerLeftBound + 25;
	const lowerLeftPadding = lowerLeftBound + X_PADDING(isPrivate);
	const upperLeftPadding = upperLeftBound - X_PADDING(isPrivate);

	const left = Math.floor(Math.random() * (upperLeftPadding - lowerLeftPadding) + lowerLeftPadding);

	const rotation =
		Math.floor(Math.random() * (MAX_ROTATION(isPrivate) - MIN_ROTATION(isPrivate) + 1) + MIN_ROTATION(isPrivate)) *
		(Math.random() < 0.5 ? -1 : 1);
	return { top, left, rotation };
};

export default WeirdGrid;
