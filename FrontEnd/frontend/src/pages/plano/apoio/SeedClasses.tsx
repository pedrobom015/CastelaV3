import { useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { DbfTable } from "../../../services/dbf/DbfReader";
import { PageHeader, Btn } from "../../../components/common/PageHeader";
import type { DbfRecord } from "../../../types/models";

// ── Seed de produtos (PRADENDO.DBF) ───────────────────────────────────────────

const PRODUTOS_SEED: DbfRecord[] = [
	{
		codigo: "0001",
		produto: "Multiassistência",
		unid: "SV",
		reftec: "",
		grupo: "PLANOS",
		depto: "ASSISTENCIA",
		qd_min: 0,
		qd_ped: 0,
		qd_rec: 0,
		qd_ven: 0,
		qd_loc: 0,
		qd_est: 0,
		preco_cus: 0,
		custo_: null,
		preco_ven: 89.9,
		venda_: null,
		dt_ult_atu: new Date(),
	},
	{
		codigo: "0004",
		produto: "Bom Pet",
		unid: "SV",
		reftec: "",
		grupo: "PLANOS",
		depto: "PET",
		qd_min: 0,
		qd_ped: 0,
		qd_rec: 0,
		qd_ven: 0,
		qd_loc: 0,
		qd_est: 0,
		preco_cus: 0,
		custo_: null,
		preco_ven: 59.9,
		venda_: null,
		dt_ult_atu: new Date(),
	},
	{
		codigo: "0005",
		produto: "Bom Med",
		unid: "SV",
		reftec: "",
		grupo: "PLANOS",
		depto: "SAUDE",
		qd_min: 0,
		qd_ped: 0,
		qd_rec: 0,
		qd_ven: 0,
		qd_loc: 0,
		qd_est: 0,
		preco_cus: 0,
		custo_: null,
		preco_ven: 99.9,
		venda_: null,
		dt_ult_atu: new Date(),
	},
	{
		codigo: "0006",
		produto: "Bom Auto",
		unid: "SV",
		reftec: "",
		grupo: "PLANOS",
		depto: "AUTO",
		qd_min: 0,
		qd_ped: 0,
		qd_rec: 0,
		qd_ven: 0,
		qd_loc: 0,
		qd_est: 0,
		preco_cus: 0,
		custo_: null,
		preco_ven: 79.9,
		venda_: null,
		dt_ult_atu: new Date(),
	},
];

// ── Helper ─────────────────────────────────────────────────────────────────────

function emptyTable(existing: DbfTable | undefined): DbfTable {
	return {
		header: existing?.header ?? {
			version: 3,
			lastUpdate: new Date(),
			recordCount: 0,
			headerSize: 0,
			recordSize: 0,
			fields: [],
		},
		records: [],
	};
}

// ── Componente ─────────────────────────────────────────────────────────────────

export function SeedClasses() {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [log, setLog] = useState<string[]>([]);
	const [running, setRunning] = useState(false);
	const [done, setDone] = useState(false);

	async function handleSeed() {
		if (!dirHandle) {
			alert("Selecione o diretório DBF primeiro (Setup).");
			return;
		}
		setRunning(true);
		setDone(false);
		setLog([]);
		const lines: string[] = [];
		const push = (s: string) => {
			lines.push(s);
			setLog([...lines]);
		};

		try {
			const pradendoTable = getTable("pradendo");

			push("🗑️  Limpando PRADENDO.DBF...");
			const newTable: DbfTable = {
				...emptyTable(pradendoTable),
				records: PRODUTOS_SEED,
			};
			await writeDbfFile(dirHandle, "PRADENDO", newTable);
			setTable("pradendo", newTable);
			push("");

			for (const p of PRODUTOS_SEED) {
				push(
					`✅ ${p.codigo} — ${p.produto} — R$ ${Number(p.preco_ven).toFixed(2)} — ${p.depto}`,
				);
			}

			push("");
			push(
				`🎉 Concluído! ${PRODUTOS_SEED.length} produtos gravados em PRADENDO.DBF`,
			);
			setDone(true);
		} catch (e) {
			push(`❌ Erro: ${e}`);
		} finally {
			setRunning(false);
		}
	}

	return (
		<div className="p-4 max-w-2xl">
			<PageHeader
				title="Seed — Produtos / Planos"
				subtitle="Apaga e recria PRADENDO.DBF com os 7 produtos padrão"
				actions={
					<Btn
						onClick={handleSeed}
						disabled={running}
						icon="⚡"
						size="lg"
					>
						{running ? "Gerando..." : "Seed Produtos"}
					</Btn>
				}
			/>

			{!done && log.length === 0 && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
					<p className="font-semibold mb-2">
						⚠️ Esta operação apaga e recria os dados
					</p>
					<ul className="list-disc list-inside space-y-1 text-yellow-700">
						<li>
							<strong>PRADENDO.DBF</strong> — apagado e recriado a
							cada clique
						</li>
					</ul>
					<div className="mt-3 grid grid-cols-2 gap-1 text-xs text-yellow-600">
						{PRODUTOS_SEED.map((p) => (
							<div key={String(p.codigo)}>
								<span className="font-mono font-semibold">
									{String(p.codigo)}
								</span>{" "}
								— {String(p.produto)}
							</div>
						))}
					</div>
				</div>
			)}

			{log.length > 0 && (
				<div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 max-h-96 overflow-y-auto">
					{log.map((line, i) => (
						<div
							key={i}
							className={
								line.startsWith("❌")
									? "text-red-400"
									: line.startsWith("🎉")
										? "text-yellow-300 font-bold"
										: line.startsWith("🗑️")
											? "text-orange-300"
											: ""
							}
						>
							{line || <br />}
						</div>
					))}
				</div>
			)}

			{done && (
				<div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4 text-green-800 text-sm font-medium">
					Produtos gravados! Acesse{" "}
					<strong>Adendos / Produtos</strong> para ver os registros.
				</div>
			)}
		</div>
	);
}
