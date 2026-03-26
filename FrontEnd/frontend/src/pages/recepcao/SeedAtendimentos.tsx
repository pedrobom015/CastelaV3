import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { writeDbfFile } from '../../services/dbf/DbfReader'
import { PageHeader, Btn } from '../../components/common/PageHeader'
import { DBF_STRUCTURES } from '../../services/dbf/initializeDbfs'
import type { DbfRecord } from '../../types/models'

// ── Dados fictícios ──────────────────────────────────────────────────────────

const NOMES = [
  'MARIA APARECIDA SILVA', 'JOÃO CARLOS OLIVEIRA', 'ANA PAULA SANTOS',
  'PEDRO HENRIQUE COSTA', 'LUCIA FERREIRA ALVES', 'ANTONIO JOSE ROCHA',
  'FERNANDA LIMA SOUZA', 'CARLOS EDUARDO PEREIRA', 'ROSA MARIA GOMES',
  'FRANCISCO NETO BARBOSA', 'JULIANA CRISTINA ARAUJO', 'MARCOS VINICIUS DIAS',
  'PATRICIA RODRIGUES MOURA', 'RAFAEL AUGUSTO CARVALHO', 'SILVIA HELENA MARTINS',
  'EDUARDO LUIZ RIBEIRO', 'CLAUDIA APARECIDA PINTO', 'RODRIGO CESAR TEIXEIRA',
  'VERA LUCIA CAMPOS', 'DANIEL FERNANDO NASCIMENTO',
]

const OBS_ATENDIMENTO = [
  'CLIENTE LIGOU PARA VERIFICAR STATUS DA TAXA EM ABERTO',
  'DUVIDA SOBRE VENCIMENTO DO PROXIMO BOLETO',
  'SOLICITOU SEGUNDA VIA DO CARNÊ',
  'RECLAMACAO SOBRE COBRANCA INDEVIDA',
  'CONSULTA DE SALDO E HISTORICO DE PAGAMENTOS',
  'SOLICITOU INFORMACOES SOBRE COBERTURA DO PLANO',
  'COMUNICOU MUDANCA DE ENDERECO',
  'PEDIU PRAZO PARA PAGAMENTO DA TAXA ATRASADA',
  'VERIFICOU SE O PAGAMENTO JA FOI BAIXADO NO SISTEMA',
  'SOLICITOU CANCELAMENTO DO PLANO',
  'DUVIDA SOBRE DEPENDENTES CADASTRADOS',
  'RECLAMACAO DE ATENDIMENTO ANTERIOR',
  'COMUNICOU FALECIMENTO DE DEPENDENTE',
  'PEDIU INFORMACOES SOBRE REINTEGRACAO',
  'CONSULTA SOBRE ACORDO DE DIVIDA',
]

const OBS_RECEBIMENTO = [
  'PAGAMENTO EFETUADO COM CARTAO',
  'PAGAMENTO EM DINHEIRO NO CAIXA',
  'RECEBIMENTO VIA PIX',
  'BAIXA DE TAXA MENSAL',
  'PAGAMENTO DE JOIA DE ADESAO',
]

const OBS_ACORDO = [
  'ACORDO DE PARCELAMENTO EM 3X',
  'NEGOCIACAO DE DEBITO EM ABERTO — PARCELADO EM 6X',
  'ACORDO FECHADO PARA PAGAMENTO EM 2X',
  'PARCELAMENTO DE DIVIDA EM 4 VEZES MENSAIS',
]

const OPERADORES = ['KARINE LIMA', 'ANA SILVA', 'JOAO PEDRO', 'FERNANDA C']
const TIPOS = ['A', 'A', 'A', 'R', 'R', 'C'] // maior frequencia de atendimento

