import { AppWrapper } from "@saas/shared/components/AppWrapper";
import { PageHeader } from "@saas/shared/components/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Elaborati",
	description: "Gestione degli elaborati",
};

export default function ElaboratiLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppWrapper>
			<PageHeader title="Elaborati" subtitle="Gestione degli elaborati" />
			<div className="container mx-auto py-6">{children}</div>
		</AppWrapper>
	);
}
