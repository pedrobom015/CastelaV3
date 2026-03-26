import { useState } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { gerarDebitosTipo2 } from '../../../../services/geracaoDebitos'
import type { ResultadoGeracao } from '../../../../services/geracaoDebitos'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'
import { ResultadoTabela } from './GeracaoMes'

/**
 * Débitos com Porcentagem
 * Gera taxas mensais aplicando um percentual de reajuste sobre o
 * valor base da circular (ex: reajuste anual de inflação).
 */
export function GeracaoPorcentagem() {
  const { getTable, dirHandle, usuario } = useAppStore()

  const hoje = new Date()
  const mesrefPadrao = `${String(hoje.getMonth() + 1).padStart(2,'0')}${String(hoje.getFullYear()).slice(-2)}`

  function primeiroGrupo() {
    const r = getTable('arqgrup')?.records.find(r => !r._deleted)
    return r ? String(r.grup ?? '').trim() : '01'
  }
  function proxCirc(g: string) {
    const r = getTable('arqgrup')?.records.find(r => !r._deleted && String(r.grup ?? '').trim() === g)
    return r ? String(r.proxcirc ?? '001').trim() : '001'
  }

  const grupoIni = primeiroGrupo()
  const [grupo, setGrupo]       = useState(grupoIni)
  const [circIni, setCircIni]   = useState(() => proxCirc(grupoIni))
  const [circFim, setCircFim]   = useState(() => proxCirc(grupoIni))
  const [emissao, setEmissao]   = useState(hoje.toISOString().slice(0, 10))
  const [mesref, setMesref]     = useState(mesrefPadrao)
  const [valor, setValor]       = useState('0')
  const [percentual, setPercentual] = useState('0')
  const [cod1, setCod1]         = useState('000000000')
  const [cod2, setCod2]         = useState('999999999')

  const [resultado, setResultado]     = useState<ResultadoGeracao | null>(null)
  const [simulado, setSimulado]       = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro]               = useState('')

  const tables = useAppStore.getState().tables
  const grupos = (getTable('arqgrup')?.records ?? [])
    .filter(r => !r._deleted)
    .map(r => String(r.grup ?? '').trim())

  function handleGrupo(g: string) {
    setGrupo(g); setCircIni(proxCirc(g)); setCircFim(proxCirc(g))
  }

  // Calcula exemplo do valor com porcentagem
  const valorBase = parseFloat(valor) || 0
  const pct = parseFloat(percentual) || 0
  const valorFinal = valorBase > 0 ? parseFloat((valorBase * (1 + pct / 100)).toFixed(2)) : 0

  async function executar(dry: boolean) {
    setErro('')
    setProcessando(true)
    try {
      const r = await gerarDebitosTipo2(dirHandle!, tables, {
        grupo, circIni, circFim,
        emissaoFallback: new Date(emissao),
        mesref, valorFallback: valorBase,
        cod1, cod2,
        percentual: pct,
      }, usuario, dry)
      setResultado(r)
      setSimulado(dry)
    } catch (e) { setErro(String(e)) }
    finally { setProcessando(false) }
  }

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader
        title="Débitos com Porcentagem"
        subtitle="Geração com reajuste percentual sobre o valor base"
      />

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 mb-4">
        O valor final de cada taxa será: <strong>valor da circular × (1 + %/100)</strong>.
        Se a circular não tiver valor, usa o valor informado no campo fallback.
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
          <select value={grupo} onChange={e => handleGrupo(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Circ. Inicial</label>
          <input value={circIni} onChange={e => setCircIni(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={3} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Circ. Final</label>
          <input value={circFim} onChange={e => setCircFim(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={3} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Emissão</label>
          <input type="date" value={emissao} onChange={e => setEmissao(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mês Ref. (MMAA)</label>
          <input value={mesref} onChange={e => setMesref(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={4} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valor fallback (R$)</label>
          <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Percentual (%)</label>
          <input type="number" step="0.01" value={percentual} onChange={e => setPercentual(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm font-bold text-blue-900" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valor final calculado</label>
          <div className="border rounded px-2 py-1 text-sm bg-gray-50 text-green-700 font-bold">
            {valorFinal > 0 ? `R$ ${valorFinal.toFixed(2)}` : '(usa valor da circular)'}
          </div>
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
      </div>

      <div className="flex gap-2 mb-4">
        <Btn variant="secondary" onClick={() => executar(true)} disabled={processando || !dirHandle}>
          Simular
        </Btn>
        {simulado && resultado && resultado.criadas > 0 && (
          <Btn variant="primary" onClick={() => executar(false)} disabled={processando}>
            {processando ? 'Gerando...' : `Confirmar — Gerar ${resultado.criadas} taxa(s)`}
          </Btn>
        )}
      </div>

      {erro && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">⚠️ {erro}</div>}
      {resultado && <ResultadoTabela resultado={resultado} simulado={simulado} />}
    </div>
  )
}
