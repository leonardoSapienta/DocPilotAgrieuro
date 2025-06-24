import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await getSession();

		// Verifica se l'utente è autenticato
		if (!session?.user?.id) {
			console.log("No user session found");
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const id = Number.parseInt(params.id, 10);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "ID template non valido" },
				{ status: 400 },
			);
		}

		console.log(
			`Fetching template with ID: ${id} for user: ${session.user.id}`,
		);

		// Recupera il template
		const template = await db.template.findFirst({
			where: {
				id: id,
			},
		});

		if (!template) {
			console.log(`Template with ID ${id} not found`);
			return NextResponse.json(
				{ error: "Template non trovato" },
				{ status: 404 },
			);
		}

		console.log("Template found:", template.name);
		return NextResponse.json(template);
	} catch (error) {
		console.error("Errore durante il recupero del template:", error);
		return NextResponse.json(
			{
				error: "Errore interno del server",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
