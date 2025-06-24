import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const manualId = searchParams.get("manualId");
		const version = searchParams.get("version");

		if (!manualId || !version) {
			return NextResponse.json(
				{ error: "ID manuale e versione sono richiesti" },
				{ status: 400 },
			);
		}

		// Verifica che il manuale esista
		const manual = await db.manual.findFirst({
			where: {
				id: Number(manualId),
			},
		});

		if (!manual) {
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		// Verifica se esiste già una versione con questo numero
		const existingVersion = await db.manualVersion.findFirst({
			where: {
				manualId: Number(manualId),
				version: Number(version),
			},
		});

		return NextResponse.json({
			exists: !!existingVersion,
			version: existingVersion,
		});
	} catch (error) {
		console.error("Errore nel controllo della versione:", error);
		return NextResponse.json(
			{ error: "Errore nel controllo della versione" },
			{ status: 500 },
		);
	}
}
