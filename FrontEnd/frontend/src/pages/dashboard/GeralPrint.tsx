import { createPortal } from "react-dom";
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
import { formatCurrency } from "../../utils/formatters";
import { COLORS, CurrencyTooltip } from "./geralComponents";
import type { GeralData } from "./geralHooks";

const axisStyle = { fontSize: 10, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

const printStyles = `
	@media print {
		body > *:not(.vg-print-wrapper) { display: none !important; }
		.vg-print-wrapper { display:block !important; background:none !important; padding:0 !important; overflow:visible !important; }
		#vg-print-overlay { box-shadow:none !important; border-radius:0 !important; max-width:100% !important; padding:8mm !important; }
		.vg-no-print { display: none !important; }
		body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
		@page { size: A4 portrait; margin: 8mm; }
	}
`;

interface GeralPrintProps {
	data: GeralData;
	periodoIni: string;
	periodoFim: string;
	blue: string;
	orange: string;
	onClose: () => void;
}


export function GeralPrint({ data, periodoIni, periodoFim, blue, orange, onClose }: GeralPrintProps) {
	const { kpis, porCobrador, porFormaPgto, emitidoPago, taxasPorMes, arrecVsInadim, admissoesPorMes } = data;

	return createPortal(
		<div
			className="vg-print-wrapper"
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				background: "rgba(0,0,0,0.45)",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "center",
				overflowY: "auto",
				padding: "40px 16px",
			}}
			onClick={onClose}
		>
			<style>{printStyles}</style>

			<div
				id="vg-print-overlay"
				style={{
					background: "white",
					borderRadius: 8,
					padding: "20px 24px",
					width: "100%",
					maxWidth: 776,
					boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* barra de controles */}
				<div
					className="vg-no-print"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 16,
						paddingBottom: 12,
						borderBottom: "1px solid #e5e7eb",
					}}
				>
					<span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e3a8a" }}>
						Prévia — Visão Geral
					</span>
					<button
						onClick={() => window.print()}
						style={{
							background: "#1e3a8a",
							color: "white",
							border: "none",
							padding: "6px 18px",
							borderRadius: 6,
							cursor: "pointer",
							fontSize: 12,
							fontWeight: 600,
						}}
					>
						🖨️ Imprimir
					</button>
					<button
						onClick={onClose}
						style={{
							background: "#f3f4f6",
							color: "#374151",
							border: "1px solid #e5e7eb",
							padding: "6px 14px",
							borderRadius: 6,
							cursor: "pointer",
							fontSize: 12,
						}}
					>
						✕ Sair
					</button>
				</div>

				{/* cabeçalho */}
				<h1 style={{ fontSize: "13pt", fontWeight: 700, color: "#1e3a8a", margin: "0 0 2px" }}>
					Visão Geral
				</h1>
				<p style={{ fontSize: "9pt", color: "#6b7280", margin: "0 0 16px" }}>
					Período: {periodoIni} até {periodoFim}
				</p>

				{/* KPIs */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4,1fr)",
						gap: 10,
						marginBottom: 20,
					}}
				>
					{[
						{ label: "Total Emitido", value: formatCurrency(kpis.emitido), sub: `${kpis.total} taxa(s)`, color: blue },
						{ label: "Total Arrecadado", value: formatCurrency(kpis.arrecadado), sub: `${kpis.pagas} paga(s)`, color: blue },
						{ label: "Inadimplente", value: formatCurrency(kpis.inadimplente), sub: `${kpis.total - kpis.pagas} em aberto`, color: orange },
						{ label: "Taxa de Quitação", value: `${kpis.pct.toFixed(1)}%`, sub: `${kpis.pagas} de ${kpis.total}`, color: kpis.pct >= 70 ? blue : orange },
					].map((k, i) => (
						<div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
							<div style={{ height: 4, background: k.color }} />
							<div style={{ padding: "7px 10px" }}>
								<p style={{ fontSize: "7pt", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 2px" }}>
									{k.label}
								</p>
								<p style={{ fontSize: "14pt", fontWeight: 700, color: k.color, margin: 0 }}>
									{k.value}
								</p>
								<p style={{ fontSize: "7pt", color: "#9ca3af", margin: "2px 0 0" }}>
									{k.sub}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* linha 1: Arrecadado por Cobrador + Distribuição por Status */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, breakInside: "avoid" }}>
					<div style={{ minWidth: 0, overflow: "hidden" }}>
						<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
							Arrecadado por Cobrador
						</p>
						<ResponsiveContainer width="100%" height={165}>
							<AreaChart data={porCobrador} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="pCobEmi" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={orange} stopOpacity={0.2} />
										<stop offset="95%" stopColor={orange} stopOpacity={0} />
									</linearGradient>
									<linearGradient id="pCobArr" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={blue} stopOpacity={0.3} />
										<stop offset="95%" stopColor={blue} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="cobrador" tick={axisStyle} />
								<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
								<Tooltip content={<CurrencyTooltip />} />
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Area type="monotone" dataKey="emitido" name="Emitido" stroke={orange} strokeWidth={2} fill="url(#pCobEmi)" dot={false} />
								<Area type="monotone" dataKey="arrecadado" name="Arrecadado" stroke={blue} strokeWidth={2} fill="url(#pCobArr)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div style={{ minWidth: 0, overflow: "hidden" }}>
						<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
							Forma de Pagamento
						</p>
						<ResponsiveContainer width="100%" height={165}>
							<BarChart data={porFormaPgto} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
								<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
								<XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
								<YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={72} />
								<Tooltip formatter={(v) => [`${v} contrato(s)`]} />
								<Bar dataKey="value" name="Contratos" radius={[0, 4, 4, 0]} maxBarSize={20}>
									{porFormaPgto.map((_, i) => (
										<Cell key={i} fill={COLORS[i % COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* linha 2: Emitido vs Pago + Taxas por Mês */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, breakInside: "avoid" }}>
					<div style={{ minWidth: 0, overflow: "hidden" }}>
						<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
							Emitido vs Pago
						</p>
						<ResponsiveContainer width="100%" height={165}>
							<AreaChart data={emitidoPago} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="pEmitido" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={orange} stopOpacity={0.2} />
										<stop offset="95%" stopColor={orange} stopOpacity={0} />
									</linearGradient>
									<linearGradient id="pPago" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={blue} stopOpacity={0.3} />
										<stop offset="95%" stopColor={blue} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="mes" tick={axisStyle} />
								<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
								<Tooltip content={<CurrencyTooltip />} />
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Area type="monotone" dataKey="emitido" name="Emitido" stroke={orange} strokeWidth={2} fill="url(#pEmitido)" dot={false} />
								<Area type="monotone" dataKey="pago" name="Pago" stroke={blue} strokeWidth={2} fill="url(#pPago)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div style={{ minWidth: 0, overflow: "hidden" }}>
						<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
							Taxas por Mês — Pagas vs Em Aberto
						</p>
						<ResponsiveContainer width="100%" height={165}>
							<BarChart data={taxasPorMes} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="25%">
								<CartesianGrid {...gridProps} />
								<XAxis dataKey="mes" tick={axisStyle} />
								<YAxis tick={axisStyle} allowDecimals={false} />
								<Tooltip />
								<Legend wrapperStyle={{ fontSize: 10 }} />
								<Bar dataKey="pagas" name="Pagas" stackId="a" fill={blue} radius={[0, 0, 0, 0]} maxBarSize={48} />
								<Bar dataKey="abertas" name="Em Aberto" stackId="a" fill={orange} radius={[1, 1, 0, 0]} maxBarSize={48} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* largura total: Arrecadado vs Inadimplente */}
				<div style={{ marginBottom: 20, breakInside: "avoid" }}>
					<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
						Arrecadado vs Inadimplente
					</p>
					<ResponsiveContainer width="100%" height={150}>
						<AreaChart data={arrecVsInadim} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<defs>
								<linearGradient id="pArrecadado" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={blue} stopOpacity={0.2} />
									<stop offset="95%" stopColor={blue} stopOpacity={0} />
								</linearGradient>
								<linearGradient id="pPendente" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor={orange} stopOpacity={0.3} />
									<stop offset="95%" stopColor={orange} stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid {...gridProps} />
							<XAxis dataKey="mes" tick={axisStyle} />
							<YAxis tick={axisStyle} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
							<Tooltip content={<CurrencyTooltip />} />
							<Legend wrapperStyle={{ fontSize: 10 }} />
							<Area type="monotone" dataKey="arrecadado" name="Arrecadado" stroke={blue} strokeWidth={2} fill="url(#pArrecadado)" dot={false} />
							<Area type="monotone" dataKey="pendente" name="Inadimplente" stroke={orange} strokeWidth={2} fill="url(#pPendente)" dot={false} />
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* largura total: Admissões por Mês */}
				<div style={{ breakInside: "avoid" }}>
					<p style={{ fontSize: "7pt", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>
						Admissões por Mês
					</p>
					<ResponsiveContainer width="100%" height={150}>
						<LineChart data={admissoesPorMes} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
							<CartesianGrid {...gridProps} />
							<XAxis dataKey="mes" tick={axisStyle} />
							<YAxis tick={axisStyle} allowDecimals={false} />
							<Tooltip formatter={(v) => [`${v} admissão(ões)`]} />
							<Line type="monotone" dataKey="admissoes" name="Admissões" stroke={blue} strokeWidth={2} dot={{ fill: blue, r: 3 }} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>,
		document.body,
	);
}
