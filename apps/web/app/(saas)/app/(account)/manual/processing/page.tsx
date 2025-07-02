import { StepIndicator } from "@saas/manual/components/StepIndicator";
import { ProcessingClient } from "@saas/manual/components/processing";
import { PageHeader } from "@saas/shared/components/PageHeader";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
	title: "Manual Processing",
	description: "Processing your manual with AI",
};

export default async function ProcessingPage() {
	const t = await getTranslations();
	// Server-side logic can go here if needed
	// For instance, fetching initial data from API or database

	return (
		<div className="flex flex-col w-full min-h-screen mx-[5px]">
			<PageHeader
				title={t("manual.processing.title")}
				subtitle={t("manual.processing.description")}
			/>

			<StepIndicator />

			<div className="flex-1 min-h-0 flex flex-col px-[5px] overflow-x-hidden min-w-0 box-border">
				<ProcessingClient />
			</div>
		</div>
	);
}
