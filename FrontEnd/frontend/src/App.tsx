import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LoginPage } from "./pages/Login/index";
import { SetupPage } from "./pages/Setup/index";
import { useAppStore } from "./store/appStore";
import { useState, useEffect } from "react";
import { loadTables, DEMO_DIR_HANDLE } from "./services/dbf/dataSource";

const IS_DEMO = import.meta.env.VITE_MODE_DEMO === 'true'

// Recepção
import { RecebimentoTaxas } from "./pages/recepcao/RecebimentoTaxas";
import { Atendimentos } from "./pages/recepcao/Atendimentos";
import { AtendimentosGlobal } from "./pages/recepcao/AtendimentosGlobal";
import { SeedAtendimentos } from "./pages/recepcao/SeedAtendimentos";

// Lançamentos
import { ContratosPage } from "./pages/plano/lancamentos/Contratos";
import { Cancelamentos } from "./pages/plano/lancamentos/Cancelamentos";
import { Reintegracao } from "./pages/plano/lancamentos/Reintegracao";
import { Processos } from "./pages/plano/lancamentos/Processos";

// Vendas
import { GerarCarne } from "./pages/plano/vendas/GerarCarne";
import { LancamentoCarne } from "./pages/plano/vendas/LancamentoCarne";
import { TabelaCarnes } from "./pages/plano/vendas/TabelaCarnes";

// Cobrança — Geração de Débitos
import { GeracaoMes } from "./pages/plano/cobranca/geracao/GeracaoMes";
import { GeracaoPeriodo } from "./pages/plano/cobranca/geracao/GeracaoPeriodo";
import { GeracaoPorcentagem } from "./pages/plano/cobranca/geracao/GeracaoPorcentagem";
import { GeracaoPeriodicos } from "./pages/plano/cobranca/geracao/GeracaoPeriodicos";

// Cobrança — Rateio
import { CobrancaRateioPendentes } from "./pages/plano/cobranca/rateio/CobrancaRateioPendentes";
import { CobrancaRateioProntos } from "./pages/plano/cobranca/rateio/CobrancaRateioProntos";

// Cobrança
import { ConsultaDebitos } from "./pages/plano/cobranca/ConsultaDebitos";
import { CustosAdicionais } from "./pages/plano/cobranca/CustosAdicionais";
import { TaxasProcessar } from "./pages/plano/cobranca/TaxasProcessar";
import { Boletos } from "./pages/plano/cobranca/Boletos";
import { BaixaBoletos } from "./pages/plano/cobranca/BaixaBoletos";

// Relatórios
import { ContratosCobrancasPage } from "./pages/plano/relatorios/ContratosCobrancas/index";
import { TaxasPendentesPage } from "./pages/plano/relatorios/TaxasPendentes";
import { PagasPorPeriodoPage } from "./pages/plano/relatorios/PagasPorPeriodo";
import { InscritosRelPage } from "./pages/plano/relatorios/Inscritos";
import { ResumoMensalPage } from "./pages/plano/relatorios/ResumoMensal";

// Tabelas
import { Categorias } from "./pages/plano/tabelas/Categorias";
import { GruposPage } from "./pages/plano/tabelas/GruposPage";
import { Regioes } from "./pages/plano/tabelas/Regioes";
import { Cobradores } from "./pages/plano/tabelas/Cobradores";
import { Circulares } from "./pages/plano/tabelas/Circulares";
import { Funcionarios } from "./pages/plano/tabelas/Funcionarios";
import { ParametroJuros } from "./pages/plano/tabelas/ParametroJuros";
import { HistoricoPadrao } from "./pages/plano/tabelas/HistoricoPadrao";
import { ContratosCancelados } from "./pages/plano/tabelas/ContratosCancelados";
import { Produtos } from "./pages/plano/tabelas/Produtos";
import { Filiais } from "./pages/plano/tabelas/Filiais";
import { Enderecos } from "./pages/plano/tabelas/Enderecos";
import { Mensagens } from "./pages/plano/tabelas/Mensagens";
import { BxRec } from "./pages/plano/tabelas/BxRec";
import { Txentr } from "./pages/plano/tabelas/Txentr";
import { BxFcc } from "./pages/plano/tabelas/BxFcc";

