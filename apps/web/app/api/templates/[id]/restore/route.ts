import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user) {
			return new NextResponse("Non autorizzato", { status: 401 });
		}

		const templateId = Number.parseInt(params.id);
		if (Number.isNaN(templateId)) {
			return new NextResponse("ID template non valido", { status: 400 });
		}

		const { revisionId } = await request.json();
		if (!revisionId) {
			return new NextResponse("ID revisione non fornito", {
				status: 400,
			});
		}

		// Recupera il template attuale
		const currentTemplate = await db.template.findUnique({
			where: {
				id: templateId,
			},
		});

		if (!currentTemplate) {
			return new NextResponse("Template non trovato", { status: 404 });
		}

		// Recupera la revisione da ripristinare
		const revision = await db.templateRevision.findUnique({
			where: {
				id: revisionId,
				templateId: templateId,
			},
		});

		if (!revision) {
			return new NextResponse("Revisione non trovata", { status: 404 });
		}

		// Trova l'ultima versione per questo template
		const lastRevision = await db.templateRevision.findFirst({
			where: {
				templateId: templateId,
			},
			orderBy: {
				version: "desc",
			},
		});

		// Crea una nuova revisione con lo stato attuale del template
		await db.templateRevision.create({
			data: {
				templateId: templateId,
				userId: session.user.id,
				name: currentTemplate.name,
				description: currentTemplate.description,
				logo_path: currentTemplate.logo_path,
				logo_footer: currentTemplate.logo_footer,
				color: currentTemplate.color,
				font_title: currentTemplate.font_title,
				font_paragraph: currentTemplate.font_paragraph,
				version: (lastRevision?.version || 0) + 1,
			},
		});

		// Aggiorna il template con i dati della revisione
		await db.template.update({
			where: {
				id: templateId,
			},
			data: {
				name: revision.name,
				description: revision.description,
				logo_path: revision.logo_path,
				logo_footer: revision.logo_footer,
				color: revision.color,
				font_title: revision.font_title,
				font_paragraph: revision.font_paragraph,
			},
		});

		// Elimina la revisione ripristinata
		await db.templateRevision.delete({
			where: {
				id: revisionId,
			},
		});

		return new NextResponse("Template ripristinato con successo", {
			status: 200,
		});
	} catch (error) {
		console.error("Errore nel ripristino della revisione:", error);
		return new NextResponse("Errore interno del server", { status: 500 });
	}
}
