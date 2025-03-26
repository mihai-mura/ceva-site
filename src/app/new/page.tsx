"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { compressAndUploadImage } from "~/lib/storage";
import { api } from "~/trpc/client";
import DropFile from "./_extra/Components/DropFile";

const NewPostPage = () => {
	const { data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/");
		},
	});
	const router = useRouter();

	const postPhotos = async (files: File[]) => {
		if (session === null) return;
		await Promise.all(
			files.map(async (file) => {
				const url = await compressAndUploadImage(file, session.user.id);

				if (!url) return;

				await api.post.create.mutate({
					url: url,
				});
			}),
		).then(() => router.push("/my-posts"));
	};

	return (
		<div className="page flex flex-col items-center justify-center pt-12">
			<h1 className="text-2xl">Create new post</h1>
			<DropFile postPhotos={postPhotos} className="h-[80vh] w-[90vw]" />
		</div>
	);
};

export default NewPostPage;
