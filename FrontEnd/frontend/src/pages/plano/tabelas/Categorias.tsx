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
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import { ArqgrupRec, emptyGrupo } from "./GrupoFormFields";
import { GrupoWizardModal } from "./GrupoWizardModal";
import {
	CategoriaWizardModal,
	type ClasseRec,
	emptyCateg,
	numberToMask,
	parseCurrency,
} from "./CategoriaWizardModal";

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

	// grupo modal
	const [modalGrupo, setModalGrupo] = useState(false);
	const [editingGrupo, setEditingGrupo] = useState<ArqgrupRec | null>(null);
	const [formGrupo, setFormGrupo] = useState<ArqgrupRec>(emptyGrupo());

	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [highlightedCateg, setHighlightedCateg] = useState<string | null>(
		null,
	);
	const [highlightedGrupo, setHighlightedGrupo] = useState<string | null>(
		null,
	);

	const _theme = useThemeStore((s) => s.theme);
	const primary =
		_theme === "orange"
			? "#ff914d"
			: _theme === "gray"
				? "#248094"
				: "#1e3a8a";
	const selectedBg =
		_theme === "orange"
			? "#fff7ed"
			: _theme === "gray"
				? "#e0f2fe"
				: "#eff6ff";

	const classesTable = getTable("classes");
	const arqgrupTable = getTable("arqgrup");
	const gruposTable = getTable("grupos"); // GRUPOS.DBF — contratos reais

	const records = useMemo(
		() =>
			searchRecords(classesTable, search, [
				"classcod",
				"descricao",
			]) as ClasseRec[],
		[classesTable, search],
	);

	// mapa classcod → grupos, computado uma vez
	const gruposPorClasse = useMemo(() => {
		const map = new Map<string, ArqgrupRec[]>();
		(arqgrupTable?.records ?? [])
			.filter((r) => !r._deleted)
			.forEach((r) => {
				const cod = String(r.classe ?? "").trim();
				if (!map.has(cod)) map.set(cod, []);
				map.get(cod)!.push(r as ArqgrupRec);
			});
		return map;
	}, [arqgrupTable]);

	/**
	 * Conta contratos e participantes dinamicamente da GRUPOS.DBF.
	 * contrat  = nº de contratos com grupo == grup
	 * partic   = soma de (1 titular + nrdepend) por contrato
	 *
	 * O sistema antigo gravava esses valores em ARQGRUP.DBF mas não os
	 * atualizava em tempo real — aqui calculamos sempre ao vivo.
	 */
	const statsPorGrupo = useMemo(() => {
		const map = new Map<string, { contrat: number; partic: number }>();
		(gruposTable?.records ?? [])
			.filter((r) => !r._deleted)
			.forEach((r) => {
				const grup = String(r.grupo ?? "").trim();
				if (!grup) return;
				if (!map.has(grup)) map.set(grup, { contrat: 0, partic: 0 });
				const entry = map.get(grup)!;
				entry.contrat++;
				entry.partic += 1 + (Number(r.nrdepend) || 0); // 1 titular + dependentes
			});
		return map;
	}, [gruposTable]);

	const classeOpts = useMemo(() => {
		const base = [{ value: "", label: "-- Selecione --" }];
		if (!classesTable) return base;
		return base.concat(
			classesTable.records
				.filter((r) => !r._deleted)
				.map((r) => ({
					value: String(r.classcod ?? "").trim(),
					label: `${String(r.classcod ?? "").trim()} — ${String(r.descricao ?? "").trim()}`,
				}))
				.sort((a, b) => a.value.localeCompare(b.value)),
		);
	}, [classesTable]);

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

	// ── Grupo ──────────────────────────────────────────────────────────────────

	function handleNewGrupo(classcod: string) {
		const recs = arqgrupTable?.records.filter((r) => !r._deleted) ?? [];
		const maxCod = recs.reduce((max, r) => {
			const n = parseInt(String(r.grup ?? "").trim(), 10);
			return isNaN(n) ? max : Math.max(max, n);
		}, 0);
		setEditingGrupo(null);
		setFormGrupo({
			...emptyGrupo(),
			grup: String(maxCod + 1).padStart(2, "0"),
			classe: classcod,
		});
		setSaveError("");
		setModalGrupo(true);
	}

	function handleEditGrupo(rec: ArqgrupRec) {
		setEditingGrupo(rec);
		setFormGrupo({ ...emptyGrupo(), ...rec });
		setSaveError("");
		setModalGrupo(true);
	}

	async function handleSaveGrupo() {
		if (!dirHandle) {
			setSaveError("Abra uma pasta de dados antes de salvar.");
			return;
		}
		setSaving(true);
		setSaveError("");
		try {
			const cur = getTable("arqgrup");
			const newRec: ArqgrupRec = { ...formGrupo };
			const editKey = editingGrupo
				? String(editingGrupo.grup ?? "").trim()
				: null;
			const rows = editKey
				? (cur?.records ?? []).map((r) =>
						String(r.grup ?? "").trim() === editKey ? newRec : r,
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
			setTable("arqgrup", tbl);
			await writeDbfFile(dirHandle, "ARQGRUP.DBF", tbl);
			setModalGrupo(false);
			setHighlightedGrupo(String(newRec.grup).trim());
			setTimeout(() => setHighlightedGrupo(null), 3000);
		} catch (err) {
			setSaveError("Erro ao salvar: " + String(err));
		} finally {
			setSaving(false);
		}
	}

	function setC(field: keyof ClasseRec, value: string | number) {
		setFormCateg((p) => ({ ...p, [field]: value }));
	}

	function setG(
		field: keyof ArqgrupRec,
		value: string | number | Date | null,
	) {
		setFormGrupo((p) => ({ ...p, [field]: value }));
	}

	const totalFormatted = computedTotal
		? computedTotal.toLocaleString("pt-BR", {
				style: "currency",
				currency: "BRL",
			})
		: "";

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<div className="p-4">
			<PageHeader
				title="Categorias e Grupos"
				subtitle="Planos de cobrança — CLASSES.DBF · ARQGRUP.DBF"
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

			{/* ── Cards de categorias ──────────────────────────────────────────── */}
			{records.length === 0 ? (
				<p className="text-center py-10 text-gray-400 text-sm">
					Nenhuma categoria encontrada.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{records.map((rec) => {
						const cod = String(rec.classcod).trim();
						const grupos = gruposPorClasse.get(cod) ?? [];
						const totalContratos = grupos.reduce((s, g) => {
							const gcod = String(g.grup).trim();
							return (
								s +
								(statsPorGrupo.get(gcod)?.contrat ??
									Number(g.contrat) ??
									0)
							);
						}, 0);
						const totalPartic = grupos.reduce((s, g) => {
							const gcod = String(g.grup).trim();
							return (
								s +
								(statsPorGrupo.get(gcod)?.partic ??
									Number(g.partic) ??
									0)
							);
						}, 0);
						const isHighlighted = highlightedCateg === cod;
						const isSelected = expandedClasse === cod;

						return (
							<Fragment key={cod}>
								{/* ── Card da categoria — clique seleciona, duplo-clique edita ── */}
								<div
									className="rounded-xl border text-xs select-none transition-all duration-200 overflow-hidden cursor-pointer"
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
									{/* Cabeçalho */}
									<div
										className="flex items-center gap-2 min-w-0 px-3 py-2 border-b"
										style={{
											borderColor: isSelected
												? `${primary}33`
												: "#f3f4f6",
											background: isSelected
												? `${primary}0d`
												: undefined,
										}}
									>
										<span
											className="font-mono font-bold text-sm shrink-0"
											style={{ color: primary }}
										>
											{cod}
										</span>
										<span className="font-semibold text-xs text-gray-800 truncate flex-1">
											{String(rec.descricao ?? "").trim()}
										</span>
										<svg
											className="w-3.5 h-3.5 shrink-0 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											onClick={(e) => {
												e.stopPropagation();
												handleEditCateg(rec);
											}}
										>
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
										</svg>
									</div>

									{/* Estatísticas */}
									<div className="grid grid-cols-2 gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-gray-600">
										<div className="flex justify-between">
											<span className="text-gray-400">
												Contratos
											</span>
											<span className="font-medium text-gray-700">
												{totalContratos > 0 ? (
													totalContratos
												) : (
													<span className="text-gray-300">
														—
													</span>
												)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">
												Participantes
											</span>
											<span className="font-medium text-gray-700">
												{totalPartic > 0 ? (
													totalPartic
												) : (
													<span className="text-gray-300">
														—
													</span>
												)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">
												{Number(rec.vlmensal) < 0
													? "Desconto"
													: "Valor Adicional"}
											</span>
											<span className="font-medium text-gray-700">
												{rec.vlmensal ? (
													formatCurrency(
														Number(rec.vlmensal),
													)
												) : (
													<span className="text-gray-300">
														—
													</span>
												)}
											</span>
										</div>
										<div className="flex justify-between items-start gap-1">
											<span className="text-gray-400 whitespace-nowrap shrink-0">
												Ajuste
											</span>
											<div className="text-right">
												<span
													className="font-semibold cursor-help block"
													style={{ color: primary }}
													title={
														[
															"Este valor não é o custo do plano.",
															"Na geração de cobrança o sistema parte do valor da circular e aplica estes ajustes contrato por contrato.",
															"",
															rec.vljoia
																? `Valor de Adesão: ${formatCurrency(Number(rec.vljoia))}`
																: null,
															rec.vlmensal
																? `${Number(rec.vlmensal) < 0 ? "Desconto" : "Valor Adicional"}: ${formatCurrency(Number(rec.vlmensal))}`
																: null,
															rec.vldepend
																? `Por Inscrito no Contrato: ${formatCurrency(Number(rec.vldepend))}`
																: null,
														]
															.filter(
																(v) =>
																	v !== null,
															)
															.join("\n") ||
														undefined
													}
												>
													{rec.vltotal ? (
														formatCurrency(
															Number(rec.vltotal),
														)
													) : (
														<span className="text-gray-300 font-normal">
															—
														</span>
													)}
												</span>
												<span className="text-[10px] text-gray-300">
													não é o custo do plano
												</span>
											</div>
										</div>
									</div>

									{/* ── Grupos ── */}
									<div
										className="border-t px-4 pb-4 pt-3"
										style={{
											borderColor: `${primary}22`,
											background: `${primary}07`,
										}}
										onClick={(e) => e.stopPropagation()}
										onDoubleClick={(e) =>
											e.stopPropagation()
										}
									>
										<div className="flex items-center justify-between mb-3">
											<span
												className="text-xs font-semibold uppercase pl-4 tracking-wide"
												style={{ color: primary }}
											>
												Grupos ({grupos.length})
											</span>
											<button
												onClick={() =>
													handleNewGrupo(cod)
												}
												className="text-xs text-white rounded px-2.5 py-1 font-medium transition-colors"
												style={{
													backgroundColor: primary,
												}}
											>
												+ Novo Grupo
											</button>
										</div>

										{grupos.length === 0 ? (
											<p className="text-xs text-gray-400 italic py-1">
												Nenhum grupo cadastrado para
												esta categoria.
											</p>
										) : (
											<div className="flex flex-col gap-2">
												{grupos.map((g) => {
													const gcod = String(
														g.grup,
													).trim();
													const live =
														statsPorGrupo.get(gcod);
													const contratVivo =
														live?.contrat ??
														Number(g.contrat) ??
														0;
													const particVivo =
														live?.partic ??
														Number(g.partic) ??
														0;
													const isGrupHighlighted =
														highlightedGrupo ===
														gcod;

													return (
														<div
															key={gcod}
															className="rounded-lg border px-3 py-2 text-xs cursor-pointer select-none transition-all duration-200"
															style={{
																borderColor:
																	isGrupHighlighted
																		? "#86efac"
																		: "#e0e7ef",
																background:
																	isGrupHighlighted
																		? "#dcfce7"
																		: "#fff",
																boxShadow:
																	isGrupHighlighted
																		? "0 0 0 2px #86efac"
																		: undefined,
															}}
															onClick={() => {
																if (!isSelected)
																	setExpandedClasse(
																		cod,
																	);
															}}
															onDoubleClick={() =>
																handleEditGrupo(
																	g,
																)
															}
															onMouseEnter={(
																e,
															) => {
																if (
																	!isGrupHighlighted
																)
																	(
																		e.currentTarget as HTMLElement
																	).style.background =
																		"#dbeafe";
															}}
															onMouseLeave={(
																e,
															) => {
																if (
																	!isGrupHighlighted
																)
																	(
																		e.currentTarget as HTMLElement
																	).style.background =
																		"#fff";
															}}
														>
															<div className="flex items-center justify-between gap-3 text-gray-600">
																<span
																	className="font-mono font-bold text-sm shrink-0"
																	style={{
																		color: primary,
																	}}
																>
																	{gcod}
																</span>
																<div className="flex items-center gap-3 text-xs">
																	<span className="text-gray-400">
																		Contratos{" "}
																		<span className="font-medium text-gray-700">
																			{contratVivo ||
																				"—"}
																		</span>
																	</span>
																	<span className="text-gray-400">
																		Participantes{" "}
																		<span className="font-medium text-gray-700">
																			{particVivo ||
																				"—"}
																		</span>
																	</span>
																	<svg
																		className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer shrink-0"
																		viewBox="0 0 24 24"
																		fill="none"
																		stroke="currentColor"
																		strokeWidth="2"
																		onClick={(
																			e,
																		) => {
																			e.stopPropagation();
																			handleEditGrupo(
																				g,
																			);
																		}}
																	>
																		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
																		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
																	</svg>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										)}
									</div>
								</div>
							</Fragment>
						);
					})}
				</div>
			)}

			{/* ══ Modal — Categoria ════════════════════════════════════════════════ */}
			{(() => {
				const contratoCount = (
					gruposPorClasse.get(String(formCateg.classcod).trim()) ?? []
				).reduce(
					(s, g) =>
						s +
						(statsPorGrupo.get(String(g.grup).trim())?.contrat ??
							Number(g.contrat) ??
							0),
					0,
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

			{/* ══ Modal — Grupo ════════════════════════════════════════════════════ */}
			{(() => {
				const grupCod = String(formGrupo.grup).trim();
				const live = statsPorGrupo.get(grupCod);
				const participRecords = (gruposTable?.records ?? []).filter(
					(r) =>
						!r._deleted && String(r.grupo ?? "").trim() === grupCod,
				);
				return (
					<GrupoWizardModal
						isOpen={modalGrupo}
						onClose={() => {
							setModalGrupo(false);
							setSaveError("");
						}}
						onSave={handleSaveGrupo}
						editing={!!editingGrupo}
						form={formGrupo}
						set={setG}
						classeOpts={classeOpts}
						liveContrat={live?.contrat ?? formGrupo.contrat}
						livePartic={live?.partic ?? formGrupo.partic}
						participRecords={participRecords}
						saving={saving}
						saveError={saveError}
						primary={primary}
					/>
				);
			})()}
		</div>
	);
}
