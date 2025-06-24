import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const section = await db.sectionsManual.findUnique({
			where: {
				id: Number.parseInt(params.id),
			},
			include: {
				cards: true,
			},
		});

		if (!section) {
			return NextResponse.json(
				{ error: "Sezione non trovata" },
				{ status: 404 },
			);
		}

		return NextResponse.json(section);
	} catch (error) {
		console.error("Error fetching section:", error);
		return NextResponse.json(
			{
				error: "Error fetching section",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
