import { StepIndicator } from "@saas/manual/components/StepIndicator";
import { TranslationClient } from "@saas/manual/components/translation";
import { PageHeader } from "@saas/shared/components/PageHeader";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
	title: "Manual Translations",
	description: "Translating your manual with AI",
};

export default async function TranslationsPage() {
	// Server-side logic can go here if needed
	// For instance, fetching initial data from API or database

	const t = await getTranslations();

	return (
		<>
			<PageHeader
				title={t("manual.translations.title")}
				subtitle={t("manual.translations.description")}
			/>

			<StepIndicator />

			<TranslationClient />
		</>
	);
}
