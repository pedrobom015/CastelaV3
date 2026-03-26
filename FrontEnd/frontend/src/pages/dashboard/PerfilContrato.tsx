import { useMemo, useState } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { getRecords } from "../../utils/dbfHelpers";
import { formatCurrency } from "../../utils/formatters";
import { PageHeader, Btn } from "../../components/common/PageHeader";
import { COLORS } from "./geralUtils";
import { PerfilPrint } from "./PerfilPrint";

// ─── Situação ─────────────────────────────────────────────────────────────────
const SITUACAO_LABEL: Record<string, string> = {
	"1": "Ativo",
	"2": "Cancelado",
	"3": "Suspenso",
	"4": "Inadimplente",
	"0": "Inativo",
};

const SITUACAO_COLOR: Record<string, string> = {
	"1": "#10b981",
	"2": "#ef4444",
	"3": "#f59e0b",
	"4": "#ff914d",
	"0": "#9ca3af",
};

function age(nascto: Date | null | undefined): number | null {
	if (!nascto) return null;
	const d =
		nascto instanceof Date ? nascto : new Date(nascto as unknown as string);
	if (isNaN(d.getTime())) return null;
	const today = new Date();
	let a = today.getFullYear() - d.getFullYear();
	const m = today.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
	return a;
}

function yearMonth(d: Date | null | undefined): string | null {
	if (!d) return null;
	const dt = d instanceof Date ? d : new Date(d as unknown as string);
	if (isNaN(dt.getTime())) return null;
	return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(ym: string) {
	const [year, month] = ym.split("-");
	const meses = [
		"Jan",
		"Fev",
		"Mar",
		"Abr",
		"Mai",
		"Jun",
		"Jul",
		"Ago",
		"Set",
		"Out",
		"Nov",
		"Dez",
	];
	return `${meses[parseInt(month) - 1]}/${year.slice(2)}`;
}

const axisStyle = { fontSize: 10, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
	label,
	value,
	sub,
	color,
}: {
	label: string;
	value: string;
	sub?: string;
	color: string;
}) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
			<div className="h-1" style={{ background: color }} />
			<div className="px-4 py-3">
				<p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
					{label}
				</p>
				<p className="text-xl font-bold" style={{ color }}>
					{value}
				</p>
				{sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
			</div>
		</div>
	);
}

function ChartCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
			<div className="px-4 pt-3 pb-1">
				<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
					{title}
				</p>
			</div>
			<div className="px-2 pb-3">{children}</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PerfilContratoPage() {
	const { getTable } = useAppStore();
	const [isPrintMode, setIsPrintMode] = useState(false);

	const gruposTable = getTable("grupos");
	const arqgrupTable = getTable("arqgrup");
	const taxasTable = getTable("taxas");
	const cobrTable = getTable("cobradores");
	const regiaoTable = getTable("regioes");
	const inscritsTable = getTable("inscrits");

	// Lookup maps
	const grupoNomes = useMemo(() => {
		const m: Record<string, string> = {};
		getRecords(arqgrupTable).forEach((g) => {
			const cod = String(g.grup ?? "").trim();
			const nome = String(g.classe ?? cod).trim();
			if (cod) m[cod] = nome;
		});
		return m;
	}, [arqgrupTable]);

	const cobrNomes = useMemo(() => {
		const m: Record<string, string> = {};
		getRecords(cobrTable).forEach((c) => {
			const cod = String(c.cobrador ?? "").trim();
			const nome = String(c.nome ?? cod).trim();
			if (cod) m[cod] = nome;
		});
		return m;
	}, [cobrTable]);

	const regiaoNomes = useMemo(() => {
		const m: Record<string, string> = {};
		getRecords(regiaoTable).forEach((r) => {
			const cod = String(r.codigo ?? "").trim();
			const nome = String(r.regiao ?? cod).trim();
			if (cod) m[cod] = nome;
		});
		return m;
	}, [regiaoTable]);

	// All contracts
	const contratos = useMemo(() => getRecords(gruposTable), [gruposTable]);

	// ── KPIs ────────────────────────────────────────────────────────────────────
	const kpis = useMemo(() => {
		let ativos = 0,
			cancelados = 0,
			suspensos = 0,
			inadimplentes = 0;
		contratos.forEach((r) => {
			const s = String(r.situacao ?? "").trim();
			if (s === "1") ativos++;
			else if (s === "2") cancelados++;
			else if (s === "3") suspensos++;
			else if (s === "4") inadimplentes++;
		});
		return {
			total: contratos.length,
			ativos,
			cancelados,
			suspensos,
			inadimplentes,
		};
	}, [contratos]);

	// ── Taxas KPIs ──────────────────────────────────────────────────────────────
	const taxasKpis = useMemo(() => {
		let emitido = 0,
			arrecadado = 0,
			inadimplencia = 0;
		getRecords(taxasTable).forEach((r) => {
			const val = Number(r.valor ?? 0);
			const pg = Number(r.valorpg ?? 0);
			const stat = String(r.stat ?? "").trim();
			emitido += val;
			arrecadado += pg;
			if (stat !== "B") inadimplencia += val - pg;
		});
		return { emitido, arrecadado, inadimplencia };
	}, [taxasTable]);

	// ── Por Situação ────────────────────────────────────────────────────────────
	const porSituacao = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const s = String(r.situacao ?? "").trim() || "?";
			map[s] = (map[s] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([s, v]) => ({
				name: SITUACAO_LABEL[s] ?? s,
				value: v,
				cor: SITUACAO_COLOR[s] ?? "#6366f1",
			}))
			.sort((a, b) => b.value - a.value);
	}, [contratos]);

	// ── Por Grupo ───────────────────────────────────────────────────────────────
	const porGrupo = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const cod = String(r.grupo ?? "").trim() || "—";
			map[cod] = (map[cod] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([cod, v]) => ({
				grupo: grupoNomes[cod] ?? cod,
				contratos: v,
			}))
			.sort((a, b) => b.contratos - a.contratos)
			.slice(0, 10);
	}, [contratos, grupoNomes]);

	// ── Por Cobrador ────────────────────────────────────────────────────────────
	const porCobrador = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const cod = String(r.cobrador ?? "").trim() || "—";
			map[cod] = (map[cod] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([cod, v]) => ({
				cobrador: cobrNomes[cod] ?? cod,
				contratos: v,
			}))
			.sort((a, b) => b.contratos - a.contratos)
			.slice(0, 8);
	}, [contratos, cobrNomes]);

	// ── Por Região ──────────────────────────────────────────────────────────────
	const porRegiao = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const cod = String(r.regiao ?? "").trim() || "—";
			map[cod] = (map[cod] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([cod, v]) => ({
				regiao: regiaoNomes[cod] ?? cod,
				contratos: v,
			}))
			.sort((a, b) => b.contratos - a.contratos)
			.slice(0, 8);
	}, [contratos, regiaoNomes]);

	// ── Idade × Gênero: 1º inscrito por contrato (seq menor = titular) ──────────
	const idadeGenero = useMemo(() => {
		const FAIXAS = ["< 30", "30–44", "45–59", "60+", "N/D"] as const;
		// para cada codigo de contrato, guarda o inscrito com menor seq
		const titulares: Record<
			string,
			{ seq: number; nascto_: unknown; sexo: string }
		> = {};
		getRecords(inscritsTable).forEach((r) => {
			const cod = String(r.codigo ?? "").trim();
			if (!cod) return;
			const seq = Number(r.seq ?? 99);
			const prev = titulares[cod];
			if (!prev || seq < prev.seq) {
				titulares[cod] = {
					seq,
					nascto_: r.nascto_,
					sexo: String(r.sexo ?? "")
						.trim()
						.toUpperCase(),
				};
			}
		});
		const data: Record<string, { M: number; F: number }> = {};
		FAIXAS.forEach((f) => {
			data[f] = { M: 0, F: 0 };
		});
		Object.values(titulares).forEach(({ nascto_, sexo }) => {
			const a = age(nascto_ as Date | null);
			const faixa =
				a === null
					? "N/D"
					: a < 30
						? "< 30"
						: a < 45
							? "30–44"
							: a < 60
								? "45–59"
								: "60+";
			if (sexo === "F") data[faixa].F++;
			else data[faixa].M++;
		});
		return FAIXAS.map((faixa) => ({ faixa, ...data[faixa] }));
	}, [inscritsTable]);

	// ── Admissões por Mês (últimos 24 meses) ────────────────────────────────────
	const admissoesPorMes = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const ym = yearMonth(r.admissao as Date | null);
			if (ym) map[ym] = (map[ym] ?? 0) + 1;
		});
		const sorted = Object.entries(map)
			.sort(([a], [b]) => a.localeCompare(b))
			.slice(-24)
			.map(([ym, v]) => ({ mes: labelMes(ym), admissoes: v }));
		return sorted;
	}, [contratos]);

	// ── Faixa Etária ─ derivado de idadeGenero para manter a mesma fonte ────────
	const faixaEtaria = useMemo(() => {
		return idadeGenero.map(({ faixa, M, F }) => ({
			name: faixa,
			value: M + F,
		}));
	}, [idadeGenero]);

	return (
		<>
			{isPrintMode && (
				<PerfilPrint
					data={{
						kpis,
						taxasKpis,
						porSituacao,
						idadeGenero,
						porGrupo,
						porCobrador,
						admissoesPorMes,
						faixaEtaria,
						porRegiao,
					}}
					onClose={() => setIsPrintMode(false)}
				/>
			)}

			<div className="p-0 flex flex-col gap-4">
				<PageHeader
					title="Perfil de Contratos"
					subtitle="Visão analítica da base de clientes"
					actions={
						<Btn
							size="sm"
							icon="🖨️"
							onClick={() => setIsPrintMode(true)}
						>
							Imprimir
						</Btn>
					}
				/>

				{/* ── KPIs status ── */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
					<KpiCard
						label="Total Contratos"
						value={String(kpis.total)}
						color="#1e3a8a"
					/>
					<KpiCard
						label="Ativos"
						value={String(kpis.ativos)}
						sub={`${kpis.total ? ((kpis.ativos / kpis.total) * 100).toFixed(0) : 0}%`}
						color="#10b981"
					/>
					<KpiCard
						label="Inadimplentes"
						value={String(kpis.inadimplentes)}
						color="#ff914d"
					/>
					<KpiCard
						label="Suspensos"
						value={String(kpis.suspensos)}
						color="#f59e0b"
					/>
					<KpiCard
						label="Cancelados"
						value={String(kpis.cancelados)}
						color="#ef4444"
					/>
				</div>

				{/* ── KPIs financeiros ── */}
				<div className="grid grid-cols-2 gap-3">
					<KpiCard
						label="Total Emitido"
						value={formatCurrency(taxasKpis.emitido)}
						color="#1e3a8a"
					/>
					<KpiCard
						label="Inadimplência Financeira"
						value={formatCurrency(taxasKpis.inadimplencia)}
						sub={`Arrecadado: ${formatCurrency(taxasKpis.arrecadado)}`}
						color="#ff914d"
					/>
				</div>

				{/* ── Linha 1: Situação + Idade × Gênero ── */}
				<div className="grid grid-cols-2 gap-4">
					<ChartCard title="Distribuição por Situação">
						<div className="flex gap-4 items-center px-2 pt-1 pb-2">
							<ResponsiveContainer width="100%" height={180}>
								<PieChart>
									<Pie
										data={porSituacao}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={70}
										innerRadius={36}
										label={false}
									>
										{porSituacao.map((entry, i) => (
											<Cell key={i} fill={entry.cor} />
										))}
									</Pie>
									<Tooltip
										formatter={(v) => [
											`${v} contrato(s)`,
											"Qtd",
										]}
									/>
									<Legend
										wrapperStyle={{ fontSize: 10 }}
										iconSize={8}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</ChartCard>

					<ChartCard title="Idade × Gênero dos Titulares">
						<ResponsiveContainer width="100%" height={180}>
							<BarChart
								data={idadeGenero}
								margin={{
									top: 4,
									right: 16,
									left: 0,
									bottom: 0,
								}}
								barCategoryGap="30%"
							>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="faixa" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip
									formatter={(v) => [`${v} titular(es)`]}
								/>
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Bar
									dataKey="M"
									name="Masculino"
									fill="#1e3a8a"
									radius={[3, 3, 0, 0]}
									maxBarSize={22}
								/>
								<Bar
									dataKey="F"
									name="Feminino"
									fill="#ec4899"
									radius={[3, 3, 0, 0]}
									maxBarSize={22}
								/>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>

				{/* ── Linha 2: Por Grupo + Por Cobrador ── */}
				<div className="grid grid-cols-2 gap-4">
					<ChartCard title="Contratos por Grupo">
						<ResponsiveContainer width="100%" height={190}>
							<BarChart
								data={porGrupo}
								margin={{
									top: 4,
									right: 16,
									left: 0,
									bottom: 0,
								}}
								barCategoryGap="25%"
							>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="grupo" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip
									formatter={(v) => [`${v} contrato(s)`]}
								/>
								<Bar
									dataKey="contratos"
									name="Contratos"
									fill="#1e3a8a"
									radius={[3, 3, 0, 0]}
									maxBarSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title="Contratos por Cobrador">
						<ResponsiveContainer width="100%" height={190}>
							<BarChart
								data={porCobrador}
								margin={{
									top: 4,
									right: 16,
									left: 0,
									bottom: 0,
								}}
								barCategoryGap="25%"
							>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="cobrador" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip
									formatter={(v) => [`${v} contrato(s)`]}
								/>
								<Bar
									dataKey="contratos"
									name="Contratos"
									fill="#ff914d"
									radius={[3, 3, 0, 0]}
									maxBarSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>

				{/* ── Linha 3: Admissões por Mês + Faixa Etária ── */}
				<div className="grid grid-cols-2 gap-4">
					{/* 		<ChartCard title="Admissões por Mês">
					<ResponsiveContainer width="100%" height={180}>
						<LineChart data={admissoesPorMes} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid {...gridProps} />
							<XAxis dataKey="mes" tick={axisStyle} />
							<YAxis tick={axisStyle} allowDecimals={false} />
							<Tooltip formatter={(v) => [`${v} admissão(ões)`]} />
							<Line type="monotone" dataKey="admissoes" name="Admissões" stroke="#1e3a8a" strokeWidth={2} dot={{ fill: "#1e3a8a", r: 3 }} />
						</LineChart>
					</ResponsiveContainer>
				</ChartCard> */}

					{/* ── Por Região — largura total ── */}
					{porRegiao.length > 0 && (
						<ChartCard title="Contratos por Região">
							<ResponsiveContainer width="100%" height={160}>
								<BarChart
									data={porRegiao}
									margin={{
										top: 4,
										right: 16,
										left: 0,
										bottom: 0,
									}}
									barCategoryGap="25%"
								>
									<CartesianGrid {...gridProps} />
									<XAxis dataKey="regiao" tick={axisStyle} />
									<YAxis
										tick={axisStyle}
										allowDecimals={false}
									/>
									<Tooltip
										formatter={(v) => [`${v} contrato(s)`]}
									/>
									<Bar
										dataKey="contratos"
										name="Contratos"
										fill="#6366f1"
										radius={[3, 3, 0, 0]}
										maxBarSize={48}
									/>
								</BarChart>
							</ResponsiveContainer>
						</ChartCard>
					)}

					<ChartCard title="Faixa Etária dos Titulares">
						<ResponsiveContainer width="100%" height={180}>
							<BarChart
								data={faixaEtaria}
								margin={{
									top: 4,
									right: 16,
									left: 0,
									bottom: 0,
								}}
								barCategoryGap="30%"
							>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="name" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip
									formatter={(v) => [`${v} titular(es)`]}
								/>
								<Bar
									dataKey="value"
									name="Titulares"
									radius={[3, 3, 0, 0]}
									maxBarSize={48}
								>
									{faixaEtaria.map((_, i) => (
										<Cell
											key={i}
											fill={COLORS[i % COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>
			</div>
		</>
	);
}
