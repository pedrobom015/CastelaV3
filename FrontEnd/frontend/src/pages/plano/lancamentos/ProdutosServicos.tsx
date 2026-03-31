import { formatCurrency } from "../../../utils/formatters";
import type { ProdutosDataType } from "./FichaFinanceira";

const TIPCOB_LABEL: Record<string, string> = {
	M: "Mensal",
	B: "Bimestral",
	T: "Trimestral",
	S: "Semestral",
	A: "Anual",
};

interface ProdutosServicosProps {
	produtosData: ProdutosDataType;
	primary: string;
}

export function ProdutosServicos({
	produtosData,
	primary: _primary,
}: ProdutosServicosProps) {
	return (
		<div className="rounded-lg border border-gray-200 overflow-hidden text-xs h-full flex flex-col">
			{/* Header */}
			<div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
				<div>
					<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
						Produtos / Serviços
						{produtosData.adendosAtivos > 0 && (
							<span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
								{produtosData.adendosAtivos}
							</span>
						)}
					</div>
					<div className="text-[10px] text-gray-400">
						ADENCOB · tipo 5 (permanente) e tipo 9 (parcelado)
					</div>
				</div>
				{produtosData.totalVencido59 > 0 && (
					<div className="text-right">
						<div className="text-[10px] text-red-500 font-medium">
							Vencido
						</div>
						<div className="font-mono font-bold text-red-600">
							{formatCurrency(produtosData.totalVencido59)}
						</div>
					</div>
				)}
			</div>

			{/* Lista de produtos */}
			{produtosData.items.length === 0 ? (
				<div className="px-3 py-3 text-xs text-gray-400 italic text-center">
					Nenhum produto / serviço configurado para este contrato.
				</div>
			) : (
				<div className="divide-y divide-gray-100">
					{produtosData.items.map((item, i) => {
						const hoje2 = new Date();
						const isProximoMes =
							item.proxima !== null &&
							item.vencidas === 0 &&
							(item.proxima.getFullYear() > hoje2.getFullYear() ||
								(item.proxima.getFullYear() ===
									hoje2.getFullYear() &&
									item.proxima.getMonth() >
										hoje2.getMonth()));
						const fmtShort = (d: Date) =>
							d.toLocaleDateString("pt-BR", {
								day: "2-digit",
								month: "2-digit",
								year: "2-digit",
							});
						return (
							<div key={i}>
								{isProximoMes && (
									<div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border-b border-blue-100 text-[10px] text-blue-600">
										{item.datainicio && (
											<span className="text-gray-400">
												desde{" "}
												{fmtShort(item.datainicio)}
											</span>
										)}
										{item.datainicio && (
											<span className="text-gray-300 mx-0.5">
												·
											</span>
										)}
										<span>
											→ próximo venc.{" "}
											<strong>
												{fmtShort(item.proxima!)}
											</strong>
											{" · "}
											<strong>
												{formatCurrency(
													item.proximaValor,
												)}
											</strong>
										</span>
									</div>
								)}
								<div
									className={`px-3 py-2${isProximoMes ? " opacity-50" : ""}`}
								>
									{/* Linha 1: nome + badge tipo */}
									<div className="flex items-start justify-between gap-2 mb-1">
										<div className="flex items-center gap-1.5 flex-wrap min-w-0">
											<span className="font-semibold text-gray-800 truncate">
												{item.nome}
											</span>
											<span className="font-mono text-[10px] text-gray-400">
												({item.codproduto})
											</span>
											{item.permanente ? (
												<span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
													∞ Permanente ·{" "}
													{TIPCOB_LABEL[
														item.tipcob
													] ?? item.tipcob}
												</span>
											) : (
												<span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
													{item.pagas}/
													{item.nparcelas} parc.
												</span>
											)}
										</div>
										<div className="text-right shrink-0">
											<div className="font-mono font-bold text-gray-800">
												{formatCurrency(
													item.valorConfig,
												)}
											</div>
											{item.permanente &&
												item.mult > 1 && (
													<div className="text-[10px] text-gray-400">
														× {item.mult} ={" "}
														{formatCurrency(
															item.valorPeriodo,
														)}
														/
														{
															TIPCOB_LABEL[
																item.tipcob
															]
														}
													</div>
												)}
										</div>
									</div>

									{/* Linha 2: barra de progresso (parcelado) */}
									{!item.permanente && item.nparcelas > 1 && (
										<div className="flex items-center gap-2 mb-1">
											<div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
												<div
													className="h-full rounded-full bg-blue-500 transition-all"
													style={{
														width: `${Math.min(100, Math.round((item.pagas / item.nparcelas) * 100))}%`,
													}}
												/>
											</div>
											<span className="text-[10px] text-gray-500 shrink-0">
												{item.pagas}/{item.nparcelas} (
												{Math.round(
													(item.pagas /
														item.nparcelas) *
														100,
												)}
												%)
											</span>
										</div>
									)}

									{/* Linha 3: detalhes financeiros */}
									<div className="flex items-center justify-between gap-3 text-[10px]">
										<div className="flex items-center gap-3 flex-wrap">
											{item.vencidas > 0 && (
												<span className="text-red-600 font-bold">
													⚠ {item.vencidas} vencida
													{item.vencidas > 1
														? "s"
														: ""}{" "}
													·{" "}
													{formatCurrency(
														item.valorVencido,
													)}
												</span>
											)}
											{/* 		{item.emAberto === 0 &&
												item.totalTaxas > 0 && (
													<span className="text-green-600 font-medium">
														✓ quitado
													</span>
												)} */}
											{item.emAberto > 0 &&
												item.vencidas === 0 &&
												!item.proxima && (
													<span className="text-gray-500">
														{item.emAberto} em
														aberto ·{" "}
														{formatCurrency(
															item.valorAberto,
														)}
													</span>
												)}
										</div>
										{item.permanente && (
											<span className="text-gray-400 font-medium shrink-0">
												mensalidade adicional
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Rodapé: Total p/ vencimento — só quando há cobranças no mês corrente */}
			{(produtosData.previsaoProdutos.tipo === "pendente" ||
				produtosData.previsaoProdutos.tipo === "cobrado_mes") && (
				<div className="flex justify-between items-center px-3 py-1.5 bg-blue-50 border-t border-blue-100 mt-auto">
					<div className="text-xs font-semibold text-blue-900">
						{produtosData.previsaoProdutos.tipo === "cobrado_mes"
							? "Cobrado neste mês"
							: "Total de produtos & serviços"}
					</div>
					<div className="font-mono font-bold text-blue-900 text-sm">
						{produtosData.previsaoProdutos.tipo === "cobrado_mes"
							? formatCurrency(
									produtosData.previsaoProdutos.total,
								)
							: formatCurrency(
									produtosData.previsaoProdutos.totalAberto,
								)}
					</div>
				</div>
			)}
		</div>
	);
}
