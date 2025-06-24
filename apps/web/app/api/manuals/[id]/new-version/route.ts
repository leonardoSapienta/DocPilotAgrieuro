import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return new NextResponse("Non autorizzato", { status: 401 });
		}

		const manualId = parseInt(params.id);
		const { version } = await request.json();

		if (!version) {
			return new NextResponse("Numero versione richiesto", { status: 400 });
		}

		// Recupera il manuale esistente
		const existingManual = await db.manual.findUnique({
			where: { id: manualId },
		});

		if (!existingManual) {
			return new NextResponse("Manuale non trovato", { status: 404 });
		}

		// Verifica che non esista già una versione con lo stesso numero
		const existingVersion = await db.manual.findFirst({
			where: {
				name: existingManual.name,
				version: Number(version),
				userId: session.user.id,
			},
		});

		if (existingVersion) {
			return new NextResponse("Esiste già una versione con questo numero", { status: 400 });
		}

		// Crea una nuova versione del manuale
		const newManual = await db.manual.create({
			data: {
				name: existingManual.name,
				version: Number(version),
				contentIt: existingManual.contentIt,
				contentFr: existingManual.contentFr,
				contentDe: existingManual.contentDe,
				contentEn: existingManual.contentEn,
				contentEs: existingManual.contentEs,
				isActive: true,
				userId: session.user.id,
				templateId: existingManual.templateId,
				pagesInput: existingManual.pagesInput,
				pagesOutput: existingManual.pagesOutput,
				images: existingManual.images,
				pdf: existingManual.pdf,
				docx: existingManual.docx,
				pdf_it: existingManual.pdf_it,
				pdf_fr: existingManual.pdf_fr,
				pdf_de: existingManual.pdf_de,
				pdf_en: existingManual.pdf_en,
				pdf_es: existingManual.pdf_es,
				docx_it: existingManual.docx_it,
				docx_fr: existingManual.docx_fr,
				docx_de: existingManual.docx_de,
				docx_en: existingManual.docx_en,
				docx_es: existingManual.docx_es,
			},
		});

		// Imposta il manuale vecchio come non attivo
		await db.manual.updateMany({
			where: { 
				id: manualId,
				userId: session.user.id 
			},
			data: { 
				isActive: false 
			},
		});

		return NextResponse.json({ success: true, manual: newManual });
	} catch (error) {
		console.error("Errore nella creazione della nuova versione:", error);
		return new NextResponse("Errore interno del server", { status: 500 });
	}
} 