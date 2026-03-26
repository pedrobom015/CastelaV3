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

	if (req.method === "GET") {
		// 3.1) Lê parâmetros de paginação, ordenação e filtro da query string
		//     Esperado: ?page=1&perPage=5&sort=id&order=ASC&filter={}
		const page = parseInt(req.query.page || "1", 10);
		const perPage = parseInt(req.query.perPage || "5", 10);
		const sort = req.query.sort || "id";
		const order = (req.query.order || "ASC").toUpperCase(); // "ASC" ou "DESC"
		const filter = req.query.filter ? JSON.parse(req.query.filter) : {};

		// 3.2) Traduzir `sort = "id"` (React Admin padrão) para `clientKey`
		//      Se sort vier como outro campo válido (ex.: "timeleft"), usa direto.
		const prismaSortField = sort === "id" ? "clientKey" : sort;

		// 3.3) Construir o objeto "where" para Prisma, usando `contains` case-insensitive
		//      para cada campo passado em filter. Ajuste essa lógica conforme seu schema.
		const where = {};
		Object.keys(filter).forEach((key) => {
			where[key] = {
				contains: filter[key],
				//mode: "insensitive",
			};
		});

		// 3.4) Conta o total de registros que batem com esse `where` (para ser enviado no Content-Range)
		const total = await prisma.client.count({ where });

		// 3.5) Calcula skip e take com base em page e perPage
		const skip = (page - 1) * perPage;
		const take = perPage;

		// 3.6) Monta o `orderBy` dinamicamente
		//      Se prismaSortField não existir no schema, vai falhar. Certifique-se de usar
		//      apenas campos válidos: clientKey, name, dateValid, timeleft, createdAt, updatedAt.
		const orderBy = {
			[prismaSortField]: order === "ASC" ? "asc" : "desc",
		};

		// 3.7) Busca apenas a fatia (página) de dados solicitada
		const data = await prisma.client.findMany({
			where,
			skip,
			take,
			orderBy,
		});

		// 3.8) Monta o cabeçalho Content-Range no formato que o React Admin espera:
		//      "<resource> <start>-<end>/<total>"
		//      Aqui nosso resource é "clients" (o mesmo nome que vamos usar no <Resource name="clients" />).
		const start = skip;
		const end = skip + data.length - 1; // zero-based index
		const contentRange = `clients ${start}-${end}/${total}`;

		// 3.9) Expõe o header e devolve o array JSON
		res.setHeader("Content-Range", contentRange);
		res.setHeader("Access-Control-Expose-Headers", "Content-Range");
		return res.status(200).json(data);
	}

	if (req.method === "POST") {
		const { clientKey, hostname, dateValid, timeleft, keepaliveTs } =
			req.body;

		try {
			const license = await prisma.client.create({
				data: {
					clientKey,
					dateValid: new Date(dateValid),
					timeleft,
				},
			});
			return res.status(201).json(license);
		} catch (error) {
			console.error(error);
			return res.status(400).json({ error: error.message });
		}
	}

	return res.status(405).json({ message: "Method not allowed" });
}
