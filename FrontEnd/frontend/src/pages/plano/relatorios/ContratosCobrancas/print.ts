import { formatDate, formatCurrency } from "../../../../utils/formatters";
import type { DbfRecord } from "../../../../types/models";

export function buildPrintHtml(
	resultado: DbfRecord[],
	getTaxasSummary: (codigo: string) => { total: number; pago: number; pendente: number },
	totais: { totalGeral: number; pagoGeral: number; pendente: number },
): string {
	const rowsHtml = resultado
		.map((r, i) => {
			const s = getTaxasSummary(String(r.codigo ?? ""));
			return `<tr class="${i % 2 === 1 ? "odd" : ""}">
				<td>${r.codigo ?? ""}</td>
				<td>${r.nome ?? ""}</td>
				<td class="center">${r.grupo ?? ""}</td>
				<td class="center">${r.situacao ?? ""}</td>
				<td class="center">${r.cobrador ?? ""}</td>
				<td class="center">${formatDate(r.admissao as Date | null)}</td>
				<td class="right">${formatCurrency(s.total)}</td>
				<td class="right">${formatCurrency(s.pago)}</td>
				<td class="right">${formatCurrency(s.pendente)}</td>
			</tr>`;
		})
		.join("");

	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório — Contratos & Cobranças</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; padding: 20px 14mm 20mm; }
    @page { size: 297mm 210mm; margin: 12mm 14mm; }
    @media print { html, body { width: 297mm; height: 210mm; } }
    .doc-header {
      background: #f0f4f8; color: #1a3a5c;
      padding: 9px 14px; border-radius: 4px;
      margin-bottom: 14px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .doc-header h1 { font-size: 13px; font-weight: bold; }
    .doc-header .subtitle { font-size: 11px; opacity: .9; }
    .cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .card { border-radius: 4px; padding: 8px 12px; display: flex; flex-direction: column; border: 1px solid #e0e0e0; }
    .card.blue { background: #eff6ff; } .card.green { background: #f0fdf4; } .card.red { background: #fef2f2; }
    .clabel { font-size: 9px; color: #888; margin-bottom: 2px; }
    .cval { font-size: 14px; font-weight: bold; }
    .csub { font-size: 9px; color: #aaa; margin-top: 2px; }
    .card.blue .cval { color: #1e40af; } .card.green .cval { color: #15803d; } .card.red .cval { color: #b91c1c; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead { display: table-header-group; }
    thead tr { background: #f8fafc; }
    th { padding: 5px 6px; text-align: left; font-size: 9px; color: #555; border-bottom: 1px solid #e0e0e0; white-space: nowrap; }
    td { padding: 4px 6px; border-bottom: 1px solid #f0f0f0; }
    tr.odd td { background: #fafafa; }
    tr.totais td { background: #f0f4f8; color: #1a3a5c; font-weight: bold; border-top: 1px solid #d0d0d0; }
    .right { text-align: right; }
    .center { text-align: center; }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>RELATÓRIO — CONTRATOS &amp; COBRANÇAS</h1>
    <span class="subtitle">${resultado.length} contrato(s)</span>
  </div>
  <div class="cards">
    <div class="card blue">
      <span class="clabel">Total Emitido</span>
      <span class="cval">${formatCurrency(totais.totalGeral)}</span>
      <span class="csub">${resultado.length} contrato(s)</span>
    </div>
    <div class="card green">
      <span class="clabel">Total Pago</span>
      <span class="cval">${formatCurrency(totais.pagoGeral)}</span>
      <span class="csub">${totais.totalGeral > 0 ? Math.round((totais.pagoGeral / totais.totalGeral) * 100) : 0}% quitado</span>
    </div>
    <div class="card red">
      <span class="clabel">Pendente</span>
      <span class="cval">${formatCurrency(totais.pendente)}</span>
      <span class="csub">${totais.totalGeral > 0 ? Math.round((totais.pendente / totais.totalGeral) * 100) : 0}% em aberto</span>
    </div>
  </div>
  <table style="margin-top:10px">
      <thead>
        <tr>
          <th>Código</th><th>Nome</th>
          <th class="center">Grp</th><th class="center">Sit</th>
          <th class="center">Cobrador</th><th class="center">Admissão</th>
          <th class="right">Total</th><th class="right">Pago</th><th class="right">Pendente</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot>
        <tr class="totais">
          <td colspan="6" class="right">TOTAIS:</td>
          <td class="right">${formatCurrency(totais.totalGeral)}</td>
          <td class="right">${formatCurrency(totais.pagoGeral)}</td>
          <td class="right">${formatCurrency(totais.pendente)}</td>
        </tr>
      </tfoot>
    </table>
</body>
</html>`;
}
