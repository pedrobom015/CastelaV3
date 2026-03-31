import { useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { DbfTable } from "../../../services/dbf/DbfReader";
import type { DbfRecord } from "../../../types/models";
import { PageHeader, Btn } from "../../../components/common/PageHeader";

// ── Types ──────────────────────────────────────────────────────────────────────

type ProcessoRec = DbfRecord & {
	processo: string;
	categ: string;
	saiu: string;
	grup: string;
	num: string;
	grau: string;
	seq: number;
	seg: string;
	ends: string;
	bais: string;
	cids: string;
	fal: string;
	sep: string;
	dfal: Date | null;
	codlan: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

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

export function SeedProcessos() {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [log, setLog] = useState<string[]>([]);
	const [running, setRunning] = useState(false);
	const [done, setDone] = useState(false);

	async function runSeed(isClear: boolean) {
		if (!dirHandle) {
			alert("Selecione o diretório DBF primeiro (Setup).");
			return;
		}

		if (
			isClear &&
			!confirm("Deseja realmente APAGAR todos os processos?")
		) {
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
			push(
				isClear
					? "🗑️ Limpando PRCESSOS.DBF..."
					: "⚡ Gerando processos de teste...",
			);

			// Se isClear for true, manda records vazio. Se false, poderia mandar um array de teste.
			// Como você pediu "para limpar por enquanto", o foco aqui é o reset.
			const records: ProcessoRec[] = [];

			const procTable: DbfTable = {
				...emptyTable(getTable("prcessos")),
				records: records,
			};

			await writeDbfFile(dirHandle, "PRCESSOS.DBF", procTable);
			setTable("prcessos", procTable);

			push("");
			if (isClear) {
				push(
					"✅ Tabela PRCESSOS.DBF resetada com sucesso (0 registros).",
				);
			}
			push("");

			push(`🎉 Concluído! Operação finalizada.`);
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
				title="Seed — Processos"
				subtitle="Gerenciamento de massa de dados para PRCESSOS.DBF"
				actions={
					<div className="flex gap-2">
						<Btn
							onClick={() => runSeed(true)}
							disabled={running}
							variant="danger"
							icon="🗑️"
						>
							{running ? "Limpando..." : "Limpar Processos"}
						</Btn>
					</div>
				}
			/>

			{!done && log.length === 0 && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
					<p className="font-semibold mb-2">ℹ️ Status da Tabela</p>
					<p>
						Utilize o botão acima para truncar a tabela de processos
						e iniciar os testes do zero.
					</p>
					<div className="mt-2 text-xs font-mono text-blue-600">
						Arquivo: PRCESSOS.DBF <br />
						Campos: processo, categ, saiu, grup, num, grau, seq,
						seg, ends, bais, cids, fal, sep, dfal, codlan
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
					Ação concluída! A tabela <strong>Processos</strong> está
					pronta para novos registros.
				</div>
			)}
		</div>
	);
}
