export function Sobre() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 text-gray-800 px-6 py-8 text-center">
          <div className="text-4xl mb-3">⚱</div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">ADP</h1>
          <p className="text-blue-200 text-sm mt-1 uppercase tracking-wide">
            Controle de Processos da Funerária
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Empresa */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-blue-700 text-2xl">🏢</div>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Empresa</div>
              <div className="font-semibold text-gray-800">Presserv Informática Ltda</div>
              <div className="text-sm text-gray-600">(19) 99886-3225</div>
            </div>
          </div>

          {/* Analista */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-gray-600 text-2xl">👨‍💻</div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Analista / Desenvolvedor</div>
              <div className="font-semibold text-gray-800">Ademilson Pedro Bom</div>
            </div>
          </div>

          {/* Versão */}
          <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="text-green-700 text-2xl">🌐</div>
            <div>
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">Versão</div>
              <div className="font-semibold text-gray-800">2.0 Web</div>
              <div className="text-sm text-gray-600">Conversão do sistema Harbor para Web Moderna</div>
            </div>
          </div>

          {/* Tecnologia */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tecnologias Utilizadas</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'React 18', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                { label: 'TypeScript', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                { label: 'Vite', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                { label: 'TailwindCSS', color: 'bg-teal-100 text-teal-800 border-teal-200' },
                { label: 'Zustand', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                { label: 'File System API', color: 'bg-green-100 text-green-800 border-green-200' },
                { label: 'DBF Reader', color: 'bg-red-100 text-red-800 border-red-200' },
              ].map((tech) => (
                <span
                  key={tech.label}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${tech.color}`}
                >
                  {tech.label}
                </span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Principais Funcionalidades</div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Leitura e escrita de arquivos DBF nativos</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Gestão completa de contratos funerários</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Controle de cobrança e boletos</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Emissão de carnês e taxas</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Relatórios e consultas gerenciais</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Tabelas de configuração e parâmetros</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Presserv Informática Ltda — Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  )
}
