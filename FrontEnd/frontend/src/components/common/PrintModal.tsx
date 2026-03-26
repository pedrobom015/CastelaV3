import { useState } from "react";
import { Modal } from "./Modal";
import { Btn } from "./PageHeader";
import { PrintPreviewModal } from "./PrintPreviewModal";
import type { Grupo } from "../../types/models";
import {
	formatDate,
	formatCpf,
	formatCep,
	situacaoLabel,
	estadoCivilLabel,
	formaPagtoLabel,
} from "../../utils/formatters";

/* ──────────────────────────────────────────────
   Definição dos blocos
   ────────────────────────────────────────────── */
const ALL_BLOCK_IDS = [
	"identificacao",
	"endereco",
	"contato",
	"plano",
	"responsaveis",
	"circulares",
	"controle",
	"seguro",
	"observacoes",
] as const;

type BlockId = (typeof ALL_BLOCK_IDS)[number];

const BLOCK_LABELS: Record<BlockId, string> = {
	identificacao: "Identificação",
	endereco: "Endereço",
	contato: "Contato",
	plano: "Dados do Plano",
	responsaveis: "Responsáveis",
	circulares: "Circulares e Cobertura",
	controle: "Controle",
	seguro: "Seguro",
	observacoes: "Observações",
};

type FieldPair = { label: string; value: string };

function getBlockFields(id: BlockId, d: Grupo): FieldPair[] {
	switch (id) {
		case "identificacao":
			return [
				{ label: "Código", value: d.codigo },
				{ label: "Grupo", value: d.grupo },
				{ label: "Situação", value: situacaoLabel(d.situacao) },
				{ label: "Nº Sorteio", value: d.nrsorteio },
				{ label: "Nome", value: d.nome },
				{ label: "CPF", value: formatCpf(d.cpf) },
				{ label: "RG", value: d.rg },
				{ label: "Nascimento", value: formatDate(d.nascto_) },
				{ label: "Estado Civil", value: estadoCivilLabel(d.estcivil) },
				{ label: "Religião", value: d.relig },
				{ label: "Naturalidade", value: d.natural },
			];
		case "endereco":
			return [
				{ label: "Endereço", value: d.endereco },
				{ label: "Complemento", value: d.complem },
				{ label: "Bairro", value: d.bairro },
				{ label: "Cidade", value: d.cidade },
				{ label: "UF", value: d.uf },
				{ label: "CEP", value: formatCep(d.cep) },
			];
		case "contato":
			return [
				{ label: "Telefone", value: d.telefone },
				{ label: "Contato", value: d.contato },
				{ label: "E-mail", value: d.email },
			];
		case "plano":
			return [
				{ label: "Admissão", value: formatDate(d.admissao) },
				{ label: "Término Carência", value: formatDate(d.tcarencia) },
				{ label: "Renovar em", value: formatDate(d.renovar) },
				{ label: "Forma Pgto", value: formaPagtoLabel(d.formapgto) },
				{ label: "Dia Pgto", value: d.diapgto },
				{ label: "Sai Taxa", value: d.saitxa },
				{ label: "Vlr Carnê", value: d.vlcarne },
			];
		case "responsaveis":
			return [
				{ label: "Vendedor", value: d.vendedor },
				{ label: "Cobrador", value: d.cobrador },
				{ label: "Região", value: d.regiao },
			];
		case "circulares":
			return [
				{ label: "Circ. Inicial", value: d.circinic },
				{ label: "Últ. Circular", value: d.ultcirc },
				{ label: "Qt. Circulares", value: String(d.qtcircs) },
				{ label: "Qt. Circs Pagas", value: String(d.qtcircpg) },
				{ label: "Funerais", value: String(d.funerais) },
				{ label: "Nr. Dependentes", value: String(d.nrdepend) },
				{ label: "Titular", value: d.titular },
				{ label: "Seguro", value: String(d.seguro) },
				{ label: "Partic. Vend. %", value: String(d.particv) },
				{ label: "Partic. Fam. %", value: String(d.particf) },
				{ label: "Tipo Contato", value: d.tipcont },
			];
		case "controle":
			return [
				{ label: "Incluído em", value: formatDate(d.em_) },
				{ label: "Por", value: d.por },
				{ label: "Últ. Impressão", value: formatDate(d.ultimp_) },
				{ label: "Atendente 1", value: d.atend1 },
				{ label: "Atendente 2", value: d.atend2 },
				{ label: "Ender. Atualiz.", value: formatDate(d.ender_) },
			];
		case "seguro":
			return [
				{ label: "Mês Ref. Seg.", value: formatDate(d.segmesref) },
				{ label: "Cód. Cob. Seg.", value: d.segcodcob },
				{ label: "Cód. Serv. Seg.", value: d.segservcod },
			];
		case "observacoes":
			return [{ label: "Observações", value: d.obs }];
	}
}

