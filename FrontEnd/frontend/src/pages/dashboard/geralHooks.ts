import { useMemo } from "react";
import { getRecords } from "../../utils/dbfHelpers";
import { toYearMonth, labelMes, monthsBetween, inRange, FORMAPGTO_LABEL } from "./geralUtils";

type AnyTable = Parameters<typeof getRecords>[0];

export interface GeralData {
	meses: string[];
	kpis: {
		emitido: number;
		arrecadado: number;
		inadimplente: number;
		pct: number;
		total: number;
		pagas: number;
	};
	porCobrador: { cobrador: string; arrecadado: number; emitido: number }[];
	porFormaPgto: { name: string; value: number }[];
	arrecVsInadim: { mes: string; arrecadado: number; pendente: number }[];
	emitidoPago: { mes: string; emitido: number; pago: number }[];
	taxasPorMes: { mes: string; pagas: number; abertas: number }[];
	admissoesPorMes: { mes: string; admissoes: number }[];
}

export function useGeralData(
	taxasTable: AnyTable,
	gruposTable: AnyTable,
	periodoIni: string,
	periodoFim: string,
): GeralData {
	const meses = useMemo(
		() => monthsBetween(periodoIni, periodoFim),
		[periodoIni, periodoFim],
	);

	const records = useMemo(
		() =>
			getRecords(taxasTable).filter((r) =>
				inRange(r.emissao_, periodoIni, periodoFim),
			),
		[taxasTable, periodoIni, periodoFim],
	);

	const kpis = useMemo(() => {
		let emitido = 0, arrecadado = 0, inadimplente = 0, pagas = 0;
		records.forEach((r) => {
			const valor = Number(r.valor ?? 0);
			const valorpg = Number(r.valorpg ?? 0);
			const stat = String(r.stat ?? "").trim();
			emitido += valor;
			arrecadado += valorpg;
			if (stat !== "B") inadimplente += valor - valorpg;
			if (stat === "B") pagas++;
		});
		const pct = records.length > 0 ? (pagas / records.length) * 100 : 0;
		return { emitido, arrecadado, inadimplente, pct, total: records.length, pagas };
	}, [records]);

	const porCobrador = useMemo(() => {
		const map: Record<string, { arrecadado: number; emitido: number }> = {};
		records.forEach((r) => {
			const cod = String(r.codcob ?? r.cobrador ?? "—").trim() || "—";
			if (!map[cod]) map[cod] = { arrecadado: 0, emitido: 0 };
			map[cod].arrecadado += Number(r.valorpg ?? 0);
			map[cod].emitido += Number(r.valor ?? 0);
		});
		return Object.entries(map)
			.map(([cod, v]) => ({ cobrador: cod, ...v }))
			.sort((a, b) => b.arrecadado - a.arrecadado)
			.slice(0, 8);
	}, [records]);

	const porFormaPgto = useMemo(() => {
		const map: Record<string, number> = {};
		getRecords(gruposTable).forEach((r) => {
			const f = String(r.formapgto ?? "").trim() || "?";
			map[f] = (map[f] ?? 0) + 1;
		});
		return Object.entries(map)
			.map(([f, value]) => ({ name: FORMAPGTO_LABEL[f] ?? f, value }))
			.sort((a, b) => b.value - a.value);
	}, [gruposTable]);

	const arrecVsInadim = useMemo(() => {
		const arrec: Record<string, number> = {};
		const inadim: Record<string, number> = {};
		meses.forEach((m) => { arrec[m] = 0; inadim[m] = 0; });
		getRecords(taxasTable).forEach((r) => {
			const ymPg = toYearMonth(r.pgto_);
			if (ymPg && arrec[ymPg] !== undefined)
				arrec[ymPg] += Number(r.valorpg ?? 0);
			const stat = String(r.stat ?? "").trim();
			if (stat !== "B") {
				const ymEm = toYearMonth(r.emissao_);
				if (ymEm && inadim[ymEm] !== undefined)
					inadim[ymEm] += Number(r.valor ?? 0) - Number(r.valorpg ?? 0);
			}
		});
		return meses.map((m) => ({
			mes: labelMes(m),
			arrecadado: Math.round(arrec[m]),
			pendente: Math.round(inadim[m]),
		}));
	}, [taxasTable, meses]);

	const emitidoPago = useMemo(() => {
		const emitido: Record<string, number> = {};
		const pago: Record<string, number> = {};
		meses.forEach((m) => { emitido[m] = 0; pago[m] = 0; });
		getRecords(taxasTable).forEach((r) => {
			const ym = toYearMonth(r.emissao_);
			if (ym && emitido[ym] !== undefined) {
				emitido[ym] += Number(r.valor ?? 0);
				pago[ym] += Number(r.valorpg ?? 0);
			}
		});
		return meses.map((m) => ({
			mes: labelMes(m),
			emitido: Math.round(emitido[m]),
			pago: Math.round(pago[m]),
		}));
	}, [taxasTable, meses]);

	const taxasPorMes = useMemo(() => {
		const pagas: Record<string, number> = {};
		const abertas: Record<string, number> = {};
		meses.forEach((m) => { pagas[m] = 0; abertas[m] = 0; });
		getRecords(taxasTable).forEach((r) => {
			const ym = toYearMonth(r.emissao_);
			if (ym && pagas[ym] !== undefined) {
				const stat = String(r.stat ?? "").trim();
				if (stat === "B") pagas[ym]++;
				else abertas[ym]++;
			}
		});
		return meses.map((m) => ({
			mes: labelMes(m),
			pagas: pagas[m],
			abertas: abertas[m],
		}));
	}, [taxasTable, meses]);

	const admissoesPorMes = useMemo(() => {
		const map: Record<string, number> = {};
		getRecords(gruposTable).forEach((r) => {
			const ym = toYearMonth(r.admissao);
			if (ym) map[ym] = (map[ym] ?? 0) + 1;
		});
		return Object.entries(map)
			.sort(([a], [b]) => a.localeCompare(b))
			.slice(-24)
			.map(([ym, v]) => ({ mes: labelMes(ym), admissoes: v }));
	}, [gruposTable]);

	return {
		meses,
		kpis,
		porCobrador,
		porFormaPgto,
		arrecVsInadim,
		emitidoPago,
		taxasPorMes,
		admissoesPorMes,
	};
}
