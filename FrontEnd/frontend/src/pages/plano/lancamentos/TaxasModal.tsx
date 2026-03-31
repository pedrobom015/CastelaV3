import { useMemo, useState, useRef, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { DataTable, type Column } from "../../../components/common/DataTable";
import { Btn } from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSection,
	FormRow,
	FormSelect,
} from "../../../components/common/FormField";
import { useAppStore } from "../../../store/appStore";
import { useThemeStore } from "../../../store/themeStore";
import { filterRecords } from "../../../utils/dbfHelpers";
import {
	formatDate,
	formatCurrency,
	toDateInputValue,
} from "../../../utils/formatters";
import {
	maskCurrency,
	parseCurrency,
	numberToMask,
} from "../tabelas/CategoriaWizardModal";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import { buildPrintHtml as buildTaxasPrintHtml } from "../../../components/common/PrintTaxasModal";
import { PrintPreviewModal } from "../../../components/common/PrintPreviewModal";
import { GerarCarneModal } from "../vendas/GerarCarne";
import type { Taxa, DbfRecord } from "../../../types/models";

/* ──────────────────────────────────────────────
   Gerador de código de barras ITF-25 em SVG
   ────────────────────────────────────────────── */
const ITF25: Record<string, number[]> = {
	"0": [0, 0, 1, 1, 0],
	"1": [1, 0, 0, 0, 1],
	"2": [0, 1, 0, 0, 1],
	"3": [1, 1, 0, 0, 0],
	"4": [0, 0, 1, 0, 1],
	"5": [1, 0, 1, 0, 0],
	"6": [0, 0, 0, 1, 1],
	"7": [1, 0, 0, 1, 0],
	"8": [0, 1, 0, 1, 0],
	"9": [0, 1, 1, 0, 0],
};
const N = 2; // narrow
const W = 5; // wide

