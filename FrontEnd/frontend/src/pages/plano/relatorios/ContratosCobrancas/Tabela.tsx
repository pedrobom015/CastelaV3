import { formatDate, formatCurrency } from "../../../../utils/formatters";
import type { DbfRecord } from "../../../../types/models";

interface Props {
	resultado: DbfRecord[];
	totais: { totalGeral: number; pagoGeral: number; pendente: number };
	getTaxasSummary: (codigo: string) => { total: number; pago: number; pendente: number };
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	pageSize: number;
}

export function ContratosCobrancasTabela({
	resultado,
	totais,
	getTaxasSummary,
	page,
	setPage,
	pageSize,
}: Props) {
	const totalPages = Math.ceil(resultado.length / pageSize);
	const paginaAtual = resultado.slice(page * pageSize, (page + 1) * pageSize);

	return (
		<div>
			{/* Cards */}
			<div className="grid grid-cols-3 gap-3 mb-4">
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
					<div className="h-1 bg-blue-900" />
					<div className="px-4 py-3">
						<p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Emitido</p>
						<p className="text-xl font-bold text-blue-900">{formatCurrency(totais.totalGeral)}</p>
						<p className="text-xs text-gray-400 mt-1">{resultado.length} contrato(s)</p>
					</div>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
					<div className="h-1 bg-green-500" />
					<div className="px-4 py-3">
						<p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Pago</p>
						<p className="text-xl font-bold text-green-700">{formatCurrency(totais.pagoGeral)}</p>
						<p className="text-xs text-gray-400 mt-1">
							{totais.totalGeral > 0 ? Math.round((totais.pagoGeral / totais.totalGeral) * 100) : 0}% quitado
						</p>
					</div>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
					<div className="h-1 bg-red-400" />
					<div className="px-4 py-3">
						<p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pendente</p>
						<p className="text-xl font-bold text-red-600">{formatCurrency(totais.pendente)}</p>
						<p className="text-xs text-gray-400 mt-1">
							{totais.totalGeral > 0 ? Math.round((totais.pendente / totais.totalGeral) * 100) : 0}% em aberto
						</p>
					</div>
				</div>
			</div>

			{/* Tabela */}
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs text-gray-500">
					{resultado.length} contrato(s) — página {page + 1} de {totalPages}
				</span>
			</div>
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-100 text-gray-700">
						<th className="border border-gray-200 p-1.5 text-left font-semibold">Código</th>
						<th className="border border-gray-200 p-1.5 text-left font-semibold">Nome</th>
						<th className="border border-gray-200 p-1.5 text-center font-semibold">Grp</th>
						<th className="border border-gray-200 p-1.5 text-center font-semibold">Sit</th>
						<th className="border border-gray-200 p-1.5 text-center font-semibold">Cobrador</th>
						<th className="border border-gray-200 p-1.5 text-center font-semibold">Admissão</th>
						<th className="border border-gray-200 p-1.5 text-right font-semibold">Total</th>
						<th className="border border-gray-200 p-1.5 text-right font-semibold">Pago</th>
						<th className="border border-gray-200 p-1.5 text-right font-semibold">Pendente</th>
					</tr>
				</thead>
				<tbody>
					{paginaAtual.map((r, i) => {
						const s = getTaxasSummary(String(r.codigo ?? ""));
						return (
							<tr key={i} className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}>
								<td className="border border-gray-200 p-1.5 text-xs">{String(r.codigo ?? "")}</td>
								<td className="border border-gray-200 p-1.5 text-xs">{String(r.nome ?? "")}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-center">{String(r.grupo ?? "")}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-center">{String(r.situacao ?? "")}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-center">{String(r.cobrador ?? "")}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-center">{formatDate(r.admissao as Date | null)}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-right">{formatCurrency(s.total)}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-right">{formatCurrency(s.pago)}</td>
								<td className="border border-gray-200 p-1.5 text-xs text-right">{formatCurrency(s.pendente)}</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			{/* Paginação */}
			{totalPages > 1 && (
				<div className="flex items-center justify-end gap-1 mt-2">
					<button onClick={() => setPage(0)} disabled={page === 0} className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40">«</button>
					<button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
						return (
							<button key={p} onClick={() => setPage(p)} className={`px-2 py-1 text-xs border rounded ${p === page ? "bg-blue-900 text-white border-blue-900" : "hover:bg-gray-100"}`}>
								{p + 1}
							</button>
						);
					})}
					<button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40">›</button>
					<button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-40">»</button>
				</div>
			)}
		</div>
	);
}
