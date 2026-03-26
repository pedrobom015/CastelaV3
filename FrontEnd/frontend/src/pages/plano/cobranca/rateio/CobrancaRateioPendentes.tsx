import { useState, useMemo } from 'react'
import { useAppStore } from '../../../../store/appStore'
import { writeDbfFile } from '../../../../services/dbf/DbfReader'
import { PageHeader, Btn } from '../../../../components/common/PageHeader'
import type { DbfRecord } from '../../../../types/models'

type R = DbfRecord

function str(v: unknown) { return String(v ?? '').trim() }
function num(v: unknown) { return Number(v ?? 0) }
function fmtDate(v: unknown): string {
  if (!v) return '—'
  const d = v instanceof Date ? v : null
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

/** Dia 5 do mês seguinte (padrão do legado: CTOD('05'+...) ) */
function defaultEmissao() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(5)
  return d.toISOString().slice(0, 10)
}

/**
 * Grupos & Proc.Pendentes — adm_rx09.prg
 *
 * Exibe TODOS os grupos não-VIP (CLASSES->prior ≠ 'S') com seus processos
 * pendentes (PRCESSOS->saiu < '001').
 *
 * Após "Processar":
 *   - proxcirc  ← '000'
 *   - procpend  ← count(PRCESSOS onde grup=grupo and saiu < '001')
 */
