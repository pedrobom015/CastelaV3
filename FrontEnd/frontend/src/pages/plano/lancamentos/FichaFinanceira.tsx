import { useMemo } from "react";
import type { Grupo } from "../../../types/models";
import { useAppStore } from "../../../store/appStore";
import { Mensalidade } from "./Mensalidade";
import { Adesao } from "./Adesao";
import { ProdutosServicos } from "./ProdutosServicos";
import { Estimativas } from "./Estimativas";

interface FichaFinanceiraProps {
	form: Grupo;
	initialData: Grupo;
	setField: (field: keyof Grupo, value: unknown) => void;
	readOnly: boolean;
	primary: string;
	primaryLight: string;
	grupoOpts: { value: string; label: string }[];
	categoriaOpts: { value: string; label: string }[];
	mode: "include" | "edit" | "view";
	adesaoNrParc: number;
	setAdesaoNrParc: (n: number) => void;
	adesaoDataInicio: Date | null;
	setAdesaoDataInicio: (d: Date) => void;
}

const TIPCOB_MULT: Record<string, number> = {
	M: 1,
	B: 2,
	T: 3,
	S: 6,
	A: 12,
};

export function FichaFinanceira({
	form,
	initialData,
	setField,
	readOnly,
	primary,
	primaryLight,
	grupoOpts,
	categoriaOpts,
	mode,
	adesaoNrParc,
	setAdesaoNrParc,
	adesaoDataInicio,
	setAdesaoDataInicio,
}: FichaFinanceiraProps) {
	const { getTable } = useAppStore();
	useAppStore((s) => s.tables); // re-renderiza quando qualquer tabela muda

	const classesTable = getTable("classes");
	const arqgrupTable = getTable("arqgrup");
	const circularTable = getTable("circular");
	const taxasTable = getTable("taxas");
	const parAdmTable = getTable("par_adm");
	const adencobTable = getTable("adencob");
	const adendosTable = getTable("adendos");
	const pradendoTable = getTable("pradendo");
	const inscritosTable = getTable("inscrits");

	const fichaData = useMemo(() => {
		if (!classesTable) return null;
		const tipcont = String(form.tipcont ?? "").trim();
		const grupoCode = String(form.grupo ?? "").trim();

		// Categoria efetiva: usa tipcont do contrato; fallback para arqgrup.classe se vazio/"00"
		const classeContrato = tipcont === "00" ? "" : tipcont;
		let classeEfetiva = classeContrato;
		if (!classeEfetiva && arqgrupTable) {
			const ag = arqgrupTable.records.find(
				(r) => !r._deleted && String(r.grup ?? "").trim() === grupoCode,
			);
			const classeGrupo = String(ag?.classe ?? "").trim();
			if (classeGrupo && classeGrupo !== "00")
				classeEfetiva = classeGrupo;
		}
		// Sem categoria explícita: vlmensal/vldepend não se aplicam
		const usouFallback =
			!classeContrato && classeEfetiva !== classeContrato;

		const classes = classeEfetiva
			? classesTable.records.find(
					(r) =>
						!r._deleted &&
						String(r.classcod ?? "").trim() === classeEfetiva,
				)
			: undefined;

		// prior precisa ser conhecido antes do lookup de circular (VIP usa mgrupvip)
		const prior = String(classes?.prior ?? "").trim();
		const parAdmRec = parAdmTable?.records.find((r) => !r._deleted);
		const mgrupvipParam = String(parAdmRec?.mgrupvip ?? "").trim();
		// VIP: lookup de circular usa grupo VIP definido nos parâmetros (par_adm.mgrupvip)
		const grupoParaCircular =
			prior === "S" && mgrupvipParam ? mgrupvipParam : grupoCode;

		// Última circular do grupo
		let ultimaCirc: {
			circ: string;
			valor: number;
			grupoUsado: string;
		} | null = null;
		if (circularTable && grupoCode) {
			const circs = circularTable.records.filter(
				(r) =>
					!r._deleted &&
					String(r.grupo ?? "").trim() === grupoParaCircular,
			);
			if (circs.length > 0) {
				const u = circs.reduce((a, b) =>
					String(a.circ ?? "") > String(b.circ ?? "") ? a : b,
				);
				ultimaCirc = {
					circ: String(u.circ ?? "").trim(),
					valor: Number(u.valor ?? 0),
					grupoUsado: grupoParaCircular,
				};
			}
		}

		// Mensalidade regular — sem categoria explícita, vlmensal/vldepend não entram
		const vlmensal = usouFallback ? 0 : Number(classes?.vlmensal ?? 0);
		const vldepend = usouFallback ? 0 : Number(classes?.vldepend ?? 0);
		// codigoPad necessário antes de nrdepend
		const codigoPadMensal = String(form.codigo ?? "").trim().padStart(9, "0");
		// Conta dependentes vivos da tabela INSCRITS (vivofalec="V", excluindo titular ehtitular="S")
		const nrdepend = inscritosTable
			? (inscritosTable.records ?? []).filter(
					(r) =>
						!r._deleted &&
						String(r.codigo ?? "").trim().padStart(9, "0") === codigoPadMensal &&
						String(r.ehtitular ?? "").trim() !== "S" &&
						String(r.vivofalec ?? "").trim() === "V",
				).length
			: Number(form.nrdepend ?? 0);
		const mforma = Math.max(1, parseInt(String(form.formapgto ?? "")) || 1);
		const rvlaux = ultimaCirc?.valor ?? 0;
		const baseMensal = rvlaux + vlmensal + nrdepend * vldepend;
		// VIP: multiplica pela periodicidade (paga de mforma em mforma circulares)
		const valorMensalidade =
			prior === "S" ? baseMensal * mforma : baseMensal;

		// Tipo 3 periódico: (vlmensal + nrdepend×vldepend) × mforma
		const valorPeriodico = (vlmensal + nrdepend * vldepend) * mforma;

		const totalMensal = valorMensalidade;

		// Previsão de cobrança baseada na tabela TAXAS
		const hoje = new Date();

		// Mensalidade Base só entra no Saldo Devedor se admissão > 30 dias
		const admissaoRaw = form.admissao;
		const admissaoDate: Date | null =
			admissaoRaw instanceof Date
				? admissaoRaw
				: typeof admissaoRaw === "string" && (admissaoRaw as string).trim()
					? (() => { const d = new Date(admissaoRaw as string); return isNaN(d.getTime()) ? null : d; })()
					: null;
		const admissaoMaior30Dias =
			admissaoDate !== null &&
			hoje.getTime() - admissaoDate.getTime() > 30 * 86400000;
		const codigoPad = String(form.codigo ?? "")
			.trim()
			.padStart(9, "0");
		const saitxaVal = String(form.saitxa ?? "").trim();
		const situacaoContrato = String(form.situacao ?? "").trim();

		// Tipos que representam cobranças de plano (circular/categoria)
		const isPlanTipo = (r: { tipo?: unknown }) =>
			[2, 3, 4].includes(parseInt(String(r.tipo ?? "").trim(), 10));
		// Tipo 5 (permanente) e 9 (parcelado) são gerenciados pelo produtosData — excluir dos extras
		const isProdutoTipo = (r: { tipo?: unknown }) =>
			[5, 9].includes(parseInt(String(r.tipo ?? "").trim(), 10));
		// Coerce emissao_ para Date mesmo após rehidratação do IDB (pode vir como string)
		const toDate = (v: unknown): Date | null => {
			if (v instanceof Date) return v;
			if (typeof v === "string" && v.trim()) {
				const d = new Date(v);
				return isNaN(d.getTime()) ? null : d;
			}
			return null;
		};

		type ExtrasInfo = { qtd: number; total: number; diasRestantes: number };
		type PrevisaoCobranca =
			| { tipo: "inativo" }
			| { tipo: "remido" }
			| {
					tipo: "pendente";
					qtd: number;
					totalRecente: number;
					qtdAntigos: number;
					totalAntigos: number;
					diasRestantes: number;
					extras?: ExtrasInfo;
			  }
			| { tipo: "cobrado_mes"; total: number; extras?: ExtrasInfo }
			| {
					tipo: "previsao";
					data: Date;
					diasRestantes: number;
					valor: number;
					extras?: ExtrasInfo;
			  }
			| { tipo: "sem_historico"; extras?: ExtrasInfo };
		let previsao: PrevisaoCobranca = { tipo: "sem_historico" };
		let paidPlanMes = 0;
		let planVencido = 0;
		let extrasVencido = 0;

		if (
			situacaoContrato !== "1" &&
			situacaoContrato !== "A" &&
			situacaoContrato !== ""
		) {
			previsao = { tipo: "inativo" };
		} else if (saitxaVal === "9999") {
			previsao = { tipo: "remido" };
		} else if (taxasTable && codigoPad !== "000000000") {
			const taxasContrato = taxasTable.records.filter(
				(r) =>
					!r._deleted &&
					String(r.codigo ?? "")
						.trim()
						.padStart(9, "0") === codigoPad,
			);
			// Saldo Devedor: separa plano de extras (stat=A e emissao_ < hoje)
			const vencidosAbertos = taxasContrato.filter((r) => {
				if (String(r.stat ?? "").trim() !== "A") return false;
				const em = toDate(r.emissao_);
				return em !== null && em < hoje;
			});
			planVencido = vencidosAbertos
				.filter((r) => isPlanTipo(r))
				.reduce((a, r) => a + Number(r.valor ?? 0), 0);
			extrasVencido = vencidosAbertos
				.filter((r) => !isPlanTipo(r) && !isProdutoTipo(r))
				.reduce((a, r) => a + Number(r.valor ?? 0), 0);
			// Separa taxas do plano (tipo 2/3/4) das extras no mês corrente
			const estesMes = (r: (typeof taxasContrato)[0]) => {
				const em = toDate(r.emissao_);
				return (
					em !== null &&
					em.getFullYear() === hoje.getFullYear() &&
					em.getMonth() === hoje.getMonth()
				);
			};
			const taxasMesPlano = taxasContrato.filter(
				(r) => estesMes(r) && isPlanTipo(r),
			);
			const taxasMesExtras = taxasContrato.filter(
				(r) =>
					estesMes(r) &&
					!isPlanTipo(r) &&
					!isProdutoTipo(r) &&
					String(r.stat ?? "").trim() === "A",
			);
			// Taxas de plano em atraso (meses anteriores, abertas) — exclui meses futuros
			const mesAnterior = (em: Date) =>
				em.getFullYear() < hoje.getFullYear() ||
				(em.getFullYear() === hoje.getFullYear() &&
					em.getMonth() < hoje.getMonth());
			const pendentesAntigos = taxasContrato.filter((r) => {
				const em = toDate(r.emissao_);
				if (em === null) return false;
				return (
					mesAnterior(em) &&
					isPlanTipo(r) &&
					String(r.stat ?? "").trim() === "A"
				);
			});

			// Calcula info de cobranças extras (não-plano) em aberto neste mês
			let extras: ExtrasInfo | undefined;
			if (taxasMesExtras.length > 0) {
				const totalExtras = taxasMesExtras.reduce(
					(a, r) => a + Number(r.valor ?? 0),
					0,
				);
				const extrasComData = taxasMesExtras
					.map((r) => ({ r, d: toDate(r.emissao_) }))
					.filter(
						(x): x is { r: typeof x.r; d: Date } => x.d !== null,
					)
					.sort((a, b) => a.d.getTime() - b.d.getTime());
				const vExt = extrasComData[0]?.d;
				extras = {
					qtd: taxasMesExtras.length,
					total: totalExtras,
					diasRestantes: vExt
						? Math.ceil(
								(vExt.getTime() - hoje.getTime()) / 86400000,
							)
						: 0,
				};
			}

			// Quanto do plano já foi pago neste mês (stat ≠ "A")
			paidPlanMes = taxasMesPlano
				.filter((r) => String(r.stat ?? "").trim() !== "A")
				.reduce((a, r) => a + Number(r.valor ?? 0), 0);

			const planAbertos = taxasMesPlano.filter(
				(r) => String(r.stat ?? "").trim() === "A",
			);
			if (planAbertos.length > 0) {
				const totalRecente = planAbertos.reduce(
					(a, r) => a + Number(r.valor ?? 0),
					0,
				);
				const comData = planAbertos
					.map((r) => ({ r, d: toDate(r.emissao_) }))
					.filter(
						(x): x is { r: typeof x.r; d: Date } => x.d !== null,
					)
					.sort((a, b) => a.d.getTime() - b.d.getTime());
				const vencimento = comData[0]?.d;
				const diasRestantes = vencimento
					? Math.ceil(
							(vencimento.getTime() - hoje.getTime()) / 86400000,
						)
					: 0;
				const totalAntigos = pendentesAntigos.reduce(
					(a, r) => a + Number(r.valor ?? 0),
					0,
				);
				previsao = {
					tipo: "pendente",
					qtd: planAbertos.length,
					totalRecente,
					qtdAntigos: pendentesAntigos.length,
					totalAntigos,
					diasRestantes,
					extras,
				};
			} else if (taxasMesPlano.length > 0) {
				// Plano deste mês já liquidado
				const total = taxasMesPlano.reduce(
					(a, r) => a + Number(r.valor ?? 0),
					0,
				);
				previsao = { tipo: "cobrado_mes", total, extras };
			} else {
				// Sem taxa de plano este mês — estimar próxima com base na última emissão de plano
				const comData = taxasContrato
					.map((r) => ({ r, d: toDate(r.emissao_) }))
					.filter(
						(x): x is { r: typeof x.r; d: Date } =>
							x.d !== null && isPlanTipo(x.r),
					)
					.sort((a, b) => b.d.getTime() - a.d.getTime());
				if (comData.length > 0) {
					const proxima = new Date(comData[0].d);
					proxima.setMonth(proxima.getMonth() + mforma);
					// Ajusta ao dia exato de pagamento (GRUPOS.diapgto) se definido
					const diapgto =
						parseInt(String(form.diapgto ?? "").trim()) || 0;
					if (diapgto >= 1 && diapgto <= 31) {
						const ultimoDia = new Date(
							proxima.getFullYear(),
							proxima.getMonth() + 1,
							0,
						).getDate();
						proxima.setDate(Math.min(diapgto, ultimoDia));
					}
					const diasRestantes = Math.ceil(
						(proxima.getTime() - hoje.getTime()) / 86400000,
					);
					previsao = {
						tipo: "previsao",
						data: proxima,
						diasRestantes,
						valor: totalMensal,
						extras,
					};
				} else {
					previsao = { tipo: "sem_historico", extras };
				}
			}
		}

		return {
			classeEfetiva,
			descricao: String(classes?.descricao ?? ""),
			vljoia: Number(classes?.vljoia ?? 0),
			nrparcClasse: Number(classes?.nrparc ?? 1),
			prior,
			vlmensal,
			vldepend,
			nrdepend,
			mforma,
			rvlaux,
			ultimaCirc,
			baseMensal,
			valorMensalidade,
			valorPeriodico,
			totalMensal,
			categoriaEncontrada: !!classes,
			usouFallback,
			admissaoMaior30Dias,
			previsao,
			paidPlanMes,
			qtcircs: Number(form.qtcircs ?? 0),
			qtcircpg: Number(form.qtcircpg ?? 0),
			mgrupvipUsado:
				prior === "S" && mgrupvipParam ? mgrupvipParam : null,
			// Cálculo do valor original (antes de editar grupo/categoria)
			...(() => {
				const origGrupoCode = String(initialData.grupo ?? "").trim();
				const origTipcont = String(initialData.tipcont ?? "").trim();
				const origClasseContrato =
					origTipcont === "00" ? "" : origTipcont;
				let origClasseEfetiva = origClasseContrato;
				if (!origClasseEfetiva && arqgrupTable) {
					const ag = arqgrupTable.records.find(
						(r) =>
							!r._deleted &&
							String(r.grup ?? "").trim() === origGrupoCode,
					);
					const cg = String(ag?.classe ?? "").trim();
					if (cg && cg !== "00") origClasseEfetiva = cg;
				}
				const origClasses = origClasseEfetiva
					? classesTable.records.find(
							(r) =>
								!r._deleted &&
								String(r.classcod ?? "").trim() ===
									origClasseEfetiva,
						)
					: undefined;
				const origPrior = String(origClasses?.prior ?? "").trim();
				const origGrupoParaCircular =
					origPrior === "S" && mgrupvipParam
						? mgrupvipParam
						: origGrupoCode;
				let origRvlaux = 0;
				if (circularTable && origGrupoCode) {
					const circs = circularTable.records.filter(
						(r) =>
							!r._deleted &&
							String(r.grupo ?? "").trim() ===
								origGrupoParaCircular,
					);
					if (circs.length > 0) {
						const u = circs.reduce((a, b) =>
							String(a.circ ?? "") > String(b.circ ?? "") ? a : b,
						);
						origRvlaux = Number(u.valor ?? 0);
					}
				}
				const origUsouFallback =
					!origClasseContrato &&
					origClasseEfetiva !== origClasseContrato;
				const origVlmensal = origUsouFallback
					? 0
					: Number(origClasses?.vlmensal ?? 0);
				const origVldepend = origUsouFallback
					? 0
					: Number(origClasses?.vldepend ?? 0);
				const origBaseMensal =
					origRvlaux + origVlmensal + nrdepend * origVldepend;
				const origValorMensalidade =
					origPrior === "S"
						? origBaseMensal * mforma
						: origBaseMensal;
				const origTotalMensal = origValorMensalidade;
				const grupoOuCategoriaAlterado =
					mode !== "include" && (
						String(form.grupo ?? "").trim() !== origGrupoCode ||
						String(form.tipcont ?? "").trim() !== origTipcont
					);
				const diferencaMensalidade = grupoOuCategoriaAlterado
					? valorMensalidade - origValorMensalidade
					: 0;
				return {
					origValorMensalidade,
					origTotalMensal,
					grupoOuCategoriaAlterado,
					diferencaMensalidade,
					planVencido,
					extrasVencido,
				};
			})(),
		};
	}, [
		form.tipcont,
		form.grupo,
		form.formapgto,
		form.codigo,
		form.situacao,
		form.saitxa,
		form.diapgto,
		form.qtcircs,
		form.qtcircpg,
		form.admissao,
		classesTable,
		arqgrupTable,
		circularTable,
		taxasTable,
		parAdmTable,
		inscritosTable,
		initialData.grupo,
		initialData.tipcont,
		mode,
	]);

	const produtosData = useMemo(() => {
		const codigoPad = String(form.codigo ?? "")
			.trim()
			.padStart(9, "0");
		const toDate = (v: unknown): Date | null => {
			if (v instanceof Date) return v;
			if (typeof v === "string" && v.trim()) {
				const d = new Date(v);
				return isNaN(d.getTime()) ? null : d;
			}
			return null;
		};
		const hoje = new Date();

		const configs = (adencobTable?.records ?? []).filter(
			(r) =>
				!r._deleted &&
				String(r.flag_excl ?? "").trim() !== "*" &&
				String(r.codigo ?? "").trim() === codigoPad,
		);
		const adendosAtivos = (adendosTable?.records ?? []).filter(
			(r) =>
				!r._deleted &&
				String(r.flag_excl ?? "").trim() !== "*" &&
				String(r.codigo ?? "").trim() === codigoPad,
		);

		const taxas59 = (taxasTable?.records ?? []).filter(
			(r) =>
				!r._deleted &&
				String(r.flag_excl ?? "").trim() !== "*" &&
				String(r.codigo ?? "")
					.trim()
					.padStart(9, "0") === codigoPad &&
				["5", "9"].includes(String(r.tipo ?? "").trim()),
		);
		const tipo5All = taxas59.filter(
			(r) => String(r.tipo ?? "").trim() === "5",
		);
		const tipo9All = taxas59
			.filter((r) => String(r.tipo ?? "").trim() === "9")
			.sort(
				(a, b) =>
					parseInt(String(a.circ ?? "0"), 10) -
					parseInt(String(b.circ ?? "0"), 10),
			);

		// Distribui tipo9All entre configs não-permanentes posicionalmente (por nparcelas)
		let tipo9Cursor = 0;
		const tipo9BySeq = new Map<string, typeof tipo9All>();
		for (const c of configs) {
			if (String(c.permanente ?? "N").trim() === "S") continue;
			const seq = String(c.seq ?? "").trim();
			const n = Math.max(1, Number(c.nparcelas ?? 1));
			tipo9BySeq.set(seq, tipo9All.slice(tipo9Cursor, tipo9Cursor + n));
			tipo9Cursor += n;
		}

		// Distribui tipo5All entre configs permanentes.
		// Prioridade: match exato por codlan (seq do ADENCOB gravado na taxa).
		// Fallback para dados sem codlan: intervalo de datainicio_ (compatibilidade).
		const seqInt = (v: unknown) => parseInt(String(v ?? "0").trim(), 10);
		const tipo5ComCodelan = tipo5All.filter((r) => String(r.codlan ?? "").trim() !== "");
		const tipo5SemCodelan = tipo5All.filter((r) => String(r.codlan ?? "").trim() === "");

		const permConfigsSorted = configs
			.filter((c) => String(c.permanente ?? "N").trim() === "S")
			.map((c) => ({
				seq: String(c.seq ?? "").trim(),
				dt: toDate(c.datainicio_) ?? new Date(0),
			}))
			.sort((a, b) => a.dt.getTime() - b.dt.getTime());
		const tipo5BySeq = new Map<string, typeof tipo5All>();

		// 1ª passagem: match exato via codlan
		for (const { seq } of permConfigsSorted) {
			tipo5BySeq.set(
				seq,
				tipo5ComCodelan.filter((r) => seqInt(r.codlan) === seqInt(seq)),
			);
		}
		// 2ª passagem: intervalo para taxas sem codlan (dados legados / seed)
		for (let i = 0; i < permConfigsSorted.length; i++) {
			const { seq, dt } = permConfigsSorted[i];
			const nextDt =
				permConfigsSorted[i + 1]?.dt ?? new Date(8640000000000000);
			const intervalTaxas = tipo5SemCodelan.filter((r) => {
				const d = toDate(r.emissao_);
				return d !== null && d >= dt && d < nextDt;
			});
			const existing = tipo5BySeq.get(seq) ?? [];
			tipo5BySeq.set(seq, [...existing, ...intervalTaxas]);
		}

		const items = configs.map((c) => {
			const codproduto = String(c.codproduto ?? "").trim();
			const prod = (pradendoTable?.records ?? []).find(
				(r) =>
					!r._deleted && String(r.codigo ?? "").trim() === codproduto,
			);
			const permanente = String(c.permanente ?? "N").trim() === "S";
			const tipcob = String(c.tipcob ?? "M").trim();
			const valorConfig = Number(c.valor ?? 0);
			const nparcelas = Number(c.nparcelas ?? 1);
			const datainicio = toDate(c.datainicio_);
			const mult = TIPCOB_MULT[tipcob] ?? 1;
			const valorPeriodo = permanente ? valorConfig * mult : valorConfig;

			// Cada config usa apenas a sua fatia exclusiva de taxas
			const seq = String(c.seq ?? "").trim();
			const taxasTipo = permanente
				? (tipo5BySeq.get(seq) ?? [])
				: (tipo9BySeq.get(seq) ?? []);
			const emAberto = taxasTipo.filter((r) => {
				const stat = String(r.stat ?? "").trim();
				return stat === "A" || stat === "1";
			});
			const pagas = taxasTipo.filter((r) => {
				const stat = String(r.stat ?? "").trim();
				return (
					stat !== "A" &&
					stat !== "1" &&
					(r.pgto_ != null || Number(r.valorpg ?? 0) > 0)
				);
			});
			const vencidas = emAberto.filter((r) => {
				const d = toDate(r.emissao_);
				return d !== null && d < hoje;
			});
			const proximas = emAberto
				.map((r) => ({ r, d: toDate(r.emissao_) }))
				.filter(
					(x): x is { r: typeof x.r; d: Date } =>
						x.d !== null && x.d >= hoje,
				)
				.sort((a, b) => a.d.getTime() - b.d.getTime());

			return {
				codproduto,
				nome: prod ? String(prod.produto ?? "").trim() : codproduto,
				permanente,
				tipcob,
				valorConfig,
				valorPeriodo,
				nparcelas,
				datainicio,
				mult,
				totalTaxas: taxasTipo.length,
				pagas: pagas.length,
				valorPago: pagas.reduce(
					(s, r) => s + Number(r.valorpg ?? r.valor ?? 0),
					0,
				),
				emAberto: emAberto.length,
				valorAberto: emAberto.reduce(
					(s, r) => s + Number(r.valor ?? 0),
					0,
				),
				vencidas: vencidas.length,
				valorVencido: vencidas.reduce(
					(s, r) => s + Number(r.valor ?? 0),
					0,
				),
				proxima: proximas[0]?.d ?? null,
				proximaValor: proximas[0]
					? Number(proximas[0].r.valor ?? 0)
					: 0,
			};
		});

		const totalAberto = taxas59
			.filter((r) => {
				const s = String(r.stat ?? "").trim();
				return s === "A" || s === "1";
			})
			.reduce((s, r) => s + Number(r.valor ?? 0), 0);
		const totalPago = taxas59
			.filter((r) => {
				const s = String(r.stat ?? "").trim();
				return s !== "A" && s !== "1";
			})
			.reduce((s, r) => s + Number(r.valorpg ?? r.valor ?? 0), 0);
		const totalVencido59 = taxas59
			.filter((r) => {
				const s = String(r.stat ?? "").trim();
				const d = toDate(r.emissao_);
				return (s === "A" || s === "1") && d !== null && d < hoje;
			})
			.reduce((s, r) => s + Number(r.valor ?? 0), 0);

		// Taxas 5/9 deste mês
		const estesMes59 = taxas59.filter((r) => {
			const d = toDate(r.emissao_);
			return (
				d &&
				d.getFullYear() === hoje.getFullYear() &&
				d.getMonth() === hoje.getMonth()
			);
		});
		const pagas59Mes = estesMes59.filter((r) => {
			const s = String(r.stat ?? "").trim();
			return s !== "A" && s !== "1";
		});
		const abertas59Mes = estesMes59.filter((r) => {
			const s = String(r.stat ?? "").trim();
			return s === "A" || s === "1";
		});
		const vencidas59Mes = abertas59Mes.filter((r) => {
			const d = toDate(r.emissao_);
			return d && d < hoje;
		});

		// Valor pago e aberto deste mês
		const valorPago59Mes = pagas59Mes.reduce(
			(s, r) => s + Number(r.valorpg ?? r.valor ?? 0),
			0,
		);
		const valorAberto59Mes = abertas59Mes.reduce(
			(s, r) => s + Number(r.valor ?? 0),
			0,
		);
		// Total cobrado no mês (pago + aberto) — base para calcular crédito real
		const totalCobrado59Mes = estesMes59.reduce(
			(s, r) => s + Number(r.valor ?? 0),
			0,
		);
		const valorVencido59Mes = vencidas59Mes.reduce(
			(s, r) => s + Number(r.valor ?? 0),
			0,
		);

		// Previsão de próximo vencimento de produtos/serviços (taxas futuras abertas)
		const futuras59 = taxas59
			.filter((r) => {
				const s = String(r.stat ?? "").trim();
				const d = toDate(r.emissao_);
				return (s === "A" || s === "1") && d !== null && d > hoje;
			})
			.map((r) => ({ r, d: toDate(r.emissao_) as Date }))
			.sort((a, b) => a.d.getTime() - b.d.getTime());
		const proximaFutura = futuras59[0] ?? null;

		// Valor para "Próximo mês": parcelados (tipo 9) via TAXAS + permanentes com periodicidade correta
		const proxMesInicio = new Date(
			hoje.getFullYear(),
			hoje.getMonth() + 1,
			1,
		);
		const proxMesFim = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 0);
		const taxasProxMes9 = tipo9All.filter((r) => {
			const d = toDate(r.emissao_);
			return d && d >= proxMesInicio && d <= proxMesFim;
		});
		const valorProxMes9 = taxasProxMes9.reduce(
			(s, r) => s + Number(r.valor ?? 0),
			0,
		);
		// Permanentes mensais (mult=1): recorrência garantida todo mês
		const valorPermanenteMensal = configs
			.filter(
				(c) =>
					String(c.permanente ?? "N").trim() === "S" &&
					(TIPCOB_MULT[String(c.tipcob ?? "M").trim()] ?? 1) === 1,
			)
			.reduce((s, c) => s + Number(c.valor ?? 0), 0);
		// Permanentes não-mensais: cobram apenas no mês do ciclo baseado em datainicio_
		// Usa taxas reais do próximo mês se disponíveis; caso contrário calcula teoricamente
		// Mapa seq → tipcob para identificar se a taxa é de um permanente não-mensal
		const seqToTipcob = new Map<number, string>();
		for (const c of configs) {
			if (String(c.permanente ?? "N").trim() === "S") {
				seqToTipcob.set(
					parseInt(String(c.seq ?? "0"), 10),
					String(c.tipcob ?? "M").trim(),
				);
			}
		}
		// Apenas taxas de permanentes não-mensais no próximo mês (via codlan → seq → tipcob)
		const taxasProxMes5 = tipo5All.filter((r) => {
			const d = toDate(r.emissao_);
			if (!d || d < proxMesInicio || d > proxMesFim) return false;
			const cl = String(r.codlan ?? "").trim();
			if (cl === "") return false; // sem codlan: dado legado, pula
			const tipcobTaxa = seqToTipcob.get(parseInt(cl, 10));
			return (TIPCOB_MULT[tipcobTaxa ?? "M"] ?? 1) > 1; // só não-mensais
		});
		const valorPermanenteNaoMensalProxMes =
			taxasProxMes5.length > 0
				? taxasProxMes5.reduce((s, r) => s + Number(r.valor ?? 0), 0)
				: configs
						.filter((c) => {
							const isPerm =
								String(c.permanente ?? "N").trim() === "S";
							const mult =
								TIPCOB_MULT[
									String(c.tipcob ?? "M").trim()
								] ?? 1;
							return isPerm && mult > 1;
						})
						.reduce((s, c) => {
							const tipcob = String(c.tipcob ?? "M").trim();
							const mult = TIPCOB_MULT[tipcob] ?? 1;
							const datainicio = toDate(c.datainicio_);
							if (!datainicio) return s;
							const diffMeses =
								(proxMesInicio.getFullYear() -
									datainicio.getFullYear()) *
									12 +
								(proxMesInicio.getMonth() -
									datainicio.getMonth());
							if (diffMeses >= 0 && diffMeses % mult === 0) {
								return s + Number(c.valor ?? 0) * mult;
							}
							return s;
						}, 0);
		const valorProximoMes59 =
			valorProxMes9 + valorPermanenteMensal + valorPermanenteNaoMensalProxMes;

		type PrevisaoProdutos =
			| { tipo: "sem_dados" }
			| { tipo: "cobrado_mes"; total: number }
			| {
					tipo: "pendente";
					qtd: number;
					totalAberto: number;
					vencidas: number;
					valorVencido: number;
					diasRestantes: number;
			  }
			| {
					tipo: "previsao";
					data: Date;
					diasRestantes: number;
					valor: number;
			  };

		let previsaoProdutos: PrevisaoProdutos = { tipo: "sem_dados" };

		if (taxas59.length > 0) {
			if (abertas59Mes.length > 0) {
				const proxVenc = abertas59Mes
					.map((r) => toDate(r.emissao_))
					.filter((d): d is Date => d !== null)
					.sort((a, b) => a.getTime() - b.getTime())[0];
				const dias = proxVenc
					? Math.ceil(
							(proxVenc.getTime() - hoje.getTime()) / 86400000,
						)
					: 0;
				previsaoProdutos = {
					tipo: "pendente",
					qtd: abertas59Mes.length,
					totalAberto: valorAberto59Mes,
					vencidas: vencidas59Mes.length,
					valorVencido: valorVencido59Mes,
					diasRestantes: dias,
				};
			} else if (pagas59Mes.length > 0 && abertas59Mes.length === 0) {
				previsaoProdutos = {
					tipo: "cobrado_mes",
					total: valorPago59Mes,
				};
			} else if (proximaFutura) {
				const dias = Math.ceil(
					(proximaFutura.d.getTime() - hoje.getTime()) / 86400000,
				);
				previsaoProdutos = {
					tipo: "previsao",
					data: proximaFutura.d,
					diasRestantes: dias,
					valor: Number(proximaFutura.r.valor ?? 0),
				};
			}
		}

		return {
			items,
			adendosAtivos: adendosAtivos.length,
			totalAberto,
			totalPago,
			totalVencido59,
			valorPago59Mes,
			valorAberto59Mes,
			totalCobrado59Mes,
			valorVencido59Mes,
			valorProximoMes59,
			valorPermanenteMensal,
			previsaoProdutos,
			hasData: items.length > 0 || taxas59.length > 0,
		};
	}, [form.codigo, adencobTable, adendosTable, taxasTable, pradendoTable]);

	// Tipo 1 (adesao/carne) taxas — determines if Adesao card is shown and if it's opaque
	const adesaoInfo = useMemo(() => {
		const codigoPad = String(form.codigo ?? "").trim().padStart(9, "0");
		const hoje = new Date();
		const toDate = (v: unknown): Date | null => {
			if (v instanceof Date) return v;
			if (typeof v === "string" && v.trim()) {
				const d = new Date(v);
				return isNaN(d.getTime()) ? null : d;
			}
			return null;
		};
		const taxas1 = (taxasTable?.records ?? []).filter(
			(r) =>
				!r._deleted &&
				String(r.codigo ?? "").trim().padStart(9, "0") === codigoPad &&
				String(r.tipo ?? "").trim() === "1",
		);
		const isMesCorrente = (d: Date) =>
			d.getFullYear() === hoje.getFullYear() &&
			d.getMonth() === hoje.getMonth();
		const isProximoMes = (d: Date) => {
			const pm = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
			return d.getFullYear() === pm.getFullYear() && d.getMonth() === pm.getMonth();
		};
		const mesCorrentes = taxas1.filter((r) => {
			const d = toDate(r.emissao_);
			return d && isMesCorrente(d);
		});
		const proximoMes = taxas1.filter((r) => {
			const d = toDate(r.emissao_);
			return d && isProximoMes(d);
		});
		const proximoMesAberto = proximoMes.filter(
			(r) => String(r.stat ?? "").trim() === "A",
		);
		const show = taxas1.length > 0;
		const opaque = show && mesCorrentes.length === 0 && proximoMesAberto.length > 0;
		const nextMonthDates = proximoMesAberto
			.map((r) => toDate(r.emissao_))
			.filter((d): d is Date => d !== null)
			.sort((a, b) => a.getTime() - b.getTime());
		const nextMonthDate = opaque ? (nextMonthDates[0] ?? null) : null;
		const proxMesTotal = proximoMesAberto.reduce((s, r) => s + Number(r.valor ?? 0), 0);
		const proxMesQtd = proximoMesAberto.length;
		const mesCorrenteTotal = mesCorrentes.reduce((s, r) => s + Number(r.valor ?? 0), 0);
		const mesCorrenteAberto = mesCorrentes.some((r) => String(r.stat ?? '').trim() === 'A');
		const mesCorrenteQtd = mesCorrentes.length;
		// Progresso geral das parcelas tipo 1
		const totalTaxas1 = taxas1.length;
		const taxas1Pagas = taxas1.filter((r) => String(r.stat ?? '').trim() !== 'A').length;
		const vlPorParcela1 = taxas1.length > 0 ? Number(taxas1[0]?.valor ?? 0) : 0;

		// Cobranças abertas: mês corrente + vencidas (para saldo devedor)
		const mesCorrenteAbertoTotal = mesCorrentes
			.filter((r) => String(r.stat ?? '').trim() === 'A')
			.reduce((s, r) => s + Number(r.valor ?? 0), 0);
		// Vencidas = emissao_ < hoje (independente do mês), stat aberto
		const vencidoAbertoTotal = taxas1
			.filter((r) => {
				const d = toDate(r.emissao_);
				return d && d < hoje && String(r.stat ?? '').trim() === 'A';
			})
			.reduce((s, r) => s + Number(r.valor ?? 0), 0);

		// Próximo mês estimado: se não há TAXAS pré-gerado mas ainda restam parcelas
		const taxas1Restantes = taxas1Pagas < totalTaxas1 ? totalTaxas1 - taxas1Pagas : 0;
		const proxMesEstimado = proxMesTotal === 0 && taxas1Restantes > 1 ? vlPorParcela1 : 0;

		return { show, opaque, nextMonthDate, proxMesTotal, proxMesQtd, mesCorrenteTotal, mesCorrenteAberto, mesCorrenteQtd, totalTaxas1, taxas1Pagas, vlPorParcela1, mesCorrenteAbertoTotal, vencidoAbertoTotal, proxMesEstimado };
	}, [form.codigo, taxasTable]);

	// Exported types are derived from the return values of these useMemos
	// (see FichaDataType and ProdutosDataType exports below the component)

	if (!fichaData) {
		return (
			<div className="text-center text-gray-400 py-12 text-sm">
				Carregando dados financeiros...
			</div>
		);
	}

	// adesaoNrParc === -1 significa que o usuário removeu o card manualmente
	// Em include: só mostra adesão se categoria foi explicitamente definida (não via fallback do grupo)
	const showAdesao =
		mode === "include"
			? fichaData.vljoia > 0 && adesaoNrParc !== -1 && !fichaData.usouFallback
			: adesaoInfo.show;

	return (
		<div className="flex flex-col gap-4 tab-content w-full">
			{/* Indicador de circulares pagas */}
			{fichaData.qtcircs > 0 && (
				<div className="flex items-center gap-3 px-1">
					<span className="text-[10px] text-gray-500 shrink-0">
						{fichaData.qtcircpg}/{fichaData.qtcircs} circs. pagas
					</span>
					<div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
						<div
							className="h-full rounded-full bg-green-500 transition-all"
							style={{
								width: `${Math.min(100, Math.round((fichaData.qtcircpg / fichaData.qtcircs) * 100))}%`,
							}}
						/>
					</div>
					<span className="text-[10px] font-medium text-green-700 shrink-0">
						{Math.min(
							100,
							Math.round(
								(fichaData.qtcircpg / fichaData.qtcircs) * 100,
							),
						)}
						%
					</span>
				</div>
			)}

			{/* 2 ou 3 colunas dependendo se há adesão no mês */}
			<div className={`grid ${showAdesao ? "grid-cols-3" : "grid-cols-2"} gap-2 items-start`}>
				{showAdesao && (
					<Adesao
						mode={mode}
						vljoia={fichaData.vljoia}
						nrparc={adesaoNrParc}
						setNrparc={setAdesaoNrParc}
						totalParcelas={adesaoInfo.totalTaxas1}
						parcelasPagas={adesaoInfo.taxas1Pagas}
						vlPorParcelaDisplay={adesaoInfo.vlPorParcela1}
						mesCorrenteTotal={adesaoInfo.mesCorrenteTotal}
						mesCorrenteAberto={adesaoInfo.mesCorrenteAberto}
						mesCorrenteQtd={adesaoInfo.mesCorrenteQtd}
						proxMesTotal={adesaoInfo.proxMesTotal}
						proxMesQtd={adesaoInfo.proxMesQtd}
						proxMesDate={adesaoInfo.nextMonthDate}
						opaque={adesaoInfo.opaque}
					dataInicio={adesaoDataInicio}
					onDataInicioChange={setAdesaoDataInicio}
					diapgto={Number(form.diapgto ?? 1)}
					/>
				)}
				<Mensalidade
					fichaData={fichaData}
					form={form}
					setField={setField}
					readOnly={readOnly}
					primary={primary}
					grupoOpts={grupoOpts}
					categoriaOpts={categoriaOpts}
				/>

				<ProdutosServicos
					produtosData={produtosData}
					primary={primary}
				/>
			</div>

			<Estimativas
				fichaData={fichaData}
				produtosData={produtosData}
				primary={primary}
				primaryLight={primaryLight}
				mode={mode}
				adesaoProxMes={
					mode === "include"
						? (adesaoNrParc > 0
							? Math.floor((fichaData.vljoia / adesaoNrParc) * 100) / 100
							: 0)
						: (adesaoInfo.proxMesTotal || adesaoInfo.proxMesEstimado)
				}
				adesaoVlParcela={
					mode === "include"
						? 0
						: adesaoInfo.vencidoAbertoTotal
				}
			/>
		</div>
	);
}

