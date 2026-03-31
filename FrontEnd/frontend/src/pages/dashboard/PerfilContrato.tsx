import { useMemo, useState } from "react";
import {
	ComposedChart,
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
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
			<div className="px-4 pt-3 pb-1">
				<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
					{title}
				</p>
				{subtitle && (
					<p className="text-[10px] text-gray-400 mt-0.5">
						{subtitle}
					</p>
				)}
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

	// ── Por Grupo — famílias + representatividade financeira ─────────────────────
	const porGrupo = useMemo(() => {
		const countMap: Record<string, number> = {};
		const codigoToGrupo: Record<string, string> = {};
		contratos.forEach((r) => {
			const grupCod = String(r.grupo ?? "").trim() || "—";
			const codigo = String(r.codigo ?? "").trim().padStart(9, "0");
			countMap[grupCod] = (countMap[grupCod] ?? 0) + 1;
			codigoToGrupo[codigo] = grupCod;
		});

		const arrecadadoMap: Record<string, number> = {};
		getRecords(taxasTable).forEach((r) => {
			const codigo = String(r.codigo ?? "").trim().padStart(9, "0");
			const grup = codigoToGrupo[codigo];
			if (!grup) return;
			arrecadadoMap[grup] =
				(arrecadadoMap[grup] ?? 0) + Number(r.valorpg ?? 0);
		});

		return Object.entries(countMap)
			.map(([cod, v]) => ({
				grupo: cod,
				familias: v,
				arrecadado: Math.round((arrecadadoMap[cod] ?? 0) * 100) / 100,
			}))
			.sort((a, b) => b.familias - a.familias)
			.slice(0, 10);
	}, [contratos, taxasTable]);

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
				familias: v,
			}))
			.sort((a, b) => b.familias - a.familias)
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
				familias: v,
			}))
			.sort((a, b) => b.familias - a.familias)
			.slice(0, 8);
	}, [contratos, regiaoNomes]);

	// ── Idade × Gênero ──────────────────────────────────────────────────────────
	const idadeGenero = useMemo(() => {
		const FAIXAS = ["< 30", "30–44", "45–59", "60+", "N/D"] as const;
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

	// ── Admissões por Mês ────────────────────────────────────────────────────────
	const admissoesPorMes = useMemo(() => {
		const map: Record<string, number> = {};
		contratos.forEach((r) => {
			const ym = yearMonth(r.admissao as Date | null);
			if (ym) map[ym] = (map[ym] ?? 0) + 1;
		});
		return Object.entries(map)
			.sort(([a], [b]) => a.localeCompare(b))
			.slice(-24)
			.map(([ym, v]) => ({ mes: labelMes(ym), admissoes: v }));
	}, [contratos]);

	// ── Faixa Etária ─────────────────────────────────────────────────────────────
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
					title="Perfil de Famílias"
					subtitle="Representatividade dos grupos familiares"
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
						label="Total de Famílias"
						value={String(kpis.total)}
						color="#1e3a8a"
					/>
					<KpiCard
						label="Famílias Ativas"
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
						label="Suspensas"
						value={String(kpis.suspensos)}
						color="#f59e0b"
					/>
					<KpiCard
						label="Canceladas"
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
					<ChartCard title="Status das Famílias">
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
											`${v} família(s)`,
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

				{/* ── Linha 2: Famílias por Grupo (financeiro) + Por Cobrador ── */}
				<div className="grid grid-cols-2 gap-4">
					<ChartCard
						title="Famílias por Grupo"
						subtitle="Número de famílias e valor arrecadado por grupo"
					>
						<ResponsiveContainer width="100%" height={210}>
							<ComposedChart
								data={porGrupo}
								margin={{
									top: 4,
									right: 40,
									left: 0,
									bottom: 0,
								}}
								barCategoryGap="25%"
							>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="grupo" tick={axisStyle} />
								<YAxis
									yAxisId="familias"
									tick={axisStyle}
									allowDecimals={false}
									width={30}
								/>
								<YAxis
									yAxisId="arrecadado"
									orientation="right"
									tick={axisStyle}
									tickFormatter={(v) =>
										v >= 1000
											? `${(v / 1000).toFixed(0)}k`
											: String(v)
									}
									width={36}
								/>
								<Tooltip
									formatter={(v, name) =>
										name === "Famílias"
											? [`${v} família(s)`, name]
											: [formatCurrency(Number(v)), name]
									}
								/>
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Bar
									yAxisId="familias"
									dataKey="familias"
									name="Famílias"
									fill="#1e3a8a"
									radius={[3, 3, 0, 0]}
									maxBarSize={40}
								/>
								<Line
									yAxisId="arrecadado"
									type="monotone"
									dataKey="arrecadado"
									name="Arrecadado"
									stroke="#10b981"
									strokeWidth={2}
									dot={{ fill: "#10b981", r: 3 }}
								/>
							</ComposedChart>
						</ResponsiveContainer>
					</ChartCard>

					<ChartCard title="Famílias por Cobrador">
						<ResponsiveContainer width="100%" height={210}>
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
									formatter={(v) => [`${v} família(s)`]}
								/>
								<Bar
									dataKey="familias"
									name="Famílias"
									fill="#ff914d"
									radius={[3, 3, 0, 0]}
									maxBarSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>

				{/* ── Linha 3: Por Região + Faixa Etária ── */}
				<div className="grid grid-cols-2 gap-4">
					{porRegiao.length > 0 && (
						<ChartCard title="Famílias por Região">
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
										formatter={(v) => [`${v} família(s)`]}
									/>
									<Bar
										dataKey="familias"
										name="Famílias"
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
