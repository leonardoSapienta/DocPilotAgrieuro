"use client";

import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { OrganizationsGrid } from "@saas/organizations/components/OrganizationsGrid";
import { Card } from "@ui/components/card";
import { useTranslations } from "next-intl";
import Link from "next/link";
import GraficoManuali from "./GraficoManuali";

export default function UserStart() {
	const t = useTranslations();
	const { user } = useSession();

	return (
		<div>
			{config.organizations.enable && <OrganizationsGrid />}

			{/* Grafico delle pagine dei manuali */}
			<div className="mt-6 mb-6">
				<GraficoManuali />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
					<Link href="/app/manual">
						<h3 className="text-lg font-semibold">Manual</h3>
						<p className="text-sm text-gray-600">
							Go to the Manual section
						</p>
						<p className="text-xs text-gray-500 mt-2">
							Develop a manual according to the ISO 20607 standard
						</p>
					</Link>
				</Card>
				<Card className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
					<Link href="/app/template">
						<h3 className="text-lg font-semibold">Template</h3>
						<p className="text-sm text-gray-600">
							Go to the Template section
						</p>
						<p className="text-xs text-gray-500 mt-2">
							Structure the design of your theme to use for
							various manuals
						</p>
					</Link>
				</Card>
			</div>
		</div>
	);
}
