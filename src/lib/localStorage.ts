export const saveAIURL = (url: string) => {
	localStorage.setItem("ai_url", url);
};

export const getAIURL = () => {
	return localStorage.getItem("ai_url");
};
