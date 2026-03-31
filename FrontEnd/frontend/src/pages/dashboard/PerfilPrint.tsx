import { createPortal } from "react-dom";
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
import { formatCurrency } from "../../utils/formatters";
import { COLORS } from "./geralUtils";

const axisStyle = { fontSize: 9, fill: "#9ca3af" };
const gridProps = { strokeDasharray: "3 3", stroke: "#f0f0f0" };

const printStyles = `
	@media print {
		body > *:not(.pp-print-wrapper) { display: none !important; }
		.pp-print-wrapper { display:block !important; background:none !important; padding:0 !important; overflow:visible !important; }
		#pp-print-overlay { box-shadow:none !important; border-radius:0 !important; max-width:100% !important; padding:8mm !important; }
		.pp-no-print { display: none !important; }
		body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
		@page { size: A4 portrait; margin: 8mm; }
	}
`;

function SectionLabel({ children }: { children: string }) {
	return (
		<p
			style={{
				fontSize: "7pt",
				fontWeight: 600,
				color: "#6b7280",
				textTransform: "uppercase",
				letterSpacing: "0.05em",
				margin: "0 0 4px",
			}}
		>
			{children}
		</p>
	);
}

export interface PerfilPrintData {
	kpis: {
		total: number;
		ativos: number;
		cancelados: number;
		suspensos: number;
		inadimplentes: number;
	};
	taxasKpis: { emitido: number; arrecadado: number; inadimplencia: number };
	porSituacao: { name: string; value: number; cor: string }[];
	idadeGenero: { faixa: string; M: number; F: number }[];
	porGrupo: { grupo: string; familias: number; arrecadado: number }[];
	porCobrador: { cobrador: string; familias: number }[];
	admissoesPorMes: { mes: string; admissoes: number }[];
	faixaEtaria: { name: string; value: number }[];
	porRegiao: { regiao: string; familias: number }[];
}

interface PerfilPrintProps {
	data: PerfilPrintData;
	onClose: () => void;
}

