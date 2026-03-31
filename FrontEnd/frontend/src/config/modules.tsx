/**
 * FONTE ÚNICA DE CONFIGURAÇÃO DE MÓDULOS
 * ───────────────────────────────────────
 * Para adicionar um novo módulo, basta inserir um objeto no array MODULES.
 * Sidebar, TopNav e helpers derivam tudo daqui automaticamente.
 */

/* ── Tipos ── */
export interface MenuItem {
	label: string;
	path?: string;
	children?: MenuItem[];
}

export interface Session {
	label: string;
	path: string;
}

export interface ModuleDef {
	id: string;
	label: string;
	description?: string;
	preview?: string;
	Icon: React.ComponentType<{ active: boolean; color: string }>;
	/** Prefixos de URL que pertencem a este módulo */
	basePaths: string[];
	/** Links exibidos na coluna lateral */
	sessions: Session[];
	/** Menus da navbar — vazio = nenhum menu exibido */
	menu: MenuItem[];
	/** Se true, redireciona para /setup quando DBF não configurado */
	requiresSetup?: boolean;
}

/* ── Ícones SVG ── */
const CalendarIcon = ({
	active,
	color,
}: {
	active: boolean;
	color: string;
}) => (
	<svg
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke={active ? color : "#bdbdbd"}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);

const DashboardIcon = ({
	active,
	color,
}: {
	active: boolean;
	color: string;
}) => (
	<svg
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke={active ? color : "#bdbdbd"}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="20" x2="18" y2="10" />
		<line x1="12" y1="20" x2="12" y2="4" />
		<line x1="6" y1="20" x2="6" y2="14" />
		<line x1="3" y1="20" x2="21" y2="20" />
	</svg>
);

const CashIcon = ({ active, color }: { active: boolean; color: string }) => (
	<svg
		viewBox="0 0 24 24"
		width="22"
		height="22"
		fill="none"
		stroke={active ? color : "#bdbdbd"}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="2" y="6" width="20" height="13" rx="2" />
		<circle cx="12" cy="12" r="3" />
		<path d="M6 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
		<line
			x1="6"
			y1="12"
			x2="6"
			y2="12"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="18"
			y1="12"
			x2="18"
			y2="12"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
	</svg>
);

/* ══════════════════════════════════════════════
   MÓDULOS — edite apenas aqui para escalar
   ══════════════════════════════════════════════ */
