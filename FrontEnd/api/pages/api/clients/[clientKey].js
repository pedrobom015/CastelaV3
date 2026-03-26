import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "../../../lib/auth";
import Cors from "nextjs-cors";

const prisma = new PrismaClient();

export default async function handler(req, res) {
	await Cors(req, res, {
		// Apenas durante DEV, em produção configure seu domínio correto
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		origin: "https://internal.presserv.org", // ou 'http://localhost:5173' se quiser restringir
		optionsSuccessStatus: 200,
	});

	const auth = authenticateRequest(req);

	if (!auth.authorized) {
		return res.status(401).json({ error: auth.message });
	}

	const { clientKey } = req.query;

	if (req.method === "GET") {
		const license = await prisma.client.findUnique({
			where: { clientKey },
		});
		if (!license) {
			return res.status(404).json({ message: "License not found" });
		}
		return res.status(200).json(license);
	}

	if (req.method === "PUT") {
		const { clientKey, dateValid, timeleft, keepaliveTs } = req.body;

		try {
			const updated = await prisma.client.update({
				where: { clientKey },
				data: {
					dateValid: new Date(dateValid),
					timeleft,
				},
			});
			return res.status(200).json(updated);
		} catch (error) {
			return res.status(400).json({ error: error.message });
		}
	}

	if (req.method === "DELETE") {
		try {
			await prisma.clientLicense.delete({
				where: { clientKey },
			});
			return res.status(204).end();
		} catch (error) {
			return res.status(400).json({ error: error.message });
		}
	}

	return res.status(405).json({ message: "Method not allowed" });
}