/* ──────────────────────────────────────────────
   SVG Preview
   ────────────────────────────────────────────── */
const PAGE_W = 210;
const MARGIN = 10;
const CONTENT_W = PAGE_W - MARGIN * 2;
const COL_W = (CONTENT_W - 4) / 2;
const FONT = "Arial, Helvetica, sans-serif";

function blockHeight(fields: FieldPair[]) {
	const rows = Math.ceil(fields.length / 2);
	return 6 + rows * 8 + 3;
}

function truncate(s: string, max = 28) {
	if (!s) return "—";
	return s.length > max ? s.slice(0, max) + "…" : s;
}

function SvgPreview({
	data,
	selected,
}: {
	data: Grupo;
	selected: Set<BlockId>;
}) {
	const blocks = ALL_BLOCK_IDS.filter((id) => selected.has(id));

	let cursor = 20;
	const positions: { id: BlockId; y: number; h: number }[] = [];
	for (const id of blocks) {
		const h = blockHeight(getBlockFields(id, data));
		positions.push({ id, y: cursor, h });
		cursor += h + 3;
	}
	cursor += 8;

	const pageH = Math.max(297, cursor);

	return (
		<svg
			viewBox={`0 0 ${PAGE_W} ${pageH}`}
			style={{ width: "100%", display: "block" }}
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<filter id="ps" x="-10%" y="-5%" width="120%" height="115%">
					<feDropShadow
						dx="1.5"
						dy="1.5"
						stdDeviation="2.5"
						floodColor="#00000030"
					/>
				</filter>
			</defs>

			{/* Page background */}
			<rect
				x="4"
				y="4"
				width={PAGE_W - 8}
				height={pageH - 8}
				fill="white"
				stroke="#d0d0d0"
				strokeWidth="0.4"
				filter="url(#ps)"
				rx="1"
			/>

			{/* Header bar */}
			<rect
				x={MARGIN}
				y={MARGIN}
				width={CONTENT_W}
				height={8}
				fill="#f0f4f8"
				rx="1"
			/>
			<text
				x={MARGIN + 3}
				y={MARGIN + 5.5}
				fontSize="2"
				fill="#1a3a5c"
				fontWeight="bold"
				fontFamily={FONT}
			>
				{`CONTRATO Nº ${String(data.codigo).padStart(9, "0")}`}
			</text>
			<text
				x={PAGE_W - MARGIN - 2}
				y={MARGIN + 5.5}
				fontSize="2"
				fill="#1a3a5c"
				textAnchor="end"
				fontFamily={FONT}
			>
				{truncate(data.nome, 30)}
			</text>

			{/* Blocks */}
			{positions.map(({ id, y, h }) => {
				const fields = getBlockFields(id, data);
				return (
					<g key={id}>
						<rect
							x={MARGIN}
							y={y}
							width={CONTENT_W}
							height={h}
							fill="white"
							stroke="#e0e0e0"
							strokeWidth="0.4"
							rx="0.8"
						/>
						{/* Title strip */}
						<rect
							x={MARGIN}
							y={y}
							width={CONTENT_W}
							height={5}
							fill="#f0f4f8"
							rx="0.8"
						/>
						<text
							x={MARGIN + 2.5}
							y={y + 3.5}
							fontSize="2"
							fill="#1a3a5c"
							fontWeight="bold"
							fontFamily={FONT}
							letterSpacing="0.3"
						>
							{BLOCK_LABELS[id].toUpperCase()}
						</text>

						{/* Fields — 2 columns */}
						{fields.map((f, i) => {
							const col = i % 2;
							const row = Math.floor(i / 2);
							const fx = MARGIN + 2 + col * (COL_W + 4);
							const fy = y + 8 + row * 8;
							return (
								<g key={i}>
									<text
										x={fx}
										y={fy}
										fontSize="2"
										fill="#999"
										fontFamily={FONT}
									>
										{f.label}
									</text>
									<text
										x={fx}
										y={fy + 3.4}
										fontSize="2"
										fill="#222"
										fontWeight="600"
										fontFamily={FONT}
									>
										{truncate(f.value)}
									</text>
								</g>
							);
						})}
					</g>
				);
			})}

			{/* Empty state */}
			{blocks.length === 0 && (
				<text
					x={PAGE_W / 2}
					y={pageH / 2}
					fontSize="2"
					fill="#ccc"
					textAnchor="middle"
					fontFamily={FONT}
				>
					Selecione blocos para visualizar
				</text>
			)}
		</svg>
	);
}

/* ──────────────────────────────────────────────
   Gerador de HTML para impressão
   ────────────────────────────────────────────── */
