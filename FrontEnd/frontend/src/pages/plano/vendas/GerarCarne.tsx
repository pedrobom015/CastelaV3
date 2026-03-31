import { useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { PageHeader, Btn } from "../../../components/common/PageHeader";
import { Modal } from "../../../components/common/Modal";
import {
	FormSection,
	FormRow,
	FormSelect,
	FormInput,
} from "../../../components/common/FormField";
import {
	ContratoInput,
	type ContratoResumido,
} from "../../../components/common/ContratoInput";
import { findRecord, getRecords } from "../../../utils/dbfHelpers";
import { parseDate } from "../../../utils/formatters";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";

type ResultState = { type: "success" | "error"; message: string } | null;

const TIPO_OPTS = [
	{ value: "", label: "-- selecione --" },
	{ value: "1", label: "1 — Jóia" },
	{ value: "2", label: "2 — Taxa" },
	{ value: "3", label: "3 — Carnê" },
	{ value: "4", label: "4 — Acerto" },
	{ value: "5", label: "5 — Servico" },
	{ value: "6", label: "6 — Jóia + Seguro" },
	{ value: "7", label: "7 — Taxa + Seguro" },
	{ value: "8", label: "8 — Carnê + Seguro" },
];

/** Formata dígitos para R$ 1.234,56 enquanto o usuário digita */
function maskCurrency(raw: string): string {
	const digits = raw.replace(/\D/g, "");
	if (!digits) return "";
	const num = parseInt(digits, 10) / 100;
	return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Extrai número float de string no formato "R$ 1.234,56" */
function parseCurrency(formatted: string): number {
	const clean = formatted.replace(/[R$\s.]/g, "").replace(",", ".");
	return parseFloat(clean) || 0;
}

/** Auto-máscara DD/MM/AAAA enquanto o usuário digita */
function maskDate(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

interface GerarCarneFormProps {
	initialContrato?: ContratoResumido | null;
	onSuccess?: () => void;
}

export function GerarCarneForm({
	initialContrato,
	onSuccess,
}: GerarCarneFormProps) {
	const { getTable, setTable, dirHandle, usuario } = useAppStore();

	const [contrato, setContrato] = useState<ContratoResumido | null>(
		initialContrato ?? null,
	);
	const [parcf, setParcf] = useState("");
	const [vlparc, setVlparc] = useState(""); // "R$ 1.234,56"
	const [tipo, setTipo] = useState("");
	const [circular, setCircular] = useState("");
	const [dataInicial, setDataInicial] = useState(""); // "DD/MM/AAAA"
	const [vendedor, setVendedor] = useState(initialContrato?.cobrador ?? "");
	const [generating, setGenerating] = useState(false);
	const [result, setResult] = useState<ResultState>(null);

	function handleSelectContrato(c: ContratoResumido) {
		setContrato(c);
		if (!vendedor) setVendedor(c.cobrador || "");
	}

	async function handleGerar() {
		if (!contrato?.codigo) {
			setResult({ type: "error", message: "Selecione o contrato." });
			return;
		}
		const qtd = parseInt(parcf, 10);
		if (!qtd || qtd <= 0) {
			setResult({
				type: "error",
				message: "Informe a quantidade de parcelas (PARCF > 0).",
			});
			return;
		}
		const valorParcela = parseCurrency(vlparc);
		if (!valorParcela || valorParcela <= 0) {
			setResult({
				type: "error",
				message: "Informe o valor da parcela (VLPARC > 0).",
			});
			return;
		}
		if (!tipo.trim()) {
			setResult({
				type: "error",
				message: "Informe o tipo de lançamento.",
			});
			return;
		}
		if (!circular.trim()) {
			setResult({
				type: "error",
				message: "Informe o número de circular inicial.",
			});
			return;
		}
		const venctoBase = parseDate(dataInicial);
		if (!venctoBase) {
			setResult({
				type: "error",
				message:
					"Informe a data de vencimento inicial no formato DD/MM/AAAA.",
			});
			return;
		}
		if (!dirHandle) {
			setResult({
				type: "error",
				message: "Nenhum diretório de dados aberto.",
			});
			return;
		}

		setGenerating(true);
		setResult(null);

		try {
			const gruposTable = getTable("grupos");
			const grupoRec = findRecord(gruposTable, "codigo", contrato.codigo);
			if (!grupoRec) {
				setResult({
					type: "error",
					message: `Contrato ${contrato.codigo} não encontrado em GRUPOS.DBF.`,
				});
				return;
			}

			const emcarneTable = getTable("emcarne");
			const existing = getRecords(emcarneTable);

			const seqMax = existing.reduce((acc, r) => {
				const n = parseInt(String(r["seq"] ?? "0"), 10);
				return n > acc ? n : acc;
			}, 0);

			const hoje = new Date();
			const circBase = parseInt(circular.trim(), 10) || 1;
			const novosRegistros: DbfRecord[] = [];

			for (let i = 0; i < qtd; i++) {
				const vencto = new Date(
					venctoBase.getFullYear(),
					venctoBase.getMonth() + i,
					venctoBase.getDate(),
					12,
					0,
					0,
				);
				const seq = String(seqMax + i + 1).padStart(9, "0");
				const circAtual = String(circBase + i).padStart(3, "0");
				novosRegistros.push({
					seq,
					codigo: contrato.codigo.padEnd(9, " "),
					vendedor: (vendedor || String(grupoRec["vendedor"] ?? ""))
						.substring(0, 3)
						.padEnd(3, " "),
					tip: tipo.substring(0, 2).padEnd(2, " "),
					circ: circAtual,
					vencto_: vencto,
					emissao_: hoje,
					etiqueta_: null,
					filial: String(grupoRec["filial"] ?? "")
						.substring(0, 2)
						.padEnd(2, " "),
					lancto_: hoje,
					por: (usuario || "SYS").substring(0, 10).padEnd(10, " "),
					parok: 0,
					intlan: "",
				});
			}

			const updatedRecords = [...existing, ...novosRegistros];
			const newTable = emcarneTable
				? { ...emcarneTable, records: updatedRecords }
				: {
						header: {
							version: 3,
							lastUpdate: hoje,
							recordCount: updatedRecords.length,
							headerSize: 0,
							recordSize: 0,
							fields: [],
						},
						records: updatedRecords,
					};

			setTable("emcarne", newTable);
			await writeDbfFile(dirHandle, "EMCARNE.DBF", newTable);

			// Cria registros em TAXAS.DBF
			const taxasTable = getTable("taxas");
			const existingTaxas = taxasTable ? [...taxasTable.records] : [];
			const novasTaxas: DbfRecord[] = novosRegistros.map((r) => ({
				codigo: r.codigo,
				tipo: tipo.substring(0, 1),
				circ: r.circ,
				emissao_: r.vencto_,
				valor: valorParcela,
				pgto_: null,
				valorpg: 0,
				cobrador: "",
				forma: "",
				baixa_: null,
				por: r.por,
				stat: "A",
				filial: r.filial,
				flag_excl: "",
				cedente: "",
				nnumero: "",
				codlan: "",
			}));
			const updatedTaxas = [...existingTaxas, ...novasTaxas];
			const newTaxasTable = taxasTable
				? { ...taxasTable, records: updatedTaxas }
				: {
						header: {
							version: 3,
							lastUpdate: hoje,
							recordCount: updatedTaxas.length,
							headerSize: 0,
							recordSize: 0,
							fields: [],
						},
						records: updatedTaxas,
					};
			setTable("taxas", newTaxasTable);
			await writeDbfFile(dirHandle, "TAXAS.DBF", newTaxasTable);

			setResult({
				type: "success",
				message: `Carnê gerado! ${novosRegistros.length} parcela(s) — contrato ${contrato.codigo} — ${vlparc} cada.`,
			});
			onSuccess?.();
		} catch (err) {
			setResult({
				type: "error",
				message: `Erro ao gerar carnê: ${String(err)}`,
			});
		} finally {
			setGenerating(false);
		}
	}

	function handleLimpar() {
		setContrato(null);
		setParcf("");
		setVlparc("");
		setTipo("");
		setCircular("");
		setDataInicial("");
		setVendedor("");
		setResult(null);
	}

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
			<FormSection title="Parâmetros para Geração">
				<FormRow cols={2}>
					<ContratoInput
						value={contrato?.codigo ?? ""}
						nomeContrato={contrato?.nome}
						label="Contrato"
						required
						disabled={!!initialContrato}
						onSelect={handleSelectContrato}
					/>
					<FormInput
						label="Vendedor"
						value={vendedor}
						onChange={(e) => setVendedor(e.target.value)}
						maxLength={3}
						placeholder="Cód. (opcional)"
					/>
				</FormRow>
				<FormRow cols={2}>
					<FormInput
						label="Qtd. Parcelas"
						type="number"
						value={parcf}
						onChange={(e) => setParcf(e.target.value)}
						placeholder="Ex: 12"
						required
					/>
					<div className="flex flex-col gap-0.5">
						<label className="text-sm font-medium text-gray-700">
							Valor por Parcela
							<span className="text-red-500 ml-0.5">*</span>
						</label>
						<input
							type="text"
							inputMode="numeric"
							value={vlparc}
							onChange={(e) =>
								setVlparc(maskCurrency(e.target.value))
							}
							placeholder="R$ 0,00"
							className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
						/>
					</div>
				</FormRow>
				<FormRow cols={3}>
					<FormSelect
						label="Tipo"
						value={tipo}
						onChange={(e) => setTipo(e.target.value)}
						options={TIPO_OPTS}
						required
					/>
					<FormInput
						label="Circular Inicial"
						value={circular}
						onChange={(e) => setCircular(e.target.value)}
						maxLength={3}
						placeholder="001"
						required
					/>
					<div className="flex flex-col gap-0.5">
						<label className="text-sm font-medium text-gray-700">
							Vencimento Inicial
							<span className="text-red-500 ml-0.5">*</span>
						</label>
						<input
							type="text"
							inputMode="numeric"
							value={dataInicial}
							onChange={(e) =>
								setDataInicial(maskDate(e.target.value))
							}
							placeholder="DD/MM/AAAA"
							maxLength={10}
							className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
						/>
					</div>
				</FormRow>
			</FormSection>

			<div className="flex gap-3 mt-4">
				<Btn
					onClick={handleGerar}
					disabled={generating}
					size="lg"
					icon="📋"
				>
					{generating ? "Gerando..." : "Gerar Carnê"}
				</Btn>
				<Btn variant="secondary" onClick={handleLimpar} size="lg">
					Limpar
				</Btn>
			</div>

			{result && (
				<div
					className={`mt-4 p-4 rounded-lg border ${
						result.type === "success"
							? "bg-green-50 border-green-300 text-green-800"
							: "bg-red-50 border-red-300 text-red-800"
					}`}
				>
					<div className="flex items-start gap-2">
						<span className="text-lg">
							{result.type === "success" ? "✅" : "❌"}
						</span>
						<p className="text-sm font-medium">{result.message}</p>
					</div>
				</div>
			)}

			<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<h3 className="text-sm font-semibold text-blue-900 mb-2">
					Informações
				</h3>
				<ul className="text-xs text-blue-800 space-y-1">
					<li>
						• Clique em 🔍 para buscar o contrato por código, CPF ou
						nome
					</li>
					<li>• PARCF: quantidade de parcelas a gerar</li>
					<li>• VLPARC: valor de cada parcela em R$</li>
					<li>
						• Circular inicial: incrementada automaticamente por
						parcela
					</li>
					<li>• Vencimento inicial: os demais avançam mês a mês</li>
					<li>• Registros gravados em EMCARNE.DBF e TAXAS.DBF</li>
				</ul>
			</div>
		</div>
	);
}

export function GerarCarneModal({
	isOpen,
	onClose,
	initialContrato,
}: {
	isOpen: boolean;
	onClose: () => void;
	initialContrato?: ContratoResumido | null;
}) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				<div className="flex flex-col leading-tight">
					<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
						Vendas
					</span>
					<span className="text-sm font-semibold">Gerar Carnê</span>
				</div>
			}
			size="lg"
			zIndex={200}
			noMinHeight
		>
			<GerarCarneForm
				initialContrato={initialContrato}
				onSuccess={onClose}
			/>
		</Modal>
	);
}

export function GerarCarne() {
	return (
		<div className="p-4 max-w-2xl">
			<PageHeader
				title="Gerar Carnê"
				subtitle="Lançamento de parcelas para contratos"
			/>
			<GerarCarneForm />
		</div>
	);
}
