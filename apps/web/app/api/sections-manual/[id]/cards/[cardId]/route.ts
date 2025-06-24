import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string; cardId: string } },
) {
	try {
		const card = await db.sectionCard.delete({
			where: {
				id: Number.parseInt(params.cardId),
				sectionId: Number.parseInt(params.id),
			},
		});

		return NextResponse.json(card);
	} catch (error) {
		console.error("Error deleting card:", error);
		return NextResponse.json(
			{
				error: "Error deleting card",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
