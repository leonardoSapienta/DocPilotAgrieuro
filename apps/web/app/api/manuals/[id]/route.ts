import { db } from "@repo/database";
import { logger } from "@repo/logs";
import { deleteManualFolder } from "@repo/storage/provider/azure";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

interface Chapter {
	chapter_info?: string;
	restructured_html?: string;
	content?: string;
	chapter_number?: number;
	example_html?: string;
	missing_information?: string;
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const resolvedParams = await params;
		const body = await req.json();
		const manualId = Number(resolvedParams.id);

		// Verifica che il manuale esista
		const existingManual = await db.manual.findUnique({
			where: {
				id: manualId,
			},
		});

		if (!existingManual) {
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		// Verifica che l'utente sia il proprietario del manuale
		if (existingManual.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 403 },
			);
		}

		// Gestisce sia la struttura diretta che quella annidata con 'manual'
		const updateData = body.manual || body;

		// Prepara i dati di aggiornamento
		const dataToUpdate: any = {};

		// Aggiungi solo i campi che sono presenti nel body
		if (updateData.version !== undefined) dataToUpdate.version = updateData.version;
		if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
		if (updateData.contentIt !== undefined) dataToUpdate.contentIt = updateData.contentIt;
		if (updateData.contentFr !== undefined) dataToUpdate.contentFr = updateData.contentFr;
		if (updateData.contentDe !== undefined) dataToUpdate.contentDe = updateData.contentDe;
		if (updateData.contentEn !== undefined) dataToUpdate.contentEn = updateData.contentEn;
		if (updateData.contentEs !== undefined) dataToUpdate.contentEs = updateData.contentEs;
		if (updateData.images !== undefined) dataToUpdate.images = updateData.images;
		if (updateData.pagesInput !== undefined) dataToUpdate.pagesInput = updateData.pagesInput;
		if (updateData.pagesOutput !== undefined) {
			const prev = existingManual.pagesOutput ?? 0;
			const add = updateData.pagesOutput ?? 0;
			dataToUpdate.pagesOutput = prev + add;
		}
		if (updateData.pdf !== undefined) dataToUpdate.pdf = updateData.pdf;
		if (updateData.docx !== undefined) dataToUpdate.docx = updateData.docx;
		if (updateData.pdf_it !== undefined) dataToUpdate.pdf_it = updateData.pdf_it;
		if (updateData.pdf_fr !== undefined) dataToUpdate.pdf_fr = updateData.pdf_fr;
		if (updateData.pdf_de !== undefined) dataToUpdate.pdf_de = updateData.pdf_de;
		if (updateData.pdf_en !== undefined) dataToUpdate.pdf_en = updateData.pdf_en;
		if (updateData.pdf_es !== undefined) dataToUpdate.pdf_es = updateData.pdf_es;
		if (updateData.docx_it !== undefined) dataToUpdate.docx_it = updateData.docx_it;
		if (updateData.docx_fr !== undefined) dataToUpdate.docx_fr = updateData.docx_fr;
		if (updateData.docx_de !== undefined) dataToUpdate.docx_de = updateData.docx_de;
		if (updateData.docx_en !== undefined) dataToUpdate.docx_en = updateData.docx_en;
		if (updateData.docx_es !== undefined) dataToUpdate.docx_es = updateData.docx_es;

		// Aggiorna il manuale
		const updatedManual = await db.manual.update({
			where: {
				id: manualId,
			},
			data: dataToUpdate,
		});

		return NextResponse.json({ manual: updatedManual });
	} catch (error) {
		console.error("Errore nell'aggiornamento del manuale:", error);
		return NextResponse.json(
			{ error: "Errore nell'aggiornamento del manuale" },
			{ status: 500 },
		);
	}
}

// GET: Recupera un manuale specifico
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const resolvedParams = await params;

		// Verifica che params.id sia disponibile
		if (!resolvedParams?.id) {
			return NextResponse.json(
				{ error: "ID manuale mancante" },
				{ status: 400 },
			);
		}

		const manualId = Number(resolvedParams.id);
		if (isNaN(manualId)) {
			return NextResponse.json(
				{ error: "ID manuale non valido" },
				{ status: 400 },
			);
		}

		const manual = await db.manual.findUnique({
			where: {
				id: manualId,
			},
		});

		if (!manual) {
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ manual });
	} catch (error) {
		console.error("Errore nel recupero del manuale:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero del manuale" },
			{ status: 500 },
		);
	}
}