export function PerfilPrint({ data, onClose }: PerfilPrintProps) {
	const {
		kpis,
		taxasKpis,
		porSituacao,
		idadeGenero,
		porGrupo,
		porCobrador,
		admissoesPorMes,
		faixaEtaria,
		porRegiao,
	} = data;

	const pctAtivos = kpis.total
		? ((kpis.ativos / kpis.total) * 100).toFixed(0)
		: "0";

	const kpiStatus = [
		{
			label: "Total Contratos",
			value: String(kpis.total),
			color: "#1e3a8a",
		},
		{
			label: "Ativos",
			value: `${kpis.ativos} (${pctAtivos}%)`,
			color: "#10b981",
		},
		{
			label: "Inadimplentes",
			value: String(kpis.inadimplentes),
			color: "#ff914d",
		},
		{ label: "Suspensos", value: String(kpis.suspensos), color: "#f59e0b" },
		{
			label: "Cancelados",
			value: String(kpis.cancelados),
			color: "#ef4444",
		},
	];

	const kpiFinanc = [
		{
			label: "Total Emitido",
			value: formatCurrency(taxasKpis.emitido),
			color: "#1e3a8a",
		},
		{
			label: "Total Arrecadado",
			value: formatCurrency(taxasKpis.arrecadado),
			color: "#10b981",
		},
		{
			label: "Inadimplência Financeira",
			value: formatCurrency(taxasKpis.inadimplencia),
			color: "#ff914d",
		},
	];

	return createPortal(
		<div
			className="pp-print-wrapper"
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
				id="pp-print-overlay"
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
				{/* Barra de controles */}
				<div
					className="pp-no-print"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 16,
						paddingBottom: 12,
						borderBottom: "1px solid #e5e7eb",
					}}
				>
					<span
						style={{
							flex: 1,
							fontSize: 13,
							fontWeight: 600,
							color: "#1e3a8a",
						}}
					>
						Prévia — Perfil de Contratos
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

				{/* Cabeçalho */}
				<h1
					style={{
						fontSize: "13pt",
						fontWeight: 700,
						color: "#1e3a8a",
						margin: "0 0 2px",
					}}
				>
					Perfil de Contratos
				</h1>
				<p
					style={{
						fontSize: "9pt",
						color: "#6b7280",
						margin: "0 0 16px",
					}}
				>
					Gerado em {new Date().toLocaleDateString("pt-BR")} — Base
					das famílias por grupo
				</p>

				{/* KPIs status */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(5,1fr)",
						gap: 8,
						marginBottom: 12,
					}}
				>
					{kpiStatus.map((k, i) => (
						<div
							key={i}
							style={{
								border: "1px solid #e5e7eb",
								borderRadius: 6,
								overflow: "hidden",
							}}
						>
							<div style={{ height: 3, background: k.color }} />
							<div style={{ padding: "5px 8px" }}>
								<p
									style={{
										fontSize: "6pt",
										color: "#9ca3af",
										textTransform: "uppercase",
										letterSpacing: "0.04em",
										margin: "0 0 2px",
									}}
								>
									{k.label}
								</p>
								<p
									style={{
										fontSize: "12pt",
										fontWeight: 700,
										color: k.color,
										margin: 0,
									}}
								>
									{k.value}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* KPIs financeiros */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3,1fr)",
						gap: 8,
						marginBottom: 20,
					}}
				>
					{kpiFinanc.map((k, i) => (
						<div
							key={i}
							style={{
								border: "1px solid #e5e7eb",
								borderRadius: 6,
								overflow: "hidden",
							}}
						>
							<div style={{ height: 3, background: k.color }} />
							<div style={{ padding: "5px 8px" }}>
								<p
									style={{
										fontSize: "6pt",
										color: "#9ca3af",
										textTransform: "uppercase",
										letterSpacing: "0.04em",
										margin: "0 0 2px",
									}}
								>
									{k.label}
								</p>
								<p
									style={{
										fontSize: "12pt",
										fontWeight: 700,
										color: k.color,
										margin: 0,
									}}
								>
									{k.value}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Linha 1: Situação + Idade × Gênero */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
						marginBottom: 20,
						breakInside: "avoid",
					}}
				>
					<div style={{ minWidth: 0 }}>
						<SectionLabel>Distribuição por Situação</SectionLabel>
						<ResponsiveContainer width="100%" height={155}>
							<PieChart>
								<Pie
									data={porSituacao}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={58}
									innerRadius={28}
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
									wrapperStyle={{ fontSize: 9 }}
									iconSize={7}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div style={{ minWidth: 0 }}>
						<SectionLabel>
							Idade × Gênero dos Titulares
						</SectionLabel>
						<ResponsiveContainer width="100%" height={155}>
							<BarChart
								data={idadeGenero}
								margin={{
									top: 4,
									right: 8,
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
								<Legend wrapperStyle={{ fontSize: 9 }} />
								<Bar
									dataKey="M"
									name="Masculino"
									fill="#1e3a8a"
									radius={[2, 2, 0, 0]}
									maxBarSize={18}
								/>
								<Bar
									dataKey="F"
									name="Feminino"
									fill="#ec4899"
									radius={[2, 2, 0, 0]}
									maxBarSize={18}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Linha 2: Por Grupo + Por Cobrador */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
						marginBottom: 20,
						breakInside: "avoid",
					}}
				>
					<div style={{ minWidth: 0 }}>
						<SectionLabel>Contratos por Grupo</SectionLabel>
						<ResponsiveContainer width="100%" height={155}>
							<BarChart
								data={porGrupo}
								margin={{
									top: 4,
									right: 8,
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
									dataKey="familias"
									name="Contratos"
									fill="#1e3a8a"
									radius={[2, 2, 0, 0]}
									maxBarSize={32}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<div style={{ minWidth: 0 }}>
						<SectionLabel>Contratos por Cobrador</SectionLabel>
						<ResponsiveContainer width="100%" height={155}>
							<BarChart
								data={porCobrador}
								margin={{
									top: 4,
									right: 8,
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
									dataKey="familias"
									name="Contratos"
									fill="#ff914d"
									radius={[2, 2, 0, 0]}
									maxBarSize={32}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Linha 3: Admissões por Mês + Faixa Etária */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 12,
						marginBottom: 20,
						breakInside: "avoid",
					}}
				>
					<div style={{ minWidth: 0 }}>
						{/* Por Região — largura total */}
						{porRegiao.length > 0 && (
							<div style={{ breakInside: "avoid" }}>
								<SectionLabel>
									Contratos por Região
								</SectionLabel>
								<ResponsiveContainer width="100%" height={140}>
									<BarChart
										data={porRegiao}
										margin={{
											top: 4,
											right: 8,
											left: 0,
											bottom: 0,
										}}
										barCategoryGap="25%"
									>
										<CartesianGrid {...gridProps} />
										<XAxis
											dataKey="regiao"
											tick={axisStyle}
										/>
										<YAxis
											tick={axisStyle}
											allowDecimals={false}
										/>
										<Tooltip
											formatter={(v) => [
												`${v} contrato(s)`,
											]}
										/>
										<Legend
											wrapperStyle={{ fontSize: 9 }}
										/>
										<Bar
											dataKey="familias"
											name="Contratos"
											fill="#6366f1"
											radius={[2, 2, 0, 0]}
											maxBarSize={48}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>
					<div style={{ minWidth: 0 }}>
						<SectionLabel>Faixa Etária dos Titulares</SectionLabel>
						<ResponsiveContainer width="100%" height={145}>
							<BarChart
								data={faixaEtaria}
								margin={{
									top: 4,
									right: 8,
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
									radius={[2, 2, 0, 0]}
									maxBarSize={40}
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
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}