function buildPrintHtml(data: Grupo, blocks: BlockId[]): string {
	const blocksHtml = blocks
		.map((id) => {
			const fields = getBlockFields(id, data);
			const fieldsHtml = fields
				.map(
					(f) => `
        <div class="field">
          <span class="label">${f.label}</span>
          <span class="value">${f.value || "—"}</span>
        </div>`,
				)
				.join("");
			return `
      <div class="block">
        <div class="block-title">${BLOCK_LABELS[id].toUpperCase()}</div>
        <div class="block-fields">${fieldsHtml}</div>
      </div>`;
		})
		.join("");

	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Contrato ${data.codigo} — ${data.nome}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; padding: 20px 14mm 20mm; }
    .doc-header {
      background: #f0f4f8; color: #1a3a5c;
      padding: 9px 14px; border-radius: 4px;
      margin-bottom: 14px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .doc-header h1 { font-size: 13px; font-weight: bold; }
    .doc-header .subtitle { font-size: 11px; opacity: .9; }
    .block {
      border: 1px solid #e0e0e0; border-radius: 3px;
      margin-bottom: 10px; overflow: hidden;
      break-inside: avoid; page-break-inside: avoid;
    }
    .block-title {
      background: #f0f4f8; color: #1a3a5c;
      font-weight: bold; font-size: 10px;
      padding: 5px 10px; letter-spacing: .5px;
    }
    .block-fields {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 6px 20px; padding: 8px 10px;
    }
    .field { display: flex; flex-direction: column; }
    .label { font-size: 9px; color: #999; margin-bottom: 1px; }
    .value { font-size: 11px; font-weight: 600; color: #222; }
    @media print {
      body { padding: 12mm 10mm 18mm; }
      .block { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>CONTRATO Nº ${String(data.codigo).padStart(9, "0")}</h1>
    <span class="subtitle">${data.nome}</span>
  </div>
  ${blocksHtml}
</body>
</html>`;
}

/* ──────────────────────────────────────────────
   Componente principal
   ────────────────────────────────────────────── */
interface PrintModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: Grupo;
}

export function PrintModal({ isOpen, onClose, data }: PrintModalProps) {
	const [selected, setSelected] = useState<Set<BlockId>>(
		new Set(ALL_BLOCK_IDS),
	);
	const [previewHtml, setPreviewHtml] = useState<string | null>(null);

	function toggle(id: BlockId) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title="Imprimir Contrato"
				size="full"
				footer={
					<>
						<Btn variant="secondary" onClick={onClose}>
							Fechar
						</Btn>
						<Btn
							onClick={() =>
								setPreviewHtml(
									buildPrintHtml(data, [
										...selected,
									] as BlockId[]),
								)
							}
							disabled={selected.size === 0}
							icon="🖨️"
						>
							Imprimir
						</Btn>
					</>
				}
			>
				<div className="flex gap-5" style={{ minHeight: 520 }}>
					{/* ── Painel de seleção ── */}
					<div className="flex-shrink-0" style={{ width: 190 }}>
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-semibold text-gray-700">
								Blocos
							</span>
							<div className="flex gap-2 text-xs">
								<button
									onClick={() =>
										setSelected(new Set(ALL_BLOCK_IDS))
									}
									className="text-blue-600 hover:underline"
								>
									Todos
								</button>
								<span className="text-gray-300">|</span>
								<button
									onClick={() => setSelected(new Set())}
									className="text-blue-600 hover:underline"
								>
									Nenhum
								</button>
							</div>
						</div>

						<div className="flex flex-col ">
							{ALL_BLOCK_IDS.map((id) => (
								<label
									key={id}
									className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-gray-50 select-none"
									style={{
										color: selected.has(id)
											? "#374151"
											: "#9ca3af",
									}}
								>
									<input
										type="checkbox"
										checked={selected.has(id)}
										onChange={() => toggle(id)}
										className="cursor-pointer"
									/>
									<span className="text-[12px]">
										{BLOCK_LABELS[id]}
									</span>
								</label>
							))}
						</div>

						<p className="mt-4 text-xs text-gray-400 leading-relaxed">
							Selecione os blocos desejados. A prévia ao lado
							reflete a seleção em tempo real.
						</p>
					</div>

					{/* Divisor */}
					<div
						className="flex-shrink-0"
						style={{ width: 1, background: "#e8e8e8" }}
					/>

					{/* ── Prévia SVG ── */}
					<div className="flex-1 overflow-y-auto">
						<p className="text-xs text-gray-400 mb-2 font-medium">
							Prévia de impressão
						</p>
						<SvgPreview data={data} selected={selected} />
					</div>
				</div>
			</Modal>
			<PrintPreviewModal
				html={previewHtml}
				onClose={() => setPreviewHtml(null)}
				title="Prévia — Contrato"
			/>
		</>
	);
}
