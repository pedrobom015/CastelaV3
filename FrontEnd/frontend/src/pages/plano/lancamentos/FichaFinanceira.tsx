import { useState, useMemo } from "react";
import { formatCurrency } from "../../../utils/formatters";
import type { Grupo } from "../../../types/models";
import { useAppStore } from "../../../store/appStore";
import { TcarnesInput } from "../vendas/TcarnesInput";

interface FichaFinanceiraProps {
	form: Grupo;
	initialData: Grupo;
	setField: (field: keyof Grupo, value: unknown) => void;
	readOnly: boolean;
	primary: string;
	primaryLight: string;
	grupoOpts: { value: string; label: string }[];
	categoriaOpts: { value: string; label: string }[];
}

export function FichaFinanceira({
	form,
	initialData,
	setField,
	readOnly,
	primary,
	primaryLight,
	grupoOpts,
	categoriaOpts,
}: FichaFinanceiraProps) {
	const { getTable } = useAppStore();
	useAppStore((s) => s.tables); // re-renderiza quando qualquer tabela muda
	const [editingGrupo, setEditingGrupo] = useState(false);
	const [editingCategoria, setEditingCategoria] = useState(false);
	const [editingCarne, setEditingCarne] = useState(false);

	const classesTable = getTable("classes");
	const arqgrupTable = getTable("arqgrup");
	const circularTable = getTable("circular");
	const tcarnesTable = getTable("tcarnes");
	const taxasTable = getTable("taxas");
	const parAdmTable = getTable("par_adm");

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
		const nrdepend = Number(form.nrdepend ?? 0);
		const mforma = Math.max(1, parseInt(String(form.formapgto ?? "")) || 1);
		const rvlaux = ultimaCirc?.valor ?? 0;
		const baseMensal = rvlaux + vlmensal + nrdepend * vldepend;
		// VIP: multiplica pela periodicidade (paga de mforma em mforma circulares)
		const valorMensalidade =
			prior === "S" ? baseMensal * mforma : baseMensal;

		// Carné de venda (joia parcelada) — lookup via vlcarne → TCARNES.tip
		const vlcarneCode = String(form.vlcarne ?? "").trim();
		let carne: {
			tip: string;
			vali: number;
			parf: number;
			parm: number;
			formapgto: string;
			vlPorParcela: number;
		} | null = null;
		if (vlcarneCode && tcarnesTable) {
			const tcarnesRec = tcarnesTable.records.find(
				(r) =>
					!r._deleted && String(r.tip ?? "").trim() === vlcarneCode,
			);
			if (tcarnesRec) {
				const vali = Number(tcarnesRec.vali ?? 0);
				const parf = Math.max(1, Number(tcarnesRec.parf ?? 1));
				// Valor por parcela conforme emc_01f9: floor(vali/parf * 10) / 10
				const vlPorParcela = Math.floor((vali / parf) * 10) / 10;
				carne = {
					tip: vlcarneCode,
					vali,
					parf,
					parm: Number(tcarnesRec.parm ?? 0),
					formapgto: String(tcarnesRec.formapgto ?? ""),
					vlPorParcela,
				};
			}
		}

		// Tipo 3 periódico: vlparc (TCARNES.vali) + (vlmensal + nrdepend×vldepend) × mforma
		const vlparc = carne?.vali ?? 0;
		const valorPeriodico =
			vlparc + (vlmensal + nrdepend * vldepend) * mforma;

		const totalMensal = valorMensalidade + (carne?.vlPorParcela ?? 0);

		// Previsão de cobrança baseada na tabela TAXAS
		const hoje = new Date();
		const codigoPad = String(form.codigo ?? "")
			.trim()
			.padStart(9, "0");
		const saitxaVal = String(form.saitxa ?? "").trim();
		const situacaoContrato = String(form.situacao ?? "").trim();

		// Tipos que representam cobranças de plano (circular/categoria)
		const isPlanTipo = (r: { tipo?: unknown }) =>
			[2, 3, 4].includes(parseInt(String(r.tipo ?? "").trim(), 10));
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
		let totalVencido = 0;

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
			// Saldo Devedor: todos stat=A com emissao_ < hoje, qualquer tipo
			totalVencido = taxasContrato
				.filter((r) => {
					if (String(r.stat ?? "").trim() !== "A") return false;
					const em = toDate(r.emissao_);
					return em !== null && em < hoje;
				})
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
					String(r.stat ?? "").trim() === "A",
			);
			// Taxas de plano em atraso (meses anteriores, abertas)
			const pendentesAntigos = taxasContrato.filter((r) => {
				if (toDate(r.emissao_) === null) return false;
				return (
					!estesMes(r) &&
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
			carne,
			totalMensal,
			categoriaEncontrada: !!classes,
			usouFallback,
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
				const origTotalMensal =
					origValorMensalidade + (carne?.vlPorParcela ?? 0);
				const grupoOuCategoriaAlterado =
					String(form.grupo ?? "").trim() !== origGrupoCode ||
					String(form.tipcont ?? "").trim() !== origTipcont;
				const diferencaMensalidade = grupoOuCategoriaAlterado
					? valorMensalidade - origValorMensalidade
					: 0;
				return {
					origValorMensalidade,
					origTotalMensal,
					grupoOuCategoriaAlterado,
					diferencaMensalidade,
					totalVencido,
				};
			})(),
		};
	}, [
		form.tipcont,
		form.grupo,
		form.nrdepend,
		form.formapgto,
		form.vlcarne,
		form.codigo,
		form.situacao,
		form.saitxa,
		form.diapgto,
		form.qtcircs,
		form.qtcircpg,
		classesTable,
		arqgrupTable,
		circularTable,
		tcarnesTable,
		taxasTable,
		parAdmTable,
		initialData.grupo,
		initialData.tipcont,
	]);

	if (!fichaData) {
		return (
			<div className="text-center text-gray-400 py-12 text-sm">
				Carregando dados financeiros...
			</div>
		);
	}

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

			{/* Parâmetros + Identificação — card unificado */}
			<div className="rounded-lg border border-gray-200 overflow-hidden text-xs">
				{/* Linha 1: campos editáveis */}
				<div className="grid grid-cols-3 divide-x divide-gray-100">
					{/* Grupo */}
					<div
						className="flex flex-col px-3 py-1 gap-0.5 cursor-pointer"
						onClick={() => !readOnly && setEditingGrupo(true)}
					>
						<span className="text-[10px] text-gray-400">Grupo</span>
						{editingGrupo && !readOnly ? (
							<select
								autoFocus
								className="text-xs border border-blue-300 rounded px-1 py-0.5 bg-white text-gray-800 w-full"
								value={form.grupo ?? ""}
								onChange={(e) => {
									setField("grupo", e.target.value);
									setEditingGrupo(false);
								}}
								onBlur={() => setEditingGrupo(false)}
							>
								{grupoOpts.map((o) => (
									<option key={o.value} value={o.value}>
										{o.label}
									</option>
								))}
							</select>
						) : (
							<span
								className="font-medium text-gray-800 truncate"
								title={
									grupoOpts.find(
										(o) => o.value === form.grupo,
									)?.label
								}
							>
								{grupoOpts.find((o) => o.value === form.grupo)
									?.label ||
									form.grupo ||
									"—"}
							</span>
						)}
					</div>

					{/* Categoria */}
					<div
						className="flex flex-col px-3 py-1 gap-0.5 cursor-pointer"
						onClick={() =>
							!readOnly &&
							!editingCategoria &&
							setEditingCategoria(true)
						}
					>
						<span className="text-[10px] text-gray-400">
							Categoria
						</span>
						{editingCategoria && !readOnly ? (
							<div
								className="flex items-center gap-1"
								onClick={(e) => e.stopPropagation()}
							>
								<select
									autoFocus
									className="flex-1 text-xs border border-blue-300 rounded px-1 py-0.5 bg-white text-gray-800"
									value={form.tipcont ?? ""}
									onChange={(e) => {
										setField("tipcont", e.target.value);
										setEditingCategoria(false);
									}}
									onBlur={() => setEditingCategoria(false)}
								>
									{categoriaOpts.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
								{form.tipcont && (
									<button
										type="button"
										onMouseDown={() => {
											setField("tipcont", "");
											setEditingCategoria(false);
										}}
										className="text-gray-400 hover:text-red-500 px-1 shrink-0"
									>
										&times;
									</button>
								)}
							</div>
						) : (
							<div className="flex items-center gap-1 min-w-0">
								<span
									className="font-medium text-gray-800 truncate"
									title={
										categoriaOpts.find(
											(o) => o.value === form.tipcont,
										)?.label
									}
								>
									{categoriaOpts.find(
										(o) => o.value === form.tipcont,
									)?.label ||
										form.tipcont || (
											<span className="text-gray-400 italic font-normal">
												Sem categoria
											</span>
										)}
								</span>
								{!readOnly && form.tipcont && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setField("tipcont", "");
										}}
										className="text-gray-300 hover:text-red-500 leading-none shrink-0"
									>
										&times;
									</button>
								)}
							</div>
						)}
					</div>

					{/* Tipo Carné */}
					<div
						className="flex flex-col px-3 py-1 gap-0.5 cursor-pointer"
						onClick={() => !readOnly && setEditingCarne(true)}
					>
						<span className="text-[10px] text-gray-400">
							Tipo Carné
						</span>
						<div className="flex items-center gap-1 min-w-0">
							<span
								className="font-medium text-gray-800 truncate"
								title={
									fichaData.carne
										? `${fichaData.carne.tip} — ${formatCurrency(fichaData.carne.vali)} · ${fichaData.carne.parf}×`
										: undefined
								}
							>
								{fichaData.carne ? (
									`${fichaData.carne.tip} · ${formatCurrency(fichaData.carne.vlPorParcela)}/parc.`
								) : (
									<span className="text-gray-400 italic font-normal">
										Sem carné
									</span>
								)}
							</span>
							{!readOnly && form.vlcarne && (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setField("vlcarne", "");
									}}
									className="text-gray-300 hover:text-red-500 leading-none shrink-0"
								>
									&times;
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Linha 2: informações derivadas */}
				<div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100 bg-gray-50/50">
					{(
						[
							[
								"Últ. Circular",
								fichaData.ultimaCirc
									? `#${fichaData.ultimaCirc.circ}`
									: "—",
							],
							[
								"Tipo",
								fichaData.prior === "S" ? "VIP" : "Padrão",
							],
							[
								"Periodicidade",
								fichaData.mforma === 1
									? "Mensal"
									: fichaData.mforma === 2
										? "Bimestral"
										: fichaData.mforma === 3
											? "Trimestral"
											: fichaData.mforma === 6
												? "Semestral"
												: fichaData.mforma === 12
													? "Anual"
													: `${fichaData.mforma} meses`,
							],
							["Dependentes", String(fichaData.nrdepend)],
						] as [string, string][]
					).map(([label, value]) => (
						<div key={label} className="flex flex-col px-3 py-1">
							<span className="text-[10px] text-gray-400">
								{label}
							</span>
							<span
								className="font-medium text-gray-700 truncate"
								title={value}
							>
								{value}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Modal de seleção de carnê */}
			{editingCarne && !readOnly && (
				<TcarnesInput
					value={String(form.vlcarne ?? "")}
					isOpen={editingCarne}
					onOpenChange={(v) => setEditingCarne(v)}
					onSelect={(tip) => {
						setField("vlcarne", tip);
						setEditingCarne(false);
					}}
				/>
			)}

			{/* Row 2: 2 colunas — valores */}
			<div className="grid grid-cols-2 gap-2 items-start">
				{/* Col 1: Mensalidade */}
				<div className="rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
					<div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
						<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
							{fichaData.prior === "S"
								? "Mensalidade VIP"
								: "Mensalidade / Circular"}
						</div>
						<div className="text-[10px] text-gray-400">
							CIRCULAR + CLASSES
						</div>
					</div>
					<div className="divide-y divide-gray-100 flex-1">
						<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
							<div>
								<div className="font-medium text-gray-800">
									Valor Circular
								</div>
								<div className="text-gray-400">
									{fichaData.ultimaCirc
										? `#${fichaData.ultimaCirc.circ} · CIRCULAR.valor`
										: "sem circular"}
								</div>
							</div>
							<div className="font-mono font-medium text-gray-700 shrink-0">
								{formatCurrency(fichaData.rvlaux)}
							</div>
						</div>
						<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
							<div>
								<div className="font-medium text-gray-800">
									Mensalidade Base
								</div>
								<div className="text-gray-400">
									{fichaData.usouFallback
										? "Grupo"
										: `Cat. ${fichaData.classeEfetiva}`}{" "}
									· CLASSES.vlmensal
									{fichaData.vlmensal < 0 ? " · desc." : ""}
								</div>
							</div>
							<div
								className={`font-mono font-medium shrink-0 ${fichaData.vlmensal < 0 ? "text-red-600" : "text-gray-700"}`}
							>
								{formatCurrency(fichaData.vlmensal)}
							</div>
						</div>
						{fichaData.nrdepend > 0 && (
							<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
								<div>
									<div className="font-medium text-gray-800">
										Dependentes
									</div>
									<div className="text-gray-400">
										{fichaData.nrdepend} ×{" "}
										{formatCurrency(fichaData.vldepend)} ·
										CLASSES.vldepend
									</div>
								</div>
								<div className="font-mono font-medium text-gray-700 shrink-0">
									{formatCurrency(
										fichaData.nrdepend * fichaData.vldepend,
									)}
								</div>
							</div>
						)}
						{fichaData.prior === "S" && fichaData.mforma > 1 && (
							<div className="flex justify-between items-center px-3 py-1 text-[10px] bg-gray-50/60 text-gray-500 gap-2">
								<span>
									Base × {fichaData.mforma} (VIP ·
									GRUPOS.formapgto
									{fichaData.mgrupvipUsado
										? ` · circ. grupo ${fichaData.mgrupvipUsado}`
										: ""}
									)
								</span>
								<span className="font-mono shrink-0">
									{formatCurrency(fichaData.baseMensal)} ×{" "}
									{fichaData.mforma}
								</span>
							</div>
						)}
					</div>
					<div className="flex justify-between items-center px-3 py-1.5 bg-blue-50 border-t border-blue-100">
						<div className="text-xs font-semibold text-blue-900">
							{fichaData.prior === "S"
								? `Total p/ período`
								: "Total p/ circular"}
						</div>
						<div className="font-mono font-bold text-blue-900 text-sm">
							{formatCurrency(fichaData.valorMensalidade)}
						</div>
					</div>
				</div>

				{/* Col 2: Carné de venda */}
				<div className="rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
					<div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
						<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
							Carné / Joia
						</div>
						<div className="text-[10px] text-gray-400">
							TCARNES via vlcarne
						</div>
					</div>
					{!fichaData.carne ? (
						<div className="px-3 py-2 text-xs text-gray-400 italic flex-1">
							Nenhum carné vinculado
						</div>
					) : (
						<>
							<div className="divide-y divide-gray-100 flex-1">
								<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
									<div>
										<div className="font-medium text-gray-800">
											Total da Joia
										</div>
										<div className="text-gray-400">
											TCARNES.vali · tipo{" "}
											{fichaData.carne.tip}
										</div>
									</div>
									<div className="font-mono font-medium text-gray-700 shrink-0">
										{formatCurrency(fichaData.carne.vali)}
									</div>
								</div>
								<div className="flex justify-between items-start px-3 py-1 text-xs gap-2">
									<div>
										<div className="font-medium text-gray-800">
											Parcelas
										</div>
										<div className="text-gray-400">
											TCARNES.parf
										</div>
									</div>
									<div className="font-mono font-medium text-gray-700 shrink-0">
										{fichaData.carne.parf}×
									</div>
								</div>
							</div>
							<div className="flex justify-between items-center px-3 py-1.5 bg-blue-50 border-t border-blue-100">
								<div className="text-xs font-semibold text-blue-900">
									Valor / Parcela
								</div>
								<div className="font-mono font-bold text-blue-900 text-sm">
									{formatCurrency(
										fichaData.carne.vlPorParcela,
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Total estimado */}
			<div
				className="flex flex-col px-3 py-2 rounded-lg shadow-sm gap-1 -mt-2"
				style={{ backgroundColor: primaryLight }}
			>
				{/* Já cobrado — fica acima do título */}
				{fichaData.previsao.tipo === "cobrado_mes" && (
					<div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
						<span>&#10003;</span>
						<span>
							Já cobrado neste mês —{" "}
							{formatCurrency(fichaData.previsao.total)}
						</span>
					</div>
				)}

				<div className="text-base font-semibold text-gray-700">
					Estimativas *
				</div>

				{/* Outros status */}
				{fichaData.previsao.tipo === "inativo" && (
					<div className="text-xs text-gray-400 italic">
						Contrato inativo — sem cobranças previstas.
					</div>
				)}
				{fichaData.previsao.tipo === "remido" && (
					<div className="text-xs text-gray-400 italic">
						Contrato remido — isento de taxa.
					</div>
				)}
				{fichaData.previsao.tipo === "pendente" &&
					fichaData.previsao.qtdAntigos > 0 &&
					fichaData.previsao.diasRestantes <= 0 && (
						<div className="text-[10px] text-red-500">
							&#9888; Mais {fichaData.previsao.qtdAntigos}{" "}
							cobrança
							{fichaData.previsao.qtdAntigos > 1 ? "s" : ""} de
							meses anteriores em aberto — consultar histórico.
						</div>
					)}
				{fichaData.previsao.tipo === "previsao" && (
					<div
						className={`flex items-center gap-1.5 text-xs font-medium rounded px-2 py-1 border ${fichaData.previsao.diasRestantes <= 30 ? "text-blue-700 bg-blue-50 border-blue-200" : "text-gray-600 bg-gray-50 border-gray-200"}`}
					>
						<span>&rarr;</span>
						{fichaData.previsao.diasRestantes <= 30 ? (
							<span>
								Próximos 30 dias —{" "}
								{formatCurrency(fichaData.previsao.valor)}{" "}
								<span className="font-normal opacity-70">
									(em ~{fichaData.previsao.diasRestantes} dia
									{fichaData.previsao.diasRestantes !== 1
										? "s"
										: ""}
									,{" "}
									{fichaData.previsao.data.toLocaleDateString(
										"pt-BR",
										{ day: "2-digit", month: "2-digit" },
									)}
									)
								</span>
							</span>
						) : (
							<span>
								Próxima cobrança:{" "}
								{fichaData.previsao.data.toLocaleDateString(
									"pt-BR",
									{ month: "long", year: "numeric" },
								)}{" "}
								— {formatCurrency(fichaData.previsao.valor)}
							</span>
						)}
					</div>
				)}
				{fichaData.previsao.tipo === "sem_historico" && (
					<div className="text-xs text-gray-400 italic">
						Sem histórico de cobranças — estimativa teórica abaixo.
					</div>
				)}
				{fichaData.previsao.tipo === "pendente" && (
					<div className="flex items-center gap-1 text-xs text-amber-700">
						<span>&#9888;</span>
						<span>
							{fichaData.previsao.qtd} cobrança
							{fichaData.previsao.qtd > 1 ? "s" : ""} de plano em
							aberto —{" "}
							<span className="font-mono font-medium">
								{formatCurrency(
									fichaData.previsao.totalRecente,
								)}
							</span>
							{fichaData.previsao.diasRestantes > 0
								? ` · previsão de receber em ${fichaData.previsao.diasRestantes} dia${fichaData.previsao.diasRestantes !== 1 ? "s" : ""}`
								: fichaData.previsao.diasRestantes < 0
									? ` · venceu há ${Math.abs(fichaData.previsao.diasRestantes)} dia${Math.abs(fichaData.previsao.diasRestantes) !== 1 ? "s" : ""}`
									: " · vence hoje"}
						</span>
					</div>
				)}
				{"extras" in fichaData.previsao &&
					fichaData.previsao.extras && (
						<div className="flex items-center gap-1 text-xs text-amber-700">
							<span>&#9888;</span>
							<span>
								{fichaData.previsao.extras.qtd} cobrança
								{fichaData.previsao.extras.qtd > 1
									? "s"
									: ""}{" "}
								adicional
								{fichaData.previsao.extras.qtd > 1
									? "is"
									: ""}{" "}
								em aberto —{" "}
								<span className="font-mono font-medium">
									{formatCurrency(
										fichaData.previsao.extras.total,
									)}
								</span>
								{fichaData.previsao.extras.diasRestantes > 0
									? ` · previsão de receber em ${fichaData.previsao.extras.diasRestantes} dia${fichaData.previsao.extras.diasRestantes !== 1 ? "s" : ""}`
									: fichaData.previsao.extras.diasRestantes <
										  0
										? ` · venceu há ${Math.abs(fichaData.previsao.extras.diasRestantes)} dia${Math.abs(fichaData.previsao.extras.diasRestantes) !== 1 ? "s" : ""}`
										: " · vence hoje"}
							</span>
						</div>
					)}

				{/* Coluna de valores */}
				<div className="flex flex-col gap-0.5 text-xs mt-0.5">
					<div className="flex justify-between items-center">
						<span className="text-gray-600">Mensalidade</span>
						<span
							className="font-mono font-medium"
							style={{ color: primary }}
						>
							{formatCurrency(
								fichaData.grupoOuCategoriaAlterado
									? fichaData.origValorMensalidade
									: fichaData.valorMensalidade,
							)}
						</span>
					</div>
					{fichaData.paidPlanMes > 0 && (
						<div className="flex justify-between items-center text-green-700">
							<span>Plano pago neste mês</span>
							<span className="font-mono font-medium">
								&#8722;{formatCurrency(fichaData.paidPlanMes)}
							</span>
						</div>
					)}
					{fichaData.grupoOuCategoriaAlterado &&
						fichaData.diferencaMensalidade !== 0 && (
							<div
								className={`flex justify-between items-center ${fichaData.diferencaMensalidade > 0 ? "text-orange-600" : "text-green-700"}`}
							>
								<span>Diferença (novo grupo/cat.)</span>
								<span className="font-mono font-medium">
									{fichaData.diferencaMensalidade > 0
										? `+${formatCurrency(fichaData.diferencaMensalidade)}`
										: formatCurrency(
												fichaData.diferencaMensalidade,
											)}
								</span>
							</div>
						)}
					{fichaData.carne && (
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Parc. Carné</span>
							<span
								className="font-mono font-medium"
								style={{ color: primary }}
							>
								{formatCurrency(fichaData.carne.vlPorParcela)}
							</span>
						</div>
					)}
					<div className="border-t border-gray-300 my-1" />
					<div className="flex justify-between items-center">
						<span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
							Saldo Devedor
						</span>
						<span
							className="font-mono font-bold text-base"
							style={{ color: primary }}
						>
							{formatCurrency(
								(fichaData.totalVencido > 0
									? fichaData.totalVencido
									: Math.max(0, fichaData.totalMensal - fichaData.paidPlanMes)
								) + fichaData.diferencaMensalidade,
							)}
						</span>
					</div>
					<div className="border-t border-gray-200 my-1" />
					<div className="flex justify-between items-center text-gray-400">
						<div>
							{" "}
							<div className="text-[10px] text-gray-400">
								* Baseada na última circular do grupo, categoria
								e carné vinculado.
							</div>{" "}
							<span className="text-[10px] uppercase tracking-wide">
								Próximo mês
							</span>
						</div>

						<span className="font-mono font-semibold text-sm">
							{formatCurrency(fichaData.totalMensal)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
