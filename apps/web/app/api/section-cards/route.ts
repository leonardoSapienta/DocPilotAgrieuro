import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const sectionId = searchParams.get("sectionId");

		if (!sectionId) {
			return NextResponse.json(
				{ error: "ID della sezione mancante" },
				{ status: 400 },
			);
		}

		// Recupera le SectionCard associate alla SectionsManual
		const sectionCards = await prisma.sectionCard.findMany({
			where: {
				sectionId: Number.parseInt(sectionId),
			},
			select: {
				id: true,
				title: true,
				description: true,
			},
		});

		return NextResponse.json(sectionCards);
	} catch (error) {
		console.error("Errore nel recupero delle sezioni:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero delle sezioni" },
			{ status: 500 },
		);
	}
}
