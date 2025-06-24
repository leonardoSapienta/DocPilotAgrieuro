import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Ottieni i dati dei manuali insieme alle informazioni sugli utenti
		const manuali = await db.$queryRaw<Array<{
			createdAt: string;
			pagesInput: number | null;
			pagesOutput: number | null;
			userId: string;
			userName: string | null;
		}>>`
			SELECT m."data_creazione" as "createdAt", m."pagine_input" as "pagesInput", m."pagine_output" as "pagesOutput",
				   m."user_id" as "userId", u."name" as "userName"
			FROM "manuali" m
			LEFT JOIN "user" u ON m."user_id" = u."id"
			ORDER BY m."data_creazione" ASC
		`;

		// Ottieni la lista di tutti gli utenti che hanno creato manuali
		const users = await db.$queryRaw`
      SELECT DISTINCT u."id" as "id", u."name" as "name"
      FROM "user" u
      INNER JOIN "manuali" m ON u."id" = m."user_id"
      ORDER BY u."name" ASC
    `;

    // Calcola i totali delle pagine input/output
    let totalPagesInput = 0;
    let totalPagesOutput = 0;
    for (const manual of manuali) {
      totalPagesInput += manual.pagesInput || 0;
      totalPagesOutput += manual.pagesOutput || 0;
    }

		return NextResponse.json({
			data: manuali,
			users: users,
      totalPagesInput,
      totalPagesOutput,
		});
	} catch (error) {
		console.error("Errore durante il recupero dei dati:", error);
		return NextResponse.json(
			{ error: "Errore durante il recupero dei dati" },
			{ status: 500 },
		);
	}
}