// ─── Exported types for sub-components ───────────────────────────────────────

type _FichaDataHelper = ReturnType<typeof _fichaDataShape>;
function _fichaDataShape() {
	return {
		classeEfetiva: "" as string,
		descricao: "" as string,
		vljoia: 0 as number,
		nrparcClasse: 1 as number,
		prior: "" as string,
		vlmensal: 0 as number,
		vldepend: 0 as number,
		nrdepend: 0 as number,
		mforma: 0 as number,
		rvlaux: 0 as number,
		ultimaCirc: null as {
			circ: string;
			valor: number;
			grupoUsado: string;
		} | null,
		baseMensal: 0 as number,
		valorMensalidade: 0 as number,
		valorPeriodico: 0 as number,
		totalMensal: 0 as number,
		categoriaEncontrada: false as boolean,
		usouFallback: false as boolean,
		admissaoMaior30Dias: false as boolean,
		previsao: { tipo: "sem_historico" } as
			| { tipo: "inativo" }
			| { tipo: "remido" }
			| {
					tipo: "pendente";
					qtd: number;
					totalRecente: number;
					qtdAntigos: number;
					totalAntigos: number;
					diasRestantes: number;
					extras?: {
						qtd: number;
						total: number;
						diasRestantes: number;
					};
			  }
			| {
					tipo: "cobrado_mes";
					total: number;
					extras?: {
						qtd: number;
						total: number;
						diasRestantes: number;
					};
			  }
			| {
					tipo: "previsao";
					data: Date;
					diasRestantes: number;
					valor: number;
					extras?: {
						qtd: number;
						total: number;
						diasRestantes: number;
					};
			  }
			| {
					tipo: "sem_historico";
					extras?: {
						qtd: number;
						total: number;
						diasRestantes: number;
					};
			  },
		paidPlanMes: 0 as number,
		qtcircs: 0 as number,
		qtcircpg: 0 as number,
		mgrupvipUsado: null as string | null,
		origValorMensalidade: 0 as number,
		origTotalMensal: 0 as number,
		grupoOuCategoriaAlterado: false as boolean,
		diferencaMensalidade: 0 as number,
		planVencido: 0 as number,
		extrasVencido: 0 as number,
	};
}

