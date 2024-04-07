"use server";
import { revalidatePath } from "next/cache";

const revalidate = (path?: string) => {
	try {
		if (path) {
			revalidatePath(path, "page");
		} else {
			revalidatePath("/", "layout");
			revalidatePath("/[lang]", "layout");
		}
	} catch (error) {
		console.error("clearCachesByServerAction=> ", error);
	}
};
export default revalidate;
