import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../components/common/Modal";
import { Btn } from "../../../components/common/PageHeader";
import { Toast } from "../../../components/common/Toast";
import { toDateInputValue } from "../../../utils/formatters";
import type { Grupo } from "../../../types/models";
import { useAppStore } from "../../../store/appStore";
import { useThemeStore } from "../../../store/themeStore";
import { ContratoFormTabs } from "./ContratoFormTabs";
import { ContratoHistoricoTabs } from "./ContratoHistoricoTabs";
import { FichaFinanceira } from "./FichaFinanceira";

interface ContratoModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "include" | "edit" | "view";
	initialData: Grupo;
	onSave: (data: Grupo) => Promise<void>;
	saving: boolean;
	onAdendos: () => void;
	onPrint: (data: Grupo) => void;
}

type ActiveTab =
	| "dados"
	| "contrato"
	| "ficha"
	| "atendimentos"
	| "acordos"
	| "adendos"
	| "taxas"
	| "inscritos";

const FORM_TABS = ["dados", "contrato", "ficha"] as const;
const FORM_TAB_LABELS: Record<string, string> = {
	dados: "Dados Pessoais",
	contrato: "Dados do Contrato",
	ficha: "Ficha Financeira",
};
const HIST_TABS = [
	"inscritos",
	"taxas",
	"acordos",
	"adendos",
	"atendimentos",
] as const;
const HIST_TAB_LABELS: Record<string, string> = {
	inscritos: "Inscritos",
	taxas: "Taxas",
	acordos: "Acordos",
	adendos: "Adendos",
	atendimentos: "Atendimentos",
};

