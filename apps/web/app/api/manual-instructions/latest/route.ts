import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const latestInstruction = await db.manualInstruction.findFirst({
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(latestInstruction);
	} catch (error) {
		console.error("Error fetching latest instruction:", error);
		return NextResponse.json(
			{
				error: "Error fetching latest instruction",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