export const MODULES: ModuleDef[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		description:
			"Indicadores financeiros, gráficos de faturamento e taxas.",
		preview: "/previews/dashboard.svg",
		Icon: DashboardIcon,
		basePaths: ["/dashboard"],
		sessions: [
			{ label: "Visão Geral", path: "/dashboard/geral" },
			{
				label: "Perfil de Contratos",
				path: "/dashboard/perfil-contratos",
			},
			{
				label: "Relatório Dinâmico",
				path: "/dashboard/relatorio-dinamico",
			},
		],
		menu: [
			{
				label: "Dashboard",
				children: [
					{ label: "Visão Geral", path: "/dashboard/geral" },
					{
						label: "Perfil de Contratos",
						path: "/dashboard/perfil-contratos",
					},
					{
						label: "Relatório Dinâmico",
						path: "/dashboard/relatorio-dinamico",
					},
				],
			},
		],
	},

	{
		id: "plano",
		label: "Plano",
		description: "Contratos, cobranças, relatórios de vendas e tabelas.",
		preview: "/previews/plano.svg",
		Icon: CalendarIcon,
		requiresSetup: true,
		basePaths: [
			"/setup",
			"/lancamentos",
			"/vendas",
			"/cobranca",
			"/relatorios",
			"/tabelas",
			"/apoio",
		],
		sessions: [
			{ label: "Contratos", path: "/lancamentos/contratos" },
			{ label: "Planos", path: "/tabelas/categorias" },
			{ label: "Produtos & Serviços", path: "/tabelas/produtos" },
			{ label: "Cobrança", path: "/cobranca/consulta-debitos" },
			{ label: "Relatórios", path: "/relatorios/contratos-cobr" },
			{ label: "Processos", path: "/lancamentos/processos" },
			{
				label: "Auxílio Funeral",
				path: "/lancamentos/auxilio-funeral",
			},
		],
		menu: [
			{
				label: "Lançamentos",
				children: [
					{ label: "Contratos", path: "/lancamentos/contratos" },
					{
						label: "Cancelamentos",
						path: "/lancamentos/cancelamentos",
					},
					{
						label: "Reintegração",
						path: "/lancamentos/reintegracao",
					},
					{ label: "Processos", path: "/lancamentos/processos" },
					{
						label: "Auxílio Funeral",
						path: "/lancamentos/auxilio-funeral",
					},
				],
			},
			{
				label: "Vendas",
				children: [
					{
						label: "Gerar Carnê do Contrato",
						path: "/vendas/gerar-carne",
					},
					{
						label: "Lançamento/Carnês",
						path: "/vendas/lancamento-carne",
					},
					{ label: "Emissão Carnê", path: "/vendas/emissao-carne" },
					{
						label: "Etiqueta p/Carnês",
						path: "/vendas/etiqueta-carne",
					},
					{
						label: "Impressão Contrato",
						path: "/vendas/impressao-contrato",
					},
					{
						label: "Lâmina Atualizada",
						path: "/vendas/lamina-atualizada",
					},
					{ label: "Tabela", path: "/vendas/tabela" },
					{
						label: "Relatórios",
						children: [
							{
								label: "Contratos sem Carnês",
								path: "/vendas/rel/sem-carnes",
							},
							{
								label: "Vendas (Vend. × Área)",
								path: "/vendas/rel/vendas-vend-area",
							},
							{
								label: "Vendas (Área × Vend.)",
								path: "/vendas/rel/vendas-area-vend",
							},
							{ label: "Comissão", path: "/vendas/rel/comissao" },
							{
								label: "Cancelamentos p/Vendedor",
								path: "/vendas/rel/canc-vendedor",
							},
						],
					},
				],
			},
			{
				label: "Cobrança",
				children: [
					{
						label: "Relatórios Anteriores",
						children: [
							{
								label: "Cobrança por Rateio",
								children: [
									{
										label: "Grupos & Proc. Pendentes",
										path: "/cobranca/rel-ant/rateio/pendentes",
									},
									{
										label: "Grupos Prontos p/Emitir",
										path: "/cobranca/rel-ant/rateio/prontos",
									},
								],
							},
							{
								label: "Não terão Débito Gerado",
								path: "/cobranca/rel-ant/sem-debito",
							},
							{
								label: "Débitos a Gerar",
								path: "/cobranca/rel-ant/debitos-gerar",
							},
						],
					},
					{
						label: "Geração dos Débitos",
						children: [
							{
								label: "Débitos de Rateio",
								path: "/cobranca/geracao/mes",
							},
							{
								label: "Débitos do Período",
								path: "/cobranca/geracao/periodo",
							},
							{
								label: "Débitos por Porcentagem",
								path: "/cobranca/geracao/porcentagem",
							},
						],
					},
					{
						label: "Consulta Débitos Gerados",
						path: "/cobranca/consulta-debitos",
					},
					{
						label: "Custos Adicionais",
						children: [
							{
								label: "Custos Adicionais",
								path: "/cobranca/custos/adicionais",
							},
							{
								label: "Verificar Custos",
								path: "/cobranca/custos/verificar",
							},
							{
								label: "Lançar Custos nas Taxas",
								path: "/cobranca/custos/lancar",
							},
							{
								label: "Gerar Taxa c/Adicional",
								path: "/cobranca/custos/gerar-taxa",
							},
							{
								label: "Eliminar C. Adicionais",
								path: "/cobranca/custos/eliminar",
							},
						],
					},
					{
						label: "Impressão da Cobrança",
						children: [
							{
								label: "Modelo por Rateio",
								path: "/cobranca/impressao/cobrador",
							},
							{
								label: "Modelo Periódico",
								path: "/cobranca/impressao/periodico",
							},
							{
								label: "Impressão PDF",
								path: "/cobranca/impressao/pdf",
							},
						],
					},
					{
						label: "Relatórios Posteriores",
						children: [
							{
								label: "Etiquetas de Cobrança",
								path: "/cobranca/rel-post/etiquetas",
							},
							{
								label: "Protocolo e Entrega",
								path: "/cobranca/rel-post/protocolo",
							},
							{
								label: "Resumo Taxas Emitidas",
								path: "/cobranca/rel-post/resumo",
							},
						],
					},
					{
						label: "Boleto Bancário",
						children: [
							{
								label: "Impressão",
								path: "/cobranca/boletos/impressao",
							},
							{
								label: "Boletos Emitidos",
								path: "/cobranca/boletos/emitidos",
							},
							{
								label: "Acerto de Nosso Número",
								path: "/cobranca/boletos/acerto-numero",
							},
							{
								label: "Baixa Boletos",
								path: "/cobranca/boletos/baixa",
							},
							{
								label: "Gerar FCC dos Boletos",
								path: "/cobranca/boletos/gerar-fcc",
							},
							{
								label: "Apagar Boletos p/FCC",
								path: "/cobranca/boletos/apagar-fcc",
							},
						],
					},
					{
						label: "Gerar Contr. Cobradores",
						path: "/cobranca/controle-cobradores",
					},
					{
						label: "Baixar Pagos p/FCC",
						path: "/cobranca/baixar-pagos-fcc",
					},
					{
						label: "Proc.Transferências",
						path: "/cobranca/transferencias",
					},
					{
						label: "Taxas a processar",
						path: "/cobranca/taxas-processar",
					},
				],
			},
			{
				label: "Relatórios",
				children: [
					{
						label: "Contratos & Cobranças",
						path: "/relatorios/contratos-cobr",
					},
					{
						label: "2ª Via das Taxas",
						path: "/relatorios/segunda-via",
					},
					{
						label: "Resumo p/Circular",
						path: "/relatorios/resumo-circular",
					},
					{
						label: "Taxas Pendentes",
						path: "/relatorios/taxas-pendentes",
					},
					{
						label: "Pagas por Período",
						path: "/relatorios/pagas-periodo",
					},
					{
						label: "Etiqueta Contratos",
						path: "/relatorios/etiqueta-contratos",
					},
					{ label: "Contratos", path: "/relatorios/contratos" },
					{ label: "Inscritos", path: "/relatorios/inscritos" },
					{
						label: "Acerto c/Vendedor",
						path: "/relatorios/acerto-vendedor",
					},
					{
						label: "Titular & Dependentes",
						path: "/relatorios/titular-dependentes",
					},
					{
						label: "Contratos Cancelados",
						path: "/relatorios/cancelados",
					},
					{ label: "Contratos Vagos", path: "/relatorios/vagos" },
					{ label: "Comissão", path: "/relatorios/comissao" },
					{
						label: "Ficha de Acertos",
						path: "/relatorios/ficha-acertos",
					},
					{
						label: "Etiquetas p/Cartão",
						path: "/relatorios/etiquetas-cartao",
					},
					{
						label: "Resumo Mensal",
						path: "/relatorios/resumo-mensal",
					},
					{
						label: "Contratos & Cobr. (2)",
						path: "/relatorios/contratos-cobr2",
					},
					{
						label: "Listagem Cobrança CAB",
						path: "/relatorios/listagem-cab",
					},
					{
						label: "Relat. Quitação Anual",
						path: "/relatorios/quitacao-anual",
					},
				],
			},
			{
				label: "Tabelas",
				children: [
					{
						label: "Categoria dos Planos",
						path: "/tabelas/categorias",
					},
					{ label: "Grupos", path: "/tabelas/grupos" },
					{ label: "Regiões", path: "/tabelas/regioes" },
					{
						label: "Cobradores/Vendedores",
						path: "/tabelas/cobradores",
					},
					{ label: "Circulares", path: "/tabelas/circulares" },
					{ label: "Funcionários", path: "/tabelas/funcionarios" },
					{ label: "Parâmetro de Juros", path: "/tabelas/juros" },
					{ label: "Histórico Padrão", path: "/tabelas/historico" },
					{
						label: "Contratos Cancelados",
						path: "/tabelas/contratos-cancelados",
					},
					{
						label: "Tabelas Secundárias",
						children: [
							{ label: "Produtos", path: "/tabelas/produtos" },
							{ label: "Filiais", path: "/tabelas/filiais" },
							{
								label: "Entregues aos Cobradores",
								path: "/tabelas/txentr",
							},
							{
								label: "Recebimento de Taxas",
								path: "/tabelas/bxrec",
							},
							{ label: "Endereços", path: "/tabelas/enderecos" },
							{
								label: "Acerto Pagos e Trocas",
								path: "/tabelas/bxfcc",
							},
							{
								label: "Mensagem p/Contrato",
								path: "/tabelas/mensagens",
							},
						],
					},
				],
			},
			{
				label: "Apoio",
				children: [
					{ label: "Parâmetros", path: "/apoio/parametros" },
					{
						label: "Ver Relatório Gravado",
						path: "/apoio/ver-relatorio",
					},
					{ label: "Backup", path: "/apoio/backup" },
					{
						label: "Reconstrói Índices",
						path: "/apoio/reconstruir-indices",
					},
					{
						label: "Elimina Reg Apagados",
						path: "/apoio/eliminar-apagados",
					},
					{ label: "Plano de Senhas", path: "/apoio/senhas" },
					{ label: "Gerar Dados de Teste", path: "/apoio/seed-data" },
					{
						label: "Seed Categorias de Planos",
						path: "/apoio/seed-classes",
					},
					{
						label: "Seed Grupos",
						path: "/apoio/seed-grupo",
					},
					{
						label: "Seed Processos",
						path: "/apoio/seed-processo",
					},
					{ label: "Sobre...", path: "/apoio/sobre" },
				],
			},
		],
	},

	{
		id: "recepcao",
		label: "Recepção",
		description: "Recebimento de taxas, busca de contratos e atendimentos.",
		preview: "/previews/recepcao.svg",
		Icon: CashIcon,
		basePaths: ["/recepcao"],
		sessions: [
			{ label: "Histórico", path: "/recepcao/historico" },
			{ label: "Recebimentos", path: "/recepcao/recebimentos" },
			{ label: "Atendimentos", path: "/recepcao/atendimentos" },
		],
		menu: [
			{
				label: "Recebimentos",
				children: [
					{
						label: "Recebimento de Taxas",
						path: "/recepcao/recebimentos",
					},
				],
			},
			{
				label: "Atendimentos",
				children: [
					{
						label: "Atendimentos (0800)",
						path: "/recepcao/atendimentos",
					},
					{
						label: "Histórico de Atendimentos",
						path: "/recepcao/historico",
					},
				],
			},
			{
				label: "Apoio",
				children: [
					{
						label: "Gerar Atendimentos de Teste",
						path: "/recepcao/seed-atendimentos",
					},
				],
			},
		],
	},

	// ── Próximo módulo: copie o bloco acima e preencha ──
];

