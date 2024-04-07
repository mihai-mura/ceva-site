"use client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { v4 } from "uuid";
import compress from "~/lib/compress";
import { storage } from "~/lib/firebase";
import { RequestBody } from "../api/post/create/route";
import DropFile from "./Extra/Components/DropFile";

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
				const storageRef = ref(storage, `${session.user.id}/${v4()}`);

				const compressedFile = await compress(file);
				if (!compressedFile) return;

				await uploadBytes(storageRef, compressedFile);

				const url = await getDownloadURL(storageRef);

				const body: RequestBody = {
					url,
				};
				const res = await fetch("/api/post/create", {
					method: "POST",
					body: JSON.stringify(body),
				});
				// return res;
				//TODO: handle errors
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
