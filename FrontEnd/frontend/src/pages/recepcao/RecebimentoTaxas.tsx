import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import {
  buscarContrato,
  listarTaxasPendentes,
  receberTaxa,
} from '../../services/recebimento'
import type { ContratoInfo, TaxaPendente, ResultadoRecebimento } from '../../services/recebimento'
import { PageHeader, Btn } from '../../components/common/PageHeader'
import { BuscaContratoInput } from '../../components/common/BuscaContratoInput'
import { formatDate, formatCurrency } from '../../utils/formatters'

const TIPO_LABEL: Record<string, string> = {
  '1': 'Jóia', '2': 'Taxa', '3': 'Carnê',
}

export function RecebimentoTaxas() {
  const { dirHandle, usuario, setTables } = useAppStore()
  const tables = useAppStore((s) => s.tables)

  const [buscaInput, setBuscaInput]       = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [contrato, setContrato]           = useState<ContratoInfo | null>(null)
  const [pendentes, setPendentes]         = useState<TaxaPendente[]>([])
  const [taxaSel, setTaxaSel]             = useState<TaxaPendente | null>(null)
  const [valorPago, setValorPago]         = useState('')
  const [processando, setProcessando]     = useState(false)
  const [erro, setErro]                   = useState('')
  const [resultado, setResultado]         = useState<ResultadoRecebimento | null>(null)

  // ─── Busca contrato ──────────────────────────────────────────────────────────
  function handleBuscar(codigoOpt?: string) {
    setErro('')
    setContrato(null)
    setPendentes([])
    setTaxaSel(null)
    setResultado(null)
    setDropdownAberto(false)

    const codigo = (codigoOpt ?? buscaInput).trim().padStart(9, '0')
    setBuscaInput(codigo)

    const c = buscarContrato(tables, codigo)
    if (!c) { setErro(`Contrato ${codigo} não encontrado.`); return }
    if (c.situacao !== 'A' && c.situacao !== '1') {
      setErro(`Contrato ${codigo} está cancelado/inativo (situação: ${c.situacao}).`)
      return
    }
    const lista = listarTaxasPendentes(tables, codigo)
    setContrato(c)
    setPendentes(lista)
    if (lista.length === 0) setErro('Nenhuma taxa pendente para este contrato.')
  }

  // ─── Seleciona taxa ──────────────────────────────────────────────────────────
  function handleSelecionarTaxa(t: TaxaPendente) {
    setTaxaSel(t)
    setValorPago(t.total.toFixed(2))
    setResultado(null)
    setErro('')
  }

  // ─── Confirma recebimento ────────────────────────────────────────────────────
  async function handleConfirmar() {
    if (!taxaSel || !dirHandle) return
    const vl = parseFloat(valorPago.replace(',', '.')) || 0
    if (vl <= 0) { setErro('Informe um valor maior que zero.'); return }
    setErro('')
    setProcessando(true)
    try {
      const res = await receberTaxa(
        dirHandle, tables,
        { taxa: taxaSel, valorPago: vl, dataRecebimento: new Date() },
        usuario
      )
      setTables(new Map(tables))
      setResultado(res)
      const novaLista = listarTaxasPendentes(tables, taxaSel.codigo)
      setPendentes(novaLista)
      setTaxaSel(null)
      setValorPago('')
    } catch (e) {
      setErro(String(e))
    } finally {
      setProcessando(false)
    }
  }

  function handleNovo() {
    setBuscaInput(''); setContrato(null); setPendentes([])
    setTaxaSel(null); setValorPago(''); setResultado(null); setErro('')
  }

  return (
    <div className="p-4 max-w-5xl">
      <PageHeader
        title="Recebimento de Taxas"
        subtitle="BXREC.DBF — Recepção de pagamentos de contratos"
        actions={resultado ? (
          <Btn variant="secondary" onClick={handleNovo}>+ Novo Recebimento</Btn>
        ) : undefined}
      />

      {/* ─── Busca de contrato ─────────────────────────────────────────────── */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          1. Selecionar Contrato
        </div>
        <div className="flex gap-2 items-end flex-wrap">
          <BuscaContratoInput
            value={buscaInput}
            onChange={setBuscaInput}
            onSelecionar={handleBuscar}
            dropdownAberto={dropdownAberto}
            setDropdownAberto={setDropdownAberto}
            disabled={!!resultado}
            autoFocus
          />
          <Btn
            onClick={() => handleBuscar()}
            disabled={!buscaInput.trim() || !!resultado}
          >
            Buscar
          </Btn>
        </div>

        {/* Card do contrato */}
        {contrato && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-xs text-blue-600 font-medium block">Contrato</span>
              <span className="font-mono font-bold">{contrato.codigo}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-blue-600 font-medium block">Nome</span>
              <span className="font-semibold">{contrato.nome}</span>
            </div>
            <div>
              <span className="text-xs text-blue-600 font-medium block">Grupo</span>
              <span>{contrato.grupo}</span>
            </div>
            <div>
              <span className="text-xs text-blue-600 font-medium block">Cobrador</span>
              <span>{contrato.cobrador || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-blue-600 font-medium block">Endereço</span>
              <span className="text-xs">{[contrato.endereco, contrato.bairro, contrato.cidade].filter(Boolean).join(' — ')}</span>
            </div>
            <div>
              <span className="text-xs text-blue-600 font-medium block">Circs. Pagas</span>
              <span className="font-bold text-green-700">{contrato.qtcircpg}</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Lista de pendentes ────────────────────────────────────────────── */}
      {pendentes.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            2. Selecionar Taxa Pendente
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-2 py-1 text-left">Tipo</th>
                <th className="px-2 py-1 text-center">Circ.</th>
                <th className="px-2 py-1 text-center">Emissão</th>
                <th className="px-2 py-1 text-right">Valor</th>
                <th className="px-2 py-1 text-right">Acréscimo</th>
                <th className="px-2 py-1 text-right font-bold">Total</th>
                <th className="px-2 py-1 text-center">Atraso</th>
                <th className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map((t, i) => {
                const isSel = taxaSel?._taxaIdx === t._taxaIdx
                return (
                  <tr
                    key={i}
                    onClick={() => handleSelecionarTaxa(t)}
                    className={`cursor-pointer border-b border-gray-100 ${isSel ? 'bg-yellow-50 ring-1 ring-inset ring-yellow-400' : i % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <td className="px-2 py-1.5">{TIPO_LABEL[t.tipo] ?? t.tipo}</td>
                    <td className="px-2 py-1.5 text-center font-mono">{t.circ}</td>
                    <td className="px-2 py-1.5 text-center">
                      {t.emissao_ ? (
                        <span className={t.diasAtraso > 0 ? 'text-red-600 font-medium' : ''}>
                          {formatDate(t.emissao_)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right">{formatCurrency(t.valor)}</td>
                    <td className={`px-2 py-1.5 text-right ${t.acrescimo > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                      {t.acrescimo > 0 ? `+ ${formatCurrency(t.acrescimo)}` : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right font-bold text-blue-900">{formatCurrency(t.total)}</td>
                    <td className="px-2 py-1.5 text-center">
                      {t.diasAtraso > 0
                        ? <span className="bg-red-100 text-red-700 px-1.5 rounded">{t.diasAtraso}d</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {isSel && <span className="text-yellow-600 font-bold">●</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Painel de confirmação ─────────────────────────────────────────── */}
      {taxaSel && (
        <div className="bg-white border-2 border-yellow-400 rounded-lg p-4 mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            3. Confirmar Recebimento
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div>
              <span className="text-xs text-gray-500 block">Tipo / Circular</span>
              <span className="font-bold">{TIPO_LABEL[taxaSel.tipo] ?? taxaSel.tipo} / {taxaSel.circ}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Emissão</span>
              <span className={taxaSel.diasAtraso > 0 ? 'text-red-600 font-semibold' : ''}>
                {taxaSel.emissao_ ? formatDate(taxaSel.emissao_) : '—'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Valor Original</span>
              <span>{formatCurrency(taxaSel.valor)}</span>
            </div>
            {taxaSel.acrescimo > 0 && (
              <>
                <div>
                  <span className="text-xs text-gray-500 block">Multa</span>
                  <span className="text-red-600">{formatCurrency(taxaSel.multa)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Juros ({taxaSel.diasAtraso}d)</span>
                  <span className="text-red-600">{formatCurrency(taxaSel.juros)}</span>
                </div>
              </>
            )}
            <div>
              <span className="text-xs text-gray-500 block">Total a Receber</span>
              <span className="text-lg font-bold text-blue-900">{formatCurrency(taxaSel.total)}</span>
            </div>
          </div>

          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor Recebido (R$)</label>
              <input
                type="number" step="0.01" min="0"
                value={valorPago}
                onChange={e => setValorPago(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmar()}
                className="border rounded px-2 py-1.5 text-sm w-36 font-mono"
              />
            </div>
            <Btn onClick={handleConfirmar} disabled={processando || !dirHandle}>
              {processando ? 'Registrando...' : '✓ Confirmar Recebimento'}
            </Btn>
            <Btn variant="secondary" onClick={() => { setTaxaSel(null); setValorPago('') }} disabled={processando}>
              Cancelar
            </Btn>
          </div>
        </div>
      )}

      {/* ─── Mensagens ────────────────────────────────────────────────────── */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
          ⚠️ {erro}
        </div>
      )}

      {/* ─── Recibo emitido ───────────────────────────────────────────────── */}
      {resultado && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
          <div className="text-green-800 font-bold text-base mb-2">
            ✅ Recebimento registrado com sucesso!
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-xs text-green-600 block">Recibo Nº</span>
              <span className="font-mono font-bold text-lg">{resultado.ano}-{resultado.numero}</span>
            </div>
            <div>
              <span className="text-xs text-green-600 block">Valor Recebido</span>
              <span className="font-bold text-green-900 text-lg">{formatCurrency(resultado.valorPago)}</span>
            </div>
            {resultado.acrescimo > 0 && (
              <div>
                <span className="text-xs text-green-600 block">Acréscimos</span>
                <span className="text-red-600">{formatCurrency(resultado.acrescimo)}</span>
              </div>
            )}
            <div>
              <span className="text-xs text-green-600 block">Operador</span>
              <span>{usuario}</span>
            </div>
          </div>
          {pendentes.length > 0 && (
            <p className="mt-2 text-sm text-orange-700 font-medium">
              ⚠️ Este contrato ainda possui {pendentes.length} taxa(s) pendente(s).
            </p>
          )}
        </div>
      )}
    </div>
  )
}
