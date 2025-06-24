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
				{ error: "ID manuale non valido" },
				{ status: 400 },
			);
		}

		console.log(`Fetching manual with ID: ${id} to get its template`);

		// Recupera il manuale con il template associato
		const manual = await db.manual.findFirst({
			where: {
				id: id,
			},
			include: {
				template: true,
			},
		});

		if (!manual) {
			console.log(`Manual with ID ${id} not found`);
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		if (!manual.template) {
			console.log(`Template for manual ${id} not found`);
			return NextResponse.json(
				{ error: "Template associato al manuale non trovato" },
				{ status: 404 },
			);
		}

		console.log("Template found:", manual.template.name);
		return NextResponse.json(manual.template);
	} catch (error) {
		console.error(
			"Errore durante il recupero del template del manuale:",
			error,
		);
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
