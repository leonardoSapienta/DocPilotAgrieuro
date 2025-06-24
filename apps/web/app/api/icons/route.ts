import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSession();
		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const icons = await db.icone.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(icons);
	} catch (error) {
		console.error("Error fetching icons:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
