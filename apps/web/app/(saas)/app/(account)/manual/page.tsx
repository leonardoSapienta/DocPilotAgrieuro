import ManualForm from "@saas/manual/components/ManualForm";
import { StepIndicator } from "@saas/manual/components/StepIndicator";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { Card } from "@ui/components/card";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
	title: "Manuals AI",
	description: "Create and manage your manuals",
};

export default function ManualPage() {
	const t = useTranslations();

	return (
		<>
			<PageHeader
				title={t("manual.title")}
				subtitle={t("manual.description")}
			/>

			<StepIndicator />

			<Card>
				{/* Add key to force remount and prevent stale DOM references */}
				<ManualForm />
			</Card>
		</>
	);
}
