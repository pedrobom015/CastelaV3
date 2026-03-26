import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	const { clientKey } = req.query;

	if (req.method !== "PUT") {
		res.setHeader("Allow", "PUT");
		return res.status(405).json({ error: "Method Not Allowed" });
	}

	if (!clientKey || clientKey.trim() === "") {
		return res.status(400).json({ error: "client_key is required in URL" });
	}

	const { hostname, keepalive, module } = req.body; // <-- usa direto

	if (!hostname || !keepalive) {
		return res
			.status(400)
			.json({ error: "hostname and keepalive are required" });
	}

	const keepaliveDate = new Date(keepalive);
	if (isNaN(keepaliveDate.getTime())) {
		return res.status(400).json({ error: "Invalid keepalive format" });
	}

	try {
		const existing = await prisma.device.findFirst({
			where: {
				clientKey: clientKey,
				machineName: hostname,
				moduleKey: module,
			},
		});

		if (!existing) {
			//return res.status(404).json({ error: "License not found" });
			await prisma.device.create({
				data: {
					clientKey: clientKey,
					machineName: hostname,
					moduleKey: module,
					keepaliveTs: keepaliveDate,
				},
			});
		}

		await prisma.device.updateMany({
			where: {
				clientKey: clientKey,
				machineName: hostname,
				moduleKey: module,
			},
			data: {
				keepaliveTs: keepaliveDate,
			},
		});

		return res.status(200).json({ success: true });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}
