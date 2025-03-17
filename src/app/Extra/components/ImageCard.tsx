"use client";
import { useClickOutside } from "@mantine/hooks";
import { Button, Card, CardBody, CardFooter, Image, Link, useDisclosure } from "@nextui-org/react";
import { deleteObject, ref } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import polaroidTexture from "~/../public/polaroidTexture.jpeg";
import type { RequestBody as PostDeleteRequestBody } from "~/app/api/post/delete/route";
import type { RequestBody } from "~/app/api/post/like/route";
import { storage } from "~/lib/firebase";
import revalidate from "~/server/actions/revalidate";
import LikedByModal from "./LikedByModalContent";
import { PositionPost } from "./WeirdGrid";

interface Props {
	post: PositionPost;
	isPrivate?: boolean;
	isLiked?: boolean;
	onDelete: (postId: string) => void;
}

interface PositionState {
	top: string;
	left: string;
	rotate: number;
	scale: number;
}

const ImageCard = ({ post, isPrivate, isLiked, onDelete }: Props) => {
	const { data: session } = useSession();
	const router = useRouter();

	const [liked, setLiked] = useState(isLiked);
	const [likesCount, setLikesCount] = useState(post.likedBy.length);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const [isVisible, setIsVisible] = useState(true);
	const [opened, setOpened] = useState(false);
	const [cardState, setCardState] = useState<PositionState>({
		top: `${post.top}px`,
		left: `${post.left}%`,
		rotate: post.rotation,
		scale: 1,
	});

	useEffect(() => {
		setLiked(isLiked);
	}, [isLiked]);

	useEffect(() => {
		setLikesCount(post.likedBy.length);
	}, [post.likedBy.length]);

	const handleClick = () => {
		setOpened(true);
		setCardState({
			top: "50vh",
			left: "50vw",
			rotate: -post.rotation,
			scale: 1.8,
		});
	};
	const cardRef = useClickOutside(() => {
		setOpened(false);
		setCardState({
			top: `${post.top}px`,
			left: `${post.left}%`,
			scale: 1,
			rotate: post.rotation,
		});
	});

	const handleLike = async (like: boolean) => {
		setLiked(like);
		setLikesCount((prev) => (like ? prev + 1 : prev - 1));

		const body: RequestBody = {
			postId: post.id,
			action: like ? "like" : "unlike",
		};
		const res = await fetch("/api/post/like", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		// If the server responds with an error, throw an error
		if (!res.ok) {
			setLiked(!like);
			setLikesCount((prev) => (like ? prev - 1 : prev + 1));
			//TODO: Show error message
		}
		revalidate("/my-posts");
	};

	const deletePost = async () => {
		setDeleteLoading(true);

		const body: PostDeleteRequestBody = {
			postId: post.id,
		};

		const res = await fetch("/api/post/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		setDeleteLoading(false);

		if (res.ok) {
			//delete from firebase
			const path = decodeURIComponent((post.imageUrl ?? "").split("o/")[1]?.split("?alt=media")[0] ?? "");
			const storageRef = ref(storage, path);
			await deleteObject(storageRef);

			setIsVisible(false);
			setTimeout(() => {
				onDelete(post.id);
			}, 1000);
		} else {
			//TODO: Show error message
		}
	};

	const openLikesModal = () => {
		onOpenChange();
	};

	return (
		<>
			<AnimatePresence>
				{isVisible && (
					<motion.div
						key={post.id}
						ref={cardRef}
						className="h-fit w-[250px]"
						style={{
							position: opened ? "fixed" : "absolute",
							top: `${post.top}px`,
							left: `${post.left}%`,
							rotate: post.rotation,
							cursor: opened ? "default" : "pointer",
							translateX: "-50%",
							translateY: "-50%",
							zIndex: opened ? 40 : 0,
						}}
						// @ts-ignore
						animate={cardState}
						transition={{ type: "spring" }}
						whileHover={
							!opened
								? {
										scale: 1.05,
										transition: { duration: 0.1 },
									}
								: undefined
						}
						exit={{ opacity: 0, scale: 0, rotate: 180 }}
						onClick={handleClick}>
						<Card radius="none" shadow="sm" className="bg-cover" style={{ backgroundImage: `url(${polaroidTexture.src})` }}>
							<CardBody className="overflow-visible px-5 pt-5">
								<Image
									as="img"
									unselectable="on"
									radius="none"
									className="bg-white object-cover"
									src={post.imageUrl}
									onDragStart={(e) => e.preventDefault()}
								/>
							</CardBody>
							{isPrivate ? (
								<CardFooter className="h-[38px] justify-between text-small">
									<p className="cursor-pointer text-black" onClick={opened ? () => openLikesModal() : undefined}>
										{likesCount} {likesCount === 1 ? "like" : "likes"}
									</p>
									<Button
										onPress={() => deletePost()}
										className=" bg-transparent text-[15px] text-danger"
										radius="full"
										variant="flat"
										size="sm"
										color="danger"
										isLoading={deleteLoading}
										isIconOnly>
										<FaTrash />
									</Button>
								</CardFooter>
							) : (
								<CardFooter className="h-[40px] justify-between gap-2 pb-5 pl-5 text-small">
									<div className="flex items-center justify-center">
										{session ? (
											<button
												onClick={opened ? () => handleLike(!liked) : undefined}
												className={`flex h-[35px] w-[35px] cursor-pointer items-center justify-center text-[25px] transition-all ease-in-out active:text-[22px] ${
													liked ? "text-red-500" : "text-black"
												}`}>
												{liked ? <AiFillHeart /> : <AiOutlineHeart />}
											</button>
										) : (
											<></>
										)}

										<p className="text-black">
											{likesCount} {likesCount === 1 ? "like" : "likes"}
										</p>
									</div>
									<Link className="text-black" href={`/profile/${post.author.username}`}>
										@{post.author.username}
									</Link>
								</CardFooter>
							)}
						</Card>
					</motion.div>
				)}
			</AnimatePresence>
			<LikedByModal isOpen={isOpen} onOpenChange={onOpenChange} userIDs={post.likedBy} />
		</>
	);
};

export default ImageCard;
