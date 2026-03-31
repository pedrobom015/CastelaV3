import { formatCurrency } from "../../../utils/formatters";
import type { FichaDataType, ProdutosDataType } from "./FichaFinanceira";

interface EstimativasProps {
	fichaData: FichaDataType;
	produtosData: ProdutosDataType;
	primary: string;
	primaryLight: string;
	mode: "include" | "edit" | "view";
	/** Valor da adesão para o próximo mês (proxMesTotal em edit, vlPorParcela em include) */
	adesaoProxMes: number;
	/** Valor de uma parcela da adesão para compor o saldo devedor em include */
	adesaoVlParcela: number;
}

export function Estimativas({
	fichaData,
	produtosData,
	primary,
	primaryLight,
	mode,
	adesaoProxMes,
	adesaoVlParcela,
}: EstimativasProps) {
	return (
		<div
			className="flex flex-col px-3 py-2 rounded-lg shadow-sm gap-1 -mt-2"
			style={{ backgroundColor: primaryLight }}
		>
			{/* Já cobrado — fica acima do título */}
			{fichaData.previsao.tipo === "cobrado_mes" && (
				<div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
					<span>&#10003;</span>
					<span>
						Já cobrado neste mês —{" "}
						{formatCurrency(fichaData.previsao.total)}
					</span>
				</div>
			)}

			<div className="text-base font-semibold text-gray-700">
				Estimativas *
			</div>

			{/* Outros status */}
			{fichaData.previsao.tipo === "inativo" && (
				<div className="text-xs text-gray-400 italic">
					Contrato inativo — sem cobranças previstas.
				</div>
			)}
			{fichaData.previsao.tipo === "remido" && (
				<div className="text-xs text-gray-400 italic">
					Contrato remido — isento de taxa.
				</div>
			)}
			{fichaData.previsao.tipo === "pendente" &&
				fichaData.previsao.qtdAntigos > 0 &&
				fichaData.previsao.diasRestantes <= 0 && (
					<div className="text-[10px] text-red-500">
						&#9888; Mais {fichaData.previsao.qtdAntigos} cobrança
						{fichaData.previsao.qtdAntigos > 1 ? "s" : ""} de meses
						anteriores em aberto — consultar histórico.
					</div>
				)}
			{fichaData.previsao.tipo === "previsao" && (
				<div
					className={`flex items-center gap-1.5 text-xs font-medium rounded px-2 py-1 border ${fichaData.previsao.diasRestantes <= 30 ? "text-blue-700 bg-blue-50 border-blue-200" : "text-gray-600 bg-gray-50 border-gray-200"}`}
				>
					<span>&rarr;</span>
					{fichaData.previsao.diasRestantes <= 30 ? (
						<span>
							Próximos 30 dias —{" "}
							{formatCurrency(fichaData.previsao.valor)}{" "}
							<span className="font-normal opacity-70">
								(em ~{fichaData.previsao.diasRestantes} dia
								{fichaData.previsao.diasRestantes !== 1
									? "s"
									: ""}
								,{" "}
								{fichaData.previsao.data.toLocaleDateString(
									"pt-BR",
									{ day: "2-digit", month: "2-digit" },
								)}
								)
							</span>
						</span>
					) : (
						<span>
							Próxima cobrança:{" "}
							{fichaData.previsao.data.toLocaleDateString(
								"pt-BR",
								{ month: "long", year: "numeric" },
							)}{" "}
							— {formatCurrency(fichaData.previsao.valor)}
						</span>
					)}
				</div>
			)}
			{/* "Sem histórico" só é exibido fora do modo de inclusão */}
			{fichaData.previsao.tipo === "sem_historico" &&
				mode !== "include" && (
					<div className="text-xs text-gray-400 italic">
						Sem histórico de cobranças de mensalidade — estimativa
						teórica abaixo.
					</div>
				)}
			{fichaData.previsao.tipo === "pendente" && (
				<div className="flex items-center gap-1 text-xs text-amber-700">
					<span>&#9888;</span>
					<span>
						{fichaData.previsao.qtd} cobrança
						{fichaData.previsao.qtd > 1 ? "s" : ""} de plano em
						aberto —{" "}
						<span className="font-mono font-medium">
							{formatCurrency(fichaData.previsao.totalRecente)}
						</span>
						{fichaData.previsao.diasRestantes > 0
							? ` · previsão de receber em ${fichaData.previsao.diasRestantes} dia${fichaData.previsao.diasRestantes !== 1 ? "s" : ""}`
							: fichaData.previsao.diasRestantes < 0
								? ` · venceu há ${Math.abs(fichaData.previsao.diasRestantes)} dia${Math.abs(fichaData.previsao.diasRestantes) !== 1 ? "s" : ""}`
								: " · vence hoje"}
					</span>
				</div>
			)}
			{"extras" in fichaData.previsao && fichaData.previsao.extras && (
				<div className="flex items-center gap-1 text-xs text-amber-700">
					<span>&#9888;</span>
					<span>
						{fichaData.previsao.extras.qtd} cobrança
						{fichaData.previsao.extras.qtd > 1 ? "s" : ""} adicional
						{fichaData.previsao.extras.qtd > 1 ? "is" : ""} em
						aberto —{" "}
						<span className="font-mono font-medium">
							{formatCurrency(fichaData.previsao.extras.total)}
						</span>
						{fichaData.previsao.extras.diasRestantes > 0
							? ` · previsão de receber em ${fichaData.previsao.extras.diasRestantes} dia${fichaData.previsao.extras.diasRestantes !== 1 ? "s" : ""}`
							: fichaData.previsao.extras.diasRestantes < 0
								? ` · venceu há ${Math.abs(fichaData.previsao.extras.diasRestantes)} dia${Math.abs(fichaData.previsao.extras.diasRestantes) !== 1 ? "s" : ""}`
								: " · vence hoje"}
					</span>
				</div>
			)}

			{/* Aviso inadimplência produtos/serviços tipo 5/9 */}
			{produtosData.previsaoProdutos.tipo === "pendente" &&
				produtosData.previsaoProdutos.vencidas > 0 && (
					<div className="flex items-center gap-1 text-xs text-red-600">
						<span>&#9888;</span>
						<span>
							{produtosData.previsaoProdutos.vencidas} cobrança
							{produtosData.previsaoProdutos.vencidas > 1
								? "s"
								: ""}{" "}
							de produtos/serviços vencida
							{produtosData.previsaoProdutos.vencidas > 1
								? "s"
								: ""}{" "}
							—{" "}
							<span className="font-mono font-medium">
								{formatCurrency(
									produtosData.previsaoProdutos.valorVencido,
								)}
							</span>
						</span>
					</div>
				)}
			{produtosData.previsaoProdutos.tipo === "pendente" &&
				produtosData.previsaoProdutos.vencidas === 0 && (
					<div className="flex items-center gap-1 text-xs text-amber-700">
						<span>&#9888;</span>
						<span>
							{produtosData.previsaoProdutos.qtd} cobrança
							{produtosData.previsaoProdutos.qtd > 1
								? "s"
								: ""}{" "}
							de produtos/serviços em aberto —{" "}
							<span className="font-mono font-medium">
								{formatCurrency(
									produtosData.previsaoProdutos.totalAberto,
								)}
							</span>
							{produtosData.previsaoProdutos.diasRestantes > 0
								? ` · vence em ${produtosData.previsaoProdutos.diasRestantes} dia${produtosData.previsaoProdutos.diasRestantes !== 1 ? "s" : ""}`
								: produtosData.previsaoProdutos.diasRestantes <
									  0
									? ` · venceu há ${Math.abs(produtosData.previsaoProdutos.diasRestantes)} dia${Math.abs(produtosData.previsaoProdutos.diasRestantes) !== 1 ? "s" : ""}`
									: " · vence hoje"}
						</span>
					</div>
				)}

			{/* Coluna de valores */}
			<div className="flex flex-col gap-0.5 text-xs mt-0.5">
				{fichaData.admissaoMaior30Dias && (
					<div className="flex justify-between items-center">
						<span className="text-gray-600">Mensalidade</span>
						<span
							className="font-mono font-medium"
							style={{ color: primary }}
						>
							{formatCurrency(
								fichaData.grupoOuCategoriaAlterado
									? fichaData.origValorMensalidade
									: fichaData.valorMensalidade,
							)}
						</span>
					</div>
				)}
				{fichaData.paidPlanMes > 0 && (
					<div className="flex justify-between items-center text-green-700">
						<span>Plano pago neste mês</span>
						<span className="font-mono font-medium">
							&#8722;{formatCurrency(fichaData.paidPlanMes)}
						</span>
					</div>
				)}
				{/* Diferença de categoria só aparece fora do modo inclusão */}
				{fichaData.grupoOuCategoriaAlterado &&
					fichaData.diferencaMensalidade !== 0 &&
					mode !== "include" && (
						<div
							className={`flex justify-between items-center ${fichaData.diferencaMensalidade > 0 ? "text-orange-600" : "text-green-700"}`}
						>
							<span>Diferença (novo grupo/cat.)</span>
							<span className="font-mono font-medium">
								{fichaData.diferencaMensalidade > 0
									? `+${formatCurrency(fichaData.diferencaMensalidade)}`
									: formatCurrency(
											fichaData.diferencaMensalidade,
										)}
							</span>
						</div>
					)}

				{produtosData.valorAberto59Mes > 0 && (
					<div className="flex justify-between items-center">
						<span className="text-gray-600">
							Produtos / Serviços
						</span>
						<span
							className="font-mono font-medium"
							style={{ color: primary }}
						>
							{formatCurrency(produtosData.valorAberto59Mes)}
						</span>
					</div>
				)}
				{produtosData.valorPago59Mes > 0 && (
					<div className="flex justify-between items-center text-green-700">
						<span>Prod./Serv. pagos neste mês</span>
						<span className="font-mono font-medium">
							&#8722;
							{formatCurrency(produtosData.valorPago59Mes)}
						</span>
					</div>
				)}
				<div className="border-t border-gray-300 my-1" />
				{(() => {
					// Base para planDebt:
					// - grupo/cat alterado: usa origValorMensalidade (diferencaMensalidade já captura o extra)
					// - admissão ≤ 30 dias: zero (contrato novo, sem histórico)
					// - caso normal: totalMensal
					const baseParaPlanNet = fichaData.grupoOuCategoriaAlterado
						? fichaData.origValorMensalidade
						: fichaData.totalMensal;
					const totalMensalParaSaldo = fichaData.admissaoMaior30Dias
						? baseParaPlanNet
						: 0;
					const planNet =
						totalMensalParaSaldo - fichaData.paidPlanMes;
					const planDebt =
						planNet >= 0
							? Math.max(fichaData.planVencido, planNet)
							: 0;
					const planCredit = planNet < 0 ? Math.abs(planNet) : 0;
					// Crédito prod/serv: pago no mês além do total cobrado no mês
					const prod59Credit = Math.max(0, produtosData.valorPago59Mes - produtosData.totalCobrado59Mes);
					const saldoDevedor =
						fichaData.extrasVencido +
						planDebt +
						fichaData.diferencaMensalidade +
						produtosData.totalVencido59 +
						adesaoVlParcela;
					return (
						<>
							<div className="flex justify-between items-center">
								<span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
									Saldo Devedor
								</span>
								<span
									className="font-mono font-bold text-base"
									style={{
										color:
											saldoDevedor > 0
												? "#f87171"
												: primary,
									}}
								>
									{formatCurrency(saldoDevedor)}
								</span>
							</div>
							{planCredit > 0 && (
								<div className="flex justify-between items-center text-green-700">
									<span>Crédito do mês</span>
									<span className="font-mono font-medium">
										{formatCurrency(planCredit)}
									</span>
								</div>
							)}
							{prod59Credit > 0 && (
								<div className="flex justify-between items-center text-green-700">
									<span>Crédito prod./serv. neste mês</span>
									<span className="font-mono font-medium">
										{formatCurrency(prod59Credit)}
									</span>
								</div>
							)}
						</>
					);
				})()}
				<div className="border-t border-gray-200 my-1" />
				<div className="text-[10px] text-gray-400 mb-0.5">
					* Baseada na última circular do grupo, categoria e carné
					vinculado.
				</div>
				<div className="flex flex-col gap-0.5 text-[11px] text-gray-500">
					<div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
						Próximo mês
					</div>
					<div className="flex justify-between items-center">
						<span>Mensalidade</span>
						<span className="font-mono">
							{formatCurrency(fichaData.totalMensal)}
						</span>
					</div>
					{adesaoProxMes > 0 && (
						<div className="flex justify-between items-center">
							<span>Próx. venc. adesão</span>
							<span className="font-mono">
								{formatCurrency(adesaoProxMes)}
							</span>
						</div>
					)}
					{produtosData.valorPermanenteMensal > 0 && (
						<div className="flex justify-between items-center">
							<span>Produtos/serv. permanentes</span>
							<span className="font-mono">
								{formatCurrency(produtosData.valorPermanenteMensal)}
							</span>
						</div>
					)}
					{(produtosData.valorProximoMes59 - produtosData.valorPermanenteMensal) > 0 && (
						<div className="flex justify-between items-center">
							<span>Próx. venc. produtos/serv.</span>
							<span className="font-mono">
								{formatCurrency(produtosData.valorProximoMes59 - produtosData.valorPermanenteMensal)}
							</span>
						</div>
					)}
					<div className="flex justify-between items-center border-t border-gray-200 pt-0.5 mt-0.5 font-semibold text-gray-700">
						<span>Total</span>
						<span className="font-mono text-sm">
							{formatCurrency(
								fichaData.totalMensal +
									produtosData.valorProximoMes59 +
									adesaoProxMes,
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
