import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { PrintWrapper } from '../../../components/common/PrintWrapper'
import { PageHeader, Btn } from '../../../components/common/PageHeader'
import { FormInput } from '../../../components/common/FormField'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import { getRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

export function PagasPorPeriodoPage() {
  const { getTable } = useAppStore()
  const [dataIni, setDataIni] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [cobrador, setCobrador] = useState('')
  const [resultado, setResultado] = useState<DbfRecord[]>([])
  const [gerado, setGerado] = useState(false)

  function gerarRelatorio() {
    let taxas = getRecords(getTable('taxas'))
    // Filtrar pagas no período
    taxas = taxas.filter(r => {
      const pgto = r.pgto_ as Date | null
      if (!pgto) return false
      if (dataIni && pgto < new Date(dataIni)) return false
      if (dataFim && pgto > new Date(dataFim)) return false
      return true
    })
    if (cobrador) taxas = taxas.filter(r => String(r.cobrador ?? '').trim() === cobrador.trim())
    taxas.sort((a, b) => {
      const da = (a.pgto_ as Date | null)?.getTime() ?? 0
      const db = (b.pgto_ as Date | null)?.getTime() ?? 0
      return da - db
    })
    setResultado(taxas)
    setGerado(true)
  }

  const totalPago = useMemo(() => resultado.reduce((a, r) => a + Number(r.valorpg ?? 0), 0), [resultado])

  const gruposTable = getTable('grupos')
  function getNome(codigo: string): string {
    if (!gruposTable) return ''
    const r = gruposTable.records.find(g => String(g.codigo ?? '').trim() === codigo.trim())
    return r ? String(r.nome ?? '').substring(0, 30) : ''
  }

  return (
    <div>
      <PageHeader title="Relatório: Taxas Pagas por Período" />

      <div className="bg-white rounded border p-4 mb-4">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <FormInput label="Pgto. De" type="date" value={dataIni} onChange={e => setDataIni(e.target.value)} />
          <FormInput label="Pgto. Até" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          <FormInput label="Cobrador" value={cobrador} onChange={e => setCobrador(e.target.value.toUpperCase())} maxLength={3} />
          <div className="flex items-end">
            <Btn onClick={gerarRelatorio} className="w-full">Gerar</Btn>
          </div>
        </div>
      </div>

      {gerado && (
        <PrintWrapper title={`Taxas Pagas — ${dataIni} a ${dataFim}`}>
          <div className="bg-green-50 rounded p-3 mb-4 no-print text-center">
            <span className="text-xl font-bold text-green-800">{resultado.length} pagamento(s) — </span>
            <span className="text-xl font-bold text-green-700">{formatCurrency(totalPago)}</span>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Código</th>
                <th className="border p-1 text-left">Nome</th>
                <th className="border p-1">Circ</th>
                <th className="border p-1">Tipo</th>
                <th className="border p-1">Emissão</th>
                <th className="border p-1">Pagamento</th>
                <th className="border p-1 text-right">Valor</th>
                <th className="border p-1 text-right">Vlr Pago</th>
                <th className="border p-1">Cobrador</th>
                <th className="border p-1">Forma</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border p-1">{String(r.codigo ?? '')}</td>
                  <td className="border p-1">{getNome(String(r.codigo ?? ''))}</td>
                  <td className="border p-1 text-center">{String(r.circ ?? '')}</td>
                  <td className="border p-1 text-center">{String(r.tipo ?? '')}</td>
                  <td className="border p-1 text-center">{formatDate(r.emissao_ as Date | null)}</td>
                  <td className="border p-1 text-center">{formatDate(r.pgto_ as Date | null)}</td>
                  <td className="border p-1 text-right">{formatCurrency(Number(r.valor ?? 0))}</td>
                  <td className="border p-1 text-right">{formatCurrency(Number(r.valorpg ?? 0))}</td>
                  <td className="border p-1 text-center">{String(r.cobrador ?? '')}</td>
                  <td className="border p-1 text-center">{String(r.forma ?? '')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-200">
                <td colSpan={7} className="border p-1 text-right">TOTAL PAGO:</td>
                <td className="border p-1 text-right">{formatCurrency(totalPago)}</td>
                <td colSpan={2} className="border p-1"></td>
              </tr>
            </tfoot>
          </table>
        </PrintWrapper>
      )}
    </div>
  )
}
