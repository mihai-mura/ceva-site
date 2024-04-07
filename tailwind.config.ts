import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	plugins: [
		nextui({
			themes: {
				light: {
					colors: {
						primary: "#F5A524",
						focus: "#F5A524",
						danger: "#c7283a",
						secondary: "#fff",
					},
				},
				dark: {
					colors: {
						primary: "#F5A524",
						focus: "#F5A524",
						danger: "#c7283a",
						secondary: "#fff",
					},
				},
			},
		}),
	],
};
export default config;
