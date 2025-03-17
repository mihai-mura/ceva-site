import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import compress from "./compress";
import { storage } from "./firebase";

export const uploadProfileImage = async (image: File, userId: string): Promise<string> => {
	const fileExtension = image.name.split(".").pop();
	const storageRef = ref(storage, `profile/${userId}.${fileExtension}`);
	await uploadBytes(storageRef, image);
	const url = await getDownloadURL(storageRef);
	return url;
};

export const compressAndUploadImage = async (image: File, userId: string): Promise<string | null> => {
	const fileExtension = image.name.split(".").pop();
	const storageRef = ref(storage, `${userId}/${v4()}.${fileExtension}`);

	const compressedFile = await compress(image);
	if (!compressedFile) return null;

	await uploadBytes(storageRef, compressedFile);

	const url = await getDownloadURL(storageRef);
	return url;
};
