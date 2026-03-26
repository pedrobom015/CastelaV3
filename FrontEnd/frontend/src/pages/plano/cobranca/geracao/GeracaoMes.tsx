import { useState } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { gerarDebitosTipo2 } from '../../../../services/geracaoDebitos'
import type { ResultadoGeracao } from '../../../../services/geracaoDebitos'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'

export function GeracaoMes() {
  const { getTable, dirHandle, usuario } = useAppStore()

  // Sugestão de grupo e circular a partir de ARQGRUP
  function primeiroGrupo() {
    const t = getTable('arqgrup')
    const r = t?.records.find(r => !r._deleted)
    return r ? String(r.grup ?? '').trim() : '01'
  }
  function proxCirc(grupo: string) {
    const t = getTable('arqgrup')
    const r = t?.records.find(r => !r._deleted && String(r.grup ?? '').trim() === grupo)
    return r ? String(r.proxcirc ?? '001').trim() : '001'
  }

  const hoje = new Date()
  const mesrefPadrao = `${String(hoje.getMonth() + 1).padStart(2, '0')}${String(hoje.getFullYear()).slice(-2)}`
  const grupoInicial = primeiroGrupo()

  const [grupo, setGrupo]         = useState(grupoInicial)
  const [circ, setCirc]           = useState(() => proxCirc(grupoInicial))
  const [emissao, setEmissao]     = useState(hoje.toISOString().slice(0, 10))
  const [mesref, setMesref]       = useState(mesrefPadrao)
  const [valor, setValor]         = useState('0')
  const [cod1, setCod1]           = useState('000000000')
  const [cod2, setCod2]           = useState('999999999')
  const [resultado, setResultado] = useState<ResultadoGeracao | null>(null)
  const [simulado, setSimulado]   = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro]           = useState('')

  const tables = useAppStore.getState().tables

  async function simular() {
    setErro('')
    setProcessando(true)
    try {
      const r = await gerarDebitosTipo2(dirHandle!, tables, {
        grupo, circIni: circ, circFim: circ, emissaoFallback: new Date(emissao),
        mesref, valorFallback: parseFloat(valor) || 0, cod1, cod2,
      }, usuario, true)
      setResultado(r)
      setSimulado(true)
    } catch (e) {
      setErro(String(e))
    } finally {
      setProcessando(false)
    }
  }

  async function confirmar() {
    setErro('')
    setProcessando(true)
    try {
      const r = await gerarDebitosTipo2(dirHandle!, tables, {
        grupo, circIni: circ, circFim: circ, emissaoFallback: new Date(emissao),
        mesref, valorFallback: parseFloat(valor) || 0, cod1, cod2,
      }, usuario, false)
      setResultado(r)
      setSimulado(false)
    } catch (e) {
      setErro(String(e))
    } finally {
      setProcessando(false)
    }
  }

  function handleGrupoChange(g: string) {
    setGrupo(g)
    setCirc(proxCirc(g))
  }

  // Lista de grupos disponíveis
  const grupos = (getTable('arqgrup')?.records ?? [])
    .filter(r => !r._deleted)
    .map(r => ({ cod: String(r.grup ?? '').trim(), prox: String(r.proxcirc ?? '').trim() }))

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader title="Débitos do Mês" subtitle="Geração de taxas mensais (tipo 2) por circular" />

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Grupo */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grupo</label>
          <select value={grupo} onChange={e => handleGrupoChange(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm">
            {grupos.map(g => (
              <option key={g.cod} value={g.cod}>{g.cod}</option>
            ))}
          </select>
        </div>

        {/* Circular */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Circular</label>
          <input value={circ} onChange={e => setCirc(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={3} />
        </div>

        {/* Emissão */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data Emissão</label>
          <input type="date" value={emissao} onChange={e => setEmissao(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        {/* Mês Ref */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mês Ref. (MMAA)</label>
          <input value={mesref} onChange={e => setMesref(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={4} placeholder="0326" />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valor p/ fallback (R$)</label>
          <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>

        {/* Contrato De */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contrato De</label>
          <input value={cod1} onChange={e => setCod1(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={9} />
        </div>

        {/* Contrato Até */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contrato Até</label>
          <input value={cod2} onChange={e => setCod2(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={9} />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Btn variant="secondary" onClick={simular} disabled={processando || !dirHandle}>
          {processando && !simulado ? '...' : 'Simular'}
        </Btn>
        {simulado && resultado && resultado.criadas > 0 && (
          <Btn variant="primary" onClick={confirmar} disabled={processando}>
            {processando ? 'Gerando...' : `Confirmar — Gerar ${resultado.criadas} taxa(s)`}
          </Btn>
        )}
      </div>

      {erro && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">⚠️ {erro}</div>}

      {resultado && <ResultadoTabela resultado={resultado} simulado={simulado} />}
    </div>
  )
}

// ─── componente compartilhado de resultado ────────────────────────────────────
export function ResultadoTabela({ resultado, simulado }: { resultado: ResultadoGeracao; simulado: boolean }) {
  const gerados   = resultado.itens.filter(i => !i.ignorado)
  const ignorados = resultado.itens.filter(i => i.ignorado)

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
          {simulado ? '⚡ Simulação' : '✅ Gerado'} — {resultado.criadas} taxa(s)
        </span>
        {resultado.ignoradas > 0 && (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {resultado.ignoradas} ignorado(s)
          </span>
        )}
      </div>

      {gerados.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            {simulado ? 'Serão geradas' : 'Geradas'}
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="px-2 py-1 text-left">Contrato</th>
                <th className="px-2 py-1 text-left">Nome</th>
                <th className="px-2 py-1 text-center">Tipo</th>
                <th className="px-2 py-1 text-center">Circ.</th>
                <th className="px-2 py-1 text-right">Valor</th>
                <th className="px-2 py-1 text-center">Cobrador</th>
              </tr>
            </thead>
            <tbody>
              {gerados.map((i, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-1 font-mono">{i.codigo}</td>
                  <td className="px-2 py-1">{i.nome}</td>
                  <td className="px-2 py-1 text-center">{i.tipo}</td>
                  <td className="px-2 py-1 text-center">{i.circ}</td>
                  <td className="px-2 py-1 text-right">R$ {i.valor.toFixed(2)}</td>
                  <td className="px-2 py-1 text-center">{i.cobrador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ignorados.length > 0 && (
        <details open>
          <summary className="text-xs font-semibold text-orange-700 cursor-pointer mb-1">
            ⚠️ {ignorados.length} contrato(s) não incluído(s) — clique para ver motivo
          </summary>
          <table className="w-full text-xs border-collapse mt-1">
            <thead>
              <tr className="bg-orange-50 text-orange-900">
                <th className="px-2 py-1 text-left">Contrato</th>
                <th className="px-2 py-1 text-left">Nome</th>
                <th className="px-2 py-1 text-left">Motivo da exclusão</th>
              </tr>
            </thead>
            <tbody>
              {ignorados.map((i, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/40'}>
                  <td className="px-2 py-1 font-mono text-gray-600">{i.codigo}</td>
                  <td className="px-2 py-1 text-gray-600">{i.nome}</td>
                  <td className="px-2 py-1 text-orange-700 font-medium">{i.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  )
}
