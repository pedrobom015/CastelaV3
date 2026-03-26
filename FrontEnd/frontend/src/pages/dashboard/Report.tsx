import { useMemo, useState } from "react";
import {
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
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { getRecords } from "../../utils/dbfHelpers";
import { formatCurrency } from "../../utils/formatters";
import { PageHeader } from "../../components/common/PageHeader";

// ─── helpers ───────────────────────────────────────────────────────────────

function toYearMonth(date: unknown): string | null {
	if (!date) return null;
	const d = date instanceof Date ? date : new Date(date as string);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

function inRange(date: unknown, from: string, to: string): boolean {
	const ym = toYearMonth(date);
	if (!ym) return false;
	return ym >= from && ym <= to;
}

// ─── cores fixas ───────────────────────────────────────────────────────────
const blue   = "#1e3a8a";
const orange = "#ff914d";
const COLORS  = [blue, orange, "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const axisStyle = { fontSize: 10, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

// ─── tooltip ───────────────────────────────────────────────────────────────
function CurrencyTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { name: string; value: number; color: string }[];
	label?: string;
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-white border border-gray-200 shadow rounded px-3 py-2 text-xs">
			<p className="font-semibold text-gray-700 mb-1">{label}</p>
			{payload.map((p, i) => (
				<p key={i} style={{ color: p.color }}>
					{p.name}: {formatCurrency(p.value)}
				</p>
			))}
		</div>
	);
}

// ─── KPI card ──────────────────────────────────────────────────────────────
function KpiCard({
	label,
	value,
	sub,
	color = blue,
}: {
	label: string;
	value: string;
	sub?: string;
	color?: string;
}) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
			<div className="h-1" style={{ background: color }} />
			<div className="px-4 py-3">
				<p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
				<p className="text-xl font-bold" style={{ color }}>{value}</p>
				{sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
			</div>
		</div>
	);
}

// ─── chart card ────────────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
			<div className="px-4 pt-3 pb-1">
				<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
			</div>
			<div className="px-2 pb-3">{children}</div>
		</div>
	);
}

