import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const data = await req.json();

		// Trova l'ultima versione per questo template
		const lastRevision = await db.templateRevision.findFirst({
			where: {
				templateId: data.template_id,
			},
			orderBy: {
				version: "desc",
			},
		});

		// Crea una nuova revisione
		const revision = await db.templateRevision.create({
			data: {
				templateId: data.template_id,
				userId: session.user.id,
				name: data.name,
				description: data.description,
				logo_path: data.logo_path,
				logo_footer: data.logo_footer,
				color: data.color,
				font_title: data.font_title,
				font_paragraph: data.font_paragraph,
				version: (lastRevision?.version || 0) + 1,
			},
		});

		return NextResponse.json(revision);
	} catch (error) {
		console.error("Errore durante il salvataggio della revisione:", error);
		return NextResponse.json(
			{ error: "Errore durante il salvataggio della revisione" },
			{ status: 500 },
		);
	}
}