// Dashboard
import { GeralPage } from "./pages/dashboard/Geral";
import { ReportPage } from "./pages/dashboard/Report";
import { RelatorioDinamicoPage } from "./pages/dashboard/RelatorioDinamico";
import { PerfilContratoPage } from "./pages/dashboard/PerfilContrato";

// Apoio
import { Parametros } from "./pages/plano/apoio/Parametros";
import { Sobre } from "./pages/plano/apoio/Sobre";
import { Backup } from "./pages/plano/apoio/Backup";
import { PlanoSenhas } from "./pages/plano/apoio/PlanoSenhas";
import { SeedData } from "./pages/plano/apoio/SeedData";

function Em({ title }: { title: string }) {
	return (
		<div className="flex items-center justify-center min-h-64">
			<div className="text-center">
				<div className="text-5xl mb-4">🚧</div>
				<h2 className="text-xl font-bold text-gray-700">{title}</h2>
				<p className="text-gray-500 mt-2">Sessão em desenvolvimento</p>
			</div>
		</div>
	);
}

function EmDesenvolvimento({ title }: { title: string }) {
	return (
		<div
			className="flex items-center justify-center h-full"
			style={{
				background: "linear-gradient(135deg, #fff8f4 0%, #fce8d6 100%)",
			}}
		>
			<div className="text-center">
				<h2
					className="text-2xl font-bold mb-2"
					style={{ color: "#ff6b1a" }}
				>
					{title}
				</h2>
				<p className="text-gray-500">Módulo em desenvolvimento</p>
			</div>
		</div>
	);
}

