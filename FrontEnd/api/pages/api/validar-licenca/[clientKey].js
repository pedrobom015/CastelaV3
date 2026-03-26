import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	const { clientKey } = req.query;

	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		return res.status(405).json({ error: "Method Not Allowed" });
	}

	if (!clientKey || clientKey.trim() === "") {
		return res.status(400).json({ error: "client_key is required in URL" });
	}

	try {
		const license = await prisma.client.findUnique({
			where: { clientKey: clientKey },
			select: {
				clientKey: true,
				dateValid: true,
				timeleft: true,
			},
		});

		if (!license) {
			return res.status(404).json({ error: "License not found" });
		}

		return res.status(200).json({
			client_key: license.clientKey,
			date_valid: license.dateValid.toISOString().split("T")[0],
			timeleft_minutes: license.timeleft,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}