// ─── página ────────────────────────────────────────────────────────────────
export function ReportPage() {
	const { getTable } = useAppStore();
	const taxasTable  = getTable("taxas");
	const arqgrupTable = getTable("arqgrup");

	const [periodoIni, setPeriodoIni] = useState(defaultFrom);
	const [periodoFim, setPeriodoFim] = useState(defaultTo);

	const records = useMemo(
		() => getRecords(taxasTable).filter((r) => inRange(r.emissao_, periodoIni, periodoFim)),
		[taxasTable, periodoIni, periodoFim],
	);

	// ── KPIs ──
	const kpis = useMemo(() => {
		let emitido = 0, arrecadado = 0, inadimplente = 0, pagas = 0;
		records.forEach((r) => {
			const valor   = Number(r.valor   ?? 0);
			const valorpg = Number(r.valorpg ?? 0);
			const stat    = String(r.stat ?? "").trim();
			emitido     += valor;
			arrecadado  += valorpg;
			if (stat !== "B") inadimplente += valor - valorpg;
			if (stat === "B") pagas++;
		});
		const pct = records.length > 0 ? (pagas / records.length) * 100 : 0;
		return { emitido, arrecadado, inadimplente, pct, total: records.length, pagas };
	}, [records]);

	// ── Arrecadado por cobrador (top 8) ──
	const porCobrador = useMemo(() => {
		const map: Record<string, { arrecadado: number; emitido: number }> = {};
		records.forEach((r) => {
			const cod  = String(r.codcob ?? r.cobrador ?? "—").trim() || "—";
			if (!map[cod]) map[cod] = { arrecadado: 0, emitido: 0 };
			map[cod].arrecadado += Number(r.valorpg ?? 0);
			map[cod].emitido    += Number(r.valor   ?? 0);
		});
		return Object.entries(map)
			.map(([cod, v]) => ({ cobrador: cod, ...v }))
			.sort((a, b) => b.arrecadado - a.arrecadado)
			.slice(0, 8);
	}, [records]);

	// ── Distribuição por status ──
	const porStatus = useMemo(() => {
		const map: Record<string, number> = {};
		records.forEach((r) => {
			const stat = String(r.stat ?? "").trim() || "?";
			map[stat] = (map[stat] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);
	}, [records]);

	// ── Top grupos por inadimplência ──
	const gruposMap = useMemo(() => {
		const m: Record<string, string> = {};
		getRecords(arqgrupTable).forEach((g) => {
			const cod  = String(g.grup   ?? "").trim();
			const nome = String(g.classe ?? cod).trim();
			if (cod) m[cod] = nome;
		});
		return m;
	}, [arqgrupTable]);

	const porGrupo = useMemo(() => {
		const map: Record<string, number> = {};
		records.forEach((r) => {
			const stat = String(r.stat ?? "").trim();
			if (stat === "B") return;
			const cod  = String(r.grupo ?? "").trim() || "—";
			map[cod] = (map[cod] ?? 0) + (Number(r.valor ?? 0) - Number(r.valorpg ?? 0));
		});
		return Object.entries(map)
			.map(([cod, v]) => ({ grupo: gruposMap[cod] ?? cod, inadimplente: Math.round(v) }))
			.sort((a, b) => b.inadimplente - a.inadimplente)
			.slice(0, 8);
	}, [records, gruposMap]);

	return (
		<div className="p-0 flex flex-col gap-4">
			<PageHeader
				title="Resumo"
				subtitle="Resumo financeiro por período"
				actions={
					<div className="flex items-center gap-2 ml-auto">
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
					</div>
				}
			/>

			{/* KPI cards */}
			<div className="grid grid-cols-4 gap-4">
				<KpiCard
					label="Total Emitido"
					value={formatCurrency(kpis.emitido)}
					sub={`${kpis.total} taxa(s)`}
					color={blue}
				/>
				<KpiCard
					label="Total Arrecadado"
					value={formatCurrency(kpis.arrecadado)}
					sub={`${kpis.pagas} paga(s)`}
					color={blue}
				/>
				<KpiCard
					label="Inadimplente"
					value={formatCurrency(kpis.inadimplente)}
					sub={`${kpis.total - kpis.pagas} em aberto`}
					color={orange}
				/>
				<KpiCard
					label="Taxa de Quitação"
					value={`${kpis.pct.toFixed(1)}%`}
					sub={`${kpis.pagas} de ${kpis.total}`}
					color={kpis.pct >= 70 ? blue : orange}
				/>
			</div>

			{/* Gráficos */}
			<div className="grid grid-cols-2 gap-4">
				{/* Arrecadado por cobrador */}
				<ChartCard title="Arrecadado por Cobrador">
					<ResponsiveContainer width="100%" height={220}>
						<AreaChart data={porCobrador} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="gCobEmi" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%"  stopColor={orange} stopOpacity={0.2} />
									<stop offset="95%" stopColor={orange} stopOpacity={0} />
								</linearGradient>
								<linearGradient id="gCobArr" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%"  stopColor={blue}   stopOpacity={0.3} />
									<stop offset="95%" stopColor={blue}   stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid {...gridProps} />
							<XAxis dataKey="cobrador" tick={axisStyle} />
							<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
							<Tooltip content={<CurrencyTooltip />} />
							<Legend wrapperStyle={{ fontSize: 11 }} />
							<Area type="monotone" dataKey="emitido"    name="Emitido"    stroke={orange} strokeWidth={2} fill="url(#gCobEmi)" dot={false} />
							<Area type="monotone" dataKey="arrecadado" name="Arrecadado" stroke={blue}   strokeWidth={2} fill="url(#gCobArr)" dot={false} />
						</AreaChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* Distribuição por status */}
				<ChartCard title="Distribuição por Status">
					<ResponsiveContainer width="100%" height={220}>
						<PieChart>
							<Pie
								data={porStatus}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius={80}
								label={({ name, percent }) =>
									`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
								}
								labelLine={false}
							>
								{porStatus.map((_, i) => (
									<Cell key={i} fill={COLORS[i % COLORS.length]} />
								))}
							</Pie>
							<Tooltip formatter={(v) => [`${v} taxa(s)`, "Qtd"]} />
						</PieChart>
					</ResponsiveContainer>
				</ChartCard>
			</div>

			{/* Inadimplência por grupo — largura total */}
			<ChartCard title="Inadimplência por Grupo">
				<ResponsiveContainer width="100%" height={180}>
					<LineChart data={porGrupo} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey="grupo" tick={axisStyle} />
						<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
						<Tooltip content={<CurrencyTooltip />} />
						<Line type="monotone" dataKey="inadimplente" name="Inadimplente" stroke={orange} strokeWidth={2} dot={{ fill: orange, r: 4 }} />
					</LineChart>
				</ResponsiveContainer>
			</ChartCard>
		</div>
	);
}
