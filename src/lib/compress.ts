import imageCompression from "browser-image-compression";

async function compress(image: File) {
	const options = {
		maxWidthOrHeight: 1920,

		useWebWorker: true,
	};
	try {
		const compressedFile = await imageCompression(image, options);

		return compressedFile;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export default compress;
