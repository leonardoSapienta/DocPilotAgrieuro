import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

const PYTHON_BACKEND_URL =
	process.env.NEXT_PUBLIC_SITE_FLASK || "http://localhost:5000";

export async function POST(req: Request) {
	try {
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non autorizzato" },
				{ status: 401 },
			);
		}

		const formData = await req.formData();
		const files = formData.getAll("files[]");
		const manualName = formData.get("manualName");
		const version = formData.get("version");

		if (!files || files.length === 0) {
			return NextResponse.json(
				{ error: "Nessun file selezionato" },
				{ status: 400 },
			);
		}

		if (!manualName) {
			return NextResponse.json(
				{ error: "Nome del manuale richiesto" },
				{ status: 400 },
			);
		}

		if (!version) {
			return NextResponse.json(
				{ error: "Versione del manuale richiesta" },
				{ status: 400 },
			);
		}

		// Inoltra la richiesta al backend Python
		const response = await fetch(`${PYTHON_BACKEND_URL}/flask-api/process-pdf`, {
			method: "POST",
			body: formData,
			// Timeout di 40 minuti (2400000 millisecondi)
			signal: AbortSignal.timeout(2400000),
		});

		if (!response.ok) {
			const error = await response.json();
			return NextResponse.json(
				{
					error:
						error.message ||
						"Errore durante l'elaborazione del documento",
				},
				{ status: response.status },
			);
		}

		const result = await response.json();
		return NextResponse.json(result);
	} catch (error) {
		console.error("Errore durante l'elaborazione del documento:", error);
		return NextResponse.json(
			{ error: "Errore interno del server" },
			{ status: 500 },
		);
	}
}
