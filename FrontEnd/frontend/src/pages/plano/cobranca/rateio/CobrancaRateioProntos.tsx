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

function defaultEmissao() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(5)
  return d.toISOString().slice(0, 10)
}

/**
 * Grupos Prontos p/Emitir — adm_r009.prg
 *
 * Filtro: não-VIP E (
 *   (procpend >= acumproc AND emissao_ + periodic dias <= remissao_)
 *   OR proxcirc > '000'
 * )
 *
 * Após "Processar": proxcirc ← '000' para cada grupo listado.
 */
export function CobrancaRateioProntos() {
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

  // grup → processos pendentes (saiu < '001'), max por maxproc
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

  const remissao = emissao ? new Date(emissao) : null

  // Grupos prontos para emitir
  // Filtro fiel ao legado adm_r009 linha 126/233:
  //   (procpend>=acumproc .AND. (emissao_+periodic)<=remissao_)
  //   .OR. (proxcirc>'000') .AND. !(CLASSES->prior='S')
  // Precedência Harbour: .AND. > .OR.  →  (A AND B) OR (C AND D)
  // Grupo VIP pode aparecer se satisfizer a primeira condição (A AND B).
  const grupos = useMemo<R[]>(() => {
    if (!remissao) return []
    return (getTable('arqgrup')?.records ?? [])
      .filter(r => {
        const g = r as R
        if (g._deleted) return false
        const isVip   = classPrior.get(str(g.classe)) === 'S'
        const emissao_ = g.emissao_ instanceof Date ? g.emissao_ : null
        const periodic = num(g.periodic)
        // Condição A AND B
        const condAB  = emissao_ !== null
          && num(g.procpend) >= num(g.acumproc)
          && new Date(emissao_.getTime() + periodic * 86_400_000) <= remissao!
        // Condição C AND D
        const condCD  = str(g.proxcirc) > '000' && !isVip
        return condAB || condCD
      })
      .sort((a, b) => {
        const ka = str((a as R).grup).slice(-1) + str((a as R).grup)
        const kb = str((b as R).grup).slice(-1) + str((b as R).grup)
        return ka.localeCompare(kb)
      }) as R[]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTable, classPrior, emissao])

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
      const tables = useAppStore.getState().tables

      const updSet = new Set(grupos.map(g => str(g.grup)))
      const novosRec = arqgrupTable.records.map(r =>
        updSet.has(str((r as R).grup)) ? { ...r, proxcirc: '000' } : r
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
        title="Grupos Prontos p/Emitir"
        subtitle="Grupos com processos suficientes para emitir circular — adm_r009"
      />

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 mb-4">
        <p>
          Lista grupos não-VIP onde <strong>proxcirc &gt; 000</strong> ou{' '}
          <strong>procpend ≥ acumproc</strong> e a data de emissão já passou a periodicidade.
        </p>
        <p className="mt-1">
          Condição: <code>(procpend ≥ acumproc AND emissao + periodic ≤ Data Emissão) OR proxcirc &gt; 000</code>
        </p>
        <p className="mt-1">
          Após <strong>Processar</strong>: zera <code>proxcirc</code> em cada grupo listado.
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
        {consultado && !processado && grupos.length > 0 && (
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
                  <th className="px-2 py-2 text-center font-medium text-gray-600">ProxCirc</th>
                </tr>
              </thead>
              <tbody>
                {grupos.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                      Nenhum grupo pronto para emitir na data informada
                    </td>
                  </tr>
                )}
                {grupos.map(g => {
                  const grup      = str(g.grup)
                  // ctproc < maxp (legado): maxproc=0 → nenhum processo exibido
                  const processos = processosPorGrupo.get(grup)?.slice(0, num(g.maxproc)) ?? []
                  const expanded  = expandidos.has(grup)
                  const proxcirc  = str(g.proxcirc)
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
                        <td className={`px-2 py-2 text-right font-semibold ${num(g.procpend) >= num(g.acumproc) ? 'text-green-700' : 'text-orange-600'}`}>
                          {num(g.procpend)}
                        </td>
                        <td className="px-2 py-2 text-right">{num(g.contrat)}</td>
                        <td className="px-2 py-2 text-right">{num(g.partic)}</td>
                        <td className="px-2 py-2 text-center">
                          {proxcirc > '000'
                            ? <span className="bg-green-100 text-green-700 px-1 rounded text-xs font-mono">{proxcirc}</span>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={grup + '-sub'} className="border-b bg-blue-50/60">
                          <td colSpan={14} className="px-6 py-3">
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
          <th className="px-2 py-1 text-left font-medium">Categ</th>
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
            <td className="px-2 py-1 font-mono">{str(p.categ)}</td>
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
