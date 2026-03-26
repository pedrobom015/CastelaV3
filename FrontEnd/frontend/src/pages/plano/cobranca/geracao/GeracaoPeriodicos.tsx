import { useState } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { gerarDebitosPeriodicos } from '../../../../services/geracaoDebitos'
import type { ResultadoGeracao } from '../../../../services/geracaoDebitos'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'
import { ResultadoTabela } from './GeracaoMes'

/**
 * Débitos Periódicos Não Gerados
 * Gera taxas do tipo '3' (carné/periódico) para contratos que ainda
 * não têm parcelas geradas para o período solicitado.
 * Baseado em adp_py07.prg — gera parcelas anuais com base no formapgto.
 *
 * Exemplos de formapgto (periodicidade):
 *   1 = mensal   (12 parcelas/ano)
 *   2 = bimestral (6 parcelas)
 *   3 = trimestral (4 parcelas)
 *   6 = semestral (2 parcelas)
 *   12 = anual (1 parcela)
 */
export function GeracaoPeriodicos() {
  const { getTable, dirHandle, usuario } = useAppStore()

  const hoje = new Date()

  function primeiroGrupo() {
    const r = getTable('arqgrup')?.records.find(r => !r._deleted)
    return r ? String(r.grup ?? '').trim() : '01'
  }

  const grupoIni = primeiroGrupo()
  const [grupo, setGrupo]             = useState(grupoIni)
  const [vencFim, setVencFim]         = useState(hoje.toISOString().slice(0, 10))
  const [cod1, setCod1]               = useState('000000000')
  const [cod2, setCod2]               = useState('999999999')
  const [vlparc, setVlparc]           = useState('0')
  const [porcparc, setPorcparc]       = useState('0')
  const [resultado, setResultado]     = useState<ResultadoGeracao | null>(null)
  const [simulado, setSimulado]       = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro]               = useState('')

  const tables = useAppStore.getState().tables
  const grupos = (getTable('arqgrup')?.records ?? [])
    .filter(r => !r._deleted)
    .map(r => String(r.grup ?? '').trim())

  // Resumo dos contratos que usam tipo=3
  const contratosComPeriodico = (getTable('grupos')?.records ?? [])
    .filter(r => !r._deleted && String(r.situacao ?? '').trim() === 'A')

  // Quantos já têm taxa tipo=3
  const taxasExistTipo3 = new Set(
    (getTable('taxas')?.records ?? [])
      .filter(r => !r._deleted && String(r.tipo ?? '').trim() === '3')
      .map(r => String(r.codigo ?? '').trim())
  )
  const semPeriodico = contratosComPeriodico.filter(
    r => !taxasExistTipo3.has(String(r.codigo ?? '').trim())
  ).length

  async function executar(dry: boolean) {
    setErro('')
    setProcessando(true)
    try {
      const r = await gerarDebitosPeriodicos(dirHandle!, tables, {
        grupo, cod1, cod2,
        vencimentoFim: new Date(vencFim),
        usuario,
        vlparc:   parseFloat(vlparc)   || 0,
        porcparc: parseFloat(porcparc) || 0,
      }, dry)
      setResultado(r)
      setSimulado(dry)
    } catch (e) { setErro(String(e)) }
    finally { setProcessando(false) }
  }

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader
        title="Débitos Periódicos Não Gerados"
        subtitle="Geração de parcelas anuais (tipo 3) — carné/periódico"
      />

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 mb-4">
        <p>Gera as parcelas anuais para contratos sem débitos periódicos (tipo 3).</p>
        <p className="mt-1">
          O número de parcelas depende do <strong>formapgto</strong> do contrato:
          {' '}1=mensal (12×), 2=bimestral (6×), 3=trimestral (4×), 6=semestral (2×), 12=anual (1×).
        </p>
        {semPeriodico > 0 && (
          <p className="mt-2 font-semibold text-orange-700">
            ⚠️ {semPeriodico} contrato(s) ativo(s) sem nenhuma taxa periódica gerada.
          </p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
          <select value={grupo} onChange={e => setGrupo(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Vencim. Final</label>
          <input type="date" value={vencFim} onChange={e => setVencFim(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Contrato De / Até</label>
          <div className="flex gap-1">
            <input value={cod1} onChange={e => setCod1(e.target.value)} maxLength={9}
              className="w-full border rounded px-2 py-1 text-sm" />
            <input value={cod2} onChange={e => setCod2(e.target.value)} maxLength={9}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vlr. Adicional</label>
          <input type="number" step="0.01" min="0" value={vlparc} onChange={e => setVlparc(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">% Reajuste</label>
          <input type="number" step="0.01" min="0" value={porcparc} onChange={e => setPorcparc(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
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
