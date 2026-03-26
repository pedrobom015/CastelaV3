export const FORMAPGTO_LABEL: Record<string, string> = {
	"01": "Mensalidade",
	"02": "Carnê",
	"03": "Déb. Auto.",
	"04": "Boleto",
	"05": "Cartão",
};

export const COLORS = [
	"#1e3a8a",
	"#ff914d",
	"#6366f1",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#ec4899",
];

export function toYearMonth(date: unknown): string | null {
	if (!date) return null;
	const d = date instanceof Date ? date : new Date(date as string);
	if (isNaN(d.getTime())) return null;
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function labelMes(ym: string) {
	const [year, month] = ym.split("-");
	const meses = [
		"Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
		"Jul", "Ago", "Set", "Out", "Nov", "Dez",
	];
	return `${meses[parseInt(month) - 1]}/${year.slice(2)}`;
}

export function monthsBetween(from: string, to: string): string[] {
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

export function defaultFrom(): string {
	const d = new Date();
	d.setMonth(d.getMonth() - 11);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function defaultTo(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function inRange(date: unknown, from: string, to: string): boolean {
	const ym = toYearMonth(date);
	if (!ym) return false;
	return ym >= from && ym <= to;
}
