import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { PrintWrapper } from '../../../components/common/PrintWrapper'
import { PageHeader, Btn } from '../../../components/common/PageHeader'
import { FormInput } from '../../../components/common/FormField'
import { formatCurrency, formatMesRef } from '../../../utils/formatters'
import { getRecords, groupBy, sumField } from '../../../utils/dbfHelpers'

export function ResumoMensalPage() {
  const { getTable } = useAppStore()
  const [mesRef, setMesRef] = useState('')
  const [resultado, setResultado] = useState<Record<string, number[]> | null>(null)
  const [gerado, setGerado] = useState(false)
  const [mesRefDisplay, setMesRefDisplay] = useState('')

  function gerarRelatorio() {
    const taxas = getRecords(getTable('taxas'))

    // Filtra pelo mês de referência (circ ou emissão)
    let filtradas = taxas
    if (mesRef) {
      // mesRef no formato MMAA
      const [mm, aa] = mesRef.split('/')
      if (mm && aa) {
        filtradas = taxas.filter(r => {
          const d = r.emissao_ as Date | null
          if (!d) return false
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const a = String(d.getFullYear()).substring(2)
          return m === mm && a === aa
        })
      }
    }

    // Agrupa por cobrador
    const porCobrador = groupBy(filtradas, 'cobrador')
    const summary: Record<string, number[]> = {}

    Object.entries(porCobrador).forEach(([cob, recs]) => {
      const emitidos = recs.length
      const pagos = recs.filter(r => r.pgto_ != null).length
      const vlEmitido = sumField(recs, 'valor')
      const vlPago = sumField(recs, 'valorpg')
      summary[cob] = [emitidos, pagos, vlEmitido, vlPago]
    })

    setResultado(summary)
    setMesRefDisplay(mesRef)
    setGerado(true)
  }

  const totais = useMemo(() => {
    if (!resultado) return [0, 0, 0, 0]
    return Object.values(resultado).reduce(
      (acc, v) => [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2], acc[3] + v[3]],
      [0, 0, 0, 0]
    )
  }, [resultado])

  const cobradoresTable = getTable('cobrador')
  function getNomeCobrador(cod: string): string {
    if (!cobradoresTable) return cod
    const r = cobradoresTable.records.find(c => String(c.cobrador ?? '').trim() === cod.trim())
    return r ? String(r.nome ?? '').substring(0, 25) : cod
  }

  return (
    <div>
      <PageHeader title="Relatório: Resumo Mensal" />

      <div className="bg-white rounded border p-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <FormInput
            label="Mês de Referência (MM/AA)"
            value={mesRef}
            onChange={e => setMesRef(e.target.value)}
            placeholder="ex: 03/25"
            maxLength={5}
          />
          <div className="flex items-end col-span-2">
            <Btn onClick={gerarRelatorio}>Gerar Resumo</Btn>
          </div>
        </div>
      </div>

      {gerado && resultado && (
        <PrintWrapper title={`Resumo Mensal — ${mesRefDisplay || 'Geral'}`}>
          <h2 className="text-center font-bold mb-4">RESUMO MENSAL {mesRefDisplay ? `— ${mesRefDisplay}` : ''}</h2>

          {/* Cards de resumo */}
          <div className="grid grid-cols-4 gap-3 mb-4 no-print">
            <div className="bg-blue-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Qtd Emitidas</p>
              <p className="text-2xl font-bold text-blue-900">{totais[0]}</p>
            </div>
            <div className="bg-green-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Qtd Pagas</p>
              <p className="text-2xl font-bold text-green-700">{totais[1]}</p>
            </div>
            <div className="bg-purple-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Vlr Emitido</p>
              <p className="text-lg font-bold text-purple-700">{formatCurrency(totais[2])}</p>
            </div>
            <div className="bg-orange-50 rounded p-3 text-center">
              <p className="text-xs text-gray-500">Vlr Recebido</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(totais[3])}</p>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Cobrador</th>
                <th className="border p-2 text-left">Nome</th>
                <th className="border p-2 text-right">Qtd Emitidas</th>
                <th className="border p-2 text-right">Qtd Pagas</th>
                <th className="border p-2 text-right">% Receb.</th>
                <th className="border p-2 text-right">Vlr Emitido</th>
                <th className="border p-2 text-right">Vlr Recebido</th>
                <th className="border p-2 text-right">Pendente</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resultado).sort(([a], [b]) => a.localeCompare(b)).map(([cob, v], i) => (
                <tr key={cob} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border p-2 text-center font-mono">{cob}</td>
                  <td className="border p-2">{getNomeCobrador(cob)}</td>
                  <td className="border p-2 text-right">{v[0]}</td>
                  <td className="border p-2 text-right">{v[1]}</td>
                  <td className="border p-2 text-right">{v[0] > 0 ? ((v[1] / v[0]) * 100).toFixed(1) : '0.0'}%</td>
                  <td className="border p-2 text-right">{formatCurrency(v[2])}</td>
                  <td className="border p-2 text-right">{formatCurrency(v[3])}</td>
                  <td className="border p-2 text-right">{formatCurrency(v[2] - v[3])}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-200">
                <td colSpan={2} className="border p-2">TOTAIS</td>
                <td className="border p-2 text-right">{totais[0]}</td>
                <td className="border p-2 text-right">{totais[1]}</td>
                <td className="border p-2 text-right">
                  {totais[0] > 0 ? ((totais[1] / totais[0]) * 100).toFixed(1) : '0.0'}%
                </td>
                <td className="border p-2 text-right">{formatCurrency(totais[2])}</td>
                <td className="border p-2 text-right">{formatCurrency(totais[3])}</td>
                <td className="border p-2 text-right">{formatCurrency(totais[2] - totais[3])}</td>
              </tr>
            </tfoot>
          </table>
        </PrintWrapper>
      )}
    </div>
  )
}
