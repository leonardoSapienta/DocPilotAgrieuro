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

		const { format, language, url } = await req.json();

		if (!format || !language || !url) {
			return NextResponse.json(
				{ error: "Formato, lingua e URL sono richiesti" },
				{ status: 400 },
			);
		}

		if (format !== "pdf" && format !== "docx") {
			return NextResponse.json(
				{ error: "Formato non valido. Deve essere 'pdf' o 'docx'" },
				{ status: 400 },
			);
		}

		// Mappa le lingue ai codici del database
		const languageMap: Record<string, string> = {
			Italian: "it",
			French: "fr",
			German: "de",
			English: "en",
			Spanish: "es",
		};

		const dbLanguage = languageMap[language];
		if (!dbLanguage) {
			return NextResponse.json(
				{ error: "Lingua non valida" },
				{ status: 400 },
			);
		}

		// Costruisci il nome del campo (es. pdf_it, docx_fr, ecc.)
		const fieldName = `${format}_${dbLanguage}`;

		console.log("Aggiornamento campo nel database", {
			manualId: id,
			fieldName,
			url,
			format,
			language,
		});

		// Aggiorna solo il campo del file specifico
		const manual = await db.manual.update({
			where: { id },
			data: {
				[fieldName]: url,
				updatedAt: new Date(),
			},
		});

		console.log("Campo aggiornato con successo", {
			manualId: id,
			fieldName,
			url,
			updatedManual: manual,
		});

		return NextResponse.json({ success: true, manual });
	} catch (error) {
		console.error(
			"Errore durante l'aggiornamento del link del file singolo:",
			error,
		);
		return NextResponse.json(
			{
				error: "Errore durante l'aggiornamento del link del file singolo",
			},
			{ status: 500 },
		);
	}
}
