/**
 * Atendimentos (0800) — recepção de chamadas / atendimento ao cliente
 * Inclui: recebimento de taxa e acordo de dívidas (parcelamento).
 */
import { useState, useMemo, useRef } from "react";
import { useAppStore } from "../../store/appStore";
import {
	buscarContrato,
	listarTaxasPendentes,
	receberTaxa,
} from "../../services/recebimento";
import type {
	ContratoInfo,
	TaxaPendente,
	ResultadoRecebimento,
} from "../../services/recebimento";
import { fazerAcordo } from "../../services/acordo";
import type { ResultadoAcordo } from "../../services/acordo";
import { PageHeader, Btn } from "../../components/common/PageHeader";
import { BuscaContratoInput } from "../../components/common/BuscaContratoInput";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { writeDbfFile } from "../../services/dbf/DbfReader";
import type { DbfRecord } from "../../types/models";
import { AdendosPanel } from "../../components/common/AdendosPanel";
import { DBF_STRUCTURES } from "../../services/dbf/initializeDbfs";

const TIPO_LABEL: Record<string, string> = {
	"1": "Jóia",
	"2": "Taxa",
	"3": "Carnê",
};

// ─── Tela principal ────────────────────────────────────────────────────────────

type ModoTaxas = "receber" | "acordo";

