import {} from "node:fs/promises";
import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSession();
		console.log("Session:", session);

		if (!session?.user?.id) {
			console.log("No user session found");
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		console.log("Fetching templates for user:", session.user.id);
		const templates = await db.template.findMany({
			include: {
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		console.log("Templates found:", templates.length);
		return NextResponse.json(templates);
	} catch (error) {
		console.error(
			"Errore dettagliato durante il recupero dei template:",
			error,
		);
		return NextResponse.json(
			{
				error: "Errore interno del server",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const data = await req.json();
		console.log("Dati ricevuti dal client:", JSON.stringify(data, null, 2));
		console.log("Header ricevuto:", JSON.stringify(data.header, null, 2));
		console.log("Logo path ricevuto:", data.header?.logoPath);

		// Verifica che il logoPath sia presente nei dati
		if (!data.header?.logoPath) {
			console.log("ATTENZIONE: logoPath non presente nei dati ricevuti");
		}

		const template = await db.template.create({
			data: {
				name: data.name,
				description: data.description || "",
				isActive: data.isActive || true,
				userId: session.user.id,
				logo_path: data.logo_path || "",
				logo_footer: data.logo_footer || "",
				color: data.color || "#000000",
				font_title: data.font_title || "Arial",
				font_paragraph: data.font_paragraph || "Arial",
			},
		});

		console.log("Template creato:", JSON.stringify(template, null, 2));

		return NextResponse.json(template);
	} catch (error) {
		console.error("Errore durante la creazione del template:", error);
		return NextResponse.json(
			{ error: "Errore durante la creazione del template" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID template mancante" },
				{ status: 400 },
			);
		}

		// Verifica che il template appartenga all'utente
		const template = await db.template.findFirst({
			where: {
				id: Number.parseInt(id),
				userId: session.user.id,
			},
		});

		if (!template) {
			return NextResponse.json(
				{ error: "Template non trovato" },
				{ status: 404 },
			);
		}

		const templateId = Number.parseInt(id);

		// Elimina le revisioni del template
		await db.templateRevision.deleteMany({
			where: {
				templateId: templateId,
			},
		});

		// Elimina il template
		// I manuali associati avranno automaticamente templateId impostato a null grazie a onDelete: SetNull
		await db.template.delete({
			where: {
				id: templateId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Errore durante l'eliminazione del template:", error);
		return NextResponse.json(
			{
				error: "Errore interno del server",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID template mancante" },
				{ status: 400 },
			);
		}

		const data = await req.json();

		// Verifica che il template appartenga all'utente
		const existingTemplate = await db.template.findFirst({
			where: {
				id: Number.parseInt(id),
				userId: session.user.id,
			},
		});

		if (!existingTemplate) {
			return NextResponse.json(
				{ error: "Template non trovato" },
				{ status: 404 },
			);
		}

		// Aggiorna il template
		const template = await db.template.update({
			where: {
				id: Number.parseInt(id),
			},
			data: {
				name: data.name,
				description: data.description,
				isActive: data.isActive,
				logo_path: data.logo_path,
				logo_footer: data.logo_footer,
				color: data.color,
				font_title: data.font_title,
				font_paragraph: data.font_paragraph,
			},
		});

		return NextResponse.json(template);
	} catch (error) {
		console.error("Errore durante l'aggiornamento del template:", error);
		return NextResponse.json(
			{ error: "Errore interno del server" },
			{ status: 500 },
		);
	}
}
