import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const id = Number.parseInt(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "ID manuale non valido" },
				{ status: 400 },
			);
		}

		// Verifica che il manuale esista e appartenga all'utente
		const existingManual = await db.manual.findFirst({
			where: {
				id,
				userId: session.user.id,
			},
		});

		if (!existingManual) {
			return NextResponse.json(
				{ error: "Manuale non trovato o non autorizzato" },
				{ status: 404 },
			);
		}

		const { format, url } = await req.json();

		if (!format || !url) {
			return NextResponse.json(
				{ error: "Formato e URL sono richiesti" },
				{ status: 400 },
			);
		}

		if (format !== "pdf" && format !== "docx") {
			return NextResponse.json(
				{ error: "Formato non valido. Deve essere 'pdf' o 'docx'" },
				{ status: 400 },
			);
		}

		// Aggiorna solo il campo del file
		const manual = await db.manual.update({
			where: { id },
			data: {
				[format]: url,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({ success: true, manual });
	} catch (error) {
		console.error(
			"Errore durante l'aggiornamento del link del file:",
			error,
		);
		return NextResponse.json(
			{ error: "Errore durante l'aggiornamento del link del file" },
			{ status: 500 },
		);
	}
}
