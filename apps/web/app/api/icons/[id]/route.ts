import { BlobServiceClient } from "@azure/storage-blob";
import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "icone";

export async function DELETE(
	req: Request,
	context: { params: { id: string } },
) {
	try {
		const session = await getSession();
		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const { id } = await Promise.resolve(context.params);
		const iconId = Number.parseInt(id, 10);
		if (Number.isNaN(iconId)) {
			return new NextResponse("ID non valido", { status: 400 });
		}

		// Recupera l'icona dal database
		const icon = await db.icone.findUnique({
			where: { id: iconId },
		});

		if (!icon) {
			return new NextResponse("Icona non trovata", { status: 404 });
		}

		// Estrai il nome del blob dall'URL
		const url = new URL(icon.urlicona);
		const blobName = url.pathname.split("/").pop();

		if (blobName) {
			// Elimina il blob da Azure Storage
			const blobServiceClient = BlobServiceClient.fromConnectionString(
				connectionString!,
			);
			const containerClient =
				blobServiceClient.getContainerClient(containerName);
			const blockBlobClient =
				containerClient.getBlockBlobClient(blobName);
			await blockBlobClient.delete();
		}

		// Elimina l'icona dal database
		await db.icone.delete({
			where: { id: iconId },
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting icon:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
