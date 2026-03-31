import { useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { DbfTable } from "../../../services/dbf/DbfReader";
import type { DbfRecord } from "../../../types/models";
import { PageHeader, Btn } from "../../../components/common/PageHeader";
import type { ArqgrupRec } from "../tabelas/GrupoFormFields";

// ── Types ──────────────────────────────────────────────────────────────────────

type CircularRec = DbfRecord & {
	grupo: string; circ: string; procpend: number; emissao_: Date | null;
	mesref: string; valor: number; menscirc: string; menscirc1: string;
	menscirc2: string; emitidos: number; pagos: number; cancelados: number;
	lancto_: Date | null; funcionar: string; impress_: Date | null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function randClasse(): string {
	return String(Math.floor(Math.random() * 3) + 1).padStart(2, "0");
}

function emptyTable(existing: DbfTable | undefined): DbfTable {
	return {
		header: existing?.header ?? {
			version: 3, lastUpdate: new Date(), recordCount: 0,
			headerSize: 0, recordSize: 0, fields: [],
		},
		records: [],
	};
}

// ── Seed ARQGRUP.DBF ───────────────────────────────────────────────────────────

function makeGruposSeed(): ArqgrupRec[] {
	return [
		{ grup: "0001", classe: randClasse(), inicio: "000000000", final: "199999999", acumproc: 0, maxproc: 0, cpadmiss: "", periodic: 0, qtdremir: 0, poratend: "", ultcirc: "", emissao_: null, procpend: 0, contrat: 0, partic: 0, proxcirc: "" },
		{ grup: "0002", classe: randClasse(), inicio: "200000000", final: "399999999", acumproc: 0, maxproc: 0, cpadmiss: "", periodic: 0, qtdremir: 0, poratend: "", ultcirc: "", emissao_: null, procpend: 0, contrat: 0, partic: 0, proxcirc: "" },
		{ grup: "0003", classe: randClasse(), inicio: "400000000", final: "599999999", acumproc: 0, maxproc: 0, cpadmiss: "", periodic: 0, qtdremir: 0, poratend: "", ultcirc: "", emissao_: null, procpend: 0, contrat: 0, partic: 0, proxcirc: "" },
		{ grup: "0004", classe: randClasse(), inicio: "600000000", final: "799999999", acumproc: 0, maxproc: 0, cpadmiss: "", periodic: 0, qtdremir: 0, poratend: "", ultcirc: "", emissao_: null, procpend: 0, contrat: 0, partic: 0, proxcirc: "" },
		{ grup: "0005", classe: randClasse(), inicio: "800000000", final: "999999999", acumproc: 0, maxproc: 0, cpadmiss: "", periodic: 0, qtdremir: 0, poratend: "", ultcirc: "", emissao_: null, procpend: 0, contrat: 0, partic: 0, proxcirc: "" },
	];
}

// ── Seed CIRCULAR.DBF ──────────────────────────────────────────────────────────

const CIRCULARES_SEED: CircularRec[] = [
	{ grupo: "0001", circ: "001", mesref: "0326", valor: 40.00, procpend: 0, emissao_: new Date(2026, 2, 1), menscirc: "", menscirc1: "", menscirc2: "", emitidos: 0, pagos: 0, cancelados: 0, lancto_: null, funcionar: "", impress_: null },
	{ grupo: "0002", circ: "002", mesref: "0326", valor: 60.00, procpend: 0, emissao_: new Date(2026, 2, 1), menscirc: "", menscirc1: "", menscirc2: "", emitidos: 0, pagos: 0, cancelados: 0, lancto_: null, funcionar: "", impress_: null },
	{ grupo: "0003", circ: "003", mesref: "0326", valor: 80.00, procpend: 0, emissao_: new Date(2026, 2, 1), menscirc: "", menscirc1: "", menscirc2: "", emitidos: 0, pagos: 0, cancelados: 0, lancto_: null, funcionar: "", impress_: null },
];

// ── Componente ─────────────────────────────────────────────────────────────────

export function SeedGrupo() {
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
		const push = (s: string) => { lines.push(s); setLog([...lines]); };

		try {
			// ── ARQGRUP ──
			push("🗑️  Limpando ARQGRUP.DBF...");
			const grupos = makeGruposSeed();
			const grupTable: DbfTable = { ...emptyTable(getTable("arqgrup")), records: grupos };
			await writeDbfFile(dirHandle, "ARQGRUP.DBF", grupTable);
			setTable("arqgrup", grupTable);
			push("");
			for (const g of grupos) {
				push(`✅ Grupo ${g.grup} (classe ${g.classe}) — ${g.inicio} → ${g.final}`);
			}
			push("");

			// ── CIRCULAR ──
			push("🗑️  Limpando CIRCULAR.DBF...");
			const circTable: DbfTable = { ...emptyTable(getTable("circular")), records: CIRCULARES_SEED };
			await writeDbfFile(dirHandle, "CIRCULAR.DBF", circTable);
			setTable("circular", circTable);
			push("");
			for (const c of CIRCULARES_SEED) {
				push(`✅ Circular ${c.circ} — Grupo ${c.grupo} — ${c.mesref} — R$ ${Number(c.valor).toFixed(2)}`);
			}
			push("");

			push(`🎉 Concluído! ${grupos.length} grupos e ${CIRCULARES_SEED.length} circulares gravados.`);
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
				title="Seed — Grupos e Circulares"
				subtitle="Apaga e recria ARQGRUP.DBF e CIRCULAR.DBF"
				actions={
					<Btn onClick={handleSeed} disabled={running} icon="⚡" size="lg">
						{running ? "Gerando..." : "Seed Grupos"}
					</Btn>
				}
			/>

			{!done && log.length === 0 && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
					<p className="font-semibold mb-2">⚠️ Esta operação apaga e recria os dados</p>
					<ul className="list-disc list-inside space-y-1 text-yellow-700">
						<li><strong>ARQGRUP.DBF</strong> — 5 grupos, faixas de 200 milhões, classe aleatória 01–03</li>
						<li><strong>CIRCULAR.DBF</strong> — 3 circulares (grupos 01–03, mês 03/26)</li>
					</ul>
					<div className="mt-3 grid grid-cols-1 gap-1 text-xs text-yellow-600 font-mono">
						{CIRCULARES_SEED.map((c) => (
							<div key={c.circ}>
								<span className="font-semibold">Circ {c.circ}</span> — Grupo {c.grupo} — {c.mesref} — R$ {Number(c.valor).toFixed(2)}
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
								line.startsWith("❌") ? "text-red-400"
								: line.startsWith("🎉") ? "text-yellow-300 font-bold"
								: line.startsWith("🗑️") ? "text-orange-300"
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
					Gravado! Acesse <strong>Tabelas / Grupos</strong> e <strong>Tabelas / Circulares</strong> para ver os registros.
				</div>
			)}
		</div>
	);
}
