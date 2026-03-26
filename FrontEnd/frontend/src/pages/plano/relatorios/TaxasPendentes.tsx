import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { PrintWrapper } from '../../../components/common/PrintWrapper'
import { PageHeader, Btn } from '../../../components/common/PageHeader'
import { FormInput, FormSelect } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

export function TaxasPendentesPage() {
  const { getTable } = useAppStore()
  const [filtros, setFiltros] = useState({ cobrador: '', grupo: '', dataIni: '', dataFim: '', circ: '' })
  const [resultado, setResultado] = useState<DbfRecord[]>([])
  const [gerado, setGerado] = useState(false)

  function gerarRelatorio() {
    const taxas = getRecords(getTable('taxas'))
    let result = taxas.filter(r => {
      // Pendentes = sem data de pagamento ou stat diferente de pago
      const pgto = r.pgto_ as Date | null
      return !pgto
    })

    if (filtros.cobrador) result = result.filter(r => String(r.cobrador ?? '').trim() === filtros.cobrador.trim())
    if (filtros.circ) result = result.filter(r => String(r.circ ?? '').trim() === filtros.circ.trim())
    if (filtros.dataIni) result = result.filter(r => {
      const d = r.emissao_ as Date | null
      return d ? d >= new Date(filtros.dataIni) : false
    })
    if (filtros.dataFim) result = result.filter(r => {
      const d = r.emissao_ as Date | null
      return d ? d <= new Date(filtros.dataFim) : false
    })

    result.sort((a, b) => String(a.codigo ?? '').localeCompare(String(b.codigo ?? '')))
    setResultado(result)
    setGerado(true)
  }

  const totalPendente = useMemo(() => resultado.reduce((a, r) => a + Number(r.valor ?? 0), 0), [resultado])

  // Lookup nome do contrato
  const gruposTable = getTable('grupos')
  function getNome(codigo: string): string {
    if (!gruposTable) return ''
    const r = gruposTable.records.find(g => String(g.codigo ?? '').trim() === codigo.trim())
    return r ? String(r.nome ?? '') : ''
  }

  return (
    <div>
      <PageHeader title="Relatório: Taxas Pendentes" />

      <div className="bg-white rounded border p-4 mb-4">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <FormInput label="Cobrador" value={filtros.cobrador} onChange={e => setFiltros(p => ({ ...p, cobrador: e.target.value.toUpperCase() }))} maxLength={3} />
          <FormInput label="Circular" value={filtros.circ} onChange={e => setFiltros(p => ({ ...p, circ: e.target.value }))} maxLength={3} />
          <FormInput label="Emissão De" type="date" value={filtros.dataIni} onChange={e => setFiltros(p => ({ ...p, dataIni: e.target.value }))} />
          <FormInput label="Emissão Até" type="date" value={filtros.dataFim} onChange={e => setFiltros(p => ({ ...p, dataFim: e.target.value }))} />
        </div>
        <Btn onClick={gerarRelatorio}>Gerar Relatório</Btn>
      </div>

      {gerado && (
        <PrintWrapper title="Taxas Pendentes">
          <div className="bg-yellow-50 rounded p-3 mb-4 no-print text-center">
            <span className="text-xl font-bold text-yellow-800">{resultado.length} taxa(s) pendente(s) — </span>
            <span className="text-xl font-bold text-red-700">{formatCurrency(totalPendente)}</span>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Código</th>
                <th className="border p-1 text-left">Nome</th>
                <th className="border p-1">Tipo</th>
                <th className="border p-1">Circ</th>
                <th className="border p-1">Emissão</th>
                <th className="border p-1 text-right">Valor</th>
                <th className="border p-1">Cobrador</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border p-1 text-center">{String(r.codigo ?? '')}</td>
                  <td className="border p-1">{getNome(String(r.codigo ?? ''))}</td>
                  <td className="border p-1 text-center">{String(r.tipo ?? '')}</td>
                  <td className="border p-1 text-center">{String(r.circ ?? '')}</td>
                  <td className="border p-1 text-center">{formatDate(r.emissao_ as Date | null)}</td>
                  <td className="border p-1 text-right">{formatCurrency(Number(r.valor ?? 0))}</td>
                  <td className="border p-1 text-center">{String(r.cobrador ?? '')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-200">
                <td colSpan={5} className="border p-1 text-right">TOTAL PENDENTE:</td>
                <td className="border p-1 text-right">{formatCurrency(totalPendente)}</td>
                <td className="border p-1"></td>
              </tr>
            </tfoot>
          </table>
        </PrintWrapper>
      )}
    </div>
  )
}
