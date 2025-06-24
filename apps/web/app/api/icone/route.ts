import { db } from "@repo/database";
import { NextResponse } from "next/server";

interface Icona {
	id: string;
	nome: string;
	descrizione: string;
	url_icona: string;
}

export async function GET() {
	try {
		// Ottieni tutte le icone dal database
		const icone = await db.$queryRaw<Icona[]>`
      SELECT i."id", i."nome", i."descrizione", i."url_icona"
      FROM "icone" i
      ORDER BY i."nome" ASC
    `;

		// Assicurati che gli URL siano completi
		const iconeWithFullUrls = icone.map((icona) => ({
			...icona,
			urlicona: icona.url_icona.startsWith("http")
				? icona.url_icona
				: `${process.env.NEXT_PUBLIC_AZURE_STORAGE_URL}/${icona.url_icona}`,
		}));

		return NextResponse.json(iconeWithFullUrls);
	} catch (error) {
		console.error("Errore durante il recupero delle icone:", error);
		return NextResponse.json(
			{ error: "Errore durante il recupero delle icone" },
			{ status: 500 },
		);
	}
}
