import { useState } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { gerarDebitosTipo2 } from '../../../../services/geracaoDebitos'
import type { ResultadoGeracao } from '../../../../services/geracaoDebitos'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'
import { ResultadoTabela } from './GeracaoMes'

// Formas de pagamento consideradas "cartão" no sistema original
const FORMAS_CARTAO = ['03', '04', '05', '06', '3', '4', '5', '6']

/**
 * Débitos do Cartão
 * Igual ao Débitos do Mês, mas filtra apenas contratos com
 * formapgto = cartão de crédito/débito (03-06).
 */
export function GeracaoCartao() {
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
  const [grupo, setGrupo]   = useState(grupoIni)
  const [circIni, setCircIni] = useState(() => proxCirc(grupoIni))
  const [circFim, setCircFim] = useState(() => proxCirc(grupoIni))
  const [emissao, setEmissao] = useState(hoje.toISOString().slice(0, 10))
  const [mesref, setMesref]   = useState(mesrefPadrao)
  const [valor, setValor]     = useState('0')
  const [cod1, setCod1]       = useState('000000000')
  const [cod2, setCod2]       = useState('999999999')
  // permite customizar quais formas são consideradas cartão
  const [formasCartao, setFormasCartao] = useState(FORMAS_CARTAO.slice(0, 2).join(','))

  const [resultado, setResultado]     = useState<ResultadoGeracao | null>(null)
  const [simulado, setSimulado]       = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro]               = useState('')

  const tables = useAppStore.getState().tables
  const grupos = (getTable('arqgrup')?.records ?? [])
    .filter(r => !r._deleted)
    .map(r => String(r.grup ?? '').trim())

  // Conta contratos com cartão para info
  const qtdCartao = (getTable('grupos')?.records ?? [])
    .filter(r => !r._deleted && FORMAS_CARTAO.includes(String(r.formapgto ?? '').trim())).length

  function handleGrupo(g: string) {
    setGrupo(g); setCircIni(proxCirc(g)); setCircFim(proxCirc(g))
  }

  async function executar(dry: boolean) {
    setErro('')
    setProcessando(true)
    try {
      const filtro = formasCartao.split(',').map(s => s.trim()).filter(Boolean)
      const r = await gerarDebitosTipo2(dirHandle!, tables, {
        grupo, circIni, circFim,
        emissaoFallback: new Date(emissao),
        mesref, valorFallback: parseFloat(valor) || 0,
        cod1, cod2,
        formapgtoFiltro: filtro,
      }, usuario, dry)
      setResultado(r)
      setSimulado(dry)
    } catch (e) { setErro(String(e)) }
    finally { setProcessando(false) }
  }

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader
        title="Débitos do Cartão"
        subtitle="Geração de taxas para contratos com pagamento por cartão"
      />

      {qtdCartao === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800 mb-4">
          ⚠️ Nenhum contrato encontrado com forma de pagamento cartão (03-06). Verifique o campo <strong>formapgto</strong> nos contratos.
        </div>
      )}

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
          <label className="block text-xs font-medium text-gray-600 mb-1">Formas cartão (códigos)</label>
          <input value={formasCartao} onChange={e => setFormasCartao(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm" placeholder="03,04,05" />
        </div>

        <div>
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
