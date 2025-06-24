import baseConfig from "@repo/tailwind-config";
import { createPreset } from "fumadocs-ui/tailwind-plugin";
import type { Config } from "tailwindcss";

export default {
	presets: [createPreset({}), baseConfig],
	content: [
		"./app/**/*.tsx",
		"./modules/**/*.tsx",
		"./content/**/*.mdx",
		"./node_modules/fumadocs-ui/dist/**/*.js",
	],
	safelist: [
		"ml-2", "ml-4", "ml-6", "ml-8", "ml-10",
		// Alert block classes
		"alert-block", "alert-title", "alert-description", "alert-icon",
		"bg-red-50", "border-red-100", "text-[#9B2423]",
		"bg-orange-50", "border-orange-100", "text-[#d05d29]",
		"bg-yellow-50", "border-yellow-100", "text-[#f9a900]",
		"bg-blue-50", "border-blue-100", "text-blue-500", "text-blue-800", "text-blue-700",
		"text-red-700", "text-orange-700", "text-yellow-700"
	],
} satisfies Config;
