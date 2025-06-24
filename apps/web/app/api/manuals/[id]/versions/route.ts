import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return new NextResponse("Non autorizzato", { status: 401 });
		}

		const manualId = parseInt(params.id);
		console.log("Recupero versioni per manualId:", manualId);

		// Recupera il manuale corrente
		const currentManual = await db.manual.findUnique({
			where: { id: manualId },
			select: {
				name: true,
				userId: true,
			},
		});

		if (!currentManual) {
			console.log("Manuale non trovato per id:", manualId);
			return new NextResponse("Manuale non trovato", { status: 404 });
		}

		console.log("Manuale trovato:", currentManual);

		// Recupera tutte le versioni dello stesso manuale
		const versions = await db.manual.findMany({
			where: {
				name: currentManual.name,
			},
			select: {
				id: true,
				version: true,
				createdAt: true,
			},
			orderBy: {
				version: "desc",
			},
		});

		console.log("Query versioni:", {
			name: currentManual.name,
			versionsFound: versions.length,
			versions: versions
		});

		return NextResponse.json({ versions });
	} catch (error) {
		console.error("Errore dettagliato nel recupero delle versioni:", error);
		return new NextResponse(
			JSON.stringify({ 
				error: "Errore nel recupero delle versioni",
				details: error instanceof Error ? error.message : String(error)
			}), 
			{ 
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
} 