import { BlobSASPermissions, BlobServiceClient } from "@azure/storage-blob";
import { db } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { NextResponse } from "next/server";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "icone";

export async function POST(req: Request) {
	try {
		const session = await getSession();
		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get("file") as File;
		const name = formData.get("name") as string;
		const description = formData.get("description") as string;

		if (!file || !name) {
			return new NextResponse("Missing required fields", { status: 400 });
		}

		// Inizializza il client di Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			connectionString!,
		);
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Genera un nome univoco per il blob
		const timestamp = Date.now();
		const blobName = `${timestamp}-${file.name}`;
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		// Converti il file in ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Carica il file
		await blockBlobClient.upload(buffer, buffer.length);

		// Genera un URL firmato valido per 1 anno
		const sasToken = await blockBlobClient.generateSasUrl({
			permissions: BlobSASPermissions.parse("r"), // Solo lettura
			expiresOn: new Date(
				new Date().setFullYear(new Date().getFullYear() + 1),
			), // 1 anno
		});

		// Salva i metadati nel database
		const icon = await db.icone.create({
			data: {
				nome: name,
				descrizione: description || null,
				urlicona: sasToken,
			},
		});

		return NextResponse.json({
			id: icon.id,
			url: sasToken,
			name: icon.nome,
			description: icon.descrizione,
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
