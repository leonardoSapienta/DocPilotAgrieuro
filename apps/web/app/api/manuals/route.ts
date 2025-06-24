import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

// Tipo esteso per i campi aggiunti al modello Manual
type ExtendedManualData = {
	userId: string;
	templateId: number | null;
	contentIt: any;
	contentEn: any;
	name: string;
	version: number;
	url_image?: string | null;
	url_manual?: string | null;
	page?: number | null;
	isActive: boolean;
};

// POST: Crea un nuovo manuale
export async function POST(req: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const {
			templateId,
			contentEn,
			name,
			version,
			url_image,
			url_manual,
			page,
		} = await req.json();

		// Verifica dei dati minimi richiesti
		if (!name) {
			return NextResponse.json(
				{ error: "Dati mancanti richiesti: name" },
				{ status: 400 },
			);
		}

		// Prepara i dati con i campi base
		const manualData: any = {
			userId: session.user.id,
			templateId: templateId || null,
			contentEn: contentEn || {},
			name,
			version: version || 1,
			isActive: true
		};

		// Aggiungi i campi opzionali se definiti
		if (url_image !== undefined) manualData.url_image = url_image;
		if (url_manual !== undefined) manualData.url_manual = url_manual;
		if (page !== undefined) manualData.page = page;

		// Crea nuovo manuale
		const manual = await db.manual.create({
			data: manualData,
		});

		return NextResponse.json({ success: true, manual });
	} catch (error) {
		console.error("Errore durante la creazione del manuale:", error);
		return NextResponse.json(
			{ error: "Errore durante la creazione del manuale" },
			{ status: 500 },
		);
	}
}

// PUT: Aggiorna un manuale esistente
export async function PUT(req: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const {
			id,
			templateId,
			contentEn,
			name,
			version,
			url_image,
			url_manual,
			page,
		} = await req.json();

		// Verifica dell'ID del manuale
		if (!id) {
			return NextResponse.json(
				{ error: "ID manuale mancante" },
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

		// Prepara i dati di aggiornamento con i campi base
		const updateData: any = {
			templateId: templateId || existingManual.templateId,
			contentEn: contentEn || existingManual.contentEn,
			name: name || existingManual.name,
			version: version || existingManual.version,
		};

		// Aggiungi i campi opzionali se definiti
		if (url_image !== undefined) {
			updateData.url_image = url_image;
		}
		if (url_manual !== undefined) {
			updateData.url_manual = url_manual;
		}
		if (page !== undefined) {
			updateData.page = page;
		}

		// Aggiorna il manuale
		const manual = await db.manual.update({
			where: { id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({ success: true, manual });
	} catch (error) {
		console.error("Errore durante l'aggiornamento del manuale:", error);
		return NextResponse.json(
			{ error: "Errore durante l'aggiornamento del manuale" },
			{ status: 500 },
		);
	}
}

// PATCH: Aggiorna un manuale esistente
export async function PATCH(req: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const { id, contentEn, images, pagesInput } = await req.json();

		// Verifica dell'ID del manuale
		if (!id) {
			return NextResponse.json(
				{ error: "ID manuale mancante" },
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

		// Aggiorna il manuale
		const manual = await db.manual.update({
			where: { id },
			data: {
				contentEn: contentEn || existingManual.contentEn,
				images: images || existingManual.images,
				pagesInput: pagesInput || existingManual.pagesInput,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({ success: true, manual });
	} catch (error) {
		console.error("Errore durante l'aggiornamento del manuale:", error);
		return NextResponse.json(
			{ error: "Errore durante l'aggiornamento del manuale" },
			{ status: 500 },
		);
	}
}