function buildBarcode(raw: string): string {
	const data = raw
		.replace(/\D/g, "")
		.padStart(raw.length % 2 === 0 ? raw.length : raw.length + 1, "0");
	const bars: { w: number; fill: boolean }[] = [];

	bars.push(
		{ w: N, fill: true },
		{ w: N, fill: false },
		{ w: N, fill: true },
		{ w: N, fill: false },
	);

	for (let i = 0; i < data.length; i += 2) {
		const d1 = ITF25[data[i]] ?? ITF25["0"];
		const d2 = ITF25[data[i + 1]] ?? ITF25["0"];
		for (let j = 0; j < 5; j++) {
			bars.push({ w: d1[j] ? W : N, fill: true });
			bars.push({ w: d2[j] ? W : N, fill: false });
		}
	}

	bars.push(
		{ w: W, fill: true },
		{ w: N, fill: false },
		{ w: N, fill: true },
	);

	let x = 0;
	const rects: string[] = [];
	for (const b of bars) {
		if (b.fill)
			rects.push(
				`<rect x="${x}" y="0" width="${b.w}" height="60" fill="black"/>`,
			);
		x += b.w;
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 60"
    style="width:100%;height:70px;display:block">
    <rect width="${x}" height="60" fill="white"/>
    ${rects.join("")}
  </svg>`;
}

/* ──────────────────────────────────────────────
   Gerador HTML do boleto
   ────────────────────────────────────────────── */
function buildBoletoHtml(taxa: Taxa, nomeContrato: string): string {
	const barcodeData = (
		taxa.nnumero ||
		taxa.codlan ||
		`${taxa.codigo}${taxa.circ}${String(taxa.valor).replace(".", "")}`
	)
		.replace(/\D/g, "")
		.padEnd(44, "0")
		.slice(0, 44);
	const linhaDigitavel = barcodeData.replace(
		/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
		"$1.$2 $3.$4 $5.$6 $7 $8",
	);
	const barcodeSvg = buildBarcode(barcodeData);
	const vencimento = formatDate(taxa.emissao_) || "—";
	const valor = formatCurrency(taxa.valor);
	const cedente = taxa.cedente || "BOMPASTOR";

	const logoUrl = `${window.location.origin}/logobp.png`;

	const slip = (recibo: boolean) => `
    <div class="slip${recibo ? " recibo" : ""}">
      <div class="slip-header">
        <div class="bank-logo"><img src="${logoUrl}" style="height:20px;width:auto;object-fit:contain;display:block;" alt="logo" /></div>
        <div class="bank-line">|</div>
        <div class="bank-code">000-0</div>
        <div class="linha-digitavel">${linhaDigitavel}</div>
      </div>
      <div class="row3">
        <div class="field wide">
          <span class="flabel">Beneficiário</span>
          <span class="fval">${cedente}</span>
        </div>
        <div class="field">
          <span class="flabel">Agência / Código Cedente</span>
          <span class="fval">${taxa.filial || "0001"} / ${taxa.cedente || "000000"}</span>
        </div>
      </div>
      <div class="row3">
        <div class="field">
          <span class="flabel">Nosso Número</span>
          <span class="fval bold">${taxa.nnumero || barcodeData.slice(0, 10)}</span>
        </div>
        <div class="field">
          <span class="flabel">Nº Documento</span>
          <span class="fval">${taxa.codlan || taxa.codigo}</span>
        </div>
        <div class="field sm">
          <span class="flabel">Espécie</span>
          <span class="fval">DM</span>
        </div>
        <div class="field sm">
          <span class="flabel">Aceite</span>
          <span class="fval">N</span>
        </div>
        <div class="field">
          <span class="flabel">Data Emissão</span>
          <span class="fval">${formatDate(taxa.emissao_) || "—"}</span>
        </div>
      </div>
      <div class="row3">
        <div class="field wide">
          <span class="flabel">Instruções (texto de responsabilidade do Beneficiário)</span>
          <span class="fval">Contrato: ${taxa.codigo} — Circular: ${taxa.circ} — Tipo: ${taxa.tipo}</span>
          <span class="fval">Cobrador: ${taxa.cobrador || "—"}</span>
        </div>
        <div class="field">
          <span class="flabel">Vencimento</span>
          <span class="fval bold">${vencimento}</span>
        </div>
      </div>
      <div class="row3">
        <div class="field wide">
          <span class="flabel">Pagador</span>
          <span class="fval">${nomeContrato} — Contrato Nº ${taxa.codigo}</span>
        </div>
        <div class="field">
          <span class="flabel">Valor do Documento</span>
          <span class="fval bold">${valor}</span>
        </div>
      </div>
      <div class="row3 last">
        <div class="field wide">
          <span class="flabel">Sacado / Pagador</span>
          <span class="fval">${nomeContrato}</span>
        </div>
        <div class="field">
          <span class="flabel">(=) Valor Cobrado</span>
          <span class="fval bold">${valor}</span>
        </div>
      </div>
      ${!recibo ? `<div class="barcode-section">${barcodeSvg}</div>` : ""}
    </div>`;

	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Boleto — ${taxa.codigo} / Circ. ${taxa.circ}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #111; background: white; padding: 10mm 12mm; }
    .slip { border: 1px solid #ccc; margin-bottom: 6mm; }
    .recibo { margin-bottom: 2mm; }
    .scissor { text-align: center; color: #aaa; font-size: 9px; margin: 3mm 0; border-top: 1px dashed #bbb; padding-top: 2mm; }
    .slip-header { display: flex; align-items: center; border-bottom: 2px solid #000; padding: 4px 8px; gap: 0; }
    .bank-logo { padding-right: 8px; border-right: 2px solid #000; display:flex; align-items:center; }
    .bank-line { padding: 0 8px; border-right: 2px solid #000; font-size: 14px; font-weight: bold; }
    .bank-code { font-size: 13px; font-weight: bold; padding: 0 10px; border-right: 2px solid #000; }
    .linha-digitavel { flex: 1; text-align: right; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
    .row3 { display: flex; border-bottom: 1px solid #bbb; }
    .row3.last { border-bottom: none; }
    .field { display: flex; flex-direction: column; padding: 3px 6px; border-right: 1px solid #bbb; flex: 1; }
    .field.wide { flex: 3; }
    .field.sm { flex: 0.5; }
    .field:last-child { border-right: none; }
    .flabel { font-size: 8px; color: #555; margin-bottom: 1px; }
    .fval { font-size: 10px; color: #111; }
    .fval.bold { font-weight: bold; font-size: 11px; }
    .barcode-section { padding: 6px 8px 4px; background: white; }
    @media print { body { padding: 8mm 10mm; } .slip { page-break-inside: avoid; } }
  </style>
</head>
<body>
  ${slip(true)}
  <div class="scissor">✂ Recibo do Pagador</div>
  ${slip(false)}
</body>
</html>`;

	return html;
}

/* ──────────────────────────────────────────────
   Recibo Cobrador
   ────────────────────────────────────────────── */
function buildReciboCobradoreHtml(taxa: Taxa, nomeContrato: string): string {
	const valor = formatCurrency(taxa.valor);
	const valorPago = formatCurrency(taxa.valorpg ?? 0);
	const emissao = formatDate(taxa.emissao_) || "—";
	const pgto = formatDate(taxa.pgto_) || "—";
	const stat =
		taxa.stat === "B"
			? "Baixado"
			: taxa.stat === "C"
				? "Cancelado"
				: "Aberto";
	const statColor =
		taxa.stat === "B"
			? "#166534"
			: taxa.stat === "C"
				? "#991b1b"
				: "#92400e";
	const statBg =
		taxa.stat === "B"
			? "#dcfce7"
			: taxa.stat === "C"
				? "#fee2e2"
				: "#fef3c7";

	const logoUrl = `${window.location.origin}/logobp.png`;

	const slip = (copy: "cobrador" | "pagador") => `
    <div class="slip">
      <div class="slip-header">
        <div class="company-block">
          <img src="${logoUrl}" class="company-logo" alt="logo" />
          <div>
            <div class="company">BOMPASTOR</div>
            <div class="subtitle">RECIBO DE COBRANÇA — VIA DO ${copy === "cobrador" ? "COBRADOR" : "PAGADOR"}</div>
          </div>
        </div>
        <div class="stat-badge" style="background:${statBg};color:${statColor}">${stat}</div>
      </div>

      <div class="grid2">
        <div class="field">
          <span class="lbl">Contrato</span>
          <span class="val">${String(taxa.codigo).padStart(9, "0")}</span>
        </div>
        <div class="field">
          <span class="lbl">Pagador</span>
          <span class="val">${nomeContrato}</span>
        </div>
      </div>

      <div class="grid4">
        <div class="field">
          <span class="lbl">Circular</span>
          <span class="val bold">${taxa.circ}</span>
        </div>
        <div class="field">
          <span class="lbl">Tipo</span>
          <span class="val">${taxa.tipo}</span>
        </div>
        <div class="field">
          <span class="lbl">Emissão</span>
          <span class="val">${emissao}</span>
        </div>
        <div class="field">
          <span class="lbl">Cobrador</span>
          <span class="val bold">${taxa.cobrador || "—"}</span>
        </div>
      </div>

      <div class="valor-block">
        <div class="field">
          <span class="lbl">Valor Original</span>
          <span class="val valor">${valor}</span>
        </div>
        ${
			taxa.stat === "B"
				? `
        <div class="field">
          <span class="lbl">Valor Pago</span>
          <span class="val valor pago">${valorPago}</span>
        </div>
        <div class="field">
          <span class="lbl">Data Pagamento</span>
          <span class="val">${pgto}</span>
        </div>
        <div class="field">
          <span class="lbl">Forma</span>
          <span class="val">${taxa.forma || "—"}</span>
        </div>`
				: ""
		}
      </div>

      ${
			copy === "cobrador"
				? `
      <div class="assinatura">
        <div class="linha-ass"></div>
        <div class="ass-label">Assinatura do Pagador</div>
      </div>`
				: ""
		}
    </div>`;

	const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recibo — ${taxa.codigo} / Circ. ${taxa.circ}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: white; padding: 10mm 12mm; }
    .slip { border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 6mm; overflow: hidden; }
    .scissor { text-align: center; color: #9ca3af; font-size: 9px; margin: 3mm 0; border-top: 1px dashed #d1d5db; padding-top: 2mm; }
    .slip-header { background: #f0f4f8; color: #1a3a5c; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
    .company-block { display: flex; align-items: center; gap: 8px; }
    .company-logo { height: 32px; width: auto; object-fit: contain; }
    .company { font-size: 13px; font-weight: bold; letter-spacing: .5px; color: #1a3a5c; }
    .subtitle { font-size: 9px; color: #4b5563; margin-top: 2px; letter-spacing: .5px; }
    .stat-badge { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; }
    .grid2 { display: grid; grid-template-columns: 1fr 2fr; border-bottom: 1px solid #e5e7eb; }
    .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid #e5e7eb; }
    .valor-block { display: flex; gap: 0; border-bottom: 1px solid #e5e7eb; }
    .valor-block .field { flex: 1; }
    .field { padding: 6px 10px; border-right: 1px solid #e5e7eb; }
    .field:last-child { border-right: none; }
    .lbl { display: block; font-size: 8px; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px; }
    .val { display: block; font-size: 11px; color: #111; }
    .val.bold { font-weight: bold; }
    .val.valor { font-size: 14px; font-weight: bold; color: #1f2937; }
    .val.pago { color: #166534; }
    .assinatura { padding: 14px 12px 10px; }
    .linha-ass { border-bottom: 1px solid #374151; width: 240px; margin-bottom: 3px; }
    .ass-label { font-size: 8px; color: #6b7280; }
    @media print { body { padding: 8mm 10mm; } .slip { page-break-inside: avoid; } }
  </style>
</head>
<body>
  ${slip("cobrador")}
  <div class="scissor">✂ Recibo do Pagador</div>
  ${slip("pagador")}
</body>
</html>`;

	return html;
}

interface TaxasModalProps {
	isOpen: boolean;
	onClose: () => void;
	codigo: string;
	nomeContrato: string;
	hideHeader?: boolean;
}

const FORMA_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "D", label: "Dinheiro" },
	{ value: "C", label: "Cheque" },
	{ value: "B", label: "Boleto" },
	{ value: "T", label: "Transferência" },
	{ value: "P", label: "PIX" },
];

const STAT_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "A", label: "Aberto" },
	{ value: "B", label: "Baixado" },
	{ value: "C", label: "Cancelado" },
];

const COLUMNS: Column[] = [
	{ key: "circ", label: "Circular", width: "70px", align: "center" },
	{ key: "tipo", label: "Tipo", width: "50px", align: "center" },
	{
		key: "emissao_",
		label: "Emissão",
		width: "100px",
		render: (v) => formatDate(v as Date | null),
	},
	{
		key: "valor",
		label: "Valor",
		width: "100px",
		align: "right",
		render: (v) => formatCurrency(Number(v)),
	},
	{
		key: "pgto_",
		label: "Pagamento",
		width: "100px",
		render: (v) => formatDate(v as Date | null),
	},
	{
		key: "valorpg",
		label: "Vlr Pago",
		width: "100px",
		align: "right",
		render: (v) => formatCurrency(Number(v)),
	},
	{ key: "cobrador", label: "Cobrador", width: "80px", align: "center" },
	{ key: "stat", label: "Status", width: "60px", align: "center" },
	{ key: "forma", label: "Forma", width: "60px", align: "center" },
];

/* ── Panel: conteúdo sem wrapper de Modal ── */
export function TaxasPanel({
	codigo,
	nomeContrato,
	hidePrint,
	onGerarTaxas,
}: {
	codigo: string;
	nomeContrato: string;
	hidePrint?: boolean;
	onGerarTaxas?: () => void;
}) {
	const { getTable, setTable, dirHandle, usuario } = useAppStore();
	const table = getTable("taxas");
	const [selected, setSelected] = useState<DbfRecord | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<Taxa | null>(null);
	const [valorpgStr, setValorpgStr] = useState("");
	const [saving, setSaving] = useState(false);
	const [printTypeOpen, setPrintTypeOpen] = useState(false);
	const [printTypeSel, setPrintTypeSel] = useState<"boleto" | "recibo">(
		"boleto",
	);
	const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(
		null,
	);
	const [highlightedRow, setHighlightedRow] = useState<DbfRecord | null>(
		null,
	);
	const [gerarCarneOpen, setGerarCarneOpen] = useState(false);
	const [filtEmissaoDe, setFiltEmissaoDe] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 90);
		return d.toISOString().slice(0, 10);
	});
	const [filtEmissaoAte, setFiltEmissaoAte] = useState("");
	const [filtPgtoDe, setFiltPgtoDe] = useState("");
	const [filtPgtoAte, setFiltPgtoAte] = useState("");
	const [filtCircTipo, setFiltCircTipo] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const [minHeight, setMinHeight] = useState(0);
	const isDirty =
		selected && editOpen
			? JSON.stringify(form) !== JSON.stringify(selected)
			: true;
	const _theme = useThemeStore((s) => s.theme);
	const primary =
		_theme === "orange"
			? "#ff914d"
			: _theme === "gray"
				? "#248094"
				: "#1e3a8a";
	const selectedBg =
		_theme === "orange"
			? "#ffedd5"
			: _theme === "gray"
				? "#e0f2fe"
				: "#dbeafe";

	const columns: Column[] = useMemo(
		() => [
			{ key: "circ", label: "Circular", width: "70px", align: "center" },
			{ key: "tipo", label: "Tipo", width: "50px", align: "center" },
			{
				key: "emissao_",
				label: "Emissão",
				width: "100px",
				render: (v) => formatDate(v as Date | null),
			},
			{
				key: "valor",
				label: "Valor",
				width: "100px",
				align: "right",
				render: (v) => formatCurrency(Number(v)),
			},
			{
				key: "pgto_",
				label: "Pagamento",
				width: "100px",
				render: (v) => formatDate(v as Date | null),
			},
			{
				key: "valorpg",
				label: "Vlr Pago",
				width: "100px",
				align: "right",
				render: (v) => formatCurrency(Number(v)),
			},
			{
				key: "cobrador",
				label: "Cobrador",
				width: "80px",
				align: "center",
			},
			{ key: "stat", label: "Status", width: "60px", align: "center" },
			{ key: "forma", label: "Forma", width: "60px", align: "center" },
			{
				key: "acoes",
				label: "",
				width: "50px",
				align: "center",
				sortable: false,
				render: (_, record) => (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setSelected(record);
							setForm(record as unknown as Taxa);
							setPrintTypeOpen(true);
						}}
						className="p-1 hover:bg-gray-200 rounded transition-colors text-lg invisible group-hover:visible"
						title="Imprimir Taxa"
					>
						🖨️
					</button>
				),
			},
		],
		[],
	);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const observer = new ResizeObserver(([entry]) => {
			const h = entry.contentRect.height;
			setMinHeight((prev) => (h > prev ? h : prev));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const taxas = useMemo(() => {
		if (!table) return [];
		const records = filterRecords(table, "codigo", codigo);
		return records.sort((a, b) => {
			const toD = (v: unknown) => {
				if (v instanceof Date) return v.getTime();
				if (typeof v === "string" && v.trim()) {
					const d = new Date(v);
					return isNaN(d.getTime()) ? 0 : d.getTime();
				}
				return 0;
			};
			const isEmpty = (v: unknown) =>
				v === null ||
				v === undefined ||
				(typeof v === "string" && !v.trim()) ||
				toD(v) === 0;
			// Sem pagamento vem primeiro
			const aPago = isEmpty(a.pgto_) ? 0 : 1;
			const bPago = isEmpty(b.pgto_) ? 0 : 1;
			if (aPago !== bPago) return aPago - bPago;
			// Dentro do grupo: emissao_ decrescente (mais recente primeiro)
			return toD(b.emissao_) - toD(a.emissao_);
		});
	}, [table, codigo]);

	const taxasFiltradas = useMemo(() => {
		const toD = (v: unknown): Date | null => {
			if (v instanceof Date) return v;
			if (typeof v === "string" && v.trim()) {
				const d = new Date(v);
				return isNaN(d.getTime()) ? null : d;
			}
			return null;
		};
		const parseFilt = (s: string): Date | null => {
			if (!s) return null;
			const d = new Date(s);
			return isNaN(d.getTime()) ? null : d;
		};
		const emDe = parseFilt(filtEmissaoDe);
		const emAte = parseFilt(filtEmissaoAte);
		const pgDe = parseFilt(filtPgtoDe);
		const pgAte = parseFilt(filtPgtoAte);
		const ct = filtCircTipo.trim().toLowerCase();
		return taxas.filter((r) => {
			if (emDe || emAte) {
				const em = toD(r.emissao_);
				if (emDe && (!em || em < emDe)) return false;
				if (emAte) {
					const ate = new Date(emAte);
					ate.setHours(23, 59, 59, 999);
					if (!em || em > ate) return false;
				}
			}
			if (pgDe || pgAte) {
				const pg = toD(r.pgto_);
				if (pgDe && (!pg || pg < pgDe)) return false;
				if (pgAte) {
					const ate = new Date(pgAte);
					ate.setHours(23, 59, 59, 999);
					if (!pg || pg > ate) return false;
				}
			}
			if (ct) {
				const circ = String(r.circ ?? "")
					.trim()
					.toLowerCase();
				const tipo = String(r.tipo ?? "")
					.trim()
					.toLowerCase();
				if (
					!circ.includes(ct) &&
					!tipo.includes(ct) &&
					!(circ + "/" + tipo).includes(ct)
				)
					return false;
			}
			return true;
		});
	}, [
		taxas,
		filtEmissaoDe,
		filtEmissaoAte,
		filtPgtoDe,
		filtPgtoAte,
		filtCircTipo,
	]);

	const totalEmitido = taxas.reduce(
		(acc, r) => acc + Number(r.valor ?? 0),
		0,
	);
	const hasPgto = (r: DbfRecord) => {
		const v = r.pgto_;
		if (v instanceof Date) return true;
		if (typeof v === "string" && v.trim()) {
			const d = new Date(v);
			return !isNaN(d.getTime());
		}
		return false;
	};
	const totalPago = taxas
		.filter(hasPgto)
		.reduce((acc, r) => acc + Number(r.valor ?? 0), 0);
	const totalPendente = taxas
		.filter((r) => !hasPgto(r))
		.reduce((acc, r) => acc + Number(r.valor ?? 0), 0);

	function handleRowClick(row: DbfRecord) {
		if (selected === row && editOpen) {
			setEditOpen(false);
			return;
		}
		setSelected(row);
		const taxa = row as unknown as Taxa;
		setForm(taxa);
		setValorpgStr(numberToMask(Number(taxa.valorpg ?? 0)));
		setEditOpen(true);
	}

	function setField(field: keyof Taxa, value: unknown) {
		setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
	}

	async function handleSave() {
		if (!dirHandle || !table || !selected || !form) return;
		setSaving(true);
		try {
			const recs = [...table.records];
			const idx = recs.indexOf(selected);
			const savedRec = { ...form, por: usuario } as unknown as DbfRecord;
			if (idx >= 0) recs[idx] = savedRec;
			const newTable = { ...table, records: recs };
			await writeDbfFile(dirHandle, "TAXAS", newTable);
			setTable("taxas", newTable);
			setEditOpen(false);
			setSelected(null);
			setHighlightedRow(savedRec);
			setTimeout(() => setHighlightedRow(null), 3000);
		} catch (e) {
			alert("Erro ao salvar: " + e);
		} finally {
			setSaving(false);
		}
	}

	return (
		<>
			{/* Resumo */}
			<div className="grid grid-cols-3 gap-3 mt-1 mb-2">
				<div className="bg-blue-50 rounded p-3 text-center">
					<p className="text-xs text-gray-500">Total Emitido</p>
					<p className="text-lg font-bold text-blue-900">
						{formatCurrency(totalEmitido)}
					</p>
				</div>
				<div className="bg-green-50 rounded p-3 text-center">
					<p className="text-xs text-gray-500">Total Pago</p>
					<p className="text-lg font-bold text-green-700">
						{formatCurrency(totalPago)}
					</p>
				</div>
				<div className="bg-red-50 rounded p-3 text-center">
					<p className="text-xs text-gray-500">Pendente</p>
					<p className="text-lg font-bold text-red-700">
						{formatCurrency(totalPendente)}
					</p>
				</div>
			</div>

			{/* Filtros */}
			<fieldset className="border border-gray-300 rounded px-2 pt-0 pb-5 mb-2 text-xs">
				<legend className="px-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
					Filtros
				</legend>
				<div className="flex items-end gap-2">
					<div className="flex flex-col gap-0.5 flex-1">
						<label className="text-gray-500">Emissão de</label>
						<input
							type="date"
							className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full"
							value={filtEmissaoDe}
							onChange={(e) => setFiltEmissaoDe(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-0.5 flex-1">
						<label className="text-gray-500">até</label>
						<input
							type="date"
							className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full"
							value={filtEmissaoAte}
							onChange={(e) => setFiltEmissaoAte(e.target.value)}
						/>
					</div>
					<div className="w-px h-6 bg-gray-300 self-end mb-0.5 shrink-0" />
					<div className="flex flex-col gap-0.5 flex-1">
						<label className="text-gray-500">Pagamento de</label>
						<input
							type="date"
							className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full"
							value={filtPgtoDe}
							onChange={(e) => setFiltPgtoDe(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-0.5 flex-1">
						<label className="text-gray-500">até</label>
						<input
							type="date"
							className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full"
							value={filtPgtoAte}
							onChange={(e) => setFiltPgtoAte(e.target.value)}
						/>
					</div>
					<div className="w-px h-6 bg-gray-300 self-end mb-0.5 shrink-0" />
					<div className="flex flex-col gap-0.5 flex-1">
						<label className="text-gray-500">Circ. / Tipo</label>
						<input
							type="text"
							className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full"
							placeholder="ex: 001/2"
							value={filtCircTipo}
							onChange={(e) => setFiltCircTipo(e.target.value)}
						/>
					</div>
					{(filtEmissaoDe ||
						filtEmissaoAte ||
						filtPgtoDe ||
						filtPgtoAte ||
						filtCircTipo) && (
						<button
							className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-500 self-end shrink-0"
							onClick={() => {
								setFiltEmissaoDe("");
								setFiltEmissaoAte("");
								setFiltPgtoDe("");
								setFiltPgtoAte("");
								setFiltCircTipo("");
							}}
						>
							Limpar
						</button>
					)}
				</div>
			</fieldset>
			<div
				ref={containerRef}
				style={{ minHeight: minHeight || undefined }}
			>
				<DataTable
					columns={columns}
					data={taxasFiltradas as never[]}
					pageSize={10}
					compact
					emptyMessage="Nenhuma taxa encontrada para este contrato"
					onRowClick={handleRowClick}
					selectedRow={selected}
					highlightedRow={highlightedRow}
					rowClassName={(record) => {
						const stat = String(record.stat ?? "").trim();
						if (stat !== "A") return "";
						const v = record.emissao_;
						let em: Date | null = null;
						if (v instanceof Date) em = v;
						else if (typeof v === "string" && v.trim()) {
							const d = new Date(v);
							if (!isNaN(d.getTime())) em = d;
						}
						if (em && em < new Date())
							return "!bg-red-50 border-l-2 !border-l-red-400";
						return "";
					}}
					expandedRow={editOpen ? selected : null}
					expandedContent={
						editOpen && form ? (
							<div
								key={
									String(selected?.seq ?? "") +
									String(selected?.circ ?? "")
								}
								className="border-t-2 p-3 expand-down form-compact"
								style={{
									borderColor: primary,
									background: selectedBg,
								}}
							>
								<div className="flex items-center justify-between mb-2">
									<span
										className="text-xs font-semibold uppercase pl-0 tracking-wide"
										style={{ color: primary }}
									>
										Circ. {form.tipo} / {form.circ}
									</span>
									<div className="flex items-center gap-2">
										<Btn
											size="sm"
											onClick={handleSave}
											disabled={saving || !isDirty}
										>
											{saving ? "Salvando..." : "Salvar"}
										</Btn>
										<button
											onClick={() => setEditOpen(false)}
											className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1"
										>
											×
										</button>
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<FormRow cols={5}>
										<FormInput
											label="Código"
											value={form.codigo}
											disabled
										/>
										<FormInput
											label="Tipo"
											value={form.tipo}
											disabled
										/>
										<FormInput
											label="Circular"
											value={form.circ}
											disabled
										/>
										<FormInput
											label="Emissão"
											type="date"
											value={toDateInputValue(
												form.emissao_,
											)}
											disabled
										/>
										<FormInput
											label="Valor Emitido"
											value={formatCurrency(
												Number(form.valor ?? 0),
											)}
											disabled
										/>
									</FormRow>
									<FormRow cols={4}>
										<FormInput
											label="Data Pagamento"
											type="date"
											value={
												form.pgto_ &&
												!isNaN(new Date(form.pgto_).getTime())
													? new Date(form.pgto_)
															.toISOString()
															.substring(0, 10)
													: ""
											}
											onChange={(e) =>
												setField(
													"pgto_",
													e.target.value
														? new Date(
																e.target.value +
																	"T12:00:00",
															)
														: null,
												)
											}
										/>
										<FormInput
											label="Valor Pago"
											value={valorpgStr}
											onChange={(e) => {
												const masked = maskCurrency(e.target.value);
												setValorpgStr(masked);
												setField("valorpg", parseCurrency(masked));
											}}
										/>
										<FormInput
											label="Data Baixa"
											type="date"
											value={
												form.baixa_ &&
												!isNaN(new Date(form.baixa_).getTime())
													? new Date(form.baixa_)
															.toISOString()
															.substring(0, 10)
													: ""
											}
											onChange={(e) =>
												setField(
													"baixa_",
													e.target.value
														? new Date(
																e.target.value +
																	"T12:00:00",
															)
														: null,
												)
											}
										/>
										<FormSelect
											label="Forma"
											value={form.forma}
											onChange={(e) =>
												setField(
													"forma",
													e.target.value,
												)
											}
											options={FORMA_OPTS}
										/>
									</FormRow>
									<FormRow cols={3}>
										<FormInput
											label="Cobrador"
											value={form.cobrador}
											onChange={(e) =>
												setField(
													"cobrador",
													e.target.value.toUpperCase(),
												)
											}
											maxLength={3}
										/>
										<FormSelect
											label="Status"
											value={form.stat}
											onChange={(e) =>
												setField("stat", e.target.value)
											}
											options={STAT_OPTS}
										/>
										<FormInput
											label="Filial"
											value={form.filial}
											onChange={(e) =>
												setField(
													"filial",
													e.target.value.toUpperCase(),
												)
											}
											maxLength={2}
										/>
									</FormRow>
								</div>
							</div>
						) : null
					}
				/>
			</div>

			{/* Seleção de tipo de impressão */}
			{printTypeOpen && form && (
				<Modal
					isOpen={printTypeOpen}
					onClose={() => setPrintTypeOpen(false)}
					title="Selecionar Tipo de Impressão"
					size="sm"
					footer={
						<>
							<Btn
								variant="secondary"
								onClick={() => setPrintTypeOpen(false)}
							>
								Cancelar
							</Btn>
							<Btn
								icon="🖨️"
								onClick={() => {
									setPrintTypeOpen(false);
									const html =
										printTypeSel === "boleto"
											? buildBoletoHtml(
													form,
													nomeContrato,
												)
											: buildReciboCobradoreHtml(
													form,
													nomeContrato,
												);
									setPrintPreviewHtml(html);
								}}
							>
								Imprimir
							</Btn>
						</>
					}
				>
					<div className="flex flex-col gap-3 py-1">
						<label
							className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
							onClick={() => setPrintTypeSel("boleto")}
						>
							<input
								type="radio"
								name="printType"
								value="boleto"
								checked={printTypeSel === "boleto"}
								onChange={() => setPrintTypeSel("boleto")}
								className="accent-orange-500"
							/>
							<div>
								<p className="text-sm font-semibold text-gray-700">
									Boleto
								</p>
								<p className="text-xs text-gray-400">
									Layout de boleto bancário com código de
									barras
								</p>
							</div>
						</label>
						<label
							className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
							onClick={() => setPrintTypeSel("recibo")}
						>
							<input
								type="radio"
								name="printType"
								value="recibo"
								checked={printTypeSel === "recibo"}
								onChange={() => setPrintTypeSel("recibo")}
								className="accent-orange-500"
							/>
							<div>
								<p className="text-sm font-semibold text-gray-700">
									Recibo Cobrador
								</p>
								<p className="text-xs text-gray-400">
									Recibo em duas vias: cobrador e pagador
								</p>
							</div>
						</label>
					</div>
				</Modal>
			)}

			<PrintPreviewModal
				html={printPreviewHtml}
				onClose={() => setPrintPreviewHtml(null)}
				title="Prévia de Impressão"
			/>

			{!onGerarTaxas && (
				<GerarCarneModal
					isOpen={gerarCarneOpen}
					onClose={() => setGerarCarneOpen(false)}
					initialContrato={{
						codigo,
						nome: nomeContrato,
						cpf: "",
						telefone: "",
						grupo: "",
						cobrador: "",
						situacao: "",
					}}
				/>
			)}
		</>
	);
}

/* ── Modal wrapper (acesso direto pelo PageHeader) ── */
export function TaxasModal({
	isOpen,
	onClose,
	codigo,
	nomeContrato,
	hideHeader,
}: TaxasModalProps) {
	const { getTable } = useAppStore();
	const table = getTable("taxas");
	const taxas = useMemo(
		() => (table ? filterRecords(table, "codigo", codigo) : []),
		[table, codigo],
	);
	const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(
		null,
	);
	const [gerarCarneOpen, setGerarCarneOpen] = useState(false);

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title={
					<div className="flex flex-col leading-tight">
						<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
							Taxas
						</span>
						<span className="text-sm font-semibold">
							{String(codigo).padStart(9, "0")} — {nomeContrato}
						</span>
					</div>
				}
				size="xl"
				fixedHeight
				hideHeader={hideHeader}
				headerExtra={
					<div className="flex items-center gap-2">
						<Btn
							size="sm"
							variant="secondary"
							onClick={() => setGerarCarneOpen(true)}
							icon="📋"
						>
							Gerar Taxas
						</Btn>
						<Btn
							size="sm"
							variant="secondary"
							onClick={() =>
								setPrintPreviewHtml(
									buildTaxasPrintHtml(
										codigo,
										nomeContrato,
										taxas as never[],
										new Set(["resumo", "detalhamento"]),
									),
								)
							}
							icon="🖨️"
						>
							Imprimir
						</Btn>
					</div>
				}
				footer={
					<div className="flex gap-2">
						<Btn variant="secondary" onClick={onClose}>
							Fechar
						</Btn>
					</div>
				}
			>
				<TaxasPanel
					codigo={codigo}
					nomeContrato={nomeContrato}
					hidePrint
					onGerarTaxas={() => setGerarCarneOpen(true)}
				/>
			</Modal>
			<PrintPreviewModal
				html={printPreviewHtml}
				onClose={() => setPrintPreviewHtml(null)}
				title="Prévia — Taxas"
			/>
			<GerarCarneModal
				isOpen={gerarCarneOpen}
				onClose={() => setGerarCarneOpen(false)}
				initialContrato={{
					codigo,
					nome: nomeContrato,
					cpf: "",
					telefone: "",
					grupo: "",
					cobrador: "",
					situacao: "",
				}}
			/>
		</>
	);
}
