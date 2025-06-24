import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const cards = await db.sectionCard.findMany({
			where: {
				sectionId: Number.parseInt(params.id),
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(cards);
	} catch (error) {
		console.error("Error fetching cards:", error);
		return NextResponse.json(
			{
				error: "Error fetching cards",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function POST(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const body = await request.json();
		const { title, description } = body;

		if (!title || !description) {
			return NextResponse.json(
				{ error: "Titolo e descrizione sono obbligatori" },
				{ status: 400 },
			);
		}

		const card = await db.sectionCard.create({
			data: {
				title,
				description,
				sectionId: Number.parseInt(params.id),
			},
		});

		return NextResponse.json(card);
	} catch (error) {
		console.error("Error creating card:", error);
		return NextResponse.json(
			{
				error: "Error creating card",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