export function CobrancaRateioPendentes() {
  const { getTable, dirHandle } = useAppStore()

  const [emissao, setEmissao]         = useState(defaultEmissao)
  const [consultado, setConsultado]   = useState(false)
  const [expandidos, setExpandidos]   = useState<Set<string>>(new Set())
  const [processando, setProcessando] = useState(false)
  const [processado, setProcessado]   = useState(false)
  const [erro, setErro]               = useState('')

  // classcod → prior
  const classPrior = useMemo(() => {
    const map = new Map<string, string>()
    ;(getTable('classes')?.records ?? []).filter(r => !(r as R)._deleted)
      .forEach(r => map.set(str((r as R).classcod), str((r as R).prior)))
    return map
  }, [getTable])

  // grup → processos pendentes (saiu < '001')
  const processosPorGrupo = useMemo(() => {
    const map = new Map<string, R[]>()
    ;(getTable('prcessos')?.records ?? [])
      .filter(r => !(r as R)._deleted && str((r as R).saiu) < '001')
      .forEach(r => {
        const g = str((r as R).grup)
        if (!map.has(g)) map.set(g, [])
        map.get(g)!.push(r as R)
      })
    return map
  }, [getTable])

  // Grupos não-VIP, ordenados por RIGHT(grup,1)+grup (cpord legado adm_rx09)
  const grupos = useMemo<R[]>(() =>
    (getTable('arqgrup')?.records ?? [])
      .filter(r => !(r as R)._deleted && classPrior.get(str((r as R).classe)) !== 'S')
      .sort((a, b) => {
        const ka = str((a as R).grup).slice(-1) + str((a as R).grup)
        const kb = str((b as R).grup).slice(-1) + str((b as R).grup)
        return ka.localeCompare(kb)
      }) as R[]
  , [getTable, classPrior])

  function toggleExpand(grup: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(grup) ? next.delete(grup) : next.add(grup)
      return next
    })
  }

  async function processar() {
    setErro('')
    setProcessando(true)
    try {
      const arqgrupTable = getTable('arqgrup')!
      const prcessosTable = getTable('prcessos')!
      const tables = useAppStore.getState().tables

      const updMap = new Map<string, R>()
      for (const g of grupos) {
        const grup = str(g.grup)
        const pendentes = (prcessosTable.records ?? []).filter(p =>
          !(p as R)._deleted && str((p as R).grup) === grup && str((p as R).saiu) < '001'
        ).length
        updMap.set(grup, { ...g, proxcirc: '000', procpend: pendentes })
      }

      const novosRec = arqgrupTable.records.map(r =>
        updMap.get(str((r as R).grup)) ?? r
      )
      const newArqgrup = { ...arqgrupTable, records: novosRec }
      await writeDbfFile(dirHandle!, 'ARQGRUP.DBF', newArqgrup)
      tables.set('arqgrup', newArqgrup)
      setProcessado(true)
    } catch (e) { setErro(String(e)) }
    finally { setProcessando(false) }
  }

  const totProcPend  = grupos.reduce((s, g) => s + num(g.procpend), 0)
  const totContratos = grupos.reduce((s, g) => s + num(g.contrat), 0)
  const totPartic    = grupos.reduce((s, g) => s + num(g.partic), 0)

  return (
    <div className="p-4 max-w-6xl">
      <PageHeader
        title="Grupos & Proc. Pendentes"
        subtitle="Grupos não-VIP com processos pendentes — adm_rx09"
      />

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 mb-4">
        <p>Lista todos os grupos não-VIP com seus processos pendentes (<code>saiu &lt; 001</code>).</p>
        <p className="mt-1">
          Após visualizar, <strong>Processar</strong> zera <code>proxcirc</code> e recalcula
          <code> procpend</code> (contagem real dos processos pendentes) em cada grupo.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 flex items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Data de Emissão</label>
          <input
            type="date" value={emissao}
            onChange={e => { setEmissao(e.target.value); setConsultado(false); setProcessado(false) }}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <Btn variant="secondary" onClick={() => setConsultado(true)} disabled={!emissao}>
          Consultar
        </Btn>
        {consultado && !processado && (
          <Btn variant="primary" onClick={processar} disabled={processando || !dirHandle}>
            {processando ? 'Processando…' : `Processar (${grupos.length} grupo(s))`}
          </Btn>
        )}
        {processado && (
          <span className="text-green-700 text-sm font-semibold">✔ Processado com sucesso</span>
        )}
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
          ⚠️ {erro}
        </div>
      )}

      {consultado && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-6 px-2 py-2" />
                  <th className="px-2 py-2 text-left font-medium text-gray-600">Gr</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">Classe</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">Nr.Inicial</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">Nr.Final</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Acum.Proc</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Period.</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Remido</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Últ.Circ</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600">Emissão</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Proc.Pend</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Contratos</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600">Partic.</th>
                </tr>
              </thead>
              <tbody>
                {grupos.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-400">
                      Nenhum grupo encontrado
                    </td>
                  </tr>
                )}
                {grupos.map(g => {
                  const grup      = str(g.grup)
                  const processos = processosPorGrupo.get(grup) ?? []
                  const expanded  = expandidos.has(grup)
                  return (
                    <>
                      <tr
                        key={grup}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(grup)}
                      >
                        <td className="px-2 py-2 text-gray-400 text-xs select-none">
                          {expanded ? '▼' : '▶'}
                        </td>
                        <td className="px-2 py-2 font-mono font-semibold">{grup}</td>
                        <td className="px-2 py-2">{str(g.classe)}</td>
                        <td className="px-2 py-2 font-mono text-xs">{str(g.inicio)}</td>
                        <td className="px-2 py-2 font-mono text-xs">{str(g.final)}</td>
                        <td className="px-2 py-2 text-right">{num(g.acumproc)}</td>
                        <td className="px-2 py-2 text-right">{num(g.periodic)}</td>
                        <td className="px-2 py-2 text-right">{str(g.qtdremir)}</td>
                        <td className="px-2 py-2 text-right font-mono">{str(g.ultcirc)}</td>
                        <td className="px-2 py-2">{fmtDate(g.emissao_)}</td>
                        <td className={`px-2 py-2 text-right font-semibold ${num(g.procpend) > 0 ? 'text-orange-600' : ''}`}>
                          {num(g.procpend)}
                        </td>
                        <td className="px-2 py-2 text-right">{num(g.contrat)}</td>
                        <td className="px-2 py-2 text-right">{num(g.partic)}</td>
                      </tr>
                      {expanded && (
                        <tr key={grup + '-sub'} className="border-b bg-blue-50/60">
                          <td colSpan={13} className="px-6 py-3">
                            {processos.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Sem processos pendentes</p>
                            ) : (
                              <ProcessosTable processos={processos} />
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
          {grupos.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 flex gap-6">
              <span>Grupos: <strong>{grupos.length}</strong></span>
              <span>Proc.Pend: <strong>{totProcPend}</strong></span>
              <span>Contratos: <strong>{totContratos}</strong></span>
              <span>Partic.: <strong>{totPartic}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProcessosTable({ processos }: { processos: R[] }) {
  return (
    <table className="w-full text-xs border border-blue-200 rounded overflow-hidden">
      <thead className="bg-blue-100">
        <tr>
          <th className="px-2 py-1 text-left font-medium">Processo</th>
          <th className="px-2 py-1 text-left font-medium">Circ</th>
          <th className="px-2 py-1 text-left font-medium">Contrato</th>
          <th className="px-2 py-1 text-left font-medium">Insc/Seq</th>
          <th className="px-2 py-1 text-left font-medium">Falecido</th>
          <th className="px-2 py-1 text-left font-medium">Endereço</th>
          <th className="px-2 py-1 text-left font-medium">Data Falec.</th>
        </tr>
      </thead>
      <tbody>
        {processos.map((p, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
            <td className="px-2 py-1 font-mono">{str(p.processo)}</td>
            <td className="px-2 py-1 font-mono">{str(p.saiu)}</td>
            <td className="px-2 py-1 font-mono">{str(p.num)}</td>
            <td className="px-2 py-1">{str(p.grau)}/{num(p.seq)}</td>
            <td className="px-2 py-1">{str(p.fal)}</td>
            <td className="px-2 py-1 max-w-xs truncate">
              {[str(p.ends), str(p.bais), str(p.cids)].filter(Boolean).join(' — ')}
            </td>
            <td className="px-2 py-1">{fmtDate(p.dfal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