// Distribuição de horários realista: concentrada de 08h às 18h
const HORARIOS_DIA = [
  '08:12', '08:34', '08:51', '09:03', '09:22', '09:45', '09:58',
  '10:07', '10:30', '10:48', '11:02', '11:25', '11:43',
  '12:05', '12:31',
  '13:15', '13:40', '14:02', '14:19', '14:38', '14:55',
  '15:10', '15:29', '15:47', '16:03', '16:24', '16:41',
  '17:05', '17:28', '17:50', '18:02',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rndInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pad(n: number, len: number) { return String(n).padStart(len, '0') }

/** Gera uma data passada N dias atrás em relação a hoje */
function diasAtras(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/** Escolhe N horários aleatórios sem repetição de uma lista */
function sortearHorarios(n: number): string[] {
  const pool = [...HORARIOS_DIA].sort(() => Math.random() - 0.5)
  return pool.slice(0, Math.min(n, pool.length)).sort()
}

/** Próximo número de atendimento disponível */
function proximoNumero(records: DbfRecord[]): number {
  let max = 0
  records.forEach((r) => {
    const n = parseInt(String(r.numero ?? '0').trim()) || 0
    if (n > max) max = n
  })
  return max + 1
}

/** Obs baseada no tipo */
function obsParaTipo(tipo: string): string {
  if (tipo === 'R') return rnd(OBS_RECEBIMENTO)
  if (tipo === 'C') return rnd(OBS_ACORDO)
  return rnd(OBS_ATENDIMENTO)
}

// ── Configuração de geração ───────────────────────────────────────────────────

interface ConfigGeracao {
  diasRetroativos: number   // quantos dias para trás gerar
  atendPorDia: [number, number]  // [min, max] atendimentos por dia
}

const PRESETS: Record<string, ConfigGeracao & { label: string; desc: string }> = {
  hoje: {
    label: 'Só hoje',
    desc: 'Lança atendimentos apenas no dia atual em vários horários',
    diasRetroativos: 0,
    atendPorDia: [8, 15],
  },
  semana: {
    label: 'Última semana',
    desc: 'Distribui atendimentos nos últimos 7 dias',
    diasRetroativos: 6,
    atendPorDia: [4, 12],
  },
  mes: {
    label: 'Último mês',
    desc: 'Distribui atendimentos nos últimos 30 dias',
    diasRetroativos: 29,
    atendPorDia: [2, 8],
  },
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SeedAtendimentos() {
  const { getTable, setTable, dirHandle, usuario } = useAppStore()
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [preset, setPreset] = useState<keyof typeof PRESETS>('hoje')

  async function handleGerar() {
    if (!dirHandle) { alert('Selecione o diretório DBF primeiro (Setup).'); return }

    setRunning(true)
    setDone(false)
    setLog([])
    const lines: string[] = []
    const push = (s: string) => { lines.push(s); setLog([...lines]) }

    try {
      const cfg = PRESETS[preset]
      const gruposTable = getTable('grupos')
      const atend800Table = getTable('atend800')

      // Pega contratos disponíveis para associar
      const contratos = (gruposTable?.records ?? []).filter((r) => !r._deleted)
      if (contratos.length === 0) {
        push('⚠️  Nenhum contrato encontrado. Gere dados de teste no Plano → Apoio primeiro.')
        return
      }

      // Limpa a tabela antes de popular
      push('🗑️  Limpando ATEND800.DBF...')
      let proximoNum = 1
      const novos: DbfRecord[] = []

      push(`📋 Preset: "${cfg.label}" — ${cfg.diasRetroativos + 1} dia(s)`)
      push(`📂 ${contratos.length} contratos disponíveis`)
      push('')

      for (let diaOffset = cfg.diasRetroativos; diaOffset >= 0; diaOffset--) {
        const data = diasAtras(diaOffset)
        const aaaammdd = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
        const qtd = rndInt(cfg.atendPorDia[0], cfg.atendPorDia[1])
        const horarios = sortearHorarios(qtd)

        push(`📅 ${aaaammdd} — gerando ${qtd} atendimento(s)`)

        for (const hora of horarios) {
          const contrato = rnd(contratos)
          const tipo = rnd(TIPOS)
          const operador = usuario || rnd(OPERADORES)
          const numero = pad(proximoNum++, 8)

          novos.push({
            numero,
            data_: new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12),
            hora,
            codigo: String(contrato.codigo ?? '').trim().padStart(9, '0'),
            nome: String(contrato.nome ?? '').trim(),
            obs: obsParaTipo(tipo),
            tipo,
            stat: 'A',
            por: operador,
            filial: '01',
          })
        }
      }

      push('')
      push(`💾 Salvando ${novos.length} atendimentos em ATEND800.DBF...`)

      const atend800Fields = DBF_STRUCTURES['ATEND800']
      const agora = new Date()
      const newTable = atend800Table
        ? {
            ...atend800Table,
            records: novos,
            header: {
              ...atend800Table.header,
              recordCount: novos.length,
              lastUpdate: agora,
            },
          }
        : {
            header: {
              version: 3,
              lastUpdate: agora,
              recordCount: novos.length,
              headerSize: 0,
              recordSize: 0,
              fields: atend800Fields,
            },
            records: novos,
          }

      await writeDbfFile(dirHandle, 'ATEND800.DBF', newTable)
      setTable('atend800', newTable)

      push('')
      push(`🎉 Concluído! ${novos.length} atendimentos gerados e gravados.`)
      setDone(true)
    } catch (e) {
      push(`❌ Erro: ${e}`)
    } finally {
      setRunning(false)
    }
  }

  const cfg = PRESETS[preset]

  return (
    <div className="p-4 max-w-3xl">
      <PageHeader
        title="Gerar Atendimentos de Teste"
        subtitle="Popula ATEND800.DBF com atendimentos fictícios distribuídos por hora e data"
        actions={
          <Btn onClick={handleGerar} disabled={running} icon="⚡" size="lg">
            {running ? 'Gerando...' : 'Gerar Atendimentos'}
          </Btn>
        }
      />

      {/* Seleção de preset */}
      {!running && !done && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Período a gerar
          </p>
          <div className="flex gap-3 flex-wrap">
            {(Object.entries(PRESETS) as [keyof typeof PRESETS, typeof PRESETS[keyof typeof PRESETS]][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setPreset(key)}
                className={`flex-1 min-w-36 border rounded-lg p-3 text-left transition ${
                  preset === key
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="font-semibold text-sm">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Serão gerados entre <strong>{cfg.atendPorDia[0]}</strong> e <strong>{cfg.atendPorDia[1]}</strong> atendimentos por dia,
            em horários distribuídos das 08h às 18h.
          </p>
        </div>
      )}

      {/* Aviso inicial */}
      {!done && log.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Atenção</p>
          <p>Os atendimentos serão inseridos usando a data atual como referência.</p>
          <ul className="mt-2 list-disc list-inside space-y-0.5 text-yellow-700">
            <li><strong>Datas</strong> — calculadas dinamicamente a partir de hoje</li>
            <li><strong>Horários</strong> — sorteados entre 08h e 18h (distribuição realista)</li>
            <li><strong>Contratos</strong> — vinculados aleatoriamente aos contratos existentes</li>
            <li><strong>Operador</strong> — usa o usuário logado ({useAppStore.getState().usuario || 'desconhecido'})</li>
          </ul>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 max-h-96 overflow-y-auto">
          {log.map((line, i) => (
            <div
              key={i}
              className={
                line.startsWith('❌') ? 'text-red-400' :
                line.startsWith('💾') ? 'text-blue-300' :
                line.startsWith('🎉') ? 'text-yellow-300 font-bold' :
                line.startsWith('⚠️') ? 'text-yellow-400' :
                line.startsWith('📅') ? 'text-cyan-300' :
                ''
              }
            >
              {line || <br />}
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4 text-green-800 text-sm font-medium">
          Atendimentos gerados! Acesse <strong>Recepção → Histórico de Atendimentos</strong> para visualizar.
        </div>
      )}
    </div>
  )
}
