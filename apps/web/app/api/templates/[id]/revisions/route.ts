import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
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

		const revisions = await db.templateRevision.findMany({
			where: {
				templateId: templateId,
			},
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

		return NextResponse.json(revisions);
	} catch (error) {
		console.error("Errore nel recupero delle revisioni:", error);
		return new NextResponse("Errore interno del server", { status: 500 });
	}
}