export type FichaDataType = _FichaDataHelper;

type _ProdutosDataHelper = ReturnType<typeof _produtosDataShape>;
function _produtosDataShape() {
	return {
		items: [] as {
			codproduto: string;
			nome: string;
			permanente: boolean;
			tipcob: string;
			valorConfig: number;
			valorPeriodo: number;
			nparcelas: number;
			datainicio: Date | null;
			mult: number;
			totalTaxas: number;
			pagas: number;
			valorPago: number;
			emAberto: number;
			valorAberto: number;
			vencidas: number;
			valorVencido: number;
			proxima: Date | null;
			proximaValor: number;
		}[],
		adendosAtivos: 0 as number,
		totalAberto: 0 as number,
		totalPago: 0 as number,
		totalVencido59: 0 as number,
		valorPago59Mes: 0 as number,
		valorAberto59Mes: 0 as number,
		totalCobrado59Mes: 0 as number,
		valorVencido59Mes: 0 as number,
		valorProximoMes59: 0 as number,
		valorPermanenteMensal: 0 as number,
		previsaoProdutos: { tipo: "sem_dados" } as
			| { tipo: "sem_dados" }
			| { tipo: "cobrado_mes"; total: number }
			| {
					tipo: "pendente";
					qtd: number;
					totalAberto: number;
					vencidas: number;
					valorVencido: number;
					diasRestantes: number;
			  }
			| {
					tipo: "previsao";
					data: Date;
					diasRestantes: number;
					valor: number;
			  },
		hasData: false as boolean,
	};
}

export type ProdutosDataType = _ProdutosDataHelper;
