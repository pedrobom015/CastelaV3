import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { PageHeader, Btn } from '../../components/common/PageHeader'

export function Backup() {
  const { getTable, dirPath } = useAppStore()
  const [info, setInfo] = useState<string | null>(null)

  function handleExportar() {
    setInfo(
      'A exportação de arquivos DBF como ZIP não está implementada nesta versão web.\n\n' +
      'Para fazer backup dos dados, copie manualmente os arquivos .DBF do diretório de dados para um local seguro.\n\n' +
      `Diretório atual: ${dirPath || 'Nenhum diretório aberto'}`
    )
  }

  const tablesLoaded = (() => {
    // Lista as tabelas que foram carregadas
    const names = [
      'grupos', 'taxas', 'emcarne', 'tcarnes', 'boletos', 'cancels',
      'cgrupos', 'prcessos', 'classes', 'arqgrup', 'regiao', 'cobrador',
      'circular', 'fncs', 'juros', 'historic', 'pradendo', 'tfiliais',
      'alender', 'mensag', 'bxrec', 'txentr', 'bxfcc', 'txproc',
      'cstseg', 'lbxbolet', 'bxbolet', 'par_adm',
    ]
    return names.filter((n) => !!getTable(n))
  })()

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader
        title="Backup de Dados"
        subtitle="Exportação e proteção dos dados do sistema"
      />

      {/* Card principal */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header do card */}
        <div className="bg-gray-100 text-gray-800 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🗄️</span>
          <div>
            <h2 className="font-semibold">Exportar Dados DBF</h2>
            <p className="text-blue-200 text-sm">Proteção e recuperação de dados</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Info sobre diretório */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diretório de Dados</div>
            <div className="font-mono text-sm text-gray-800 break-all">
              {dirPath || 'Nenhum diretório aberto'}
            </div>
          </div>

          {/* Tabelas carregadas */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Tabelas Carregadas em Memória ({tablesLoaded.length})
            </div>
            {tablesLoaded.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tablesLoaded.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-white border border-blue-200 rounded text-xs font-mono text-blue-800">
                    {t.toUpperCase()}.DBF
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-700">Nenhuma tabela carregada. Abra o diretório de dados primeiro.</p>
            )}
          </div>

          {/* Botão exportar */}
          <Btn onClick={handleExportar} size="lg" icon="📦" className="w-full justify-center">
            Exportar todos os DBFs como ZIP
          </Btn>

          {/* Resultado */}
          {info && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-lg mt-0.5">⚠️</span>
                <pre className="text-sm text-yellow-800 whitespace-pre-wrap font-sans">{info}</pre>
              </div>
            </div>
          )}

          {/* Instruções manuais */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Como fazer backup manual</h3>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Abra o Explorador de Arquivos do Windows</li>
              <li>Navegue até o diretório de dados do ADP</li>
              <li>Selecione todos os arquivos com extensão <code className="bg-white px-1 rounded text-xs">.DBF</code></li>
              <li>Copie e cole em uma pasta de backup segura</li>
              <li>Recomendado: faça backup diário em nuvem ou dispositivo externo</li>
            </ol>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-1">Atenção</h3>
            <p className="text-sm text-red-700">
              Sempre faça backup antes de realizar operações em lote (cancelamentos,
              geração de circulares, etc.). A perda de dados DBF não tem recuperação automática.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
