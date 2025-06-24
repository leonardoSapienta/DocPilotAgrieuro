import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return new NextResponse("Non autorizzato", { status: 401 });
		}

		const newActiveId = parseInt(params.id);
		const { oldActiveId } = await request.json();

		// Disattiva la vecchia versione
		if (oldActiveId) {
			await db.manual.update({
				where: { id: oldActiveId },
				data: { isActive: false }
			});
		}

		// Attiva la nuova versione
		await db.manual.update({
			where: { id: newActiveId },
			data: { isActive: true }
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Errore nel cambio versione:", error);
		return new NextResponse("Errore interno del server", { status: 500 });
	}
} 