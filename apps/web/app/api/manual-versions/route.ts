import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

// POST: Crea una nuova versione del manuale
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
		console.log("Dati ricevuti per il salvataggio della versione:", {
			manualId: body.manualId,
			version: body.version,
			userId: body.userId,
			name: body.name,
			contentIt: body.contentIt ? "presente" : "mancante",
		});

		// Verifica i campi obbligatori
		const requiredFields = {
			manualId: body.manualId,
			version: body.version,
			userId: body.userId,
			name: body.name,
			contentIt: body.contentIt,
		};

		const missingFields = Object.entries(requiredFields)
			.filter(([_, value]) => !value)
			.map(([key]) => key);

		if (missingFields.length > 0) {
			return NextResponse.json(
				{
					error: "Dati mancanti",
					details: {
						missingFields,
					},
				},
				{ status: 400 },
			);
		}

		// Verifica che il manuale esista
		const manual = await db.manual.findUnique({
			where: {
				id: Number(body.manualId),
			},
			include: {
				manualVersions: true,
			},
		});

		if (!manual) {
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		console.log("Manuale trovato:", {
			id: manual.id,
			name: manual.name,
			version: manual.version,
			versionsCount: manual.manualVersions.length,
		});

		// Verifica che non esista già una versione con lo stesso numero per questo manuale
		const existingVersion = await db.manualVersion.findFirst({
			where: {
				manualId: Number(body.manualId),
				version: Number(body.version),
				userId: session.user.id,
			},
		});

		if (existingVersion) {
			return NextResponse.json(
				{
					error: "Esiste già una versione con questo numero per questo manuale",
				},
				{ status: 400 },
			);
		}

		// Crea la nuova versione
		const version = await db.manualVersion.create({
			data: {
				manualId: Number(body.manualId),
				version: Number(body.version),
				contentIt: body.contentIt,
				contentFr: body.contentFr || null,
				contentDe: body.contentDe || null,
				contentEn: body.contentEn || null,
				contentEs: body.contentEs || null,
				images: body.images || null,
				pagesInput: body.pagesInput || null,
				pagesOutput: body.pagesOutput || null,
				name: body.name,
				templateId: body.templateId || null,
				userId: body.userId,
				pdf: body.pdf || null,
				docx: body.docx || null,
				pdf_it: body.pdf_it || null,
				pdf_fr: body.pdf_fr || null,
				pdf_de: body.pdf_de || null,
				pdf_en: body.pdf_en || null,
				pdf_es: body.pdf_es || null,
				docx_it: body.docx_it || null,
				docx_fr: body.docx_fr || null,
				docx_de: body.docx_de || null,
				docx_en: body.docx_en || null,
				docx_es: body.docx_es || null,
			},
			include: {
				manual: true,
			},
		});

		console.log("Versione salvata con successo:", {
			id: version.id,
			manualId: version.manualId,
			version: version.version,
			name: version.name,
			userId: version.userId,
			manualName: version.manual.name,
		});

		return NextResponse.json({ version });
	} catch (error) {
		console.error("Errore nel salvataggio della versione:", error);
		return NextResponse.json(
			{ error: "Errore nel salvataggio della versione" },
			{ status: 500 },
		);
	}
}

// GET: Recupera tutte le versioni di un manuale
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

		if (!manualId) {
			return NextResponse.json(
				{ error: "ID manuale mancante" },
				{ status: 400 },
			);
		}

		const versions = await db.manualVersion.findMany({
			where: {
				manualId: Number(manualId),
			},
			include: {
				manual: true,
			},
			orderBy: {
				version: "desc",
			},
		});

		console.log("Versioni trovate:", {
			manualId,
			count: versions.length,
			versions: versions.map((v) => ({
				id: v.id,
				version: v.version,
				name: v.name,
			})),
		});

		return NextResponse.json({ versions });
	} catch (error) {
		console.error("Errore nel recupero delle versioni:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero delle versioni" },
			{ status: 500 },
		);
	}
}
