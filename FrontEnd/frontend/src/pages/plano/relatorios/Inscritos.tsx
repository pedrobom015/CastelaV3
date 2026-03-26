import { useState, useMemo } from 'react'
import { useAppStore } from '../../../store/appStore'
import { PrintWrapper } from '../../../components/common/PrintWrapper'
import { PageHeader, Btn } from '../../../components/common/PageHeader'
import { FormInput, FormSelect } from '../../../components/common/FormField'
import { formatDate } from '../../../utils/formatters'
import { getRecords } from '../../../utils/dbfHelpers'
import type { DbfRecord } from '../../../types/models'

const VIVOFALEC_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'V', label: 'Vivos' },
  { value: 'F', label: 'Falecidos' },
]

export function InscritosRelPage() {
  const { getTable } = useAppStore()
  const [codigo, setCodigo] = useState('')
  const [grau, setGrau] = useState('')
  const [vivofalec, setVivofalec] = useState('')
  const [resultado, setResultado] = useState<DbfRecord[]>([])
  const [gerado, setGerado] = useState(false)

  function gerarRelatorio() {
    let inscritos = getRecords(getTable('inscrits'))
    if (codigo) inscritos = inscritos.filter(r => String(r.codigo ?? '').trim() === codigo.trim())
    if (grau) inscritos = inscritos.filter(r => String(r.grau ?? '').trim() === grau.trim())
    if (vivofalec) inscritos = inscritos.filter(r => String(r.vivofalec ?? '').trim() === vivofalec.trim())
    inscritos.sort((a, b) => String(a.codigo ?? '').localeCompare(String(b.codigo ?? '')))
    setResultado(inscritos)
    setGerado(true)
  }

  const gruposTable = getTable('grupos')
  function getNomeContrato(codigo: string): string {
    if (!gruposTable) return ''
    const r = gruposTable.records.find(g => String(g.codigo ?? '').trim() === codigo.trim())
    return r ? String(r.nome ?? '').substring(0, 25) : ''
  }

  return (
    <div>
      <PageHeader title="Relatório: Inscritos / Dependentes" />

      <div className="bg-white rounded border p-4 mb-4">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <FormInput label="Código Contrato" value={codigo} onChange={e => setCodigo(e.target.value)} maxLength={9} />
          <FormInput label="Grau" value={grau} onChange={e => setGrau(e.target.value)} maxLength={1} placeholder="1-9" />
          <FormSelect label="Vivo/Falecido" value={vivofalec} onChange={e => setVivofalec(e.target.value)} options={VIVOFALEC_OPTS} />
          <div className="flex items-end">
            <Btn onClick={gerarRelatorio} className="w-full">Gerar</Btn>
          </div>
        </div>
      </div>

      {gerado && (
        <PrintWrapper title="Relatório de Inscritos">
          <p className="text-sm mb-3">{resultado.length} inscrito(s) encontrado(s)</p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-1">Contrato</th>
                <th className="border p-1 text-left">Titular</th>
                <th className="border p-1">Seq</th>
                <th className="border p-1">Grau</th>
                <th className="border p-1 text-left">Nome</th>
                <th className="border p-1">Nasc.</th>
                <th className="border p-1">Sexo</th>
                <th className="border p-1">V/F</th>
                <th className="border p-1">Carência</th>
              </tr>
            </thead>
            <tbody>
              {resultado.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="border p-1 text-center">{String(r.codigo ?? '')}</td>
                  <td className="border p-1">{getNomeContrato(String(r.codigo ?? ''))}</td>
                  <td className="border p-1 text-center">{String(r.seq ?? '')}</td>
                  <td className="border p-1 text-center">{String(r.grau ?? '')}</td>
                  <td className="border p-1">{String(r.nome ?? '')}</td>
                  <td className="border p-1 text-center">{formatDate(r.nascto_ as Date | null)}</td>
                  <td className="border p-1 text-center">{String(r.sexo ?? '')}</td>
                  <td className="border p-1 text-center">{String(r.vivofalec ?? '')}</td>
                  <td className="border p-1 text-center">{formatDate(r.tcarencia as Date | null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintWrapper>
      )}
    </div>
  )
}
