import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const sections = await db.sectionsManual.findMany({
			orderBy: {
				name: "asc",
			},
			include: {
				cards: true,
			},
		});
		return NextResponse.json(sections);
	} catch (error) {
		console.error("Errore nel recupero delle sezioni:", error);
		return NextResponse.json(
			{ error: "Errore nel recupero delle sezioni" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json(
				{ error: "Il nome della sezione è obbligatorio" },
				{ status: 400 },
			);
		}

		const section = await db.sectionsManual.create({
			data: {
				name,
			},
		});

		return NextResponse.json(section);
	} catch (error) {
		console.error("Error creating section:", error);
		return NextResponse.json(
			{
				error: "Error creating section",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "ID della sezione è obbligatorio" },
				{ status: 400 },
			);
		}

		// Elimina la sezione e tutte le sue card associate (grazie a onDelete: Cascade)
		const section = await db.sectionsManual.delete({
			where: {
				id: Number.parseInt(id),
			},
			include: {
				cards: true,
			},
		});

		return NextResponse.json({
			message: "Sezione e card associate eliminate con successo",
			section,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		return NextResponse.json(
			{
				error: "Error deleting section",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
