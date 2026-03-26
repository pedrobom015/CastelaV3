import { useState } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { gerarDebitosTipo4 } from '../../../../services/geracaoDebitos'
import type { ResultadoGeracao } from '../../../../services/geracaoDebitos'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'
import { ResultadoTabela } from './GeracaoMes'

/**
 * Débitos do Período — adp_px07.prg
 * Gera taxas tipo='4' para contratos cujo último débito (tipo 3 ou 4)
 * vence até a data informada (vini_).
 *
 * Diferença do Débitos Periódicos (adp_py07/tipo='3'):
 *   - tipo='4' na taxa
 *   - vlparc é multiplicado pela periodicidade (valor mensal adicional)
 *   - filtro por data do último débito, não por existência de circ
 */
export function GeracaoPeriodo() {
  const { getTable, dirHandle, usuario } = useAppStore()

  const hoje = new Date()

  function primeiroGrupo() {
    const r = getTable('arqgrup')?.records.find(r => !r._deleted)
    return r ? String(r.grup ?? '').trim() : '01'
  }

  const grupoIni = primeiroGrupo()
  const [grupo, setGrupo]         = useState(grupoIni)
  const [vini, setVini]           = useState(hoje.toISOString().slice(0, 10))
  const [vfim, setVfim]           = useState(() => {
    const d = new Date(hoje)
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  })
  const [vlparc, setVlparc]       = useState('0')
  const [cod1, setCod1]           = useState('000000000')
  const [cod2, setCod2]           = useState('999999999')
  const [resultado, setResultado] = useState<ResultadoGeracao | null>(null)
  const [simulado, setSimulado]   = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro]           = useState('')

  const tables = useAppStore.getState().tables
  const grupos = (getTable('arqgrup')?.records ?? [])
    .filter(r => !r._deleted)
    .map(r => String(r.grup ?? '').trim())

  async function executar(dry: boolean) {
    setErro('')
    setProcessando(true)
    try {
      const r = await gerarDebitosTipo4(dirHandle!, tables, {
        grupo,
        cod1, cod2,
        vini:   new Date(vini),
        vfim:   new Date(vfim),
        vlparc: parseFloat(vlparc) || 0,
        usuario,
      }, dry)
      setResultado(r)
      setSimulado(dry)
    } catch (e) { setErro(String(e)) }
    finally { setProcessando(false) }
  }

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader
        title="Débitos do Período"
        subtitle="Geração de parcelas anuais (tipo 4) — adp_px07"
      />

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 mb-4">
        <p>Gera um ano de parcelas para contratos cujo <strong>último débito (tipo 3 ou 4)</strong> vence
        até a <strong>Data Limite</strong>.</p>
        <p className="mt-1">O número de parcelas depende do <strong>formapgto</strong> do contrato
        (periodicidade). O <strong>Vlr. Adicional</strong> é multiplicado pela periodicidade.</p>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
          <select value={grupo} onChange={e => setGrupo(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Limite Últ. Débito</label>
          <input type="date" value={vini} onChange={e => setVini(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data 1ª Parcela</label>
          <input type="date" value={vfim} onChange={e => setVfim(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vlr. Adicional (×período)</label>
          <input type="number" step="0.01" min="0" value={vlparc} onChange={e => setVlparc(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Contrato De / Até</label>
          <div className="flex gap-1">
            <input value={cod1} onChange={e => setCod1(e.target.value)} maxLength={9}
              className="w-full border rounded px-2 py-1 text-sm" />
            <input value={cod2} onChange={e => setCod2(e.target.value)} maxLength={9}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Btn variant="secondary" onClick={() => executar(true)} disabled={processando || !dirHandle}>
          Simular
        </Btn>
        {simulado && resultado && resultado.criadas > 0 && (
          <Btn variant="primary" onClick={() => executar(false)} disabled={processando}>
            {processando ? 'Gerando...' : `Confirmar — Gerar ${resultado.criadas} parcela(s)`}
          </Btn>
        )}
      </div>

      {erro && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">⚠️ {erro}</div>}
      {resultado && <ResultadoTabela resultado={resultado} simulado={simulado} />}
    </div>
  )
}
