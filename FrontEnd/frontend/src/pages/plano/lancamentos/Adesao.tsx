import { useState } from "react";
import { formatCurrency } from "../../../utils/formatters";

interface AdesaoProps {
	// Include mode: adesão planejada
	mode: "include" | "edit" | "view";
	vljoia: number;
	nrparc: number;
	setNrparc: (n: number) => void;
	// Include mode: data de início
	dataInicio: Date | null;
	onDataInicioChange: (d: Date) => void;
	diapgto: number;
	// Contratos existentes: progresso geral das taxas tipo 1
	totalParcelas: number;
	parcelasPagas: number;
	vlPorParcelaDisplay: number;
	// Contratos existentes: dados mensais das taxas tipo 1
	mesCorrenteTotal: number;
	mesCorrenteAberto: boolean;
	mesCorrenteQtd: number;
	proxMesTotal: number;
	proxMesQtd: number;
	proxMesDate: Date | null;
	opaque: boolean;
}

export function Adesao({
	mode,
	vljoia,
	nrparc,
	setNrparc,
	dataInicio,
	onDataInicioChange,
	diapgto,
	totalParcelas,
	parcelasPagas,
	vlPorParcelaDisplay,
	mesCorrenteAberto,
	proxMesTotal,
	proxMesDate,
	opaque,
}: AdesaoProps) {
	const [showModal, setShowModal] = useState(false);
	const [tempNrparc, setTempNrparc] = useState(nrparc || 1);

	// Calcula data padrão a partir do diapgto quando o modal abre
	function defaultDataInicio(): Date {
		const hoje = new Date();
		const dia = diapgto >= 1 && diapgto <= 31 ? diapgto : 1;
		const ultimoDiaMesAtual = new Date(
			hoje.getFullYear(),
			hoje.getMonth() + 1,
			0,
		).getDate();
		const ultimoDiaProxMes = new Date(
			hoje.getFullYear(),
			hoje.getMonth() + 2,
			0,
		).getDate();
		if (dia >= hoje.getDate()) {
			return new Date(
				hoje.getFullYear(),
				hoje.getMonth(),
				Math.min(dia, ultimoDiaMesAtual),
			);
		}
		return new Date(
			hoje.getFullYear(),
			hoje.getMonth() + 1,
			Math.min(dia, ultimoDiaProxMes),
		);
	}

	// Estado local do modal: data de início (inicializa ao abrir)
	const [tempDataInicio, setTempDataInicio] = useState<Date>(
		() => dataInicio ?? defaultDataInicio(),
	);

	const fmtShort = (d: Date) =>
		d.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
		});

	const vlPorParcela =
		nrparc > 0 ? Math.floor((vljoia / nrparc) * 100) / 100 : vljoia;

	if (mode === "include") {
		return (
			<>
				{/* Modal de parcelamento */}
				{showModal && (
					<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
						<div className="bg-white rounded-xl shadow-xl p-6 w-80 flex flex-col gap-4">
							<div className="text-sm font-bold text-gray-800">
								Parcelamento da Adesão
							</div>
							<div className="text-xs text-gray-500">
								Valor total:{" "}
								<strong>{formatCurrency(vljoia)}</strong>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-xs text-gray-600">
									Número de parcelas
								</label>
								<div className="grid grid-cols-4 gap-2">
									{[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
										<button
											key={n}
											type="button"
											onClick={() => setTempNrparc(n)}
											className={`py-1.5 rounded text-sm font-medium border transition ${
												tempNrparc === n
													? "bg-blue-600 text-white border-blue-600"
													: "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
											}`}
										>
											{n}×
										</button>
									))}
								</div>
								{vljoia > 0 && (
									<div className="text-xs text-gray-500 mt-1">
										→{" "}
										{formatCurrency(
											Math.floor(
												(vljoia / tempNrparc) * 100,
											) / 100,
										)}{" "}
										por parcela
									</div>
								)}
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs text-gray-600">
									Data início (1º vencimento)
								</label>
								<input
									type="date"
									value={tempDataInicio
										.toISOString()
										.slice(0, 10)}
									onChange={(e) => {
										const d = new Date(
											e.target.value + "T00:00:00",
										);
										if (!isNaN(d.getTime()))
											setTempDataInicio(d);
									}}
									className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700"
								/>
							</div>
							<div className="flex gap-2 justify-end">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="px-3 py-1.5 text-sm text-gray-600 rounded border border-gray-200 hover:bg-gray-50"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={() => {
										setNrparc(tempNrparc);
										onDataInicioChange(tempDataInicio);
										setShowModal(false);
									}}
									className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
								>
									Confirmar
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
					{/* Header clicável para abrir modal de parcelamento */}
					<div
						className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
						onClick={() => {
							setTempNrparc(nrparc || 1);
							setTempDataInicio(
								dataInicio ?? defaultDataInicio(),
							);
							setShowModal(true);
						}}
					>
						<div className="flex items-center justify-between">
							<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
								Adesão
							</div>
							<div className="flex items-center gap-2">
								<span className="text-[10px] text-blue-500">
									{nrparc > 0 ? "alterar" : "parcelar"}
								</span>
								{nrparc !== -1 && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setNrparc(-1);
										}}
										className="text-gray-300 hover:text-red-500 leading-none text-base"
										title="Remover adesão"
									>
										&times;
									</button>
								)}
							</div>
						</div>
						<div className="text-[10px] text-gray-400">
							Adesão a gerar ao confirmar contrato
						</div>
					</div>

					{nrparc === 0 ? (
						<div className="px-3 py-2 text-xs text-gray-400 italic flex-1">
							Clique para definir o parcelamento
						</div>
					) : (
						<div className="px-3 py-2 flex-1">
							{/* Item no estilo de Produtos/Serviços */}
							<div className="flex items-start justify-between gap-2 mb-1">
								<div className="flex items-center gap-1.5 flex-wrap min-w-0">
									<span className="font-semibold text-gray-800 truncate text-xs">
										Joia / Adesão
									</span>
									<span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
										0/{nrparc} parc.
									</span>
								</div>
								<div className="text-right shrink-0">
									<div className="font-mono font-bold text-gray-800 text-xs">
										{formatCurrency(vlPorParcela)}
									</div>
									<div className="text-[10px] text-gray-500">
										por parcela
									</div>
								</div>
							</div>

							{/* Barra de progresso */}
							<div className="flex items-center gap-2 mb-1.5">
								<div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
									<div
										className="h-full rounded-full bg-blue-500 transition-all"
										style={{ width: "0%" }}
									/>
								</div>
								<span className="text-[10px] text-gray-500 shrink-0">
									0/{nrparc} (0%)
								</span>
							</div>

							<div className="text-[10px] text-gray-400">
								Total:{" "}
								<strong className="text-gray-600">
									{formatCurrency(vljoia)}
								</strong>
								{dataInicio ? (
									<>
										{" · 1º venc. "}
										<strong className="text-gray-600">
											{fmtShort(dataInicio)}
										</strong>
									</>
								) : (
									<>{" · datas definidas na confirmação"}</>
								)}
							</div>
						</div>
					)}
				</div>
			</>
		);
	}

	// Contratos existentes — exibe progresso real das taxas tipo 1
	const pct =
		totalParcelas > 0
			? Math.round((parcelasPagas / totalParcelas) * 100)
			: 0;

	return (
		<div className="rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
			{/* Banner próximo mês */}
			{opaque && proxMesDate && (
				<div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border-b border-blue-100 text-[10px] text-blue-600">
					<span>
						{"→ próximo venc. "}
						<strong>{fmtShort(proxMesDate)}</strong>
						{proxMesTotal ? (
							<>
								{" · "}
								<strong>{formatCurrency(proxMesTotal)}</strong>
							</>
						) : null}
					</span>
				</div>
			)}

			<div className={opaque ? "opacity-50" : undefined}>
				{/* Header */}
				<div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
					<div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
						Adesão
					</div>
					<div className="text-[10px] text-gray-400">
						taxas tipo 1
					</div>
				</div>

				{/* Item no estilo de Produtos/Serviços */}
				<div className="px-3 py-2">
					<div className="flex items-start justify-between gap-2 mb-1">
						<div className="flex items-center gap-1.5 flex-wrap min-w-0">
							<span className="font-semibold text-gray-800 truncate text-xs">
								Adesão
							</span>
							<span
								className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
									parcelasPagas >= totalParcelas &&
									totalParcelas > 0
										? "bg-green-100 text-green-700"
										: "bg-blue-100 text-blue-700"
								}`}
							>
								{parcelasPagas}/{totalParcelas} parc.
							</span>
						</div>
						<div className="text-right shrink-0">
							<div className="font-mono font-bold text-gray-800 text-xs">
								{formatCurrency(vlPorParcelaDisplay)}
							</div>
							<div className="text-[10px] text-gray-500">
								por parcela
							</div>
						</div>
					</div>

					{/* Barra de progresso */}
					{totalParcelas > 1 && (
						<div className="flex items-center gap-2 mb-1.5">
							<div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
								<div
									className="h-full rounded-full bg-blue-500 transition-all"
									style={{ width: `${pct}%` }}
								/>
							</div>
							<span className="text-[10px] text-gray-500 shrink-0">
								{parcelasPagas}/{totalParcelas} ({pct}%)
							</span>
						</div>
					)}
				</div>

				{/* Footer status */}
				{/* 		{!opaque && (
					<div
						className={`flex justify-between items-center px-3 py-1.5 border-t ${mesCorrenteAberto ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"}`}
					>
						<div
							className={`text-xs font-semibold ${mesCorrenteAberto ? "text-orange-900" : "text-green-900"}`}
						>
							{mesCorrenteAberto ? "Em aberto" : "✓ Pago"}
						</div>
					</div>
				)} */}
			</div>
		</div>
	);
}
