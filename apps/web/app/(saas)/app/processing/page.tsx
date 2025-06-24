import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import ManualForm from "@saas/manual/components/ManualForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProcessingPage({
	searchParams,
}: {
	searchParams: { manualId?: string };
}) {
	const session = await getSession();

	if (!session?.user?.id) {
		return null;
	}

	// Se non c'è un manualId, reindirizza alla pagina degli elaborati
	if (!searchParams.manualId) {
		redirect("/app/elaborati");
	}

	// Recupera il manuale dal database
	const manual = await db.manual.findFirst({
		where: {
			id: Number(searchParams.manualId),
			userId: session.user.id,
		},
	});

	// Se il manuale non esiste o non appartiene all'utente, reindirizza alla pagina degli elaborati
	if (!manual) {
		redirect("/app/elaborati");
	}

	return (
		<div className="container mx-auto py-6">
			<ManualForm
				initialData={{
					name: manual.name,
					version: manual.version,
					contentEn: manual.contentEn,
					images: (manual.images as any[]) ?? [],
					pagesInput: manual.pagesInput ?? 0,
				}}
				manualId={manual.id}
			/>
		</div>
	);
}