/* ── Helpers derivados de MODULES ── */
export function getActiveModule(pathname: string): ModuleDef | undefined {
	return MODULES.find((m) => m.basePaths.some((p) => pathname.startsWith(p)));
}

/** Caminhos ainda em desenvolvimento — não exibidos no menu */
export const DEV_PATHS = new Set([
	"/vendas/emissao-carne",
	"/vendas/etiqueta-carne",
	"/vendas/impressao-contrato",
	"/vendas/lamina-atualizada",
	"/vendas/rel/sem-carnes",
	"/vendas/rel/vendas-vend-area",
	"/vendas/rel/vendas-area-vend",
	"/vendas/rel/comissao",
	"/vendas/rel/canc-vendedor",
	"/cobranca/rel-ant/sem-debito",
	"/cobranca/rel-ant/debitos-gerar",
	"/cobranca/geracao/periodicos",
	"/cobranca/custos/verificar",
	"/cobranca/custos/lancar",
	"/cobranca/custos/gerar-taxa",
	"/cobranca/custos/eliminar",
	"/cobranca/impressao/cobrador",
	"/cobranca/impressao/periodico",
	"/cobranca/impressao/pdf",
	"/cobranca/rel-post/etiquetas",
	"/cobranca/rel-post/protocolo",
	"/cobranca/rel-post/resumo",
	"/cobranca/boletos/acerto-numero",
	"/cobranca/boletos/gerar-fcc",
	"/cobranca/boletos/apagar-fcc",
	"/cobranca/controle-cobradores",
	"/cobranca/baixar-pagos-fcc",
	"/cobranca/transferencias",
	"/relatorios/segunda-via",
	"/relatorios/resumo-circular",
	"/relatorios/etiqueta-contratos",
	"/relatorios/acerto-vendedor",
	"/relatorios/titular-dependentes",
	"/relatorios/cancelados",
	"/relatorios/vagos",
	"/relatorios/comissao",
	"/relatorios/ficha-acertos",
	"/relatorios/etiquetas-cartao",
	"/relatorios/listagem-cab",
	"/relatorios/quitacao-anual",
	"/apoio/ver-relatorio",
	"/apoio/reconstruir-indices",
	"/apoio/eliminar-apagados",
]);

/** Remove recursivamente itens cujo path está em DEV_PATHS.
 *  Grupos que ficam sem filhos após a filtragem também são removidos. */
export function filterDevItems(items: MenuItem[]): MenuItem[] {
	return items.reduce<MenuItem[]>((acc, item) => {
		if (item.path && DEV_PATHS.has(item.path)) return acc;
		if (item.children) {
			const filtered = filterDevItems(item.children);
			if (filtered.length === 0) return acc;
			return [...acc, { ...item, children: filtered }];
		}
		return [...acc, item];
	}, []);
}
