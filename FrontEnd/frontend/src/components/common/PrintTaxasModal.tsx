import { useState } from 'react'
import { Modal } from './Modal'
import { Btn } from './PageHeader'
import { PrintPreviewModal } from './PrintPreviewModal'
import { formatDate, formatCurrency } from '../../utils/formatters'
import type { DbfRecord } from '../../types/models'

interface PrintTaxasModalProps {
  isOpen: boolean
  onClose: () => void
  codigo: string
  nomeContrato: string
  taxas: DbfRecord[]
}

const FONT = 'Arial, Helvetica, sans-serif'

const BLOCK_IDS = ['resumo', 'detalhamento'] as const
type BlockId = (typeof BLOCK_IDS)[number]
const BLOCK_LABELS: Record<BlockId, string> = {
  resumo: 'Resumo Financeiro',
  detalhamento: 'Detalhamento das Taxas',
}

/* ──────────────────────────────────────────────
   SVG Preview
   ────────────────────────────────────────────── */
function SvgPreview({
  codigo,
  nomeContrato,
  taxas,
  selected,
}: {
  codigo: string
  nomeContrato: string
  taxas: DbfRecord[]
  selected: Set<BlockId>
}) {
  const PAGE_W = 210
  const MARGIN = 10
  const CW = PAGE_W - MARGIN * 2

  const totalEmitido = taxas.reduce((a, r) => a + Number(r.valor ?? 0), 0)
  const totalPago = taxas.reduce((a, r) => a + Number(r.valorpg ?? 0), 0)
  const totalPendente = totalEmitido - totalPago

  // Layout
  let cursor = 20
  let pageH = 20

  // Header always present
  const headerY = cursor
  cursor += 10

  // Resumo block
  const resumoY = selected.has('resumo') ? cursor : null
  if (selected.has('resumo')) cursor += 22

  // Detalhamento block
  const detalY = selected.has('detalhamento') ? cursor : null
  const ROW_H = 4.8
  const TABLE_ROWS = Math.min(taxas.length, 30)
  const tableH = selected.has('detalhamento') ? 10 + TABLE_ROWS * ROW_H + 8 : 0
  if (selected.has('detalhamento')) cursor += tableH

  cursor += 10
  pageH = Math.max(297, cursor)

  // Table columns
  const cols = [
    { label: 'Circular', w: 18 },
    { label: 'Tipo', w: 12 },
    { label: 'Emissão', w: 22 },
    { label: 'Valor', w: 22 },
    { label: 'Pagamento', w: 22 },
    { label: 'Vlr Pago', w: 22 },
    { label: 'Cobrador', w: 20 },
    { label: 'Status', w: 16 },
    { label: 'Forma', w: 14 },
  ]

  return (
    <svg
      viewBox={`0 0 ${PAGE_W} ${pageH}`}
      style={{ width: '100%', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="ps2" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="1.5" dy="1.5" stdDeviation="2.5" floodColor="#00000030" />
        </filter>
      </defs>

      {/* Page */}
      <rect x="4" y="4" width={PAGE_W - 8} height={pageH - 8} fill="white" stroke="#d0d0d0" strokeWidth="0.4" filter="url(#ps2)" rx="1" />

      {/* Header */}
      <rect x={MARGIN} y={headerY} width={CW} height={8} fill="#f0f4f8" rx="1" />
      <text x={MARGIN + 3} y={headerY + 5.5} fontSize="4" fill="#1a3a5c" fontWeight="bold" fontFamily={FONT}>
        {`TAXAS — CONTRATO Nº ${String(codigo).padStart(9, '0')}`}
      </text>
      <text x={PAGE_W - MARGIN - 2} y={headerY + 5.5} fontSize="3" fill="#1a3a5c" textAnchor="end" fontFamily={FONT}>
        {nomeContrato.length > 28 ? nomeContrato.slice(0, 28) + '…' : nomeContrato}
      </text>

      {/* Resumo */}
      {resumoY !== null && (
        <g>
          <rect x={MARGIN} y={resumoY} width={CW} height={20} fill="white" stroke="#e0e0e0" strokeWidth="0.4" rx="0.8" />
          <rect x={MARGIN} y={resumoY} width={CW} height={5} fill="#f0f4f8" rx="0.8" />
          <text x={MARGIN + 2.5} y={resumoY + 3.5} fontSize="3.2" fill="#1a3a5c" fontWeight="bold" fontFamily={FONT} letterSpacing="0.3">
            RESUMO FINANCEIRO
          </text>

          {/* 3 cards */}
          {[
            { label: 'Total Emitido', value: formatCurrency(totalEmitido), color: '#1e40af' },
            { label: 'Total Pago', value: formatCurrency(totalPago), color: '#15803d' },
            { label: 'Pendente', value: formatCurrency(totalPendente), color: '#b91c1c' },
          ].map((card, i) => {
            const cardW = (CW - 8) / 3
            const cx = MARGIN + 2 + i * (cardW + 2)
            const cy = resumoY + 6
            return (
              <g key={i}>
                <rect x={cx} y={cy} width={cardW} height={12} fill={i === 0 ? '#eff6ff' : i === 1 ? '#f0fdf4' : '#fef2f2'} rx="0.8" />
                <text x={cx + cardW / 2} y={cy + 4.5} fontSize="2.6" fill="#888" textAnchor="middle" fontFamily={FONT}>{card.label}</text>
                <text x={cx + cardW / 2} y={cy + 9} fontSize="3.8" fill={card.color} fontWeight="bold" textAnchor="middle" fontFamily={FONT}>{card.value}</text>
              </g>
            )
          })}
        </g>
      )}

      {/* Detalhamento */}
      {detalY !== null && (
        <g>
          <rect x={MARGIN} y={detalY} width={CW} height={tableH} fill="white" stroke="#e0e0e0" strokeWidth="0.4" rx="0.8" />
          <rect x={MARGIN} y={detalY} width={CW} height={5} fill="#f0f4f8" rx="0.8" />
          <text x={MARGIN + 2.5} y={detalY + 3.5} fontSize="3.2" fill="#1a3a5c" fontWeight="bold" fontFamily={FONT} letterSpacing="0.3">
            DETALHAMENTO DAS TAXAS ({taxas.length})
          </text>

          {/* Col headers */}
          {(() => {
            let xOff = MARGIN + 1
            return cols.map((col) => {
              const x = xOff
              xOff += col.w
              return (
                <text key={col.label} x={x} y={detalY + 9} fontSize="2.4" fill="#555" fontWeight="bold" fontFamily={FONT}>
                  {col.label}
                </text>
              )
            })
          })()}
          <line x1={MARGIN} y1={detalY + 10} x2={MARGIN + CW} y2={detalY + 10} stroke="#e0e0e0" strokeWidth="0.3" />

          {/* Rows */}
          {taxas.slice(0, 30).map((r, rowIdx) => {
            const ry = detalY + 10 + rowIdx * ROW_H
            const vals = [
              String(r.circ ?? ''),
              String(r.tipo ?? ''),
              formatDate(r.emissao_ as Date | null),
              formatCurrency(Number(r.valor ?? 0)),
              formatDate(r.pgto_ as Date | null),
              formatCurrency(Number(r.valorpg ?? 0)),
              String(r.cobrador ?? ''),
              String(r.stat ?? ''),
              String(r.forma ?? ''),
            ]
            let xOff = MARGIN + 1
            return (
              <g key={rowIdx}>
                {rowIdx % 2 === 1 && (
                  <rect x={MARGIN} y={ry} width={CW} height={ROW_H} fill="#fafafa" />
                )}
                {cols.map((col, ci) => {
                  const x = xOff
                  xOff += col.w
                  const val = vals[ci] ?? ''
                  const truncated = val.length > Math.floor(col.w / 2.2) ? val.slice(0, Math.floor(col.w / 2.2)) + '…' : val
                  return (
                    <text key={ci} x={x} y={ry + 3.2} fontSize="2.6" fill="#333" fontFamily={FONT}>
                      {truncated}
                    </text>
                  )
                })}
              </g>
            )
          })}

          {taxas.length > 30 && (
            <text x={MARGIN + CW / 2} y={detalY + 10 + 30 * ROW_H + 3} fontSize="2.8" fill="#aaa" textAnchor="middle" fontFamily={FONT}>
              … e mais {taxas.length - 30} registros
            </text>
          )}
        </g>
      )}

      {/* Empty */}
      {selected.size === 0 && (
        <text x={PAGE_W / 2} y={pageH / 2} fontSize="6" fill="#ccc" textAnchor="middle" fontFamily={FONT}>
          Selecione blocos para visualizar
        </text>
      )}
    </svg>
  )
}

/* ──────────────────────────────────────────────
   HTML para impressão
   ────────────────────────────────────────────── */
export function buildPrintHtml(
  codigo: string,
  nomeContrato: string,
  taxas: DbfRecord[],
  blocks: Set<BlockId>,
): string {
  const totalEmitido = taxas.reduce((a, r) => a + Number(r.valor ?? 0), 0)
  const totalPago = taxas.reduce((a, r) => a + Number(r.valorpg ?? 0), 0)
  const totalPendente = totalEmitido - totalPago

  const resumoHtml = blocks.has('resumo')
    ? `<div class="block">
        <div class="block-title">RESUMO FINANCEIRO</div>
        <div class="cards">
          <div class="card blue">
            <span class="clabel">Total Emitido</span>
            <span class="cval">${formatCurrency(totalEmitido)}</span>
          </div>
          <div class="card green">
            <span class="clabel">Total Pago</span>
            <span class="cval">${formatCurrency(totalPago)}</span>
          </div>
          <div class="card red">
            <span class="clabel">Pendente</span>
            <span class="cval">${formatCurrency(totalPendente)}</span>
          </div>
        </div>
      </div>`
    : ''

  const rowsHtml = taxas
    .map(
      (r, i) => `
      <tr class="${i % 2 === 1 ? 'odd' : ''}">
        <td>${r.circ ?? ''}</td>
        <td>${r.tipo ?? ''}</td>
        <td>${formatDate(r.emissao_ as Date | null)}</td>
        <td class="right">${formatCurrency(Number(r.valor ?? 0))}</td>
        <td>${formatDate(r.pgto_ as Date | null)}</td>
        <td class="right">${formatCurrency(Number(r.valorpg ?? 0))}</td>
        <td>${r.cobrador ?? ''}</td>
        <td>${r.stat ?? ''}</td>
        <td>${r.forma ?? ''}</td>
      </tr>`,
    )
    .join('')

  const detalhHtml = blocks.has('detalhamento')
    ? `<div class="block">
        <div class="block-title">DETALHAMENTO DAS TAXAS (${taxas.length})</div>
        <table>
          <thead>
            <tr>
              <th>Circular</th><th>Tipo</th><th>Emissão</th><th class="right">Valor</th>
              <th>Pagamento</th><th class="right">Vlr Pago</th><th>Cobrador</th><th>Status</th><th>Forma</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Taxas — Contrato ${codigo}</title>
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
    .block { border: 1px solid #e0e0e0; border-radius: 3px; margin-bottom: 12px; overflow: hidden; break-inside: avoid; }
    .block-title { background: #f0f4f8; color: #1a3a5c; font-weight: bold; font-size: 10px; padding: 5px 10px; letter-spacing: .5px; }
    .cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 10px; }
    .card { border-radius: 4px; padding: 8px 12px; display: flex; flex-direction: column; }
    .card.blue { background: #eff6ff; } .card.green { background: #f0fdf4; } .card.red { background: #fef2f2; }
    .clabel { font-size: 9px; color: #888; margin-bottom: 2px; }
    .cval { font-size: 14px; font-weight: bold; }
    .card.blue .cval { color: #1e40af; } .card.green .cval { color: #15803d; } .card.red .cval { color: #b91c1c; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #f8fafc; }
    th { padding: 5px 6px; text-align: left; font-size: 9px; color: #555; border-bottom: 1px solid #e0e0e0; white-space: nowrap; }
    td { padding: 4px 6px; border-bottom: 1px solid #f0f0f0; }
    tr.odd td { background: #fafafa; }
    .right { text-align: right; }
    @media print { .block { break-inside: avoid; page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>TAXAS — CONTRATO Nº ${String(codigo).padStart(9, '0')}</h1>
    <span class="subtitle">${nomeContrato}</span>
  </div>
  ${resumoHtml}
  ${detalhHtml}
</body>
</html>`
}


/* ──────────────────────────────────────────────
   Componente principal
   ────────────────────────────────────────────── */
export function PrintTaxasModal({ isOpen, onClose, codigo, nomeContrato, taxas }: PrintTaxasModalProps) {
  const [selected, setSelected] = useState<Set<BlockId>>(new Set(BLOCK_IDS))
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  function toggle(id: BlockId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Imprimir Taxas"
      size="full"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Fechar</Btn>
          <Btn
            onClick={() => setPreviewHtml(buildPrintHtml(codigo, nomeContrato, taxas, selected))}
            disabled={selected.size === 0}
            icon="🖨️"
          >
            Imprimir
          </Btn>
        </>
      }
    >
      <div className="flex gap-5" style={{ minHeight: 520 }}>
        {/* Painel de seleção */}
        <div className="flex-shrink-0" style={{ width: 190 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Blocos</span>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setSelected(new Set(BLOCK_IDS))} className="text-blue-600 hover:underline">Todos</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setSelected(new Set())} className="text-blue-600 hover:underline">Nenhum</button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {BLOCK_IDS.map((id) => (
              <label
                key={id}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-gray-50 select-none"
                style={{ color: selected.has(id) ? '#374151' : '#9ca3af' }}
              >
                <input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} className="cursor-pointer" />
                <span className="text-sm">{BLOCK_LABELS[id]}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500 leading-relaxed">
            <p className="font-medium text-gray-600 mb-1">{taxas.length} taxa(s) encontrada(s)</p>
          </div>
        </div>

        {/* Divisor */}
        <div className="flex-shrink-0" style={{ width: 1, background: '#e8e8e8' }} />

        {/* Prévia SVG */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2 font-medium">Prévia de impressão</p>
          <SvgPreview codigo={codigo} nomeContrato={nomeContrato} taxas={taxas} selected={selected} />
        </div>
      </div>
    </Modal>
    <PrintPreviewModal
      html={previewHtml}
      onClose={() => setPreviewHtml(null)}
      title="Prévia — Taxas"
    />
    </>
  )
}
