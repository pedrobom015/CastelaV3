import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	BarChart,
	Bar,
	AreaChart,
	Area,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { getRecords } from "../../utils/dbfHelpers";
import { formatCurrency } from "../../utils/formatters";
import { PageHeader, Btn } from "../../components/common/PageHeader";

// ─── helpers ───────────────────────────────────────────────────────────────

function toYearMonth(date: unknown): string | null {
	if (!date) return null;
	const d = date instanceof Date ? date : new Date(date as string);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function labelMes(ym: string) {
	const [year, month] = ym.split("-");
	const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
	return `${meses[parseInt(month) - 1]}/${year.slice(2)}`;
}

function monthsBetween(from: string, to: string): string[] {
	const result: string[] = [];
	const [fy, fm] = from.split("-").map(Number);
	const [ty, tm] = to.split("-").map(Number);
	let y = fy, m = fm;
	while (y < ty || (y === ty && m <= tm)) {
		result.push(`${y}-${String(m).padStart(2, "0")}`);
		m++;
		if (m > 12) { m = 1; y++; }
	}
	return result;
}

function defaultFrom(): string {
	const d = new Date();
	d.setMonth(d.getMonth() - 11);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function defaultTo(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── tipos ────────────────────────────────────────────────────────────────

type Metrica = "emitido" | "arrecadado" | "inadimplente" | "qtd_pagas" | "qtd_abertas";
type Agrupamento = "mes" | "cobrador" | "grupo";
type TipoGrafico = "area" | "bar" | "line";

const METRICAS: { value: Metrica; label: string }[] = [
	{ value: "emitido",       label: "Emitido (R$)" },
	{ value: "arrecadado",    label: "Arrecadado (R$)" },
	{ value: "inadimplente",  label: "Inadimplente (R$)" },
	{ value: "qtd_pagas",     label: "Qtd Taxas Pagas" },
	{ value: "qtd_abertas",   label: "Qtd Taxas em Aberto" },
];

const AGRUPAMENTOS: { value: Agrupamento; label: string }[] = [
	{ value: "mes",       label: "Por Mês" },
	{ value: "cobrador",  label: "Por Cobrador" },
	{ value: "grupo",     label: "Por Grupo" },
];

const GRAFICOS: { value: TipoGrafico; label: string }[] = [
	{ value: "area", label: "Área" },
	{ value: "bar",  label: "Barras" },
	{ value: "line", label: "Linha" },
];

const blue   = "#1e3a8a";
const orange = "#ff914d";

const axisStyle = { fontSize: 10, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

// ─── tooltip ──────────────────────────────────────────────────────────────

function CustomTooltip({
	active, payload, label, isCurrency,
}: {
	active?: boolean;
	payload?: { name: string; value: number; color: string }[];
	label?: string;
	isCurrency: boolean;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-white border border-gray-200 shadow rounded px-3 py-2 text-xs">
			<p className="font-semibold text-gray-700 mb-1">{label}</p>
			{payload.map((p, i) => (
				<p key={i} style={{ color: p.color }}>
					{p.name}: {isCurrency ? formatCurrency(p.value) : p.value}
				</p>
			))}
		</div>
	);
}

// ─── select ───────────────────────────────────────────────────────────────

function Select<T extends string>({
	label, value, options, onChange,
}: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as T)}
				className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
			>
				{options.map((o) => (
					<option key={o.value} value={o.value}>{o.label}</option>
				))}
			</select>
		</div>
	);
}

// ─── página ───────────────────────────────────────────────────────────────

export function RelatorioDinamicoPage() {
	const { getTable } = useAppStore();
	const taxasTable   = getTable("taxas");
	const arqgrupTable = getTable("arqgrup");

	const [periodoIni, setPeriodoIni] = useState(defaultFrom);
	const [periodoFim, setPeriodoFim] = useState(defaultTo);
	const [metrica,     setMetrica]     = useState<Metrica>("arrecadado");
	const [agrupamento, setAgrupamento] = useState<Agrupamento>("mes");
	const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("area");
	const [isPrintMode, setIsPrintMode] = useState(false);

	const meses = useMemo(
		() => monthsBetween(periodoIni, periodoFim),
		[periodoIni, periodoFim],
	);

	const gruposMap = useMemo(() => {
		const m: Record<string, string> = {};
		getRecords(arqgrupTable).forEach((g) => {
			const cod  = String(g.grup   ?? "").trim();
			const nome = String(g.classe ?? cod).trim();
			if (cod) m[cod] = nome;
		});
		return m;
	}, [arqgrupTable]);

	const dados = useMemo(() => {
		const map: Record<string, { emitido: number; arrecadado: number; inadimplente: number; qtd_pagas: number; qtd_abertas: number }> = {};

		if (agrupamento === "mes") {
			meses.forEach((m) => {
				map[m] = { emitido: 0, arrecadado: 0, inadimplente: 0, qtd_pagas: 0, qtd_abertas: 0 };
			});
		}

		getRecords(taxasTable).forEach((r) => {
			let chave = "";
			if (agrupamento === "mes") {
				const ym = toYearMonth(r.emissao_);
				if (!ym || !map[ym]) return;
				chave = ym;
			} else if (agrupamento === "cobrador") {
				chave = String(r.codcob ?? r.cobrador ?? "—").trim() || "—";
			} else {
				const cod = String(r.grupo ?? "").trim() || "—";
				chave = gruposMap[cod] ?? cod;
			}

			if (!map[chave]) map[chave] = { emitido: 0, arrecadado: 0, inadimplente: 0, qtd_pagas: 0, qtd_abertas: 0 };

			const valor   = Number(r.valor   ?? 0);
			const valorpg = Number(r.valorpg ?? 0);
			const stat    = String(r.stat ?? "").trim();

			map[chave].emitido      += valor;
			map[chave].arrecadado   += valorpg;
			if (stat !== "B") map[chave].inadimplente += valor - valorpg;
			if (stat === "B") map[chave].qtd_pagas++;
			else              map[chave].qtd_abertas++;
		});

		const entries = agrupamento === "mes"
			? meses.map((m) => ({ key: labelMes(m), ...map[m] }))
			: Object.entries(map)
				.map(([k, v]) => ({ key: k, ...v }))
				.sort((a, b) => b[metrica] - a[metrica])
				.slice(0, 12);

		return entries.map((e) => ({ name: e.key, valor: Math.round(e[metrica]) }));
	}, [taxasTable, meses, agrupamento, metrica, gruposMap]);

	const isCurrency = ["emitido", "arrecadado", "inadimplente"].includes(metrica);
	const yFormatter = isCurrency
		? (v: number) => `R$${(v / 1000).toFixed(0)}k`
		: (v: number) => String(v);

	const tooltipEl = <CustomTooltip isCurrency={isCurrency} />;
	const metricaLabel = METRICAS.find((m) => m.value === metrica)?.label ?? metrica;
	const agrupLabel   = AGRUPAMENTOS.find((a) => a.value === agrupamento)?.label ?? agrupamento;
	const tipoLabel    = GRAFICOS.find((g) => g.value === tipoGrafico)?.label ?? tipoGrafico;

	function handlePrint() { setIsPrintMode(true); }

	function renderChart() {
		const common = {
			data: dados,
			margin: { top: 4, right: 16, left: 0, bottom: 0 },
		};

		if (tipoGrafico === "bar") {
			return (
				<BarChart {...common} barCategoryGap="25%">
					<defs>
						<linearGradient id="gDinBar" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%"  stopColor={blue} stopOpacity={0.85} />
							<stop offset="95%" stopColor={blue} stopOpacity={0.4} />
						</linearGradient>
					</defs>
					<CartesianGrid {...gridProps} />
					<XAxis dataKey="name" tick={axisStyle} />
					<YAxis tick={axisStyle} tickFormatter={yFormatter} />
					<Tooltip content={tooltipEl} />
					<Bar dataKey="valor" name={metricaLabel} fill="url(#gDinBar)" radius={[1, 1, 0, 0]} maxBarSize={48} />
				</BarChart>
			);
		}

		if (tipoGrafico === "line") {
			return (
				<LineChart {...common}>
					<CartesianGrid {...gridProps} />
					<XAxis dataKey="name" tick={axisStyle} />
					<YAxis tick={axisStyle} tickFormatter={yFormatter} />
					<Tooltip content={tooltipEl} />
					<Line type="monotone" dataKey="valor" name={metricaLabel} stroke={orange} strokeWidth={2} dot={{ fill: orange, r: 4 }} />
				</LineChart>
			);
		}

		// area (default)
		return (
			<AreaChart {...common}>
				<defs>
					<linearGradient id="gDinArea" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%"  stopColor={blue} stopOpacity={0.2} />
						<stop offset="95%" stopColor={blue} stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid {...gridProps} />
				<XAxis dataKey="name" tick={axisStyle} />
				<YAxis tick={axisStyle} tickFormatter={yFormatter} />
				<Tooltip content={tooltipEl} />
				<Legend wrapperStyle={{ fontSize: 11 }} />
				<Area type="monotone" dataKey="valor" name={metricaLabel} stroke={blue} strokeWidth={2} fill="url(#gDinArea)" dot={false} />
			</AreaChart>
		);
	}

	// ── Modo prévia de impressão ──────────────────────────────────────────────
	const printStyles = `
		@media print {
			body > *:not(.rd-print-wrapper) { display: none !important; }
			.rd-print-wrapper { display:block !important; background:none !important; padding:0 !important; overflow:visible !important; }
			#rd-print-overlay { box-shadow:none !important; border-radius:0 !important; max-width:100% !important; padding:8mm !important; }
			.rd-no-print { display: none !important; }
			body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
			@page { size: A4 portrait; margin: 8mm; }
		}
	`;

	if (isPrintMode) return createPortal(
		<div className="rd-print-wrapper" style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"40px 16px" }} onClick={() => setIsPrintMode(false)}>
			<style>{printStyles}</style>

			<div id="rd-print-overlay" style={{ background:"white", borderRadius:8, padding:"20px 24px", width:"100%", maxWidth:776, boxShadow:"0 8px 40px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>

				{/* barra de controles — oculta ao imprimir */}
				<div className="rd-no-print" style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, paddingBottom:12, borderBottom:"1px solid #e5e7eb" }}>
					<span style={{ flex:1, fontSize:13, fontWeight:600, color:"#1e3a8a" }}>Prévia — Relatório Dinâmico</span>
					<button onClick={() => window.print()} style={{ background:"#1e3a8a", color:"white", border:"none", padding:"6px 18px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600 }}>🖨️ Imprimir</button>
					<button onClick={() => setIsPrintMode(false)} style={{ background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontSize:12 }}>✕ Sair</button>
				</div>

				{/* cabeçalho */}
				<h1 style={{ fontSize:"13pt", fontWeight:700, color:"#1e3a8a", margin:"0 0 3px" }}>Relatório Dinâmico</h1>
				<p style={{ fontSize:"9pt", color:"#6b7280", margin:"0 0 2px" }}>
					Métrica: <strong>{metricaLabel}</strong> &nbsp;|&nbsp; Agrupamento: <strong>{agrupLabel}</strong> &nbsp;|&nbsp; Visualização: <strong>{tipoLabel}</strong>
				</p>
				<p style={{ fontSize:"9pt", color:"#6b7280", margin:"0 0 16px" }}>
					Período: {periodoIni} até {periodoFim} &nbsp;|&nbsp; {dados.length} itens
				</p>

				{/* gráfico */}
				<div style={{ width:"100%", minWidth:0, overflow:"hidden" }}>
					<ResponsiveContainer width="100%" height={340}>
						{renderChart()}
					</ResponsiveContainer>
				</div>

			</div>
		</div>,
		document.body,
	);

	return (
		<div className="p-0 flex flex-col gap-4">
			<PageHeader
				title="Relatório Dinâmico"
				subtitle="Configure métrica, agrupamento e tipo de visualização"
				actions={
					<div className="flex items-center gap-3 ml-auto flex-wrap">
						<span className="text-xs text-gray-400 whitespace-nowrap">Período</span>
						<input
							type="month"
							value={periodoIni}
							max={periodoFim}
							onChange={(e) => setPeriodoIni(e.target.value)}
							className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
						/>
						<span className="text-xs text-gray-400">até</span>
						<input
							type="month"
							value={periodoFim}
							min={periodoIni}
							onChange={(e) => setPeriodoFim(e.target.value)}
							className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
						/>
						<Btn size="sm" icon="🖨️" onClick={handlePrint}>Imprimir</Btn>
					</div>
				}
			/>

			{/* Controles */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-6 flex-wrap">
				<Select label="Métrica"      value={metrica}     options={METRICAS}     onChange={setMetrica} />
				<Select label="Agrupar por"  value={agrupamento} options={AGRUPAMENTOS} onChange={setAgrupamento} />
				<Select label="Visualização" value={tipoGrafico} options={GRAFICOS}     onChange={setTipoGrafico} />
				<span className="ml-auto text-xs text-gray-400">{dados.length} itens</span>
			</div>

			{/* Gráfico */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
				<div className="px-4 pt-3 pb-1">
					<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
						{metricaLabel} — {AGRUPAMENTOS.find((a) => a.value === agrupamento)?.label}
					</p>
				</div>
				<div className="px-2 pb-3">
					<ResponsiveContainer width="100%" height={320}>
						{renderChart()}
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
