import React, { useState, useMemo } from "react";
import type { DbfRecord } from "../../types/models";
import { useThemeStore } from "../../store/themeStore";

export interface Column {
	key: string;
	label: string;
	width?: string;
	align?: "left" | "center" | "right";
	render?: (value: unknown, record: DbfRecord) => React.ReactNode;
	sortable?: boolean;
}

interface DataTableProps {
	columns: Column[];
	data: DbfRecord[];
	onRowClick?: (record: DbfRecord) => void;
	selectedRow?: DbfRecord | null;
	highlightedRow?: DbfRecord | null;
	striped?: boolean;
	compact?: boolean;
	emptyMessage?: string;
	pageSize?: number;
	onRowDoubleClick?: (record: DbfRecord) => void;
	expandedRow?: DbfRecord | null;
	expandedContent?: React.ReactNode;
	rowClassName?: (record: DbfRecord) => string;
}

export function DataTable({
	columns,
	data,
	onRowClick,
	onRowDoubleClick,
	selectedRow,
	highlightedRow,
	striped = true,
	compact = false,
	emptyMessage = "Nenhum registro encontrado",
	pageSize = 50,
	expandedRow,
	expandedContent,
	rowClassName,
}: DataTableProps) {
	const _theme = useThemeStore((s) => s.theme);
	const selectedBg =
		_theme === "orange"
			? "#ffedd5"
			: _theme === "gray"
				? "#e0f2fe"
				: "#dbeafe";
	const selectedBorderColor =
		_theme === "orange"
			? "#fb923c"
			: _theme === "gray"
				? "#38bdf8"
				: "#60a5fa";

	const [sortKey, setSortKey] = useState<string | null>(null);
	const [sortAsc, setSortAsc] = useState(true);
	const [page, setPage] = useState(0);

	const sorted = useMemo(() => {
		if (!sortKey) return data;
		return [...data].sort((a, b) => {
			const va = a[sortKey] ?? "";
			const vb = b[sortKey] ?? "";
			if (va < vb) return sortAsc ? -1 : 1;
			if (va > vb) return sortAsc ? 1 : -1;
			return 0;
		});
	}, [data, sortKey, sortAsc]);

	const totalPages = Math.ceil(sorted.length / pageSize);
	const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

	function handleSort(key: string) {
		if (sortKey === key) setSortAsc(!sortAsc);
		else {
			setSortKey(key);
			setSortAsc(true);
		}
		setPage(0);
	}

	const paddingClass = compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";

	return (
		<div className="flex flex-col gap-2">
			<div className="overflow-auto border border-gray-300 rounded">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr className="bg-gray-100 text-gray-800">
							{columns.map((col) => (
								<th
									key={col.key}
									className={`${paddingClass} font-semibold border-r  last:border-r-0 whitespace-nowrap ${
										col.sortable !== false
											? "cursor-pointer hover:bg-blue-900 hover:text-white select-none"
											: ""
									} text-${col.align ?? "left"}`}
									style={{ width: col.width }}
									onClick={() =>
										col.sortable !== false &&
										handleSort(col.key)
									}
								>
									{col.label}
									{sortKey === col.key && (
										<span className="ml-1 text-xs">
											{sortAsc ? "▲" : "▼"}
										</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
					{paged.length === 0 && (
						<tr>
							<td
								colSpan={columns.length}
								className="text-center py-8 text-gray-500 text-sm"
							>
								{emptyMessage}
							</td>
						</tr>
					)}
				</tbody>
				{paged.length > 0 && paged.map((record, idx) => {
						const isSelected = selectedRow === record;
						const isHighlighted = highlightedRow === record;
						return (
							<tbody key={idx} className={`group ${expandedRow === record ? "row-expanded" : ""}`}>
								<tr
									className={`
                      border-b border-gray-200 last:border-b-0
                      ${onRowClick || onRowDoubleClick ? "cursor-pointer" : ""}
                      ${rowClassName?.(record) ?? ""}
                      ${isHighlighted ? "bg-green-50 border-l-2 border-l-green-400" : !isSelected && striped && idx % 2 === 1 ? "bg-gray-50" : !isSelected ? "bg-white" : ""}
                      hover:bg-blue-50 transition-colors
                    `}
									style={isSelected ? { background: selectedBg, borderColor: selectedBorderColor } : undefined}
									onClick={() => onRowClick?.(record)}
									onDoubleClick={() =>
										onRowDoubleClick?.(record)
									}
								>
									{columns.map((col) => (
										<td
											key={col.key}
											className={`${paddingClass} border-r border-gray-200 last:border-r-0 text-${col.align ?? "left"}`}
											style={{ width: col.width }}
										>
											{col.render
												? col.render(
														record[col.key],
														record,
													)
												: String(
														record[col.key] ??
															"",
													)}
										</td>
									))}
								</tr>
								{expandedRow === record && expandedContent && (
									<tr>
										<td colSpan={columns.length} className="p-0 border-b border-gray-200">
											<div className="expand-down">{expandedContent}</div>
										</td>
									</tr>
								)}
							</tbody>
						);
					})}
				</table>
			</div>

			{/* Paginação */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm">
					<span className="text-gray-600">
						{page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length} registros
					</span>
					<div className="flex gap-1">
						<button
							className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
							onClick={() => setPage(0)}
							disabled={page === 0}
						>
							«
						</button>
						<button
							className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0}
						>
							‹
						</button>
						{Array.from(
							{ length: Math.min(5, totalPages) },
							(_, i) => {
								const p =
									Math.max(
										0,
										Math.min(page - 2, totalPages - 5),
									) + i;
								return (
									<button
										key={p}
										className={`px-2 py-1 border rounded ${p === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
										onClick={() => setPage(p)}
									>
										{p + 1}
									</button>
								);
							},
						)}
						<button
							className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
							onClick={() =>
								setPage((p) => Math.min(totalPages - 1, p + 1))
							}
							disabled={page >= totalPages - 1}
						>
							›
						</button>
						<button
							className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
							onClick={() => setPage(totalPages - 1)}
							disabled={page >= totalPages - 1}
						>
							»
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
