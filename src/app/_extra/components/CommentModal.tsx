"use client";

import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, Textarea } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CommentWithAuthor } from "~/server/services/CommentService";
import { api } from "~/trpc/client";

interface CommentModalProps {
	isOpen: boolean;
	onOpenChange: () => void;
	postId: string;
	isPrivate: boolean;
}

export default function CommentModal({ isOpen, onOpenChange, postId, isPrivate }: CommentModalProps) {
	const { data: session } = useSession();
	const [newComment, setNewComment] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [comments, setComments] = useState<CommentWithAuthor[]>([]);
	const [isLoadingComments, setIsLoadingComments] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchComments();
		}
	}, [isOpen]);

	const fetchComments = async () => {
		setIsLoadingComments(true);

		const comments = await api.comment.list.query({ postId });
		if (comments) setComments(comments);
		setIsLoadingComments(false);
	};

	const handleSubmit = async () => {
		if (!newComment.trim()) return;
		setIsLoading(true);

		const comment = await api.comment.create.mutate({
			postId,
			content: newComment.trim(),
		});

		setIsLoading(false);
		if (comment) {
			setNewComment("");
			await fetchComments();
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
			<ModalContent>
				<ModalHeader className="text-xl font-bold">Comments</ModalHeader>
				<ModalBody className="max-h-[400px] px-6">
					{isLoadingComments ? (
						<div className="flex h-40 items-center justify-center">
							<Spinner size="lg" />
						</div>
					) : (
						<div className="flex flex-col gap-6 overflow-y-auto scrollbar-hide">
							{comments.length === 0 ? (
								<p className="text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
							) : (
								comments.map((comment) => (
									<div key={comment.id} className="flex flex-col gap-2 rounded-md p-3">
										<div className="flex items-center gap-2">
											<Avatar size="sm" src={comment.author.image ?? ""} name={comment.author.username ?? ""} showFallback />
											<div className="flex flex-1 items-center justify-between">
												<span className="text-sm font-medium text-gray-700 dark:text-gray-200">{comment.author.username}</span>
												<span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
										<p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
									</div>
								))
							)}
						</div>
					)}
					{session && !isPrivate && (
						<div className="mt-6">
							<Textarea
								placeholder="Add a comment..."
								value={newComment}
								onValueChange={setNewComment}
								minRows={2}
								className="w-full rounded-lg transition-all focus:border-primary"
							/>
						</div>
					)}
				</ModalBody>
				{session && !isPrivate && (
					<ModalFooter>
						<Button
							color="primary"
							onPress={handleSubmit}
							isLoading={isLoading}
							className="font-semibold text-black transition-transform hover:scale-[1.02]">
							Post Comment
						</Button>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	);
}
