import { useState } from "react";
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { formatCurrency } from "../../utils/formatters";
import { PageHeader, Btn } from "../../components/common/PageHeader";
import { defaultFrom, defaultTo, COLORS } from "./geralUtils";

import { CurrencyTooltip, KpiCard, ChartCard } from "./geralComponents";
import { useGeralData } from "./geralHooks";
import { GeralPrint } from "./GeralPrint";

const axisStyle = { fontSize: 10, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

const blue = "#1e3a8a";
const orange = "#ff914d";


export function GeralPage() {
	const { getTable } = useAppStore();

	const [periodoIni, setPeriodoIni] = useState(defaultFrom);
	const [periodoFim, setPeriodoFim] = useState(defaultTo);
	const [isPrintMode, setIsPrintMode] = useState(false);

	const taxasTable = getTable("taxas");
	const gruposTable = getTable("grupos");

	const data = useGeralData(taxasTable, gruposTable, periodoIni, periodoFim);
	const { kpis, porCobrador, porFormaPgto, emitidoPago, taxasPorMes, arrecVsInadim, admissoesPorMes } = data;

	return (
		<>
			{isPrintMode && (
				<GeralPrint
					data={data}
					periodoIni={periodoIni}
					periodoFim={periodoFim}
					blue={blue}
					orange={orange}
					onClose={() => setIsPrintMode(false)}
				/>
			)}

			<div className="p-0 flex flex-col gap-4">
				<PageHeader
					title="Visão Geral"
					subtitle="Visão financeira por período"
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
							<Btn size="sm" icon="🖨️" onClick={() => setIsPrintMode(true)}>
								Imprimir
							</Btn>
						</div>
					}
				/>

				<div className="flex flex-col gap-4">
					{/* KPI cards */}
					<div className="grid grid-cols-4 gap-4">
						<KpiCard label="Total Emitido" value={formatCurrency(kpis.emitido)} sub={`${kpis.total} taxa(s)`} color={blue} />
						<KpiCard label="Total Arrecadado" value={formatCurrency(kpis.arrecadado)} sub={`${kpis.pagas} paga(s)`} color={blue} />
						<KpiCard label="Inadimplente" value={formatCurrency(kpis.inadimplente)} sub={`${kpis.total - kpis.pagas} em aberto`} color={orange} />
						<KpiCard
							label="Taxa de Quitação"
							value={`${kpis.pct.toFixed(1)}%`}
							sub={`${kpis.pagas} de ${kpis.total}`}
							color={kpis.pct >= 70 ? blue : orange}
						/>
					</div>

					{/* Arrecadado por Cobrador + Distribuição por Status */}
					<div className="grid grid-cols-2 gap-4">
						<ChartCard title="Arrecadado por Cobrador">
							<ResponsiveContainer width="100%" height={200}>
								<AreaChart data={porCobrador} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="gCobEmi" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={orange} stopOpacity={0.2} />
											<stop offset="95%" stopColor={orange} stopOpacity={0} />
										</linearGradient>
										<linearGradient id="gCobArr" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={blue} stopOpacity={0.3} />
											<stop offset="95%" stopColor={blue} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid {...gridProps} />
									<XAxis dataKey="cobrador" tick={axisStyle} />
									<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
									<Tooltip content={<CurrencyTooltip />} />
									<Legend wrapperStyle={{ fontSize: 11 }} />
									<Area type="monotone" dataKey="emitido" name="Emitido" stroke={orange} strokeWidth={2} fill="url(#gCobEmi)" dot={false} />
									<Area type="monotone" dataKey="arrecadado" name="Arrecadado" stroke={blue} strokeWidth={2} fill="url(#gCobArr)" dot={false} />
								</AreaChart>
							</ResponsiveContainer>
						</ChartCard>

					<ChartCard title="Forma de Pagamento">
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={porFormaPgto} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} layout="vertical">
								<CartesianGrid {...gridProps} horizontal={false} />
								<XAxis type="number" tick={axisStyle} allowDecimals={false} />
								<YAxis type="category" dataKey="name" tick={axisStyle} width={76} />
								<Tooltip formatter={(v) => [`${v} contrato(s)`]} />
								<Bar dataKey="value" name="Contratos" radius={[0, 4, 4, 0]} maxBarSize={22}>
									{porFormaPgto.map((_, i) => (
										<Cell key={i} fill={COLORS[i % COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</ChartCard>





















					</div>

					{/* Emitido vs Pago + Taxas por Mês */}
					<div className="grid grid-cols-2 gap-4">
						<ChartCard title="Emitido vs Pago">
							<ResponsiveContainer width="100%" height={200}>
								<AreaChart data={emitidoPago} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="gEmitido" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={orange} stopOpacity={0.2} />
											<stop offset="95%" stopColor={orange} stopOpacity={0} />
										</linearGradient>
										<linearGradient id="gPago" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={blue} stopOpacity={0.3} />
											<stop offset="95%" stopColor={blue} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid {...gridProps} />
									<XAxis dataKey="mes" tick={axisStyle} />
									<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
									<Tooltip content={<CurrencyTooltip />} />
									<Legend wrapperStyle={{ fontSize: 11 }} />
									<Area type="monotone" dataKey="emitido" name="Emitido" stroke={orange} strokeWidth={2} fill="url(#gEmitido)" dot={false} />
									<Area type="monotone" dataKey="pago" name="Pago" stroke={blue} strokeWidth={2} fill="url(#gPago)" dot={false} />
								</AreaChart>
							</ResponsiveContainer>
						</ChartCard>

						<ChartCard title="Taxas por Mês — Pagas vs Em Aberto">
							<ResponsiveContainer width="100%" height={200}>
								<BarChart data={taxasPorMes} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="25%">
									<CartesianGrid {...gridProps} />
									<XAxis dataKey="mes" tick={axisStyle} />
									<YAxis tick={axisStyle} allowDecimals={false} />
									<Tooltip />
									<Legend wrapperStyle={{ fontSize: 11 }} />
									<Bar dataKey="pagas" name="Pagas" stackId="a" fill={blue} radius={[0, 0, 0, 0]} maxBarSize={48} />
									<Bar dataKey="abertas" name="Em Aberto" stackId="a" fill={orange} radius={[1, 1, 0, 0]} maxBarSize={48} />
								</BarChart>
							</ResponsiveContainer>
						</ChartCard>
					</div>

					{/* Arrecadado vs Inadimplente — largura total */}
					<ChartCard title="Arrecadado vs Inadimplente">
						<ResponsiveContainer width="100%" height={180}>
							<AreaChart data={arrecVsInadim} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="gArrecadado" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={blue} stopOpacity={0.2} />
										<stop offset="95%" stopColor={blue} stopOpacity={0} />
									</linearGradient>
									<linearGradient id="gPendente" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={orange} stopOpacity={0.3} />
										<stop offset="95%" stopColor={orange} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="mes" tick={axisStyle} />
								<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
								<Tooltip content={<CurrencyTooltip />} />
								<Legend wrapperStyle={{ fontSize: 11 }} />
								<Area type="monotone" dataKey="arrecadado" name="Arrecadado" stroke={blue} strokeWidth={2} fill="url(#gArrecadado)" dot={false} />
								<Area type="monotone" dataKey="pendente" name="Inadimplente" stroke={orange} strokeWidth={2} fill="url(#gPendente)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					</ChartCard>

					{/* Admissões por Mês — largura total */}
					<ChartCard title="Admissões por Mês">
						<ResponsiveContainer width="100%" height={180}>
							<LineChart data={admissoesPorMes} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="mes" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip formatter={(v) => [`${v} admissão(ões)`]} />
								<Line type="monotone" dataKey="admissoes" name="Admissões" stroke={blue} strokeWidth={2} dot={{ fill: blue, r: 3 }} />
							</LineChart>
						</ResponsiveContainer>
					</ChartCard>
				</div>
			</div>
		</>
	);
}
