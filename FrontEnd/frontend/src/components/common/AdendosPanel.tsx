/**
 * AdendosPanel — lista e inclusão de adendos vinculados a um contrato.
 * Dados financeiros armazenados em ADENCOB.DBF (tabela dedicada).
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { Btn } from "./PageHeader";
import { useAppStore } from "../../store/appStore";
import { writeDbfFile } from "../../services/dbf/DbfReader";
import { formatDate, formatCurrency } from "../../utils/formatters";
import type { DbfRecord } from "../../types/models";

const IS_DEMO = import.meta.env.VITE_MODE_DEMO === "true";

interface Props {
	codigo: string;
	hideList?: boolean;
	onFooterChange?: (el: React.ReactNode) => void;
}

interface Produto {
	codigo: string;
	produto: string;
	unid: string;
	grupo: string;
	preco_ven: number;
}

interface AdencobRec {
	seq: string;
	codigo: string;
	codproduto: string;
	valor: number;
	nparcelas: number;
	permanente: string; // 'S' | 'N'
	tipcob: string; // M/B/T/S/A
	formapgto: string; // 01/02/...
	datainicio_: Date | null;
	em_: Date | null;
	por: string;
	flag_excl: string;
}

const TIPCOB_OPTS = [
	{ value: "M", label: "Mensal" },
	{ value: "B", label: "Bimestral" },
	{ value: "T", label: "Trimestral" },
	{ value: "S", label: "Semestral" },
	{ value: "A", label: "Anual" },
];
const TIPCOB_LABEL: Record<string, string> = {
	M: "Mensal",
	B: "Bimestral",
	T: "Trimestral",
	S: "Semestral",
	A: "Anual",
};


function nextSeq(records: DbfRecord[]): string {
	const max = records.reduce((m, r) => {
		const n = parseInt(String(r.seq ?? "0"), 10);
		return n > m ? n : m;
	}, 0);
	return String(max + 1).padStart(6, "0");
}

export function AdendosPanel({ codigo, hideList, onFooterChange }: Props) {
	const { dirHandle, usuario, getTable, setTable } = useAppStore();
	useAppStore((s) => s.tables);

	const codigoPad = String(codigo).padStart(9, "0");

	// ── Estado do formulário ─────────────────────────────────────────────────────
	const [step, setStep] = useState<"produto" | "cobranca">("produto");
	const [codProdInput, setCodProdInput] = useState("");
	const [produtoSel, setProdutoSel] = useState<Produto | null>(null);
	const [termoBusca, setTermoBusca] = useState("");

	// Campos financeiros
	const [valor, setValor] = useState("");
	const [nparcelas, setNparcelas] = useState("1");
	const [permanente, setPermanente] = useState(false);
	const [tipcob, setTipcob] = useState("M");
	const [formapgto, setFormapgto] = useState("01");
	const [dataInicio, setDataInicio] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);
	const [dataIncl, setDataIncl] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);

	const [salvando, setSalvando] = useState(false);
	const [erro, setErro] = useState("");
	const [sucesso, setSucesso] = useState("");

	// ── Tabelas ──────────────────────────────────────────────────────────────────
	const adendosTable = getTable("adendos");
	const adencobTable = getTable("adencob");
	const pradendoTable = getTable("pradendo");
	const taxasTable = getTable("taxas");

	const produtos = useMemo<Produto[]>(() => {
		if (!pradendoTable) return [];
		return pradendoTable.records
			.filter((r) => !r._deleted)
			.map((r) => ({
				codigo: String(r.codigo ?? "").trim(),
				produto: String(r.produto ?? "").trim(),
				unid: String(r.unid ?? "").trim(),
				grupo: String(r.grupo ?? "").trim(),
				preco_ven: Number(r.preco_ven ?? 0),
			}))
			.sort((a, b) => a.produto.localeCompare(b.produto));
	}, [pradendoTable]);

	const produtosMap = useMemo(() => {
		const m = new Map<string, Produto>();
		produtos.forEach((p) => m.set(p.codigo, p));
		return m;
	}, [produtos]);

	const produtosFiltrados = useMemo(() => {
		const t = termoBusca.trim().toUpperCase();
		if (!t) return produtos;
		return produtos.filter(
			(p) =>
				p.produto.toUpperCase().includes(t) ||
				p.codigo.includes(t) ||
				p.grupo.toUpperCase().includes(t),
		);
	}, [produtos, termoBusca]);

	const adendos = useMemo(() => {
		if (!adendosTable) return [];
		return adendosTable.records.filter(
			(r) =>
				!r._deleted &&
				String(r.flag_excl ?? "").trim() !== "*" &&
				String(r.codigo ?? "").trim() === codigoPad,
		);
	}, [adendosTable, codigoPad]);

	const adencobs = useMemo<AdencobRec[]>(() => {
		if (!adencobTable) return [];
		return adencobTable.records
			.filter(
				(r) =>
					!r._deleted &&
					String(r.flag_excl ?? "").trim() !== "*" &&
					String(r.codigo ?? "").trim() === codigoPad,
			)
			.map((r) => ({
				seq: String(r.seq ?? "").trim(),
				codigo: String(r.codigo ?? "").trim(),
				codproduto: String(r.codproduto ?? "").trim(),
				valor: Number(r.valor ?? 0),
				nparcelas: Number(r.nparcelas ?? 1),
				permanente: String(r.permanente ?? "N").trim(),
				tipcob: String(r.tipcob ?? "M").trim(),
				formapgto: String(r.formapgto ?? "01").trim(),
				datainicio_:
					r.datainicio_ instanceof Date ? r.datainicio_ : null,
				em_: r.em_ instanceof Date ? r.em_ : null,
				por: String(r.por ?? "").trim(),
				flag_excl: String(r.flag_excl ?? " ").trim(),
			}));
	}, [adencobTable, codigoPad]);

	// ── Selecionar produto ───────────────────────────────────────────────────────
	function handleSelecionarProduto(p: Produto) {
		setProdutoSel(p);
		setCodProdInput(p.codigo);
		setTermoBusca("");
		setErro("");
		setSucesso("");
		setValor(p.preco_ven > 0 ? String(p.preco_ven) : "");
		setStep("produto");
	}

	function handleCodProdBlur() {
		const cod = codProdInput.trim().padStart(4, "0");
		const found = produtosMap.get(cod);
		if (found) {
			handleSelecionarProduto(found);
		} else if (codProdInput.trim()) {
			setProdutoSel(null);
			setErro(
				`Produto "${codProdInput.trim()}" não encontrado. Use a busca.`,
			);
		}
	}

	function handleAvancarCobranca() {
		if (!produtoSel) {
			setErro("Selecione um produto.");
			return;
		}
		const codFinal = produtoSel.codigo;
		if (
			adendos.some((r) => String(r.codproduto ?? "").trim() === codFinal)
		) {
			setErro("Já existe um produto / serviço ativo para este contrato.");
			return;
		}
		setErro("");
		setStep("cobranca");
	}

	function handleVoltarProduto() {
		setStep("produto");
		setErro("");
	}

	// ── Salvar ───────────────────────────────────────────────────────────────────
	async function handleSalvar() {
		if (!produtoSel) {
			setErro("Selecione um produto.");
			return;
		}
		if (!IS_DEMO && !dirHandle) {
			setErro("Pasta de dados não configurada.");
			return;
		}

		const valorNum = parseFloat(valor.replace(",", "."));
		if (isNaN(valorNum) || valorNum <= 0) {
			setErro("Informe um valor válido.");
			return;
		}
		const parcs = parseInt(nparcelas, 10);
		if (isNaN(parcs) || parcs < 1) {
			setErro("Informe o número de parcelas.");
			return;
		}

		setSalvando(true);
		setErro("");
		try {
			const hoje = new Date();
			const codFinal = produtoSel.codigo;

			// ── 1. Salva em ADENDOS.DBF (registro base) ──────────────────────────
			const novoAdendo: DbfRecord = {
				codigo: codigoPad,
				codproduto: codFinal,
				incluido_: new Date(dataIncl + "T12:00:00"),
				idxd: "",
				idxm: "",
				flag_excl: " ",
				por: usuario ?? "SIS",
			};
			const baseAdendos = adendosTable ?? {
				header: {
					version: 3,
					lastUpdate: hoje,
					recordCount: 0,
					headerSize: 0,
					recordSize: 0,
					fields: [],
				},
				records: [],
			};
			const newAdendos = {
				...baseAdendos,
				records: [...baseAdendos.records, novoAdendo],
				header: {
					...baseAdendos.header,
					recordCount: baseAdendos.records.length + 1,
				},
			};
			await writeDbfFile(dirHandle!, "ADENDOS.DBF", newAdendos);
			setTable("adendos", newAdendos);

			// ── 2. Salva em ADENCOB.DBF (dados financeiros) ──────────────────────
			const baseAdencob = adencobTable ?? {
				header: {
					version: 3,
					lastUpdate: hoje,
					recordCount: 0,
					headerSize: 0,
					recordSize: 0,
					fields: [],
				},
				records: [],
			};
			const seqNovo = nextSeq(baseAdencob.records);
			const novoAdencob: DbfRecord = {
				seq: seqNovo,
				codigo: codigoPad,
				codproduto: codFinal,
				valor: valorNum,
				nparcelas: parcs,
				permanente: permanente ? "S" : "N",
				tipcob: permanente ? tipcob : "M",
				formapgto: formapgto,
				datainicio_: new Date(dataInicio + "T12:00:00"),
				em_: hoje,
				por: usuario ?? "SIS",
				flag_excl: " ",
			};
			const newAdencob = {
				...baseAdencob,
				records: [...baseAdencob.records, novoAdencob],
				header: {
					...baseAdencob.header,
					recordCount: baseAdencob.records.length + 1,
				},
			};
			await writeDbfFile(dirHandle!, "ADENCOB.DBF", newAdencob);
			setTable("adencob", newAdencob);

			// ── 3. Gera TAXAS com tipo=5 ──────────────────────────────────────
			const addDays = (base: Date, days: number): Date => {
				const d = new Date(base);
				d.setDate(d.getDate() + days);
				return d;
			};
			const dataInicioDate = new Date(dataInicio + "T12:00:00");

			// circ sequencial por contrato para tipo=5
			const circMax = (taxasTable?.records ?? []).reduce((m, r) => {
				const t = String(r.tipo ?? "").trim();
				if (
					r._deleted ||
					(t !== "5" && t !== "9") ||
					String(r.codigo ?? "").trim() !== codigoPad
				)
					return m;
				const n = parseInt(String(r.circ ?? "0"), 10);
				return n > m ? n : m;
			}, 0);

			const novasTaxas: DbfRecord[] = [];

			if (permanente) {
				const mult: Record<string, number> = {
					M: 1,
					B: 2,
					T: 3,
					S: 6,
					A: 12,
				};
				const taxaValor = valorNum * (mult[tipcob] ?? 1);
				// Primeira cobrança sempre em ~30 dias, independente da periodicidade.
				// O valor já reflete o período completo (ex: anual = valor × 12).
				// A próxima cobrança será gerada após o pagamento + N meses do ciclo.
				const vencimento = addDays(dataInicioDate, 30);
				novasTaxas.push({
					codigo: codigoPad,
					tipo: "5",
					circ: String(circMax + 1).padStart(3, "0"),
					emissao_: vencimento,
					valor: taxaValor,
					pgto_: null,
					valorpg: 0,
					cobrador: "",
					forma: "",
					baixa_: null,
					por: usuario ?? "SIS",
					stat: "1",
					filial: "",
					flag_excl: " ",
					cedente: "",
					nnumero: "",
					codlan: seqNovo, // identifica o ADENCOB que gerou esta taxa
				});
			} else {
				const vlParcela =
					Math.round((valorNum / parcs) * 100) / 100;
				for (let i = 0; i < parcs; i++) {
					novasTaxas.push({
						codigo: codigoPad,
						tipo: "9",
						circ: String(circMax + 1 + i).padStart(3, "0"),
						emissao_: addDays(dataInicioDate, (i + 1) * 30),
						valor: vlParcela,
						pgto_: null,
						valorpg: 0,
						cobrador: "",
						forma: "",
						baixa_: null,
						por: usuario ?? "SIS",
						stat: "1",
						filial: "",
						flag_excl: " ",
						cedente: "",
						nnumero: "",
						codlan: seqNovo, // identifica o ADENCOB que gerou esta taxa
					});
				}
			}

			const baseTaxas = taxasTable ?? {
				header: {
					version: 3,
					lastUpdate: hoje,
					recordCount: 0,
					headerSize: 0,
					recordSize: 0,
					fields: [],
				},
				records: [],
			};
			const newTaxas = {
				...baseTaxas,
				records: [...baseTaxas.records, ...novasTaxas],
				header: {
					...baseTaxas.header,
					recordCount:
						baseTaxas.records.length + novasTaxas.length,
				},
			};
			await writeDbfFile(dirHandle!, "TAXAS.DBF", newTaxas);
			setTable("taxas", newTaxas);

			setSucesso(
				`Produto / serviço "${produtoSel.produto}" adicionado com sucesso.`,
			);
			resetForm();
		} catch (e) {
			setErro(String(e));
		} finally {
			setSalvando(false);
		}
	}

	function resetForm() {
		setCodProdInput("");
		setProdutoSel(null);
		setTermoBusca("");
		setValor("");
		setNparcelas("1");
		setPermanente(false);
		setTipcob("M");
		setFormapgto("01");
		setDataInicio(new Date().toISOString().slice(0, 10));
		setDataIncl(new Date().toISOString().slice(0, 10));
		setStep("produto");
		setErro("");
	}

	// ── Footer dinâmico (botões enviados para a modal pai) ───────────────────────
	const handlersRef = useRef({ handleAvancarCobranca, handleVoltarProduto, handleSalvar });
	handlersRef.current = { handleAvancarCobranca, handleVoltarProduto, handleSalvar };

	useEffect(() => {
		if (!onFooterChange) return;
		const next   = () => handlersRef.current.handleAvancarCobranca();
		const back   = () => handlersRef.current.handleVoltarProduto();
		const save   = () => handlersRef.current.handleSalvar();
		if (step === "produto") {
			onFooterChange(
				<Btn onClick={next} disabled={salvando || !produtoSel}>
					Próximo →
				</Btn>,
			);
		} else {
			onFooterChange(
				<>
					<Btn variant="secondary" onClick={back} disabled={salvando}>← Voltar</Btn>
					<Btn onClick={save} disabled={salvando || !dirHandle}>
						{salvando ? "Salvando..." : "✓ Confirmar"}
					</Btn>
				</>,
			);
		}
	}, [step, produtoSel, salvando, dirHandle, onFooterChange]);

	// ── Remover ──────────────────────────────────────────────────────────────────
	async function handleRemover(adendoIdx: number, codproduto: string) {
		if (!dirHandle || !adendosTable) return;
		setSalvando(true);
		try {
			// Remove de ADENDOS
			const newAdendosRecords = adendosTable.records.map((r, i) =>
				i === adendoIdx ? { ...r, flag_excl: "*", _deleted: true } : r,
			);
			const newAdendos = { ...adendosTable, records: newAdendosRecords };
			await writeDbfFile(dirHandle!, "ADENDOS.DBF", newAdendos);
			setTable("adendos", newAdendos);

			// Remove registros correspondentes de ADENCOB
			if (adencobTable) {
				const newAdencobRecords = adencobTable.records.map((r) =>
					String(r.codigo ?? "").trim() === codigoPad &&
					String(r.codproduto ?? "").trim() === codproduto
						? { ...r, flag_excl: "*", _deleted: true }
						: r,
				);
				const newAdencob = {
					...adencobTable,
					records: newAdencobRecords,
				};
				await writeDbfFile(dirHandle!, "ADENCOB.DBF", newAdencob);
				setTable("adencob", newAdencob);
			}
			setSucesso("Produto / serviço removido.");
		} catch (e) {
			setErro(String(e));
		} finally {
			setSalvando(false);
		}
	}

	// ── Render ───────────────────────────────────────────────────────────────────
	return (
		<div className="flex flex-col gap-4">
			{/* ── Lista de adendos ────────────────────────────────────────────── */}
			{!hideList && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
							Produtos / Serviços Ativos
						</span>
						<span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
							{adendos.length}
						</span>
					</div>

					{adendos.length === 0 ? (
						<p className="text-sm text-gray-400 italic text-center py-6 border rounded bg-gray-50">
							Nenhum produto / serviço cadastrado para este
							contrato.
						</p>
					) : (
						<div className="border rounded overflow-hidden">
							<table className="w-full text-xs">
								<thead className="bg-blue-900 text-white">
									<tr>
										<th className="px-3 py-1.5 text-left">
											Cód.
										</th>
										<th className="px-3 py-1.5 text-left">
											Produto / Serviço
										</th>
										<th className="px-3 py-1.5 text-right">
											Valor
										</th>
										<th className="px-3 py-1.5 text-center">
											Parcelas
										</th>
										<th className="px-3 py-1.5 text-center">
											Tipo
										</th>
										<th className="px-3 py-1.5 text-center">
											Início
										</th>
										<th className="px-3 py-1.5 text-left">
											Por
										</th>
										<th className="px-3 py-1.5 text-center w-20">
											Ação
										</th>
									</tr>
								</thead>
								<tbody>
									{adendos.map((r, i) => {
										const codP = String(
											r.codproduto ?? "",
										).trim();
										const prod = produtosMap.get(codP);
										const cob = adencobs.find(
											(c) => c.codproduto === codP,
										);
										const realIdx = (
											adendosTable?.records ?? []
										).indexOf(r);
										return (
											<tr
												key={i}
												className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
											>
												<td className="px-3 py-1.5 font-mono">
													{codP}
												</td>
												<td className="px-3 py-1.5 font-medium">
													{prod?.produto ?? (
														<span className="text-gray-400 italic">
															—
														</span>
													)}
												</td>
												<td className="px-3 py-1.5 text-right font-mono">
													{cob
														? formatCurrency(
																cob.valor,
															)
														: "—"}
												</td>
												<td className="px-3 py-1.5 text-center">
													{cob ? (
														cob.permanente ===
														"S" ? (
															<span className="text-green-700 font-medium">
																∞{" "}
																{TIPCOB_LABEL[
																	cob.tipcob
																] ?? cob.tipcob}
															</span>
														) : (
															`${cob.nparcelas}×`
														)
													) : (
														"—"
													)}
												</td>
												<td className="px-3 py-1.5 text-center text-gray-500">
													{cob
														? cob.permanente === "S"
															? "Permanente"
															: cob.nparcelas > 1
																? "Parcelado"
																: "À vista"
														: "—"}
												</td>
												<td className="px-3 py-1.5 text-center">
													{cob
														? formatDate(
																cob.datainicio_,
															)
														: formatDate(
																r.incluido_ as Date | null,
															)}
												</td>
												<td className="px-3 py-1.5 text-gray-600">
													{String(
														r.por ?? "",
													).trim() || "—"}
												</td>
												<td className="px-3 py-1.5 text-center">
													<button
														onClick={() =>
															handleRemover(
																realIdx,
																codP,
															)
														}
														disabled={
															salvando ||
															!dirHandle
														}
														className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5 rounded border border-red-200 hover:bg-red-50 disabled:opacity-40 transition"
													>
														Remover
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* ── Formulário ───────────────────────────────────────────────────── */}
			<div className="border-t pt-4">
				{/* Step 1 — Produto */}
				{step === "produto" && (
					<div className="flex flex-col gap-3">
						<div className="flex gap-2 items-end flex-wrap">
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Código do Produto{" "}
									<span className="text-red-500">*</span>
								</label>
								<input
									value={codProdInput}
									onChange={(e) => {
										setCodProdInput(
											e.target.value.toUpperCase(),
										);
										setProdutoSel(null);
										setErro("");
										setSucesso("");
									}}
									onBlur={handleCodProdBlur}
									onKeyDown={(e) =>
										e.key === "Enter" && handleCodProdBlur()
									}
									placeholder="0001"
									disabled={salvando}
									maxLength={4}
									className="w-24 border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
							</div>

							{produtoSel && (
								<div className="flex-1 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-xs">
									<span className="font-mono text-blue-700">
										{produtoSel.codigo}
									</span>
									{" — "}
									<span className="font-medium text-blue-900">
										{produtoSel.produto}
									</span>
									{produtoSel.grupo && (
										<span className="ml-1 text-blue-500">
											({produtoSel.grupo})
										</span>
									)}
									{produtoSel.preco_ven > 0 && (
										<span className="ml-2 text-green-700 font-mono">
											{formatCurrency(
												produtoSel.preco_ven,
											)}
										</span>
									)}
								</div>
							)}

							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Data de Inclusão
								</label>
								<input
									type="date"
									value={dataIncl}
									onChange={(e) =>
										setDataIncl(e.target.value)
									}
									disabled={salvando}
									className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
							</div>

{!onFooterChange && (
								<Btn
									onClick={handleAvancarCobranca}
									disabled={salvando || !produtoSel}
								>
									Próximo →
								</Btn>
							)}
						</div>

						{/* Busca sempre visível */}
						<div className="border border-blue-200 rounded-lg bg-blue-50 p-3">
							<div className="flex items-center gap-2 mb-2">
								<input
									value={termoBusca}
									onChange={(e) =>
										setTermoBusca(e.target.value)
									}
									placeholder="Filtrar por nome, código ou grupo..."
									className="flex-1 border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
							</div>
							{produtos.length === 0 ? (
								<div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
									<p className="font-medium mb-1">
										PRADENDO.DBF não tem produtos
										cadastrados.
									</p>
									<p className="text-orange-600">
										Digite o código diretamente no campo
										acima.
									</p>
								</div>
							) : produtosFiltrados.length === 0 ? (
								<p className="text-xs text-gray-500 italic py-2">
									Nenhum produto encontrado.
								</p>
							) : (
								<div
									className="overflow-auto rounded border border-blue-200 bg-white"
									style={{ height: "200px" }}
								>
									<table className="w-full text-xs border-collapse">
										<thead>
											<tr className="bg-blue-900 text-white sticky top-0">
												<th className="px-2 py-1 text-left">
													Cód.
												</th>
												<th className="px-2 py-1 text-left">
													Produto / Serviço
												</th>
												<th className="px-2 py-1 text-left">
													Grupo
												</th>
												<th className="px-2 py-1 text-right">
													Preço
												</th>
												<th className="px-2 py-1"></th>
											</tr>
										</thead>
										<tbody>
											{produtosFiltrados.map((p, i) => {
												const jaAdicionado =
													adendos.some(
														(r) =>
															String(
																r.codproduto ??
																	"",
															).trim() ===
															p.codigo,
													);
												return (
													<tr
														key={i}
														onClick={() =>
															!jaAdicionado &&
															handleSelecionarProduto(
																p,
															)
														}
														className={`border-b border-gray-100 ${
															jaAdicionado
																? "bg-gray-50 opacity-50 cursor-not-allowed"
																: "hover:bg-yellow-50 cursor-pointer"
														} ${i % 2 === 0 ? "" : "bg-gray-50"}`}
													>
														<td className="px-2 py-1.5 font-mono">
															{p.codigo}
														</td>
														<td className="px-2 py-1.5 font-medium">
															{p.produto}
														</td>
														<td className="px-2 py-1.5 text-gray-500">
															{p.grupo}
														</td>
														<td className="px-2 py-1.5 text-right font-mono text-green-700">
															{p.preco_ven > 0
																? formatCurrency(
																		p.preco_ven,
																	)
																: "—"}
														</td>
														<td className="px-2 py-1.5 text-center">
															{jaAdicionado ? (
																<span className="text-xs text-green-600 font-medium">
																	✓ Adicionado
																</span>
															) : (
																<span className="text-blue-600 font-bold">
																	→
																</span>
															)}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Step 2 — Dados de Cobrança */}
				{step === "cobranca" && produtoSel && (
					<div className="flex flex-col gap-4">
						{/* Produto selecionado */}
						<div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs flex items-center justify-between">
							<div>
								<span className="font-mono text-blue-700">
									{produtoSel.codigo}
								</span>
								{" — "}
								<span className="font-semibold text-blue-900">
									{produtoSel.produto}
								</span>
							</div>

						</div>

						<div className="grid grid-cols-4 gap-3 items-end">
							{/* Valor */}
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Valor Total <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={valor ? formatCurrency(parseFloat(valor) || 0) : ""}
									readOnly
									placeholder="R$ 0,00"
									className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50 cursor-default text-gray-700 focus:outline-none"
								/>
							</div>

							{/* Nº Parcelas */}
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Nº Parcelas <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									min="1"
									max="99"
									value={nparcelas}
									onChange={(e) => setNparcelas(e.target.value)}
									disabled={permanente}
									className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-400"
								/>
							</div>

							{/* Data Início */}
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Data Início
								</label>
								<input
									type="date"
									value={dataInicio}
									onChange={(e) => setDataInicio(e.target.value)}
									className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
							</div>

							{/* Permanente toggle */}
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Cobrança Permanente
								</label>
								<div className="flex items-center gap-2 h-[34px]">
									<div
										onClick={() => setPermanente((v) => !v)}
										className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${permanente ? "bg-green-500" : "bg-gray-300"}`}
									>
										<div
											className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${permanente ? "translate-x-5" : "translate-x-0.5"}`}
										/>
									</div>
									{permanente && (
										<select
											value={tipcob}
											onChange={(e) => setTipcob(e.target.value)}
											className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
										>
											{TIPCOB_OPTS.map((o) => (
												<option key={o.value} value={o.value}>
													{o.label}
												</option>
											))}
										</select>
									)}
								</div>
							</div>
						</div>

						{/* Resumo */}
						{valor && (
							<div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-xs text-green-800">
								{permanente ? (
									<>
										Cobrança de{" "}
										<strong>
											{formatCurrency(
												parseFloat(
													valor.replace(",", "."),
												) || 0,
											)}
										</strong>{" "}
										por período · {TIPCOB_LABEL[tipcob]} ·
										permanente
									</>
								) : (
									<>
										Total de{" "}
										<strong>
											{formatCurrency(
												parseFloat(
													valor.replace(",", "."),
												) || 0,
											)}
										</strong>{" "}
										em <strong>{nparcelas}×</strong> de{" "}
										<strong>
											{formatCurrency(
												(parseFloat(
													valor.replace(",", "."),
												) || 0) /
													(parseInt(nparcelas) || 1),
											)}
										</strong>
									</>
								)}
							</div>
						)}

						{!onFooterChange && (
							<div className="flex gap-2">
								<Btn variant="secondary" onClick={handleVoltarProduto} disabled={salvando}>← Voltar</Btn>
								<Btn onClick={handleSalvar} disabled={salvando || !dirHandle}>
									{salvando ? "Salvando..." : "✓ Confirmar"}
								</Btn>
							</div>
						)}
					</div>
				)}

				{/* Feedback */}
				{erro && (
					<p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5 mt-2">
						⚠️ {erro}
					</p>
				)}
				{sucesso && (
					<p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1.5 mt-2">
						✅ {sucesso}
					</p>
				)}
				{!dirHandle && (
					<p className="text-xs text-orange-600 italic mt-1">
						Configure a pasta de dados no Setup para habilitar
						inclusão de produtos / serviços.
					</p>
				)}
			</div>
		</div>
	);
}
