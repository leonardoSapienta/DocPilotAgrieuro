import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

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
			name,
			version,
			templateId,
			contentIt,
			contentFr,
			contentDe,
			contentEn,
			contentEs,
			pagesInput,
			pagesOutput,
			images,
			pdf,
		} = await req.json();

		if (!name || !version) {
			return NextResponse.json(
				{ error: "Nome e versione sono richiesti" },
				{ status: 400 },
			);
		}

		// Assicuriamoci che contentEn contenga tutti i campi necessari
		const processedContentEn = contentEn.map((chapter: any) => ({
			chapter_info: chapter.chapter_info,
			restructured_html: chapter.restructured_html || "",
			chapter_number: chapter.chapter_number || 9999,
			example_html: chapter.example_html || "",
			missing_information: chapter.missing_information || "",
			is_empty:
				!chapter.restructured_html ||
				chapter.restructured_html.trim() === "",
		}));

		const manual = await db.manual.create({
			data: {
				userId: session.user.id,
				name,
				version: Number.parseFloat(version),
				templateId: templateId || null,
				contentIt: contentIt || null,
				contentFr: contentFr || null,
				contentDe: contentDe || null,
				contentEn: processedContentEn,
				contentEs: contentEs || null,
				pagesInput: pagesInput || null,
				pagesOutput: pagesOutput || null,
				images: images || null,
				pdf: pdf || null,
			},
		});

		return NextResponse.json({
			success: true,
			manual,
		});
	} catch (error) {
		console.error("Errore nel salvataggio del manuale:", error);
		return NextResponse.json(
			{ error: "Errore interno del server" },
			{ status: 500 },
		);
	}
}
