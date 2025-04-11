import { env } from "~/env";

type ImageCaptioningResponse = {
	caption: string;
};

export const generateImageCaption = async (imageUrl: string) => {
	if (!env.NEXT_PUBLIC_IMAGE_CAPTIONING_URL) return { data: null, error: "No image captioning url" };

	try {
		const response = await fetch(env.NEXT_PUBLIC_IMAGE_CAPTIONING_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ imageUrl }),
		});
		const data: ImageCaptioningResponse = await response.json();
		return { data: data.caption, error: null };
	} catch (error) {
		return { data: null, error };
	}
};
