/**
 * AdendosPanel — lista e inclusão de adendos vinculados a um contrato.
 * Componente reutilizável sem wrapper de Modal.
 */
import { useState, useMemo } from 'react'
import { Btn } from './PageHeader'
import { useAppStore } from '../../store/appStore'
import { writeDbfFile } from '../../services/dbf/DbfReader'
import { formatDate } from '../../utils/formatters'
import type { DbfRecord } from '../../types/models'

interface Props {
  codigo: string
}

interface Produto {
  codigo: string
  produto: string
  unid: string
  grupo: string
}

export function AdendosPanel({ codigo }: Props) {
  const { dirHandle, usuario, getTable, setTable } = useAppStore()
  useAppStore((s) => s.tables) // força re-render quando tables muda

  const [codProdInput, setCodProdInput] = useState('')
  const [produtoSel, setProdutoSel]     = useState<Produto | null>(null)
  const [dataIncl, setDataIncl]         = useState(() => new Date().toISOString().slice(0, 10))
  const [salvando, setSalvando]         = useState(false)
  const [erro, setErro]                 = useState('')
  const [sucesso, setSucesso]           = useState('')
  const [buscaAberta, setBuscaAberta]   = useState(false)
  const [termoBusca, setTermoBusca]     = useState('')

  const codigoPad = String(codigo).padStart(9, '0')

  const adendosTable  = getTable('adendos')
  const pradendoTable = getTable('pradendo')

  const produtos = useMemo<Produto[]>(() => {
    if (!pradendoTable) return []
    return pradendoTable.records
      .filter((r) => !r._deleted)
      .map((r) => ({
        codigo:  String(r.codigo  ?? '').trim(),
        produto: String(r.produto ?? '').trim(),
        unid:    String(r.unid    ?? '').trim(),
        grupo:   String(r.grupo   ?? '').trim(),
      }))
      .sort((a, b) => a.produto.localeCompare(b.produto))
  }, [pradendoTable])

  const produtosFiltrados = useMemo(() => {
    const t = termoBusca.trim().toUpperCase()
    if (!t) return produtos
    return produtos.filter((p) =>
      p.produto.toUpperCase().includes(t) ||
      p.codigo.includes(t) ||
      p.grupo.toUpperCase().includes(t)
    )
  }, [produtos, termoBusca])

  const adendos = useMemo(() => {
    if (!adendosTable) return []
    return adendosTable.records.filter((r) =>
      !r._deleted &&
      String(r.flag_excl ?? '').trim() !== '*' &&
      String(r.codigo    ?? '').trim() === codigoPad
    )
  }, [adendosTable, codigoPad])

  const produtosMap = useMemo(() => {
    const map = new Map<string, Produto>()
    produtos.forEach((p) => map.set(p.codigo, p))
    return map
  }, [produtos])

  function handleCodProdBlur() {
    const cod = codProdInput.trim().padStart(4, '0')
    const found = produtosMap.get(cod)
    if (found) {
      setProdutoSel(found)
      setCodProdInput(found.codigo)
      setErro('')
    } else if (codProdInput.trim()) {
      setProdutoSel(null)
      setErro(`Produto "${codProdInput.trim()}" não encontrado. Use a busca.`)
    }
  }

  function handleSelecionarProduto(p: Produto) {
    setProdutoSel(p)
    setCodProdInput(p.codigo)
    setBuscaAberta(false)
    setTermoBusca('')
    setErro('')
    setSucesso('')
  }

  async function handleSalvar() {
    const codFinal = produtoSel?.codigo ?? codProdInput.trim().padStart(4, '0')
    if (!codFinal || codFinal === '0000') { setErro('Selecione um produto.'); return }
    if (!dirHandle) { setErro('Pasta de dados não configurada.'); return }
    if (produtos.length > 0 && !produtosMap.has(codFinal)) {
      setErro(`Produto "${codFinal}" não encontrado. Use a busca para selecionar.`)
      return
    }
    if (adendos.some((r) => String(r.codproduto ?? '').trim() === codFinal)) {
      setErro('Já existe um adendo ativo com este produto para este contrato.')
      return
    }
    setErro('')
    setSalvando(true)
    try {
      const novoReg: DbfRecord = {
        codigo:     codigoPad,
        codproduto: codFinal,
        incluido_:  new Date(dataIncl + 'T12:00:00'),
        idxd:       '',
        idxm:       '',
        flag_excl:  ' ',
        por:        usuario ?? 'SIS',
      }
      const base = adendosTable ?? {
        header: { version: 3, lastUpdate: new Date(), recordCount: 0, headerSize: 0, recordSize: 0, fields: [] },
        records: [],
      }
      const newTable = {
        ...base,
        records: [...base.records, novoReg],
        header:  { ...base.header, recordCount: base.records.length + 1 },
      }
      await writeDbfFile(dirHandle, 'ADENDOS.DBF', newTable)
      setTable('adendos', newTable)
      const nome = produtosMap.get(codFinal)?.produto ?? codFinal
      setSucesso(`Adendo "${nome}" adicionado com sucesso.`)
      setCodProdInput('')
      setProdutoSel(null)
      setDataIncl(new Date().toISOString().slice(0, 10))
    } catch (e) {
      setErro(String(e))
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(realIdx: number) {
    if (!dirHandle || !adendosTable) return
    setSalvando(true)
    try {
      const newRecords = adendosTable.records.map((r, i) =>
        i === realIdx ? { ...r, flag_excl: '*', _deleted: true } : r
      )
      const newTable = { ...adendosTable, records: newRecords }
      await writeDbfFile(dirHandle, 'ADENDOS.DBF', newTable)
      setTable('adendos', newTable)
      setSucesso('Adendo removido.')
    } catch (e) {
      setErro(String(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Lista de adendos ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Adendos Ativos</span>
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {adendos.length}
          </span>
        </div>

        {adendos.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-6 border rounded bg-gray-50">
            Nenhum adendo cadastrado para este contrato.
          </p>
        ) : (
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-3 py-1.5 text-left">Cód.</th>
                  <th className="px-3 py-1.5 text-left">Produto / Serviço</th>
                  <th className="px-3 py-1.5 text-left">Grupo</th>
                  <th className="px-3 py-1.5 text-center">Incluído em</th>
                  <th className="px-3 py-1.5 text-left">Por</th>
                  <th className="px-3 py-1.5 text-center w-20">Ação</th>
                </tr>
              </thead>
              <tbody>
                {adendos.map((r, i) => {
                  const codP    = String(r.codproduto ?? '').trim()
                  const prod    = produtosMap.get(codP)
                  const realIdx = (adendosTable?.records ?? []).indexOf(r)
                  return (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-1.5 font-mono">{codP}</td>
                      <td className="px-3 py-1.5 font-medium">
                        {prod?.produto ?? <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500">{prod?.grupo ?? '—'}</td>
                      <td className="px-3 py-1.5 text-center">{formatDate(r.incluido_ as Date | null)}</td>
                      <td className="px-3 py-1.5 text-gray-600">{String(r.por ?? '').trim() || '—'}</td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          onClick={() => handleRemover(realIdx)}
                          disabled={salvando || !dirHandle}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5 rounded border border-red-200 hover:bg-red-50 disabled:opacity-40 transition"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Formulário de inclusão ───────────────────────────────────────── */}
      <div className="border-t pt-4">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Adicionar Novo Adendo</h3>

        <div className="flex gap-2 items-end flex-wrap mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Código do Produto <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              <input
                value={codProdInput}
                onChange={(e) => {
                  setCodProdInput(e.target.value.toUpperCase())
                  setProdutoSel(null)
                  setErro('')
                  setSucesso('')
                }}
                onBlur={handleCodProdBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleCodProdBlur()}
                placeholder="0001"
                disabled={salvando}
                maxLength={4}
                className="w-24 border rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={() => { setBuscaAberta((v) => !v); setTermoBusca('') }}
                disabled={salvando}
                className={`px-3 py-1.5 text-xs rounded border transition font-medium ${
                  buscaAberta
                    ? 'bg-blue-100 border-blue-400 text-blue-900'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔍 Buscar
              </button>
            </div>
          </div>

          {produtoSel && (
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-xs">
              <span className="font-mono text-blue-700">{produtoSel.codigo}</span>
              {' — '}
              <span className="font-medium text-blue-900">{produtoSel.produto}</span>
              {produtoSel.grupo && (
                <span className="ml-1 text-blue-500">({produtoSel.grupo})</span>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data de Inclusão</label>
            <input
              type="date"
              value={dataIncl}
              onChange={(e) => setDataIncl(e.target.value)}
              disabled={salvando}
              className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <Btn
            onClick={handleSalvar}
            disabled={salvando || (!produtoSel && !codProdInput.trim()) || !dirHandle}
          >
            {salvando ? 'Salvando...' : '+ Adicionar'}
          </Btn>
        </div>

        {/* Painel de busca de produto */}
        {buscaAberta && (
          <div className="border-2 border-blue-200 rounded-lg bg-blue-50 p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Nome, código ou grupo do produto..."
                autoFocus
                className="flex-1 border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={() => { setBuscaAberta(false); setTermoBusca('') }}
                className="text-gray-400 hover:text-gray-700 text-sm px-2"
              >
                ✕
              </button>
            </div>

            {produtos.length === 0 ? (
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                <p className="font-medium mb-1">PRADENDO.DBF não tem produtos cadastrados.</p>
                <p className="text-orange-600">Digite o código diretamente no campo acima e clique em "+ Adicionar".</p>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhum produto encontrado com "{termoBusca}".</p>
            ) : (
              <div className="overflow-auto max-h-48 rounded border border-blue-200 bg-white">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white sticky top-0">
                      <th className="px-2 py-1 text-left">Cód.</th>
                      <th className="px-2 py-1 text-left">Produto / Serviço</th>
                      <th className="px-2 py-1 text-left">Grupo</th>
                      <th className="px-2 py-1 text-left">Unid.</th>
                      <th className="px-2 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((p, i) => {
                      const jaAdicionado = adendos.some((r) => String(r.codproduto ?? '').trim() === p.codigo)
                      return (
                        <tr
                          key={i}
                          onClick={() => !jaAdicionado && handleSelecionarProduto(p)}
                          className={`border-b border-gray-100 ${
                            jaAdicionado
                              ? 'bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'hover:bg-yellow-50 cursor-pointer'
                          } ${i % 2 === 0 ? '' : 'bg-gray-50'}`}
                        >
                          <td className="px-2 py-1.5 font-mono">{p.codigo}</td>
                          <td className="px-2 py-1.5 font-medium">{p.produto}</td>
                          <td className="px-2 py-1.5 text-gray-500">{p.grupo}</td>
                          <td className="px-2 py-1.5 text-gray-400">{p.unid}</td>
                          <td className="px-2 py-1.5 text-center">
                            {jaAdicionado ? (
                              <span className="text-xs text-green-600 font-medium">✓ Já adicionado</span>
                            ) : (
                              <span className="text-blue-600 font-bold">→</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {erro && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
            ⚠️ {erro}
          </p>
        )}
        {sucesso && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1.5">
            ✅ {sucesso}
          </p>
        )}
        {!dirHandle && (
          <p className="text-xs text-orange-600 italic mt-1">
            Configure a pasta de dados no Setup para habilitar inclusão de adendos.
          </p>
        )}
      </div>
    </div>
  )
}
