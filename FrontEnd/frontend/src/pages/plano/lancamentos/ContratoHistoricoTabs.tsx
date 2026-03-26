import { useAppStore } from "../../../store/appStore";
import { formatDate, formatCurrency } from "../../../utils/formatters";
import { TaxasPanel } from "./TaxasModal";
import { InscritosPanel } from "./InscritosModal";

const TIPO: Record<string, string> = {
	A: "Atendimento",
	R: "Recebimento",
	C: "Acordo",
};

export interface ContratoHistoricoTabsProps {
	activeTab:
		| "atendimentos"
		| "acordos"
		| "adendos"
		| "taxas"
		| "inscritos";
	codigo: string;
	nome: string;
	onAdendos: () => void;
}

export function ContratoHistoricoTabs({
	activeTab,
	codigo,
	nome,
	onAdendos,
}: ContratoHistoricoTabsProps) {
	const { getTable } = useAppStore();
	const codigoPad = String(codigo).padStart(9, "0");

	if (activeTab === "atendimentos") {
		const atend800 = getTable("atend800");
		const atends = (atend800?.records ?? [])
			.filter(
				(r) =>
					!r._deleted &&
					String(r.codigo ?? "").trim() === codigoPad,
			)
			.sort((a, b) => {
				const da =
					a.data_ instanceof Date ? a.data_.getTime() : 0;
				const db =
					b.data_ instanceof Date ? b.data_.getTime() : 0;
				return db - da;
			});

		return (
			<div
				key="atendimentos"
				className="flex flex-col gap-4 min-h-0 overflow-y-auto"
			>
				<div>
					<h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
						Histórico de Atendimentos
						<span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
							{atends.length}
						</span>
					</h3>
					{atends.length === 0 ? (
						<p className="text-sm text-gray-400 italic py-4 text-center border rounded bg-gray-50">
							Nenhum atendimento registrado.
						</p>
					) : (
						<div className="border rounded overflow-hidden">
							<table className="w-full text-xs">
								<thead className="bg-gray-100 text-gray-600">
									<tr>
										<th className="px-2 py-1.5 text-left font-medium">Nº</th>
										<th className="px-2 py-1.5 text-left font-medium">Data</th>
										<th className="px-2 py-1.5 text-left font-medium">Hora</th>
										<th className="px-2 py-1.5 text-left font-medium">Tipo</th>
										<th className="px-2 py-1.5 text-left font-medium">Observação</th>
										<th className="px-2 py-1.5 text-left font-medium">Por</th>
									</tr>
								</thead>
								<tbody>
									{atends.map((r, i) => (
										<tr
											key={i}
											className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
										>
											<td className="px-2 py-1 font-mono">
												{String(r.numero ?? "").trim()}
											</td>
											<td className="px-2 py-1">
												{formatDate(r.data_ as Date | null)}
											</td>
											<td className="px-2 py-1 font-mono">
												{String(r.hora ?? "").trim()}
											</td>
											<td className="px-2 py-1">
												<span
													className={`px-1.5 py-0.5 rounded text-xs font-medium ${
														r.tipo === "R"
															? "bg-green-100 text-green-700"
															: r.tipo === "C"
																? "bg-orange-100 text-orange-700"
																: "bg-blue-100 text-blue-700"
													}`}
												>
													{TIPO[String(r.tipo ?? "")] ??
														String(r.tipo ?? "")}
												</span>
											</td>
											<td
												className="px-2 py-1 max-w-[220px] truncate"
												title={String(r.obs ?? "")}
											>
												{String(r.obs ?? "").trim() || "—"}
											</td>
											<td className="px-2 py-1">
												{String(r.por ?? "").trim()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (activeTab === "acordos") {
		const acordosT = getTable("acordos");
		const acordos = (acordosT?.records ?? [])
			.filter(
				(r) =>
					!r._deleted &&
					String(r.codigo ?? "").trim() === codigoPad,
			)
			.sort((a, b) => {
				const da =
					a.data_ instanceof Date ? a.data_.getTime() : 0;
				const db =
					b.data_ instanceof Date ? b.data_.getTime() : 0;
				return db - da;
			});

		return (
			<div
				key="acordos"
				className="flex flex-col gap-4 min-h-0 overflow-y-auto"
			>
				<div>
					<h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
						Acordos
						<span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
							{acordos.length}
						</span>
					</h3>
					{acordos.length === 0 ? (
						<p className="text-sm text-gray-400 italic py-4 text-center border rounded bg-gray-50">
							Nenhum acordo registrado.
						</p>
					) : (
						<div className="border rounded overflow-hidden">
							<table className="w-full text-xs">
								<thead className="bg-gray-100 text-gray-600">
									<tr>
										<th className="px-2 py-1.5 text-left font-medium">Nº Acordo</th>
										<th className="px-2 py-1.5 text-left font-medium">Data</th>
										<th className="px-2 py-1.5 text-right font-medium">Valor Total</th>
										<th className="px-2 py-1.5 text-center font-medium">Parcelas</th>
										<th className="px-2 py-1.5 text-right font-medium">Vlr. Parcela</th>
										<th className="px-2 py-1.5 text-center font-medium">Stat</th>
										<th className="px-2 py-1.5 text-left font-medium">Observação</th>
										<th className="px-2 py-1.5 text-left font-medium">Por</th>
									</tr>
								</thead>
								<tbody>
									{acordos.map((r, i) => (
										<tr
											key={i}
											className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
										>
											<td className="px-2 py-1 font-mono">
												{String(r.numero ?? "").trim()}
											</td>
											<td className="px-2 py-1">
												{formatDate(r.data_ as Date | null)}
											</td>
											<td className="px-2 py-1 text-right font-mono">
												{formatCurrency(Number(r.valor ?? 0))}
											</td>
											<td className="px-2 py-1 text-center">
												{Number(r.parcelas ?? 0)}x
											</td>
											<td className="px-2 py-1 text-right font-mono">
												{formatCurrency(Number(r.vlparc ?? 0))}
											</td>
											<td className="px-2 py-1 text-center">
												<span
													className={`px-1.5 py-0.5 rounded text-xs font-medium ${
														r.stat === "Q"
															? "bg-green-100 text-green-700"
															: "bg-orange-100 text-orange-700"
													}`}
												>
													{r.stat === "Q" ? "Quitado" : "Ativo"}
												</span>
											</td>
											<td
												className="px-2 py-1 max-w-[180px] truncate"
												title={String(r.obs ?? "")}
											>
												{String(r.obs ?? "").trim() || "—"}
											</td>
											<td className="px-2 py-1">
												{String(r.por ?? "").trim()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		);
	}

	if (activeTab === "adendos") {
		const adendosTable = getTable("adendos");
		const pradendoTable = getTable("pradendo");

		const adendosList = (adendosTable?.records ?? []).filter(
			(r) =>
				!r._deleted &&
				String(r.flag_excl ?? "").trim() !== "*" &&
				String(r.codigo ?? "").trim() === codigoPad,
		);

		const prodMap = new Map<string, string>();
		(pradendoTable?.records ?? []).forEach((r) => {
			if (!r._deleted)
				prodMap.set(
					String(r.codigo ?? "").trim(),
					String(r.produto ?? "").trim(),
				);
		});

		return (
			<div
				key="adendos"
				className="flex flex-col gap-4 overflow-y-auto"
			>
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
						Adendos Ativos
						<span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
							{adendosList.length}
						</span>
					</h3>
					<button
						onClick={onAdendos}
						className="px-3 py-1 text-xs font-semibold rounded border border-blue-400 text-blue-800 hover:bg-blue-50 transition"
					>
						+ Adicionar Adendo
					</button>
				</div>

				{adendosList.length === 0 ? (
					<p className="text-sm text-gray-400 italic py-6 text-center border rounded bg-gray-50">
						Nenhum adendo cadastrado para este contrato.
					</p>
				) : (
					<div className="border rounded overflow-hidden">
						<table className="w-full text-xs">
							<thead className="bg-blue-900 text-white">
								<tr>
									<th className="px-3 py-1.5 text-left font-medium">Cód.</th>
									<th className="px-3 py-1.5 text-left font-medium">Produto / Serviço</th>
									<th className="px-3 py-1.5 text-center font-medium">Incluído em</th>
									<th className="px-3 py-1.5 text-left font-medium">Por</th>
								</tr>
							</thead>
							<tbody>
								{adendosList.map((r, i) => {
									const codP = String(r.codproduto ?? "").trim();
									return (
										<tr
											key={i}
											className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
										>
											<td className="px-3 py-1.5 font-mono">{codP}</td>
											<td className="px-3 py-1.5 font-medium">
												{prodMap.get(codP) ?? (
													<span className="text-gray-400 italic">—</span>
												)}
											</td>
											<td className="px-3 py-1.5 text-center">
												{formatDate(r.incluido_ as Date | null)}
											</td>
											<td className="px-3 py-1.5 text-gray-600">
												{String(r.por ?? "").trim() || "—"}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		);
	}

	if (activeTab === "taxas") {
		return (
			<div key="taxas" className="flex flex-col gap-3 tab-content">
				<TaxasPanel codigo={codigo} nomeContrato={nome} />
			</div>
		);
	}

	if (activeTab === "inscritos") {
		return (
			<div key="inscritos" className="flex flex-col gap-3 tab-content">
				<InscritosPanel codigo={codigo} nomeContrato={nome} />
			</div>
		);
	}

	return null;
}
