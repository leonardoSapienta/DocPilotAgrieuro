import { BlobServiceClient } from "@azure/storage-blob";
import { db } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const prompt = formData.get("prompt") as string;

		if (!file) {
			return NextResponse.json(
				{ error: "File is required" },
				{ status: 400 },
			);
		}

		// Upload to Azure
		const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
		if (!connectionString) {
			console.error("Azure Storage connection string is missing");
			throw new Error(
				"Azure Storage connection string is not configured",
			);
		}

		console.log("Connecting to Azure Blob Storage...");
		const blobServiceClient =
			BlobServiceClient.fromConnectionString(connectionString);

		const containerName = "manual-instructions";
		console.log(`Getting container client for: ${containerName}`);
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Crea il container se non esiste
		try {
			console.log("Attempting to create container if not exists...");
			const createContainerResponse =
				await containerClient.createIfNotExists();
			console.log(
				"Container creation response:",
				createContainerResponse,
			);
		} catch (error) {
			console.error("Error creating container:", error);
			return NextResponse.json(
				{
					error: "Error creating storage container",
					details:
						error instanceof Error
							? error.message
							: "Unknown error",
				},
				{ status: 500 },
			);
		}

		const blobName = `${Date.now()}-${file.name}`;
		console.log(`Creating blob with name: ${blobName}`);
		const blockBlobClient = containerClient.getBlockBlobClient(blobName);

		console.log("Uploading file data...");
		const buffer = await file.arrayBuffer();
		await blockBlobClient.uploadData(buffer);

		// Salva nel database
		const manualInstruction = await db.manualInstruction.create({
			data: {
				file_path: blobName,
				prompt: prompt || null,
			},
		});

		return NextResponse.json(manualInstruction);
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{
				error: "Error saving manual instruction",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
