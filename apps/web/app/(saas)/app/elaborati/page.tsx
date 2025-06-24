import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { ManualCard } from "@saas/manual/components/ManualCard";
import type { Metadata } from "next";

// Forza la pagina ad essere completamente dinamica
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
	title: "Elaborati",
	description: "Gestione degli elaborati",
};

// Estendi il tipo Manual per includere isActive e userName
type Manual = {
	id: number;
	name: string;
	contentEn: any;
	contentIt: any;
	contentFr: any;
	contentDe: any;
	contentEs: any;
	createdAt: Date;
	version: number;
	isActive: boolean;
	pdf: string | null;
	docx: string | null;
	pdf_it: string | null;
	pdf_en: string | null;
	pdf_fr: string | null;
	pdf_de: string | null;
	pdf_es: string | null;
	docx_it: string | null;
	docx_en: string | null;
	docx_fr: string | null;
	docx_de: string | null;
	docx_es: string | null;
	user: {
		name: string;
	};
};

export default async function ElaboratiPage() {
	const session = await getSession();

	if (!session?.user?.id) {
		return null;
	}

	// Recupera tutti i manuali attivi con le informazioni dell'utente
	const manuals = await db.manual.findMany({
		where: {
			isActive: true
		},
		select: {
			id: true,
			name: true,
			contentEn: true,
			contentIt: true,
			contentFr: true,
			contentDe: true,
			contentEs: true,
			createdAt: true,
			version: true,
			isActive: true,
			pdf: true,
			docx: true,
			pdf_it: true,
			pdf_en: true,
			pdf_fr: true,
			pdf_de: true,
			pdf_es: true,
			docx_it: true,
			docx_en: true,
			docx_fr: true,
			docx_de: true,
			docx_es: true,
			user: {
				select: {
					name: true
				}
			}
		},
		orderBy: [
			{ name: "asc" },
			{ version: "desc" }
		],
	}) as Manual[];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{manuals.map((manual) => (
				<ManualCard
					key={manual.id}
					id={manual.id}
					name={manual.name}
					contentEn={manual.contentEn}
					contentIt={manual.contentIt}
					contentFr={manual.contentFr}
					contentDe={manual.contentDe}
					contentEs={manual.contentEs}
					createdAt={manual.createdAt}
					version={manual.version}
					isActive={manual.isActive}
					pdf={manual.pdf}
					docx={manual.docx}
					pdf_it={manual.pdf_it}
					pdf_en={manual.pdf_en}
					pdf_fr={manual.pdf_fr}
					pdf_de={manual.pdf_de}
					pdf_es={manual.pdf_es}
					docx_it={manual.docx_it}
					docx_en={manual.docx_en}
					docx_fr={manual.docx_fr}
					docx_de={manual.docx_de}
					docx_es={manual.docx_es}
					creatorName={manual.user.name}
				/>
			))}
		</div>
	);
}
