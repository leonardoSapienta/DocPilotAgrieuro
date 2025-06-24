import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSession();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const templates = await db.template.findMany({
			where: {
				userId: session.user.id,
			},
			select: {
				id: true,
				name: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(templates);
	} catch (error) {
		console.error("Error fetching templates:", error);
		return NextResponse.json(
			{ error: "Failed to fetch templates" },
			{ status: 500 },
		);
	}
}
