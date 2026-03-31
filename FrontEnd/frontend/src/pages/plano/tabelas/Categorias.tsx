import { Fragment, useState, useMemo } from "react";
import { useAppStore } from "../../../store/appStore";
import { useThemeStore } from "../../../store/themeStore";
import {
	PageHeader,
	Btn,
	SearchBar,
} from "../../../components/common/PageHeader";
import { formatCurrency } from "../../../utils/formatters";
import { searchRecords } from "../../../utils/dbfHelpers";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import {
	CategoriaWizardModal,
	type ClasseRec,
	emptyCateg,
	numberToMask,
	parseCurrency,
} from "./CategoriaWizardModal";
import { ClsInfoModal, type ClsInfoRec, type ClsItemRec } from "./ClsInfoModal";

// ─── Component ────────────────────────────────────────────────────────────────

export function Categorias() {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [search, setSearch] = useState("");
	const [expandedClasse, setExpandedClasse] = useState<string | null>(null);

	// categoria modal
	const [modalCateg, setModalCateg] = useState(false);
	const [editingCateg, setEditingCateg] = useState<ClasseRec | null>(null);
	const [formCateg, setFormCateg] = useState<ClasseRec>(emptyCateg());
	const [strVljoia, setStrVljoia] = useState("");
	const [strVladicional, setStrVladicional] = useState("");
	const [strVldepend, setStrVldepend] = useState("");

	// plano modal
	const [modalPlano, setModalPlano] = useState(false);
	const [planoClasscod, setPlanoClasscod] = useState("");

	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [highlightedCateg, setHighlightedCateg] = useState<string | null>(
		null,
	);
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

	const _theme = useThemeStore((s) => s.theme);
	const primary =
		_theme === "orange"
			? "#ff914d"
			: _theme === "gray"
				? "#248094"
				: "#1e3a8a";

	const classesTable = getTable("classes");
	const gruposTable = getTable("grupos");
	const clsInfoTable = getTable("clsinfo");
	const clsItemTable = getTable("clsitem");

	const records = useMemo(
		() =>
			searchRecords(classesTable, search, [
				"classcod",
				"descricao",
			]) as ClasseRec[],
		[classesTable, search],
	);

	// Famílias e participantes por categoria (direto de GRUPOS.DBF via tipcont)
	const familiasPorCateg = useMemo(() => {
		const map = new Map<string, { familias: number; partic: number }>();
		(gruposTable?.records ?? [])
			.filter((r) => !r._deleted)
			.forEach((r) => {
				const cat = String(r.tipcont ?? "").trim();
				if (!cat) return;
				if (!map.has(cat)) map.set(cat, { familias: 0, partic: 0 });
				const entry = map.get(cat)!;
				entry.familias++;
				entry.partic += 1 + (Number(r.nrdepend) || 0);
			});
		return map;
	}, [gruposTable]);

	// Mapa classcod → ClsInfoRec
	const clsInfoMap = useMemo(() => {
		const map = new Map<string, ClsInfoRec>();
		(clsInfoTable?.records ?? []).forEach((r) => {
			const cod = String(r.classcod ?? "").trim();
			if (cod) map.set(cod, r as ClsInfoRec);
		});
		return map;
	}, [clsInfoTable]);

	// Mapa classcod → ClsItemRec[] ordenado
	const clsItemMap = useMemo(() => {
		const map = new Map<string, ClsItemRec[]>();
		(clsItemTable?.records ?? []).forEach((r) => {
			const cod = String(r.classcod ?? "").trim();
			if (!cod) return;
			if (!map.has(cod)) map.set(cod, []);
			map.get(cod)!.push(r as ClsItemRec);
		});
		map.forEach((items, cod) => {
			map.set(
				cod,
				items.sort((a, b) => Number(a.ordem) - Number(b.ordem)),
			);
		});
		return map;
	}, [clsItemTable]);

	// ── Categoria ──────────────────────────────────────────────────────────────

	function initCurrencyStrings(rec: ClasseRec) {
		setStrVljoia(numberToMask(rec.vljoia));
		const ad = Number(rec.vlmensal) || 0;
		setStrVladicional(ad < 0 ? "-" + numberToMask(ad) : numberToMask(ad));
		setStrVldepend(numberToMask(rec.vldepend));
	}

	const computedTotal = useMemo(
		() =>
			parseCurrency(strVljoia) +
			parseCurrency(strVladicional) +
			parseCurrency(strVldepend),
		[strVljoia, strVladicional, strVldepend],
	);

	function handleNewCateg() {
		const recs = classesTable?.records.filter((r) => !r._deleted) ?? [];
		const maxCod = recs.reduce((max, r) => {
			const n = parseInt(String(r.classcod ?? "").trim(), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0);
		const newRec = {
			...emptyCateg(),
			classcod: String(maxCod + 1).padStart(2, "0"),
		};
		setEditingCateg(null);
		setFormCateg(newRec);
		initCurrencyStrings(newRec);
		setSaveError("");
		setModalCateg(true);
	}

	function handleEditCateg(rec: ClasseRec) {
		const merged = { ...emptyCateg(), ...rec };
		setEditingCateg(rec);
		setFormCateg(merged);
		initCurrencyStrings(merged);
		setSaveError("");
		setModalCateg(true);
	}

	async function handleSaveCateg() {
		if (!dirHandle) {
			setSaveError("Abra uma pasta de dados antes de salvar.");
			return;
		}
		setSaving(true);
		setSaveError("");
		try {
			const cur = getTable("classes");
			const newRec: ClasseRec = {
				...formCateg,
				vljoia: parseCurrency(strVljoia),
				vlmensal: parseCurrency(strVladicional),
				vldepend: parseCurrency(strVldepend),
				vltotal: computedTotal,
			};
			const rows = editingCateg
				? (cur?.records ?? []).map((r) =>
						r === editingCateg ? newRec : r,
					)
				: [...(cur?.records ?? []), newRec];
			const tbl = cur
				? { ...cur, records: rows }
				: {
						header: {
							version: 3,
							lastUpdate: new Date(),
							recordCount: rows.length,
							headerSize: 0,
							recordSize: 0,
							fields: [],
						},
						records: rows,
					};
			setTable("classes", tbl);
			await writeDbfFile(dirHandle, "CLASSES.DBF", tbl);
			setModalCateg(false);
			setHighlightedCateg(String(newRec.classcod).trim());
			setTimeout(() => setHighlightedCateg(null), 3000);
		} catch (err) {
			setSaveError("Erro ao salvar: " + String(err));
		} finally {
			setSaving(false);
		}
	}

	function setC(field: keyof ClasseRec, value: string | number) {
		setFormCateg((p) => ({ ...p, [field]: value }));
	}

	const totalFormatted = computedTotal
		? computedTotal.toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			})
		: "";

	// ── Status helpers ─────────────────────────────────────────────────────────

	const STATUS_ICON: Record<string, string> = {
		I: "✓",
		O: "◉",
		N: "✗",
	};
	const STATUS_COLOR: Record<string, string> = {
		I: "text-green-600",
		O: "text-yellow-500",
		N: "text-gray-300",
	};

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<div className="p-4">
			<PageHeader
				title="Planos"
				subtitle="Planos de cobrança"
				actions={
					<>
						<SearchBar
							value={search}
							onChange={setSearch}
							placeholder="Buscar por código ou descrição..."
						/>
						<Btn
							variant="secondary"
							icon="✏️"
							disabled={!expandedClasse}
							onClick={() => {
								const selRec = records.find(
									(r) =>
										String(r.classcod).trim() ===
										expandedClasse,
								);
								if (selRec) handleEditCateg(selRec);
							}}
						>
							Editar
						</Btn>
						<Btn
							icon="+"
							onClick={handleNewCateg}
							style={{
								backgroundColor: primary,
								borderColor: primary,
							}}
						>
							Nova Categoria
						</Btn>
					</>
				}
			/>

			<div className="mb-3 text-sm text-gray-500">
				{records.length} categoria(s)
			</div>

			{/* ── Cards ────────────────────────────────────────────────────────── */}
			{records.length === 0 ? (
				<p className="text-center py-10 text-gray-400 text-sm">
					Nenhuma categoria encontrada.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
					{records.map((rec) => {
						const cod = String(rec.classcod).trim();
						const info = clsInfoMap.get(cod);
						const items = clsItemMap.get(cod) ?? [];
						const stats = familiasPorCateg.get(cod);
						const isHighlighted = highlightedCateg === cod;
						const isSelected = expandedClasse === cod;

						const preco = info?.preco_exib
							? Number(info.preco_exib)
							: null;
						const precoStr = preco
							? preco.toLocaleString("pt-BR", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})
							: null;

						return (
							<Fragment key={cod}>
								<div
									className="rounded-xl border text-xs select-none transition-all duration-200 overflow-hidden cursor-pointer flex flex-col"
									style={{
										borderColor: isHighlighted
											? "#86efac"
											: isSelected
												? primary
												: "#e5e7eb",
										boxShadow: isHighlighted
											? "0 0 0 2px #86efac"
											: isSelected
												? `0 0 0 2px ${primary}33`
												: "0 1px 3px rgba(0,0,0,0.06)",
										background: isHighlighted
											? "#dcfce7"
											: "#fff",
									}}
									onClick={() =>
										setExpandedClasse(
											isSelected ? null : cod,
										)
									}
									onDoubleClick={(e) => {
										e.stopPropagation();
										handleEditCateg(rec);
									}}
								>
									{/* ── Cabeçalho ──────────────────────── */}
									<div
										className="px-4 pt-4 pb-3"
										style={{
											background: isSelected
												? `${primary}0d`
												: undefined,
											borderBottom: `1px solid ${isSelected ? primary + "33" : "#f3f4f6"}`,
										}}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1.5 mb-0.5">
													<span
														className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
														style={{
															color: primary,
															background: `${primary}15`,
														}}
													>
														{cod}
													</span>
													{info?.destaque && (
														<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
															★ Destaque
														</span>
													)}
												</div>
												<h3
													className="text-base font-bold leading-tight"
													style={{ color: primary }}
												>
													{String(
														rec.descricao ?? "",
													).trim()}
												</h3>
												{info?.subtitulo && (
													<p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
														{String(
															info.subtitulo,
														).trim()}
													</p>
												)}
											</div>
											{/* Ícones */}
											<div
												className="flex items-center gap-1.5 shrink-0 mt-0.5"
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<svg
													className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													onClick={() =>
														handleEditCateg(rec)
													}
												>
													<title>
														Editar categoria
													</title>
													<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
													<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
												</svg>
												<svg
													className="w-3.5 h-3.5 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													onClick={() => {
														setPlanoClasscod(cod);
														setModalPlano(true);
													}}
												>
													<title>
														Editar apresentação do
														plano
													</title>
													<circle
														cx="12"
														cy="12"
														r="10"
													/>
													<line
														x1="2"
														y1="12"
														x2="22"
														y2="12"
													/>
													<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
												</svg>
											</div>
										</div>

										{/* Preço */}
										{precoStr && (
											<div className="mt-2">
												<span
													className="text-2xl font-black"
													style={{ color: primary }}
												>
													R${precoStr}
												</span>
												<span className="text-gray-400 text-xs font-medium ml-0.5">
													/mês
												</span>
											</div>
										)}
									</div>

									{/* ── Corpo expansível ──────────────── */}
									{(() => {
										const isExpanded =
											expandedCards.has(cod);
										const hasBody =
											(info?.cobertura &&
												String(
													info.cobertura,
												).trim()) ||
											items.length > 0;
										return (
											<div className="relative flex flex-col">
												{/* Conteúdo colapsável */}
												<div
													className="overflow-hidden transition-all duration-300"
													style={{
														maxHeight: isExpanded
															? "9999px"
															: "200px",
													}}
												>
													{/* Cobertura */}
													{info?.cobertura &&
														String(
															info.cobertura,
														).trim() && (
															<div
																className="px-4 py-2 text-[11px] text-gray-600 leading-snug border-b"
																style={{
																	background: `${primary}07`,
																	borderColor: `${primary}22`,
																}}
															>
																<span
																	className="font-bold mr-1"
																	style={{
																		color: primary,
																	}}
																>
																	★
																</span>
																{String(
																	info.cobertura,
																).trim()}
															</div>
														)}
													{/* Itens */}
													{items.length > 0 && (
														<ul className="px-4 py-2 flex flex-col gap-0.5">
															{items.map(
																(it, idx) => (
																	<li
																		key={
																			idx
																		}
																		className="flex items-start gap-1.5 text-[11px] leading-snug py-0.5"
																	>
																		<span
																			className={`font-bold shrink-0 mt-px ${STATUS_COLOR[String(it.status)] ?? "text-gray-400"}`}
																		>
																			{STATUS_ICON[
																				String(
																					it.status,
																				)
																			] ??
																				"·"}
																		</span>
																		<span
																			className={
																				String(
																					it.status,
																				) ===
																				"N"
																					? "text-gray-400"
																					: "text-gray-700"
																			}
																		>
																			{String(
																				it.descricao ??
																					"",
																			).trim()}
																		</span>
																	</li>
																),
															)}
														</ul>
													)}
												</div>

												{/* Gradiente + botão "..." / "▲" */}
												{hasBody && (
													<div
														className="flex justify-center py-1"
														style={
															!isExpanded
																? {
																		background: `linear-gradient(to bottom, transparent, white 60%)`,
																		marginTop:
																			"-28px",
																		paddingTop:
																			"16px",
																		position:
																			"relative",
																	}
																: undefined
														}
														onClick={(e) =>
															e.stopPropagation()
														}
													>
														<button
															className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-0.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors select-none"
															onClick={(e) => {
																e.stopPropagation();
																setExpandedCards(
																	(prev) => {
																		const next =
																			new Set(
																				prev,
																			);
																		if (
																			next.has(
																				cod,
																			)
																		)
																			next.delete(
																				cod,
																			);
																		else
																			next.add(
																				cod,
																			);
																		return next;
																	},
																);
															}}
														>
															{isExpanded
																? "▲"
																: "···"}
														</button>
													</div>
												)}

												{/* Footer: famílias */}
												<div
													className="flex items-center gap-4 px-4 py-2 border-t text-[11px]"
													style={{
														borderColor: `${primary}22`,
														background: `${primary}07`,
													}}
												>
													<div className="flex items-center gap-1">
														<span className="text-gray-400">
															Famílias
														</span>
														<span
															className="font-semibold"
															style={{
																color: primary,
															}}
														>
															{stats?.familias ??
																0}
														</span>
													</div>
													<div className="flex items-center gap-1">
														<span className="text-gray-400">
															Participantes
														</span>
														<span className="font-semibold text-gray-700">
															{stats?.partic ?? 0}
														</span>
													</div>
													{rec.vlmensal ||
													rec.vldepend ? (
														<div className="ml-auto flex items-center gap-1">
															<span className="text-gray-400">
																Ajuste
															</span>
															<span
																className="font-semibold"
																style={{
																	color: primary,
																}}
															>
																{formatCurrency(
																	Number(
																		rec.vltotal,
																	),
																)}
															</span>
														</div>
													) : null}
												</div>
											</div>
										);
									})()}
								</div>
							</Fragment>
						);
					})}
				</div>
			)}

			{/* ══ Modal — Categoria ════════════════════════════════════════════════ */}
			{(() => {
				const contratoCount = stats_for_modal(
					familiasPorCateg,
					String(formCateg.classcod).trim(),
				);
				return (
					<CategoriaWizardModal
						isOpen={modalCateg}
						onClose={() => {
							setModalCateg(false);
							setSaveError("");
						}}
						onSave={handleSaveCateg}
						editing={!!editingCateg}
						form={formCateg}
						setC={setC}
						strVljoia={strVljoia}
						setStrVljoia={setStrVljoia}
						strVladicional={strVladicional}
						setStrVladicional={setStrVladicional}
						strVldepend={strVldepend}
						setStrVldepend={setStrVldepend}
						totalFormatted={totalFormatted}
						contratoCount={contratoCount}
						saving={saving}
						saveError={saveError}
						primary={primary}
					/>
				);
			})()}

			{/* ══ Modal — Apresentação do Plano ══════════════════════════════════ */}
			<ClsInfoModal
				isOpen={modalPlano}
				onClose={() => setModalPlano(false)}
				classcod={planoClasscod}
				descricao={
					records.find(
						(r) => String(r.classcod).trim() === planoClasscod,
					)?.descricao ?? ""
				}
				primary={primary}
			/>
		</div>
	);
}

function stats_for_modal(
	map: Map<string, { familias: number; partic: number }>,
	cod: string,
): number {
	return map.get(cod)?.familias ?? 0;
}