export function ContratoModal({
	isOpen,
	onClose,
	mode,
	initialData,
	onSave,
	saving,
	onAdendos,
	onPrint,
}: ContratoModalProps) {
	const { getTable } = useAppStore();
	const cobradorTable = getTable("cobrador");
	const regiaoTable = getTable("regiao");
	const arqgrupTable = getTable("arqgrup");
	const classesTable = getTable("classes");
	const gruposTable = getTable("grupos");

	const vendedorOpts = useMemo(() => {
		const base = [{ value: "", label: "-- Selecione --" }];
		if (!cobradorTable) return base;
		return base.concat(
			cobradorTable.records
				.filter(
					(r) =>
						!r._deleted &&
						String(r.funcao ?? "")
							.trim()
							.toUpperCase() === "V",
				)
				.map((r) => ({
					value: String(r.cobrador ?? "").trim(),
					label: `${String(r.cobrador ?? "").trim()} — ${String(r.nome ?? "").trim()}`,
				}))
				.sort((a, b) => a.value.localeCompare(b.value)),
		);
	}, [cobradorTable]);

	const cobradorOpts = useMemo(() => {
		const base = [{ value: "", label: "-- Selecione --" }];
		if (!cobradorTable) return base;
		return base.concat(
			cobradorTable.records
				.filter(
					(r) =>
						!r._deleted &&
						String(r.funcao ?? "")
							.trim()
							.toUpperCase() === "C",
				)
				.map((r) => ({
					value: String(r.cobrador ?? "").trim(),
					label: `${String(r.cobrador ?? "").trim()} — ${String(r.nome ?? "").trim()}`,
				}))
				.sort((a, b) => a.value.localeCompare(b.value)),
		);
	}, [cobradorTable]);

	const categoriaOpts = useMemo(() => {
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

	const grupoOpts = useMemo(() => {
		const base = [{ value: "", label: "-- Selecione --" }];
		if (!arqgrupTable) return base;
		const descMap = new Map<string, string>();
		(classesTable?.records ?? []).forEach((r) => {
			if (!r._deleted)
				descMap.set(
					String(r.classcod ?? "").trim(),
					String(r.descricao ?? "").trim(),
				);
		});
		return base.concat(
			arqgrupTable.records
				.filter((r) => !r._deleted)
				.map((r) => {
					const grup = String(r.grup ?? "").trim();
					const classe = String(r.classe ?? "").trim();
					const descricao = descMap.get(classe) ?? "";
					const label = descricao ? `${grup} — ${descricao}` : grup;
					return { value: grup, label };
				})
				.sort((a, b) => a.value.localeCompare(b.value)),
		);
	}, [arqgrupTable, classesTable]);

	const regiaoOpts = useMemo(() => {
		const base = [{ value: "", label: "-- Selecione --" }];
		if (!regiaoTable) return base;
		return base.concat(
			regiaoTable.records
				.filter((r) => !r._deleted)
				.map((r) => ({
					value: String(r.codigo ?? "").trim(),
					label: `${String(r.codigo ?? "").trim()} — ${String(r.regiao ?? "").trim()}`,
				}))
				.sort((a, b) => a.value.localeCompare(b.value)),
		);
	}, [regiaoTable]);

	useAppStore((s) => s.tables);
	const theme = useThemeStore((s) => s.theme);
	const primary =
		theme === "orange"
			? "#ff914d"
			: theme === "gray"
				? "#248094"
				: "#1e3a8a";
	const primaryLight =
		theme === "orange"
			? "#fff8f4"
			: theme === "gray"
				? "#f8fafc"
				: "#eff6ff";

	const [form, setForm] = useState<Grupo>(initialData);

	const [activeTab, setActiveTab] = useState<ActiveTab>("dados");
	const [saved, setSaved] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "error" | "warning";
	} | null>(null);

	useEffect(() => {
		if (isOpen) {
			setForm(initialData);
			setActiveTab("dados");
			setSaved(false);
		}
	}, [isOpen, initialData]);

	const isDirty =
		mode === "edit"
			? JSON.stringify(form) !== JSON.stringify(initialData)
			: true;
	const readOnly = mode === "view";

	function setField(field: keyof Grupo, value: unknown) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	function dateKey(field: keyof Grupo) {
		const initVal = toDateInputValue(initialData[field] as Date | null);
		return initVal || `empty-${field}`;
	}

	function dateProps(field: keyof Grupo) {
		const initVal = toDateInputValue(initialData[field] as Date | null);
		return {
			defaultValue: initVal,
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				if (e.target.value)
					setField(field, new Date(e.target.value + "T12:00:00"));
			},
			onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
				if (!e.target.value) setField(field, null);
			},
		};
	}

	async function handleSaveClick() {
		if (submitting || saving) return;

		const codigoPad = String(form.codigo).padStart(9, "0");

		if (mode === "include") {
			const missing: string[] = [];
			if (!String(form.nome ?? "").trim()) missing.push("Nome Completo");
			if (!String(form.grupo ?? "").trim()) missing.push("Grupo");
			if (missing.length > 0) {
				setToast({
					message: `Preencha os campos obrigatórios:\n• ${missing.join("\n• ")}`,
					type: "error",
				});
				return;
			}

			const exists = (gruposTable?.records ?? []).some(
				(r) =>
					!r._deleted && String(r.codigo ?? "").trim() === codigoPad,
			);
			if (exists) {
				setToast({
					message: `Código ${codigoPad} já cadastrado. Escolha outro código.`,
					type: "warning",
				});
				return;
			}
		}

		setSubmitting(true);
		try {
			const dataToSave = { ...form, codigo: codigoPad };
			await onSave(dataToSave);
			if (mode === "include") {
				onClose();
			} else {
				setSaved(true);
				setTimeout(() => setSaved(false), 3000);
			}
		} finally {
			setSubmitting(false);
		}
	}

	const isFormTab = (FORM_TABS as readonly string[]).includes(activeTab);
	const isHistTab = !isFormTab;

	return (
		<>
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title={
					mode === "include" ? (
						<div className="flex flex-col leading-tight">
							<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
								Novo Contrato
							</span>
						</div>
					) : (
						<div className="flex flex-col leading-tight">
							<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
								{mode === "edit"
									? "Contrato"
									: "Consulta Contrato"}
							</span>
							<span className="text-sm font-semibold">
								{String(form.codigo).padStart(9, "0")} —{" "}
								{form.nome}
							</span>
						</div>
					)
				}
				headerExtra={
					mode !== "include" && (
						<button
							onClick={() => onPrint({ ...form })}
							className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-white transition active:scale-95 whitespace-nowrap shadow-sm hover:bg-white/90"
							style={{ color: primary }}
							title="Imprimir Contrato"
						>
							<span>🖨️</span>
							<span className="hidden sm:inline">
								Imprimir Contrato
							</span>
						</button>
					)
				}
				size="full"
				fixedHeight
				footer={
					!readOnly && isFormTab ? (
						<div className="flex items-center justify-end min-h-[38px]">
							{(isDirty || saving || saved || submitting) && (
								<Btn
									onClick={handleSaveClick}
									disabled={saving || saved || submitting}
									variant={saved ? "success" : "primary"}
								>
									{saving || submitting
										? "Salvando..."
										: saved
											? "✓ Salvo"
											: "Salvar"}
								</Btn>
							)}
						</div>
					) : (
						<>
							<Btn variant="secondary" onClick={onClose}>
								Fechar
							</Btn>
						</>
					)
				}
			>
				<div className="flex flex-col relative h-full">
					{/* Tabs */}
					<div className="flex border-b border-gray-200 mb-4 gap-1 flex-wrap flex-shrink-0 bg-white sticky top-[-20px] -mt-[20px] pt-[20px] z-10">
						{FORM_TABS.map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab)}
								className={`px-4 py-2 text-sm capitalize rounded-t transition fixed-width-tab ${
									activeTab === tab
										? "bg-gray-100 text-gray-800 font-bold"
										: "text-gray-600 hover:bg-gray-100 font-medium"
								}`}
								data-text={FORM_TAB_LABELS[tab]}
							>
								{FORM_TAB_LABELS[tab]}
							</button>
						))}

						{mode !== "include" && (
							<>
								<span className="self-end mb-1 mx-1 text-gray-300 text-lg">
									|
								</span>
								{HIST_TABS.map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`px-4 py-2 text-sm rounded-t transition-all fixed-width-tab ${
											activeTab === tab
												? "bg-gray-100 font-bold"
												: "font-medium"
										}`}
										data-text={HIST_TAB_LABELS[tab]}
										style={{
											color: primary,
											backgroundColor:
												activeTab === tab
													? undefined
													: "transparent",
										}}
										onMouseEnter={(e) => {
											if (activeTab !== tab) {
												e.currentTarget.style.backgroundColor =
													primaryLight;
											}
										}}
										onMouseLeave={(e) => {
											if (activeTab !== tab) {
												e.currentTarget.style.backgroundColor =
													"transparent";
											}
										}}
									>
										{HIST_TAB_LABELS[tab]}
									</button>
								))}
							</>
						)}
					</div>

					{/* Conteúdo das abas */}
					{isFormTab && activeTab !== "ficha" && (
						<ContratoFormTabs
							form={form}
							setField={setField}
							dateKey={dateKey}
							dateProps={dateProps}
							readOnly={readOnly}
							activeTab={activeTab as "dados" | "contrato"}
							mode={mode}
							vendedorOpts={vendedorOpts}
							cobradorOpts={cobradorOpts}
							regiaoOpts={regiaoOpts}
						/>
					)}

					{activeTab === "ficha" && (
					<FichaFinanceira
						form={form}
						initialData={initialData}
						setField={setField}
						readOnly={readOnly}
						primary={primary}
						primaryLight={primaryLight}
						grupoOpts={grupoOpts}
						categoriaOpts={categoriaOpts}
					/>
				)}

					{isHistTab && (
						<ContratoHistoricoTabs
							activeTab={
								activeTab as
									| "atendimentos"
									| "acordos"
									| "adendos"
									| "taxas"
									| "inscritos"
							}
							codigo={String(form.codigo)}
							nome={form.nome}
							onAdendos={onAdendos}
						/>
					)}
				</div>
			</Modal>
		</>
	);
}