export function Atendimentos() {
	const { dirHandle, usuario, setTables, setTable } = useAppStore();
	const tables = useAppStore((s) => s.tables); // subscreve tables → re-render quando muda

	// ── estado geral ────────────────────────────────────────────────────────────
	const [obs, setObs] = useState("");
	const [buscaInput, setBuscaInput] = useState("");
	const [dropdownAberto, setDropdownAberto] = useState(false);
	const [contrato, setContrato] = useState<ContratoInfo | null>(null);
	const [pendentes, setPendentes] = useState<TaxaPendente[]>([]);
	const [processando, setProcessando] = useState(false);
	const [erro, setErro] = useState("");
	const [atendSalvo, setAtendSalvo] = useState("");
	const [showSuccess, setShowSuccess] = useState(false);
	const [modoTaxas, setModoTaxas] = useState<ModoTaxas>("receber");
	const [abaContrato, setAbaContrato] = useState<"taxas" | "adendos">("taxas");
	const gravandoRef = useRef(false); // guard síncrono contra double-click

	// ── estado: recebimento individual ─────────────────────────────────────────
	const [taxaSel, setTaxaSel] = useState<TaxaPendente | null>(null);
	const [valorPago, setValorPago] = useState("");
	const [resultado, setResultado] = useState<ResultadoRecebimento | null>(
		null,
	);

	// ── estado: acordo ─────────────────────────────────────────────────────────
	const [taxasSel, setTaxasSel] = useState<Set<number>>(new Set()); // _taxaIdx
	const [valorAcordo, setValorAcordo] = useState("");
	const [parcelasAcordo, setParcelasAcordo] = useState("1");
	const [primVenc, setPrimVenc] = useState(() => {
		// Padrão: dia 5 do próximo mês
		const d = new Date();
		d.setMonth(d.getMonth() + 1);
		d.setDate(5);
		return d.toISOString().slice(0, 10);
	});
	const [obsAcordo, setObsAcordo] = useState("");
	const [resultadoAcordo, setResultadoAcordo] =
		useState<ResultadoAcordo | null>(null);

	const concluido = !!resultado || !!atendSalvo || !!resultadoAcordo;

	// ─── helpers ─────────────────────────────────────────────────────────────────
	const numParcelas = parseInt(parcelasAcordo) || 1;
	const vlAcordo = parseFloat(valorAcordo.replace(",", ".")) || 0;
	const vlParc =
		numParcelas > 0 && vlAcordo > 0
			? parseFloat((vlAcordo / numParcelas).toFixed(2))
			: 0;

	// Preview: próximas circs sequenciais para o grupo do contrato
	const previewCircs = useMemo(() => {
		if (!contrato) return [];
		const arqgrupTable = tables.get("arqgrup");
		let proxNum = 1;
		if (arqgrupTable) {
			const rec = arqgrupTable.records.find(
				(r) =>
					!r._deleted &&
					String(r.grup ?? "").trim() === contrato.grupo,
			);
			if (rec) {
				proxNum =
					parseInt(String(rec.proxcirc ?? "").trim()) ||
					parseInt(String(rec.ultcirc ?? "").trim()) + 1 ||
					1;
			}
		}
		return Array.from({ length: numParcelas }, (_, i) =>
			String(proxNum + i).padStart(3, "0"),
		);
	}, [contrato, tables, numParcelas]);

	// ─── Busca contrato ──────────────────────────────────────────────────────────
	function handleBuscar(codigoOpt?: string) {
		setErro("");
		setContrato(null);
		setPendentes([]);
		setTaxaSel(null);
		setTaxasSel(new Set());
		setResultado(null);
		setResultadoAcordo(null);
		setAtendSalvo("");
		setDropdownAberto(false);

		const codigo = (codigoOpt ?? buscaInput).trim().padStart(9, "0");
		setBuscaInput(codigo);

		const c = buscarContrato(tables, codigo);
		if (!c) {
			setErro(`Contrato ${codigo} não encontrado.`);
			return;
		}

		const lista = listarTaxasPendentes(tables, codigo);
		setContrato(c);
		setPendentes(lista);
	}

	// ─── Toggle seleção para acordo ──────────────────────────────────────────────
	function toggleAcordo(idx: number) {
		setTaxasSel((prev) => {
			const next = new Set(prev);
			next.has(idx) ? next.delete(idx) : next.add(idx);
			return next;
		});
	}

	function toggleTodas() {
		if (taxasSel.size === pendentes.length) {
			setTaxasSel(new Set());
		} else {
			setTaxasSel(new Set(pendentes.map((t) => t._taxaIdx)));
		}
	}

	// ─── Gera número de atendimento ──────────────────────────────────────────────
	function proximoNumAtendimento(): string {
		const atend800 = tables.get("atend800");
		let max = 0;
		atend800?.records.forEach((r) => {
			const n = parseInt(String(r.numero ?? "")) || 0;
			if (n > max) max = n;
		});
		return String(max + 1).padStart(8, "0");
	}

	// ─── Salva registro em ATEND800 ──────────────────────────────────────────────
	async function salvarAtendimento(tipo: string): Promise<string> {
		if (!dirHandle) throw new Error("Pasta de dados não configurada.");
		const atend800 = tables.get("atend800");
		const numero = proximoNumAtendimento();
		const agora = new Date();
		const hora = agora.toTimeString().slice(0, 5);

		const novoReg: DbfRecord = {
			numero,
			data_: agora,
			hora,
			codigo: contrato?.codigo ?? "",
			nome: contrato?.nome ?? "",
			obs: obs.trim(),
			tipo,
			stat: "A",
			por: usuario ?? "SIS",
			filial: "01",
		};

		const atend800Fields = DBF_STRUCTURES["ATEND800"];
		const newTable = atend800
			? {
					...atend800,
					records: [...atend800.records, novoReg],
					header: {
						...atend800.header,
						recordCount: atend800.records.length + 1,
					},
				}
			: {
					header: {
						version: 3,
						lastUpdate: agora,
						recordCount: 1,
						headerSize: 0,
						recordSize: 0,
						fields: atend800Fields,
					},
					records: [novoReg],
				};

		await writeDbfFile(dirHandle, "ATEND800.DBF", newTable);
		setTable("atend800", newTable); // atualiza store global — notifica todos os componentes
		return numero;
	}

	// ─── Seleciona taxa para recebimento ────────────────────────────────────────
	function handleSelecionarTaxa(t: TaxaPendente) {
		if (modoTaxas !== "receber") return;
		setTaxaSel(t);
		setValorPago(t.total.toFixed(2));
		setResultado(null);
		setErro("");
	}

	// ─── Confirma recebimento individual ────────────────────────────────────────
	async function handleConfirmarRecebimento() {
		if (gravandoRef.current || !taxaSel || !dirHandle) return;
		const vl = parseFloat(valorPago.replace(",", ".")) || 0;
		if (vl <= 0) {
			setErro("Informe um valor maior que zero.");
			return;
		}
		gravandoRef.current = true;
		setErro("");
		setProcessando(true);
		try {
			const res = await receberTaxa(
				dirHandle,
				tables,
				{ taxa: taxaSel, valorPago: vl, dataRecebimento: new Date() },
				usuario,
			);
			setTables(new Map(tables));
			setResultado(res);
			const novaLista = listarTaxasPendentes(tables, taxaSel.codigo);
			setPendentes(novaLista);
			setTaxaSel(null);
			setValorPago("");
		} catch (e) {
			setErro(String(e));
		} finally {
			gravandoRef.current = false;
			setProcessando(false);
		}
	}

	// ─── Confirma acordo ────────────────────────────────────────────────────────
	async function handleConfirmarAcordo() {
		if (gravandoRef.current || !dirHandle || taxasSel.size === 0) return;
		if (vlAcordo <= 0) {
			setErro("Informe o valor total do acordo.");
			return;
		}
		if (numParcelas < 1) {
			setErro("Número de parcelas inválido.");
			return;
		}

		gravandoRef.current = true;
		setErro("");
		setProcessando(true);
		try {
			const taxasParaAcordo = pendentes.filter((t) =>
				taxasSel.has(t._taxaIdx),
			);
			const res = await fazerAcordo(
				dirHandle,
				tables,
				{
					taxas: taxasParaAcordo,
					valorTotal: vlAcordo,
					numParcelas,
					primeiroVencimento: new Date(primVenc + "T12:00:00"),
					atendNumero: "",
					obsAcordo: obsAcordo.trim(),
				},
				usuario,
			);
			setTables(new Map(tables));
			setResultadoAcordo(res);

			// Atualiza lista de pendentes (as taxas acordadas foram baixadas)
			if (contrato) {
				const novaLista = listarTaxasPendentes(tables, contrato.codigo);
				setPendentes(novaLista);
			}
			setTaxasSel(new Set());
		} catch (e) {
			setErro(String(e));
		} finally {
			gravandoRef.current = false;
			setProcessando(false);
		}
	}

	// ─── Salvar atendimento ───────────────────────────────────────────────────────
	async function handleSalvarAtendimento() {
		if (gravandoRef.current || !contrato) {
			setErro("Selecione um contrato antes de salvar o atendimento.");
			return;
		}
		if (!obs.trim()) {
			setErro("Informe uma descrição/observação.");
			return;
		}
		gravandoRef.current = true;
		setErro("");
		setProcessando(true);
		try {
			// Tipo baseado no que foi feito durante o atendimento
			const tipo = resultado ? "R" : resultadoAcordo ? "C" : "A";
			const num = await salvarAtendimento(tipo);
			setAtendSalvo(num);
			setShowSuccess(true);
		} catch (e) {
			setErro(String(e));
		} finally {
			gravandoRef.current = false;
			setProcessando(false);
		}
	}

	function handleNovo() {
		setObs("");
		setBuscaInput("");
		setContrato(null);
		setPendentes([]);
		setTaxaSel(null);
		setValorPago("");
		setResultado(null);
		setErro("");
		setAtendSalvo("");
		setTaxasSel(new Set());
		setResultadoAcordo(null);
		setModoTaxas("receber");
		const d = new Date();
		d.setMonth(d.getMonth() + 1);
		d.setDate(5);
		setPrimVenc(d.toISOString().slice(0, 10));
	}

	// ─── Mudar modo de seleção ────────────────────────────────────────────────────
	function handleModoAcordo() {
		setModoTaxas("acordo");
		setTaxaSel(null);
		setValorPago("");
		setResultado(null);
		setErro("");
	}

	function handleModoReceber() {
		setModoTaxas("receber");
		setTaxasSel(new Set());
		setErro("");
	}

	// ── totalSelecionado para acordo ──────────────────────────────────────────────
	const totalSelecionado = pendentes
		.filter((t) => taxasSel.has(t._taxaIdx))
		.reduce((acc, t) => acc + t.total, 0);

	// ═════════════════════════════════════════════════════════════════════════════
	return (
		<div className="p-4 max-w-5xl">
			<PageHeader
				title="Atendimentos (0800)"
				subtitle="Registro de atendimentos, recebimentos e acordos"
				actions={
					concluido ? (
						<Btn variant="secondary" onClick={handleNovo}>
							+ Novo Atendimento
						</Btn>
					) : undefined
				}
			/>

			{/* ── 1. Busca de contrato ───────────────────────────────────────────── */}
			<div className="bg-white border rounded-lg p-4 mb-4">
				<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
					1. Identificar Contrato
				</div>
				<div className="flex gap-2 items-end flex-wrap">
					<BuscaContratoInput
						value={buscaInput}
						onChange={setBuscaInput}
						onSelecionar={handleBuscar}
						dropdownAberto={dropdownAberto}
						setDropdownAberto={setDropdownAberto}
						disabled={concluido}
						autoFocus
					/>
					<Btn
						onClick={() => handleBuscar()}
						disabled={!buscaInput.trim() || concluido}
					>
						Buscar
					</Btn>
				</div>

				{/* Card do contrato + observação */}
				{contrato && (
					<div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
							<div>
								<span className="text-xs text-blue-600 font-medium block">
									Contrato
								</span>
								<span className="font-mono font-bold">
									{contrato.codigo}
								</span>
							</div>
							<div className="col-span-2">
								<span className="text-xs text-blue-600 font-medium block">
									Nome
								</span>
								<span className="font-semibold">
									{contrato.nome}
								</span>
							</div>
							<div>
								<span className="text-xs text-blue-600 font-medium block">
									Situação
								</span>
								<span
									className={`px-2 py-0.5 rounded text-xs font-bold ${contrato.situacao === "A" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
								>
									{contrato.situacao === "A"
										? "Ativo"
										: contrato.situacao}
								</span>
							</div>
							<div>
								<span className="text-xs text-blue-600 font-medium block">
									Grupo
								</span>
								<span>{contrato.grupo}</span>
							</div>
							<div>
								<span className="text-xs text-blue-600 font-medium block">
									Cobrador
								</span>
								<span>{contrato.cobrador || "—"}</span>
							</div>
							<div className="col-span-2">
								<span className="text-xs text-blue-600 font-medium block">
									Endereço
								</span>
								<span className="text-xs">
									{[
										contrato.endereco,
										contrato.bairro,
										contrato.cidade,
									]
										.filter(Boolean)
										.join(" — ")}
								</span>
							</div>
							<div>
								<span className="text-xs text-blue-600 font-medium block">
									Circs. Pagas
								</span>
								<span className="font-bold text-green-700">
									{contrato.qtcircpg}
								</span>
							</div>
						</div>

						{/* Observação */}
						<div className="mt-3 pt-3 border-t border-blue-200">
							<label className="block text-xs font-medium text-gray-600 mb-1">
								Motivo do atendimento{" "}
								<span className="text-red-500 font-normal">
									(obrigatório para salvar)
								</span>
							</label>
							<textarea
								value={obs}
								onChange={(e) => setObs(e.target.value)}
								rows={2}
								placeholder="Descreva o motivo do atendimento..."
								disabled={!!atendSalvo}
								className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
							/>
						</div>
					</div>
				)}
			</div>

			{/* ── 2. Operações do Contrato ─────────────────────────────────────── */}
			{contrato && (
				<div className="bg-white border rounded-lg mb-4">
					{/* Título */}
					<div className="px-4 pt-3 pb-0">
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
							2. Operações do Contrato
						</span>
					</div>

					{/* Tabs */}
					<div className="flex border-b mt-2">
						<button
							onClick={() => setAbaContrato("taxas")}
							className={`px-5 py-2 text-sm font-medium border-b-2 transition -mb-px ${
								abaContrato === "taxas"
									? "border-blue-900 text-blue-900"
									: "border-transparent text-gray-500 hover:text-gray-700"
							}`}
						>
							Taxas em Aberto
							{pendentes.length > 0 && (
								<span className="ml-1.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
									{pendentes.length}
								</span>
							)}
						</button>
						<button
							onClick={() => setAbaContrato("adendos")}
							className={`px-5 py-2 text-sm font-medium border-b-2 transition -mb-px ${
								abaContrato === "adendos"
									? "border-blue-900 text-blue-900"
									: "border-transparent text-gray-500 hover:text-gray-700"
							}`}
						>
							Adendos
						</button>
					</div>

					{/* Aba Adendos */}
					{abaContrato === "adendos" && (
						<div className="p-4">
							<AdendosPanel codigo={contrato.codigo} />
						</div>
					)}

					{/* Aba Taxas */}
					{abaContrato === "taxas" && (
					<div className="p-4">
						<div className="flex items-center justify-end mb-3">
							{pendentes.length > 0 && !concluido && (
								<div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
									<button
										onClick={handleModoReceber}
										className={`px-4 py-1.5 transition font-medium ${modoTaxas === "receber" ? "bg-blue-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
									>
										Receber
									</button>
									<button
										onClick={handleModoAcordo}
										className={`px-4 py-1.5 transition font-medium border-l border-gray-300 ${modoTaxas === "acordo" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
									>
										Fazer Acordo
									</button>
								</div>
							)}
						</div>

					{pendentes.length === 0 ? (
						<p className="text-sm text-gray-500 italic py-2">
							Nenhuma taxa pendente para este contrato.
						</p>
					) : (
						<table className="w-full text-xs border-collapse">
							<thead>
								<tr className="bg-blue-900 text-white">
									{modoTaxas === "acordo" && (
										<th className="px-2 py-1 text-center w-8">
											<input
												type="checkbox"
												checked={
													taxasSel.size ===
														pendentes.length &&
													pendentes.length > 0
												}
												onChange={toggleTodas}
												className="cursor-pointer"
											/>
										</th>
									)}
									<th className="px-2 py-1 text-left">
										Tipo
									</th>
									<th className="px-2 py-1 text-center">
										Circ.
									</th>
									<th className="px-2 py-1 text-center">
										Emissão
									</th>
									<th className="px-2 py-1 text-right">
										Valor
									</th>
									<th className="px-2 py-1 text-right">
										Acréscimo
									</th>
									<th className="px-2 py-1 text-right font-bold">
										Total
									</th>
									<th className="px-2 py-1 text-center">
										Atraso
									</th>
									{modoTaxas === "receber" && (
										<th className="px-2 py-1"></th>
									)}
								</tr>
							</thead>
							<tbody>
								{pendentes.map((t, i) => {
									const isSel =
										modoTaxas === "receber"
											? taxaSel?._taxaIdx === t._taxaIdx
											: taxasSel.has(t._taxaIdx);
									return (
										<tr
											key={i}
											onClick={() => {
												if (concluido) return;
												if (modoTaxas === "acordo")
													toggleAcordo(t._taxaIdx);
												else handleSelecionarTaxa(t);
											}}
											className={`border-b border-gray-100 ${concluido ? "" : "cursor-pointer"} ${
												isSel
													? "bg-yellow-50 ring-1 ring-inset ring-yellow-400"
													: i % 2 === 0
														? "bg-white hover:bg-gray-50"
														: "bg-gray-50 hover:bg-gray-100"
											}`}
										>
											{modoTaxas === "acordo" && (
												<td
													className="px-2 py-1.5 text-center"
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													<input
														type="checkbox"
														checked={taxasSel.has(
															t._taxaIdx,
														)}
														onChange={() =>
															toggleAcordo(
																t._taxaIdx,
															)
														}
														className="cursor-pointer"
													/>
												</td>
											)}
											<td className="px-2 py-1.5">
												{TIPO_LABEL[t.tipo] ?? t.tipo}
											</td>
											<td className="px-2 py-1.5 text-center font-mono">
												{t.circ || "—"}
											</td>
											<td className="px-2 py-1.5 text-center">
												{t.emissao_ ? (
													<span
														className={
															t.diasAtraso > 0
																? "text-red-600 font-medium"
																: ""
														}
													>
														{formatDate(t.emissao_)}
													</span>
												) : (
													"—"
												)}
											</td>
											<td className="px-2 py-1.5 text-right">
												{formatCurrency(t.valor)}
											</td>
											<td
												className={`px-2 py-1.5 text-right ${t.acrescimo > 0 ? "text-red-600 font-medium" : "text-gray-400"}`}
											>
												{t.acrescimo > 0
													? `+ ${formatCurrency(t.acrescimo)}`
													: "—"}
											</td>
											<td className="px-2 py-1.5 text-right font-bold text-blue-900">
												{formatCurrency(t.total)}
											</td>
											<td className="px-2 py-1.5 text-center">
												{t.diasAtraso > 0 ? (
													<span className="bg-red-100 text-red-700 px-1.5 rounded">
														{t.diasAtraso}d
													</span>
												) : (
													<span className="text-gray-400">
														—
													</span>
												)}
											</td>
											{modoTaxas === "receber" && (
												<td className="px-2 py-1.5 text-center">
													{isSel && (
														<span className="text-yellow-600 font-bold">
															●
														</span>
													)}
												</td>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					)}

						{modoTaxas === "acordo" && taxasSel.size > 0 && (
							<div className="mt-2 flex items-center gap-4 text-xs text-gray-600 border-t pt-2">
								<span>{taxasSel.size} taxa(s) selecionada(s)</span>
								<span>
									Total em aberto:{" "}
									<span className="font-bold text-red-600">
										{formatCurrency(totalSelecionado)}
									</span>
								</span>
							</div>
						)}
					</div>
					)}
				</div>
			)}

			{/* ── 3a. Confirmar Recebimento ──────────────────────────────────────── */}
			{modoTaxas === "receber" && taxaSel && (
				<div className="bg-white border-2 border-yellow-400 rounded-lg p-4 mb-4">
					<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
						3. Confirmar Recebimento
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
						<div>
							<span className="text-xs text-gray-500 block">
								Tipo / Circular
							</span>
							<span className="font-bold">
								{TIPO_LABEL[taxaSel.tipo] ?? taxaSel.tipo} /{" "}
								{taxaSel.circ}
							</span>
						</div>
						<div>
							<span className="text-xs text-gray-500 block">
								Emissão
							</span>
							<span
								className={
									taxaSel.diasAtraso > 0
										? "text-red-600 font-semibold"
										: ""
								}
							>
								{taxaSel.emissao_
									? formatDate(taxaSel.emissao_)
									: "—"}
							</span>
						</div>
						<div>
							<span className="text-xs text-gray-500 block">
								Valor Original
							</span>
							<span>{formatCurrency(taxaSel.valor)}</span>
						</div>
						{taxaSel.acrescimo > 0 && (
							<>
								<div>
									<span className="text-xs text-gray-500 block">
										Multa
									</span>
									<span className="text-red-600">
										{formatCurrency(taxaSel.multa)}
									</span>
								</div>
								<div>
									<span className="text-xs text-gray-500 block">
										Juros ({taxaSel.diasAtraso}d)
									</span>
									<span className="text-red-600">
										{formatCurrency(taxaSel.juros)}
									</span>
								</div>
							</>
						)}
						<div>
							<span className="text-xs text-gray-500 block">
								Total a Receber
							</span>
							<span className="text-lg font-bold text-blue-900">
								{formatCurrency(taxaSel.total)}
							</span>
						</div>
					</div>
					<div className="flex gap-2 items-end">
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">
								Valor Recebido (R$)
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={valorPago}
								onChange={(e) => setValorPago(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" &&
									handleConfirmarRecebimento()
								}
								className="border rounded px-2 py-1.5 text-sm w-36 font-mono"
							/>
						</div>
						<Btn
							onClick={handleConfirmarRecebimento}
							disabled={processando || !dirHandle}
						>
							{processando ? "Registrando..." : "✓ Confirmar"}
						</Btn>
						<Btn
							variant="secondary"
							onClick={() => {
								setTaxaSel(null);
								setValorPago("");
							}}
							disabled={processando}
						>
							Cancelar
						</Btn>
					</div>
				</div>
			)}

			{/* ── 3b. Painel de Acordo ─────────────────────────────────────────────── */}
			{modoTaxas === "acordo" && taxasSel.size > 0 && !concluido && (
				<div className="bg-white border-2 border-orange-400 rounded-lg p-4 mb-4">
					<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
						3. Definir Acordo de Parcelamento
					</div>

					<div className="mb-4">
						<p className="text-xs text-gray-500 mb-1">
							Taxas que serão baixadas por R$ 0,01 (marcadas como
							"acordo"):
						</p>
						<div className="flex flex-wrap gap-2">
							{pendentes
								.filter((t) => taxasSel.has(t._taxaIdx))
								.map((t, i) => (
									<span
										key={i}
										className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
									>
										{TIPO_LABEL[t.tipo] ?? t.tipo} {t.circ}{" "}
										— {formatCurrency(t.total)}
									</span>
								))}
						</div>
						<p className="text-xs text-orange-700 mt-1 font-medium">
							Total original: {formatCurrency(totalSelecionado)}
						</p>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">
								Valor Total (R$)
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={valorAcordo}
								onChange={(e) => setValorAcordo(e.target.value)}
								placeholder="0,00"
								className="border rounded px-2 py-1.5 text-sm w-full font-mono"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">
								Nº de Parcelas
							</label>
							<input
								type="number"
								min="1"
								max="60"
								value={parcelasAcordo}
								onChange={(e) =>
									setParcelasAcordo(e.target.value)
								}
								className="border rounded px-2 py-1.5 text-sm w-full font-mono"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1">
								1º Vencimento
							</label>
							<input
								type="date"
								value={primVenc}
								onChange={(e) => setPrimVenc(e.target.value)}
								className="border rounded px-2 py-1.5 text-sm w-full"
							/>
						</div>
						<div className="flex flex-col justify-end">
							<span className="text-xs text-gray-500">
								Valor por parcela
							</span>
							<span className="text-lg font-bold text-blue-900">
								{vlParc > 0 ? formatCurrency(vlParc) : "—"}
							</span>
						</div>
						<div className="col-span-2 md:col-span-4">
							<label className="block text-xs font-medium text-gray-600 mb-1">
								Observação do Acordo
							</label>
							<input
								value={obsAcordo}
								onChange={(e) => setObsAcordo(e.target.value)}
								placeholder="Ex: Pagamento em dia 10 de cada mês..."
								className="border rounded px-2 py-1.5 text-sm w-full"
							/>
						</div>
					</div>

					{vlParc > 0 && numParcelas > 0 && (
						<div className="mb-4">
							<p className="text-xs text-gray-500 mb-1">
								Novas taxas que serão criadas (tipo Taxa / circ
								sequencial do grupo):
							</p>
							<div className="flex flex-wrap gap-2 max-h-20 overflow-auto">
								{Array.from({ length: numParcelas }, (_, i) => {
									const dt = new Date(primVenc + "T12:00:00");
									dt.setMonth(dt.getMonth() + i);
									const vl =
										i === numParcelas - 1
											? parseFloat(
													(
														vlAcordo -
														vlParc *
															(numParcelas - 1)
													).toFixed(2),
												)
											: vlParc;
									const circ =
										previewCircs[i] ??
										String(i + 1).padStart(3, "0");
									return (
										<span
											key={i}
											className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-200"
										>
											{circ} ·{" "}
											{dt.toLocaleDateString("pt-BR", {
												month: "short",
												year: "2-digit",
											})}{" "}
											— {formatCurrency(vl)}
										</span>
									);
								})}
							</div>
						</div>
					)}

					<div className="flex gap-2">
						<Btn
							onClick={handleConfirmarAcordo}
							disabled={
								processando || !dirHandle || vlAcordo <= 0
							}
						>
							{processando ? "Processando..." : "✓ Confirmar Acordo"}
						</Btn>
						<Btn
							variant="secondary"
							onClick={handleModoReceber}
							disabled={processando}
						>
							Cancelar
						</Btn>
					</div>
				</div>
			)}

			{/* ── Erro ─────────────────────────────────────────────────────────────── */}
			{erro && (
				<div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
					⚠️ {erro}
				</div>
			)}

			{/* ── Resultado: Recebimento ───────────────────────────────────────────── */}
			{resultado && (
				<div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
					<div className="text-green-800 font-bold text-base mb-2">
						✅ Recebimento registrado com sucesso!
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
						<div>
							<span className="text-xs text-green-600 block">
								Recibo Nº
							</span>
							<span className="font-mono font-bold text-lg">
								{resultado.ano}-{resultado.numero}
							</span>
						</div>
						<div>
							<span className="text-xs text-green-600 block">
								Valor Recebido
							</span>
							<span className="font-bold text-green-900 text-lg">
								{formatCurrency(resultado.valorPago)}
							</span>
						</div>
						{resultado.acrescimo > 0 && (
							<div>
								<span className="text-xs text-green-600 block">
									Acréscimos
								</span>
								<span className="text-red-600">
									{formatCurrency(resultado.acrescimo)}
								</span>
							</div>
						)}
						<div>
							<span className="text-xs text-green-600 block">
								Operador
							</span>
							<span>{usuario}</span>
						</div>
					</div>
					{pendentes.length > 0 && (
						<p className="mt-2 text-sm text-orange-700 font-medium">
							⚠️ Este contrato ainda possui {pendentes.length}{" "}
							taxa(s) pendente(s).
						</p>
					)}
				</div>
			)}

			{/* ── Resultado: Acordo ────────────────────────────────────────────────── */}
			{resultadoAcordo && (
				<div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-4">
					<div className="text-orange-800 font-bold text-base mb-2">
						✅ Acordo registrado com sucesso!
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
						<div>
							<span className="text-xs text-orange-600 block">
								Acordo Nº
							</span>
							<span className="font-mono font-bold text-lg">
								{resultadoAcordo.numero}
							</span>
						</div>
						<div>
							<span className="text-xs text-orange-600 block">
								Parcelas
							</span>
							<span className="font-bold">
								{resultadoAcordo.parcelas.length}x{" "}
								{formatCurrency(resultadoAcordo.valorParc)}
							</span>
						</div>
						<div>
							<span className="text-xs text-orange-600 block">
								Valor Total
							</span>
							<span className="font-bold text-orange-900">
								{formatCurrency(vlAcordo)}
							</span>
						</div>
						<div>
							<span className="text-xs text-orange-600 block">
								Operador
							</span>
							<span>{usuario}</span>
						</div>
					</div>
					<p className="text-xs text-gray-600">
						As taxas selecionadas foram baixadas por R$ 0,01 com
						referência ACRD{resultadoAcordo.numero}.{" "}
						{resultadoAcordo.parcelas.length} novas taxas (tipo
						Mensal / circ ACO) foram criadas em TAXAS.DBF.
					</p>
				</div>
			)}

			{/* ── Barra de ação sticky ─────────────────────────────────────────────── */}
			{!atendSalvo && contrato && (
				<div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center gap-4 shadow-lg">
					<Btn
						onClick={handleSalvarAtendimento}
						disabled={processando || !obs.trim() || !contrato}
						size="lg"
					>
						{processando ? "Salvando..." : "Salvar Atendimento"}
					</Btn>
					{!obs.trim() && (
						<span className="text-xs text-gray-400">
							Preencha o motivo do atendimento para salvar
						</span>
					)}
				</div>
			)}

			{/* ── Modal de sucesso ─────────────────────────────────────────────────── */}
			{showSuccess && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4">
						<div className="text-5xl">✅</div>
						<h2 className="text-xl font-bold text-green-800 text-center">
							Atendimento Salvo!
						</h2>
						<p className="text-sm text-gray-600 text-center">
							Atendimento nº{" "}
							<span className="font-mono font-bold text-blue-900">
								{atendSalvo}
							</span>{" "}
							registrado com sucesso.
						</p>
						<Btn
							size="lg"
							onClick={() => {
								setShowSuccess(false);
								handleNovo();
							}}
						>
							OK — Novo Atendimento
						</Btn>
					</div>
				</div>
			)}

		</div>
	);
}
