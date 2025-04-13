import { getAIURL } from "./localStorage";

type ImageCaptioningResponse = {
	caption: string;
};

export const generateImageCaption = async (imageUrl: string) => {
	const URL = getAIURL();

	if (!URL) return { data: null, error: "No image captioning url" };

	try {
		const response = await fetch(`${URL}/generate-caption`, {
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

export const testImageCaptioningAPI = async (URL: string): Promise<boolean> => {
	try {
		const response = await fetch(`${URL}/test`);
		if (response.status !== 200) return false;
		return true;
	} catch (error) {
		return false;
	}
};
