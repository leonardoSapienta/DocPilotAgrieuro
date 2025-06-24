import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { name, version } = body;

		if (!name || !version) {
			return NextResponse.json(
				{ error: "Nome e versione sono obbligatori" },
				{ status: 400 },
			);
		}

		// Cerca un manuale con lo stesso nome
		const existingManual = await db.manual.findFirst({
			where: {
				name: name,
				userId: session.user.id,
			},
		});

		// Cerca anche nelle versioni precedenti
		const existingVersion = await db.manualVersion.findFirst({
			where: {
				name: name,
			},
		});

		return NextResponse.json({
			exists: !!(existingManual || existingVersion),
			existingManual: existingManual || null,
		});
	} catch (error) {
		console.error("Errore nel controllo dei duplicati:", error);
		return NextResponse.json(
			{ error: "Errore nel controllo dei duplicati" },
			{ status: 500 },
		);
	}
}
