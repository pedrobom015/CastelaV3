/**
 * AtendimentosFrequencia — gráfico adaptativo de frequência
 * - Período de 1 dia → eixo X por hora (00h–23h)
 * - Período > 1 dia  → eixo X por data
 */
import { useMemo } from "react";
import type { DbfRecord } from "../../types/models";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

interface Props {
	registros: DbfRecord[];
	dataIni: string;
	dataFim: string;
}

function toYMD(val: unknown): string | null {
	if (!val) return null;
	const d = val instanceof Date ? val : new Date(val as string);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatYMD(ymd: string): string {
	const [, m, d] = ymd.split("-");
	return `${d}/${m}`;
}

const LEGENDA = [
	["#3b82f6", "Atendimento"],
	["#22c55e", "Recebimento"],
	["#f97316", "Acordo"],
] as const;

const TIPO_NOME: Record<string, string> = { A: "Atendimento", R: "Recebimento", C: "Acordo" };

export function AtendimentosFrequencia({ registros, dataIni, dataFim }: Props) {
	// Aplica filtro de período
	const filtrados = useMemo(() => {
		return registros.filter((r) => {
			const ymd = toYMD(r.data_);
			if (!ymd) return false;
			if (dataIni && ymd < dataIni) return false;
			if (dataFim && ymd > dataFim) return false;
			return true;
		});
	}, [registros, dataIni, dataFim]);

	// Decide modo: se o intervalo for exatamente 1 dia → hora, senão → dia
	const modoHora = useMemo(() => {
		if (!dataIni || !dataFim) return false;
		const ini = new Date(dataIni + "T00:00:00");
		const fim = new Date(dataFim + "T00:00:00");
		const diffDias = (fim.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24);
		return diffDias < 1; // mesmo dia
	}, [dataIni, dataFim]);

	// Dados por hora (sempre calculado, usado só quando modoHora)
	const dadosHora = useMemo(() => {
		const counts: Record<number, { A: number; R: number; C: number }> = {};
		for (let h = 0; h < 24; h++) counts[h] = { A: 0, R: 0, C: 0 };
		filtrados.forEach((r) => {
			const hora = String(r.hora ?? "").trim();
			const h = parseInt(hora.slice(0, 2));
			if (isNaN(h) || h < 0 || h > 23) return;
			const tipo = String(r.tipo ?? "").trim();
			if (tipo === "A" || tipo === "R" || tipo === "C") counts[h][tipo]++;
		});
		return Array.from({ length: 24 }, (_, h) => ({
			label: `${String(h).padStart(2, "0")}h`,
			...counts[h],
		}));
	}, [filtrados]);

	// Dados por data (sempre calculado, usado só quando !modoHora)
	const dadosData = useMemo(() => {
		const map = new Map<string, { A: number; R: number; C: number }>();
		filtrados.forEach((r) => {
			const ymd = toYMD(r.data_);
			if (!ymd) return;
			if (!map.has(ymd)) map.set(ymd, { A: 0, R: 0, C: 0 });
			const entry = map.get(ymd)!;
			const tipo = String(r.tipo ?? "").trim();
			if (tipo === "A" || tipo === "R" || tipo === "C") entry[tipo]++;
		});
		// Preenche todos os dias do intervalo (sem gaps)
		const result: { label: string; ymd: string; A: number; R: number; C: number }[] = [];
		if (dataIni && dataFim) {
			const cur = new Date(dataIni + "T00:00:00");
			const end = new Date(dataFim + "T00:00:00");
			while (cur <= end) {
				const ymd = toYMD(cur)!;
				result.push({ label: formatYMD(ymd), ymd, ...(map.get(ymd) ?? { A: 0, R: 0, C: 0 }) });
				cur.setDate(cur.getDate() + 1);
			}
		}
		return result;
	}, [filtrados, dataIni, dataFim]);

	if (filtrados.length === 0 && registros.length === 0) return null;

	const data = modoHora ? dadosHora : dadosData;
	const titulo = modoHora
		? `Frequência por hora — ${dataIni ? formatYMD(dataIni).replace("/", "/") : ""}`
		: "Frequência por data";

	return (
		<div className="bg-white border rounded-lg p-4 mb-4">
			<div className="flex items-center justify-between mb-1">
				<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
					{titulo}
				</p>
				<div className="flex gap-4">
					{LEGENDA.map(([cor, nome]) => (
						<span key={nome} className="flex items-center gap-1 text-xs text-gray-500">
							<span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: cor }} />
							{nome}
						</span>
					))}
				</div>
			</div>
			<p className="text-2xl font-bold text-blue-900 mb-3">
				{filtrados.length}
				<span className="text-sm font-normal text-gray-400 ml-1">atendimento(s)</span>
			</p>

			{filtrados.length === 0 ? (
				<p className="text-sm text-gray-400 italic text-center py-6">
					Nenhum atendimento no período selecionado.
				</p>
			) : (
				<ResponsiveContainer width="100%" height={180}>
					<BarChart
						data={data}
						margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
						barSize={modoHora ? 14 : Math.max(8, Math.min(32, Math.floor(600 / data.length)))}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
						<XAxis
							dataKey="label"
							tick={{ fontSize: 10, fill: "#9ca3af" }}
							tickLine={false}
							axisLine={false}
							interval={modoHora ? 0 : "preserveStartEnd"}
						/>
						<YAxis
							allowDecimals={false}
							tick={{ fontSize: 10, fill: "#9ca3af" }}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
							labelFormatter={(label) => modoHora ? `Hora: ${label}` : `Data: ${label}`}
							formatter={(value, name) => [value ?? 0, TIPO_NOME[name as string] ?? name]}
						/>
						<Bar dataKey="A" stackId="s" fill="#3b82f6" />
						<Bar dataKey="R" stackId="s" fill="#22c55e" />
						<Bar dataKey="C" stackId="s" fill="#f97316" radius={[3, 3, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}