export default function App() {
	const { dirHandle, tables, restoreDirHandle, setTables, setDirHandle, setUsuario } = useAppStore();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const waitHydration = async () => {
			await useAppStore.persist.rehydrate();

			if (IS_DEMO) {
				// Lê do store após reidratação (não da closure, que pode estar desatualizada)
				const persisted = useAppStore.getState().tables;
				const alreadyLoaded = persisted instanceof Map && persisted.size > 0;

				if (!alreadyLoaded) {
					try {
						const loaded = await loadTables();
						setTables(loaded);
						setUsuario('DEMO', 3);
					} catch (e) {
						console.error('[demo] Falha ao carregar dados do backend:', e);
					}
				}
				// Sempre restaura o handle fictício (não é persistido)
				setDirHandle(DEMO_DIR_HANDLE, 'backend');
			} else {
				// Modo normal: restaura FileSystemDirectoryHandle do IDB
				await restoreDirHandle();
			}

			setIsReady(true);
		};
		waitHydration();
	}, []);

	if (!isReady) {
		return (
			<div className="min-h-screen bg-gray-800 flex items-center justify-center">
				<div className="text-white flex flex-col items-center gap-2">
					<span className="animate-spin text-2xl">⚙️</span>
					<p>Carregando{IS_DEMO ? ' dados do servidor' : ' banco de dados'}...</p>
				</div>
			</div>
		);
	}

	const isConfigured = IS_DEMO
		? tables instanceof Map && tables.size > 0
		: !!dirHandle && tables instanceof Map && tables.size > 0;

	console.log("Configurado:", isConfigured, "Tabelas Size:", tables.size);

	return (
		<Routes>
			{/* Rota pública de login */}
			<Route path="/login" element={<LoginPage />} />

			{/* Todas as rotas protegidas por Firebase auth */}
			<Route element={<ProtectedRoute />}>
				<Route element={<AppShell />}>
					{/* Raiz: redireciona conforme configuração do DBF */}
					<Route
						path="/"
						element={
							isConfigured ? (
								<Navigate to="/dashboard/geral" replace />
							) : (
								<Navigate to="/setup" replace />
							)
						}
					/>

					{/* Setup de diretório DBF (módulo Plano) */}
					<Route path="/setup" element={<SetupPage />} />

					{/* Módulo Plano + Recepção */}
					<Route element={<MainLayout />}>
						<Route
							path="/dashboard"
							element={<EmDesenvolvimento title="Dashboard" />}
						/>

						{/* Dashboard — Geral */}
						<Route
							path="/dashboard/geral"
							element={<GeralPage />}
						/>
						<Route
							path="/dashboard/perfil-contratos"
							element={<PerfilContratoPage />}
						/>
						<Route
							path="/dashboard/relatorios"
							element={<ReportPage />}
						/>
						<Route
							path="/dashboard/relatorio-dinamico"
							element={<RelatorioDinamicoPage />}
						/>
						<Route
							path="/recepcao"
							element={<RecebimentoTaxas />}
						/>
						<Route
							path="/recepcao/recebimentos"
							element={<RecebimentoTaxas />}
						/>
						<Route
							path="/recepcao/atendimentos"
							element={<Atendimentos />}
						/>
						<Route
							path="/recepcao/historico"
							element={<AtendimentosGlobal />}
						/>
						<Route
							path="/recepcao/seed-atendimentos"
							element={<SeedAtendimentos />}
						/>
						{/* Lançamentos */}
						<Route
							path="/lancamentos/contratos"
							element={<ContratosPage />}
						/>
						<Route
							path="/lancamentos/cancelamentos"
							element={<Cancelamentos />}
						/>
						<Route
							path="/lancamentos/reintegracao"
							element={<Reintegracao />}
						/>
						<Route
							path="/lancamentos/processos"
							element={<Processos />}
						/>

						{/* Vendas */}
						<Route
							path="/vendas/gerar-carne"
							element={<GerarCarne />}
						/>
						<Route
							path="/vendas/lancamento-carne"
							element={<LancamentoCarne />}
						/>
						<Route
							path="/vendas/emissao-carne"
							element={<Em title="Emissão de Carnê" />}
						/>
						<Route
							path="/vendas/etiqueta-carne"
							element={<Em title="Etiqueta p/Carnês" />}
						/>
						<Route
							path="/vendas/impressao-contrato"
							element={<Em title="Impressão Contrato" />}
						/>
						<Route
							path="/vendas/lamina-atualizada"
							element={<Em title="Lâmina Atualizada" />}
						/>
						<Route
							path="/vendas/tabela"
							element={<TabelaCarnes />}
						/>
						<Route
							path="/vendas/rel/sem-carnes"
							element={<Em title="Contratos sem Carnês" />}
						/>
						<Route
							path="/vendas/rel/vendas-vend-area"
							element={<Em title="Vendas por Vendedor" />}
						/>
						<Route
							path="/vendas/rel/vendas-area-vend"
							element={<Em title="Vendas por Área" />}
						/>
						<Route
							path="/vendas/rel/comissao"
							element={<Em title="Comissão" />}
						/>
						<Route
							path="/vendas/rel/canc-vendedor"
							element={<Em title="Cancelamentos por Vendedor" />}
						/>

						{/* Cobrança */}
						<Route
							path="/cobranca/rel-ant/rateio/pendentes"
							element={<CobrancaRateioPendentes />}
						/>
						<Route
							path="/cobranca/rel-ant/rateio/prontos"
							element={<CobrancaRateioProntos />}
						/>
						<Route
							path="/cobranca/rel-ant/sem-debito"
							element={<Em title="Não terão Débito Gerado" />}
						/>
						<Route
							path="/cobranca/rel-ant/debitos-gerar"
							element={<Em title="Débitos a Gerar" />}
						/>
						<Route
							path="/cobranca/geracao/mes"
							element={<GeracaoMes />}
						/>
						<Route
							path="/cobranca/geracao/periodo"
							element={<GeracaoPeriodo />}
						/>
						<Route
							path="/cobranca/geracao/porcentagem"
							element={<GeracaoPorcentagem />}
						/>
						<Route
							path="/cobranca/geracao/periodicos"
							element={<GeracaoPeriodicos />}
						/>
						<Route
							path="/cobranca/consulta-debitos"
							element={<ConsultaDebitos />}
						/>
						<Route
							path="/cobranca/custos/adicionais"
							element={<CustosAdicionais />}
						/>
						<Route
							path="/cobranca/custos/verificar"
							element={<Em title="Verificar Custos" />}
						/>
						<Route
							path="/cobranca/custos/lancar"
							element={<Em title="Lançar Custos nas Taxas" />}
						/>
						<Route
							path="/cobranca/custos/gerar-taxa"
							element={<Em title="Gerar Taxa c/Adicional" />}
						/>
						<Route
							path="/cobranca/custos/eliminar"
							element={<Em title="Eliminar Custos Adicionais" />}
						/>
						<Route
							path="/cobranca/impressao/cobrador"
							element={<Em title="Impressão Modelo por Rateio" />}
						/>
						<Route
							path="/cobranca/impressao/periodico"
							element={<Em title="Impressão Modelo Periódico" />}
						/>
						<Route
							path="/cobranca/impressao/pdf"
							element={<Em title="Impressão em PDF" />}
						/>
						<Route
							path="/cobranca/rel-post/etiquetas"
							element={<Em title="Etiquetas de Cobrança" />}
						/>
						<Route
							path="/cobranca/rel-post/protocolo"
							element={<Em title="Protocolo e Entrega" />}
						/>
						<Route
							path="/cobranca/rel-post/resumo"
							element={<Em title="Resumo Taxas Emitidas" />}
						/>
						<Route
							path="/cobranca/boletos/impressao"
							element={<Boletos />}
						/>
						<Route
							path="/cobranca/boletos/emitidos"
							element={<Boletos />}
						/>
						<Route
							path="/cobranca/boletos/acerto-numero"
							element={<Em title="Acerto de Nosso Número" />}
						/>
						<Route
							path="/cobranca/boletos/baixa"
							element={<BaixaBoletos />}
						/>
						<Route
							path="/cobranca/boletos/gerar-fcc"
							element={<Em title="Gerar FCC dos Boletos" />}
						/>
						<Route
							path="/cobranca/boletos/apagar-fcc"
							element={<Em title="Apagar Boletos p/FCC" />}
						/>
						<Route
							path="/cobranca/controle-cobradores"
							element={<Em title="Controle de Cobradores" />}
						/>
						<Route
							path="/cobranca/baixar-pagos-fcc"
							element={<Em title="Baixar Pagos p/FCC" />}
						/>
						<Route
							path="/cobranca/transferencias"
							element={<Em title="Proc. Transferências" />}
						/>
						<Route
							path="/cobranca/taxas-processar"
							element={<TaxasProcessar />}
						/>

						{/* Relatórios */}
						<Route
							path="/relatorios/contratos-cobr"
							element={<ContratosCobrancasPage />}
						/>
						<Route
							path="/relatorios/segunda-via"
							element={<Em title="2ª Via das Taxas" />}
						/>
						<Route
							path="/relatorios/resumo-circular"
							element={<Em title="Resumo p/Circular" />}
						/>
						<Route
							path="/relatorios/taxas-pendentes"
							element={<TaxasPendentesPage />}
						/>
						<Route
							path="/relatorios/pagas-periodo"
							element={<PagasPorPeriodoPage />}
						/>
						<Route
							path="/relatorios/etiqueta-contratos"
							element={<Em title="Etiqueta Contratos" />}
						/>
						<Route
							path="/relatorios/contratos"
							element={<ContratosCobrancasPage />}
						/>
						<Route
							path="/relatorios/inscritos"
							element={<InscritosRelPage />}
						/>
						<Route
							path="/relatorios/acerto-vendedor"
							element={<Em title="Acerto c/Vendedor" />}
						/>
						<Route
							path="/relatorios/titular-dependentes"
							element={<Em title="Titular & Dependentes" />}
						/>
						<Route
							path="/relatorios/cancelados"
							element={<Em title="Contratos Cancelados" />}
						/>
						<Route
							path="/relatorios/vagos"
							element={<Em title="Contratos Vagos" />}
						/>
						<Route
							path="/relatorios/comissao"
							element={<Em title="Comissão" />}
						/>
						<Route
							path="/relatorios/ficha-acertos"
							element={<Em title="Ficha de Acertos" />}
						/>
						<Route
							path="/relatorios/etiquetas-cartao"
							element={<Em title="Etiquetas p/Cartão" />}
						/>
						<Route
							path="/relatorios/resumo-mensal"
							element={<ResumoMensalPage />}
						/>
						<Route
							path="/relatorios/contratos-cobr2"
							element={<ContratosCobrancasPage />}
						/>
						<Route
							path="/relatorios/listagem-cab"
							element={<Em title="Listagem Cobrança CAB" />}
						/>
						<Route
							path="/relatorios/quitacao-anual"
							element={<Em title="Quitação Anual" />}
						/>

						{/* Tabelas */}
						<Route
							path="/tabelas/categorias"
							element={<Categorias />}
						/>
						<Route
							path="/tabelas/grupos"
							element={<GruposPage />}
						/>
						<Route path="/tabelas/regioes" element={<Regioes />} />
						<Route
							path="/tabelas/cobradores"
							element={<Cobradores />}
						/>
						<Route
							path="/tabelas/circulares"
							element={<Circulares />}
						/>
						<Route
							path="/tabelas/funcionarios"
							element={<Funcionarios />}
						/>
						<Route
							path="/tabelas/juros"
							element={<ParametroJuros />}
						/>
						<Route
							path="/tabelas/historico"
							element={<HistoricoPadrao />}
						/>
						<Route
							path="/tabelas/contratos-cancelados"
							element={<ContratosCancelados />}
						/>
						<Route
							path="/tabelas/produtos"
							element={<Produtos />}
						/>
						<Route path="/tabelas/filiais" element={<Filiais />} />
						<Route path="/tabelas/txentr" element={<Txentr />} />
						<Route path="/tabelas/bxrec" element={<BxRec />} />
						<Route
							path="/tabelas/enderecos"
							element={<Enderecos />}
						/>
						<Route path="/tabelas/bxfcc" element={<BxFcc />} />
						<Route
							path="/tabelas/mensagens"
							element={<Mensagens />}
						/>

						{/* Apoio */}
						<Route
							path="/apoio/parametros"
							element={<Parametros />}
						/>
						<Route
							path="/apoio/ver-relatorio"
							element={<Em title="Ver Relatório Gravado" />}
						/>
						<Route path="/apoio/backup" element={<Backup />} />
						<Route
							path="/apoio/reconstruir-indices"
							element={<Em title="Reconstruir Índices" />}
						/>
						<Route
							path="/apoio/eliminar-apagados"
							element={<Em title="Eliminar Registros Apagados" />}
						/>
						<Route path="/apoio/senhas" element={<PlanoSenhas />} />
						<Route path="/apoio/seed-data" element={<SeedData />} />
						<Route path="/apoio/sobre" element={<Sobre />} />

						<Route
							path="*"
							element={
								<Navigate to="/lancamentos/contratos" replace />
							}
						/>
					</Route>
					{/* fim MainLayout */}
				</Route>
				{/* fim AppShell */}
			</Route>
			{/* fim ProtectedRoute */}

			{/* Fallback: qualquer rota desconhecida vai ao login */}
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}
