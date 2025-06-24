import { getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function IconsLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { organizationSlug: string };
}) {
	const session = await getSession();
	if (!session) {
		redirect("/auth/login");
	}

	const t = await getTranslations();

	return (
		<>
			<PageHeader
				title="Icone"
				subtitle="Gestisci le icone del manuale"
			/>
			{children}
		</>
	);
}