// DELETE: Elimina un manuale specifico
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	let resolvedParams: { id: string } | undefined;
	
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		resolvedParams = await params;

		// Assicuriamoci che params.id sia disponibile
		if (!resolvedParams?.id) {
			logger.error("ID manuale non fornito nei parametri");
			return NextResponse.json(
				{ error: "ID manuale non fornito" },
				{ status: 400 },
			);
		}

		const id = Number.parseInt(resolvedParams.id);
		if (Number.isNaN(id)) {
			logger.error("ID manuale non valido", { id: resolvedParams.id });
			return NextResponse.json(
				{ error: "ID manuale non valido" },
				{ status: 400 },
			);
		}

		// Verifica che il manuale esista
		const existingManual = await db.manual.findFirst({
			where: {
				id,
			},
		});

		if (!existingManual) {
			logger.error("Manuale non trovato", {
				id,
			});
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		logger.info("Inizio processo di eliminazione del manuale", {
			manualName: existingManual.name,
			manualId: id,
		});

		// Elimina la cartella delle immagini su Azure
		try {
			await deleteManualFolder(existingManual.name);
			logger.info("Cartella delle immagini eliminata con successo", {
				manualName: existingManual.name,
				manualId: id,
			});
		} catch (error) {
			logger.error(
				"Errore durante l'eliminazione della cartella delle immagini:",
				{
					error:
						error instanceof Error
							? error.message
							: "Errore sconosciuto",
					manualName: existingManual.name,
					manualId: id,
				},
			);
			// Non blocchiamo l'eliminazione del manuale se fallisce l'eliminazione delle immagini
		}

		// Elimina il manuale dal database
		await db.manual.delete({
			where: { id },
		});

		logger.info("Manuale eliminato con successo", {
			manualName: existingManual.name,
			manualId: id,
		});

		return NextResponse.json(
			{ success: true, message: "Manuale eliminato con successo" },
			{ status: 200 },
		);
	} catch (error) {
		logger.error("Errore durante l'eliminazione del manuale:", {
			error:
				error instanceof Error ? error.message : "Errore sconosciuto",
			manualId: resolvedParams?.id,
		});
		return NextResponse.json(
			{ error: "Errore durante l'eliminazione del manuale" },
			{ status: 500 },
		);
	}
}

// PUT: Aggiorna un manuale esistente
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const resolvedParams = await params;
		const body = await request.json();
		const manualId = Number(resolvedParams.id);

		// Verifica che il manuale esista
		const existingManual = await db.manual.findUnique({
			where: {
				id: manualId,
			},
		});

		if (!existingManual) {
			return NextResponse.json(
				{ error: "Manuale non trovato" },
				{ status: 404 },
			);
		}

		// Verifica che l'utente sia il proprietario del manuale
		if (existingManual.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 403 },
			);
		}

		// Aggiorna il manuale
		const updatedManual = await db.manual.update({
			where: {
				id: manualId,
			},
			data: {
				version: body.version,
				name: body.name,
				contentIt: body.contentIt,
				contentFr: body.contentFr,
				contentDe: body.contentDe,
				contentEn: body.contentEn,
				contentEs: body.contentEs,
				images: body.images,
				pagesInput: body.pagesInput,
				pagesOutput: body.pagesOutput,
				pdf: body.pdf,
				docx: body.docx,
				pdf_it: body.pdf_it,
				pdf_fr: body.pdf_fr,
				pdf_de: body.pdf_de,
				pdf_en: body.pdf_en,
				pdf_es: body.pdf_es,
				docx_it: body.docx_it,
				docx_fr: body.docx_fr,
				docx_de: body.docx_de,
				docx_en: body.docx_en,
				docx_es: body.docx_es,
			},
		});

		return NextResponse.json({ manual: updatedManual });
	} catch (error) {
		console.error("Errore nell'aggiornamento del manuale:", error);
		return NextResponse.json(
			{ error: "Errore nell'aggiornamento del manuale" },
			{ status: 500 },
		);
	}
}
