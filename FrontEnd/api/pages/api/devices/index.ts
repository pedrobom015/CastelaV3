// pages/api/devices/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "nextjs-cors";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  await Cors(req, res, {
    methods: ["GET", "POST", "OPTIONS"],
    origin: "https://internal.presserv.org", // em produção restrinja ao seu domínio
    optionsSuccessStatus: 200,
  });

  // Autenticação
  const auth = authenticateRequest(req);
  if (!auth.authorized) {
    return res.status(401).json({ error: auth.message });
  }

  // GET /api/devices?page=1&perPage=5&sort=id&order=ASC&filter={}
  if (req.method === "GET") {
  
    const page = parseInt((req.query.page as string) || "1", 10);
    const perPage = parseInt((req.query.perPage as string) || "5", 10);
    const sort = (req.query.sort as string) || "id";
    const order = ((req.query.order as string) || "ASC").toUpperCase();
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};

    // React Admin envia sort="id": mapeamos para machineName
    const prismaSortField = sort === "id" ? "id" : sort;

    // Monta o where para cada campo via contains
    const where: Record<string, any> = {};
    Object.keys(filter).forEach((key) => {
      where[key] = { contains: filter[key] };
    });

    // Conta e busca página
    const total = await prisma.device.count({ where });
    const skip = (page - 1) * perPage;
    const data = await prisma.device.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { [prismaSortField]: order === "ASC" ? "asc" : "desc" },
    });

    // Content-Range header
    const start = skip;
    const end = skip + data.length - 1;
    res.setHeader("Content-Range", `devices ${start}-${end}/${total}`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Range");

    return res.status(200).json(data);
  }



  // Método não permitido
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
