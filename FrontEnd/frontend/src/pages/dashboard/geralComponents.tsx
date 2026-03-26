import { formatCurrency } from "../../utils/formatters";
export { COLORS } from "./geralUtils";

export function CurrencyTooltip({
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

export function KpiCard({
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

export function ChartCard({
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
