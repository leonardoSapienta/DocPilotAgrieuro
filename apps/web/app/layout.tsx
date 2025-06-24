import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import "cropperjs/dist/cropper.css";
import "../modules/ui/components/editor/tiptap-styles.css";

export const metadata: Metadata = {
	title: {
		absolute: "Template",
		default: "Template",
		template: "%s | Template",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
