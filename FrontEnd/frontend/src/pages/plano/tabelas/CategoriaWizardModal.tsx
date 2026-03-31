/**
 * CategoriaWizardModal — modal compartilhado para Categorias.
 * USE_WIZARD = true  → layout wizard com etapas
 * USE_WIZARD = false → layout clássico (formulário único)
 */

const USE_WIZARD = true;

import { useState } from "react";
import type { DbfRecord } from "../../../types/models";
import { Modal } from "../../../components/common/Modal";
import { Btn } from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSelect,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";

// ─── Tipo e factory ───────────────────────────────────────────────────────────

export type ClasseRec = DbfRecord & {
	classcod: string;
	descricao: string;
	contrat: number;
	prior: string;
	vljoia: number;
	nrparc: number;
	parcger: number;
	vlmensal: number;
	vldepend: number;
	nrmesval: number;
	renvenc: string;
	renuso: string;
	vltotal: number;
	mensag1: string;
	mensag2: string;
};

export function emptyCateg(): ClasseRec {
	return {
		classcod: "",
		descricao: "",
		contrat: 0,
		prior: "",
		vljoia: 0,
		nrparc: 0,
		parcger: 0,
		vlmensal: 0,
		vldepend: 0,
		nrmesval: 0,
		renvenc: "",
		renuso: "",
		vltotal: 0,
		mensag1: "",
		mensag2: "",
	};
}

// ─── Currency helpers ─────────────────────────────────────────────────────────

export function maskCurrency(raw: string): string {
	const digits = raw.replace(/\D/g, "");
	if (!digits) return "";
	return (parseInt(digits, 10) / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function maskCurrencyAdicional(raw: string): string {
	const isNeg = raw.startsWith("-") || raw.endsWith("-");
	const digits = raw.replace(/\D/g, "");
	if (!digits) return isNeg ? "-" : "";
	const fmt = (parseInt(digits, 10) / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
	return isNeg ? "-" + fmt : fmt;
}

export function numberToMask(value: number): string {
	if (!value) return "";
	return Math.abs(value).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function parseCurrency(formatted: string): number {
	if (!formatted || formatted === "-") return 0;
	const isNeg = formatted.startsWith("-");
	const val =
		parseFloat(formatted.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
	return isNeg ? -Math.abs(val) : val;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const SIM_NAO_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "S", label: "S - Sim" },
	{ value: "N", label: "N - Não" },
];

const inputCls =
	"border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
const labelCls = "text-sm font-medium text-gray-700";

function Hint({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs text-gray-400 italic mt-0.5 leading-tight">
			{children}
		</p>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex items-center gap-2 mb-4">
			<span className="text-xs font-bold uppercase tracking-widest text-slate-400">
				{children}
			</span>
			<div className="flex-1 h-px bg-slate-100" />
		</div>
	);
}

function Toggle({
	checked,
	onChange,
	label,
	hint,
	primary,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
	hint?: string;
	primary: string;
}) {
	return (
		<div className="flex items-start justify-between gap-4 p-4 border border-slate-100 rounded-2xl">
			<div className="flex-1">
				<p className="text-sm font-medium text-slate-700">{label}</p>
				{hint && (
					<p className="text-xs text-slate-400 italic mt-0.5 leading-tight">
						{hint}
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={() => onChange(!checked)}
				className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1`}
				style={{
					backgroundColor: checked ? primary : "#e2e8f0",
					boxShadow: checked ? `0 0 0 2px ${primary}33` : undefined,
				}}
				aria-checked={checked}
				role="switch"
			>
				<span
					className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
						checked ? "translate-x-6" : "translate-x-1"
					}`}
				/>
			</button>
		</div>
	);
}

// ─── Etapas ───────────────────────────────────────────────────────────────────

type StepId = "plano-valores" | "parcelas-mensagens";

const STEPS: {
	id: StepId;
	label: string;
	subtitle: string;
	icon: React.ReactNode;
}[] = [
	{
		id: "plano-valores",
		label: "Plano e Cobrança",
		subtitle: "Tipo de cobrança, taxas e valores do plano",
		icon: <IcoDollar />,
	},
	{
		id: "parcelas-mensagens",
		label: "Parcelas e Avisos",
		subtitle: "Parcelamento da jóia, renovação automática e mensagens",
		icon: <IcoRefresh />,
	},
];

// ─── Ícones ───────────────────────────────────────────────────────────────────

function IcoSettings() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.07 4.93a10 10 0 0 0-14.14 0M4.93 19.07a10 10 0 0 0 14.14 0" />
		</svg>
	);
}
function IcoDollar() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<line x1="12" y1="1" x2="12" y2="23" />
			<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
		</svg>
	);
}
function IcoRefresh() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<polyline points="23 4 23 10 17 10" />
			<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
		</svg>
	);
}

function IcoCheck() {
	return (
		<svg
			className="w-3.5 h-3.5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#10b981"
			strokeWidth="2.5"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}
function IcoChevronLeft() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<polyline points="15 18 9 12 15 6" />
		</svg>
	);
}
function IcoChevronRight() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
	);
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CategoriaWizardModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	editing: boolean;
	form: ClasseRec;
	setC: (field: keyof ClasseRec, value: string | number) => void;
	strVljoia: string;
	setStrVljoia: (v: string) => void;
	strVladicional: string;
	setStrVladicional: (v: string) => void;
	strVldepend: string;
	setStrVldepend: (v: string) => void;
	totalFormatted: string;
	contratoCount: number;
	saving: boolean;
	saveError: string;
	primary: string;
}

// ─── Layout clássico ──────────────────────────────────────────────────────────

function CategoriaModalClassico({
	isOpen,
	onClose,
	onSave,
	editing,
	form,
	setC,
	strVljoia,
	setStrVljoia,
	strVladicional,
	setStrVladicional,
	strVldepend,
	setStrVldepend,
	totalFormatted,
	contratoCount,
	saving,
	saveError,
	primary,
}: CategoriaWizardModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={
				editing
					? `Editar Categoria — ${form.classcod}`
					: "Nova Categoria"
			}
			footer={
				<>
					<Btn variant="secondary" onClick={onClose}>
						Cancelar
					</Btn>
					<Btn
						onClick={onSave}
						disabled={saving}
						style={{
							backgroundColor: primary,
							borderColor: primary,
						}}
					>
						{saving ? "Salvando..." : "Salvar"}
					</Btn>
				</>
			}
		>
			<FormSection title="Identificação">
				<FormRow cols={2}>
					<FormInput
						label="Código"
						value={form.classcod}
						onChange={(e) => setC("classcod", e.target.value)}
						maxLength={2}
						required
						disabled
					/>
					<FormInput
						label="Descrição"
						value={form.descricao}
						onChange={(e) => setC("descricao", e.target.value)}
						maxLength={35}
						required
					/>
				</FormRow>
				<FormRow cols={2}>
					<div>
						<FormSelect
							label="Cobrança por período?"
							value={form.prior}
							onChange={(e) => setC("prior", e.target.value)}
							options={SIM_NAO_OPTS}
						/>
						<Hint>
							Sim = cobra por intervalo · Não = cobra por
							utilização
						</Hint>
					</div>
					<div>
						<FormInput
							label="Nº Contratos"
							type="number"
							value={String(contratoCount)}
							disabled
							readOnly
						/>
						<Hint>
							Calculado automaticamente a partir dos grupos
							vinculados
						</Hint>
					</div>
				</FormRow>
			</FormSection>
			<FormSection title="Valores">
				<FormRow cols={4}>
					<div>
						<label className={labelCls}>Vl. Jóia</label>
						<input
							className={inputCls}
							value={strVljoia}
							onChange={(e) =>
								setStrVljoia(maskCurrency(e.target.value))
							}
							placeholder="R$ 0,00"
						/>
						<Hint>Taxa de adesão cobrada uma única vez</Hint>
					</div>
					<div>
						<label className={labelCls}>
							{strVladicional.startsWith("-") ? (
								<>
									<span className="text-red-600">
										Desconto
									</span>{" "}
									<span className="text-xs font-normal text-gray-400">
										(+ para vl. adicional)
									</span>
								</>
							) : (
								<>
									Vl. Adicional{" "}
									<span className="text-xs font-normal text-gray-400">
										(- para desconto)
									</span>
								</>
							)}
						</label>
						<input
							className={inputCls}
							value={strVladicional}
							onChange={(e) =>
								setStrVladicional(
									maskCurrencyAdicional(e.target.value),
								)
							}
							placeholder="R$ 0,00"
						/>
						<Hint>Acréscimo (+) ou desconto (-) fixo</Hint>
					</div>
					<div>
						<label className={labelCls}>p/Dependente</label>
						<input
							className={inputCls}
							value={strVldepend}
							onChange={(e) =>
								setStrVldepend(maskCurrency(e.target.value))
							}
							placeholder="R$ 0,00"
						/>
						<Hint>Valor por dependente incluso</Hint>
					</div>
					<div>
						<label className={labelCls}>Total</label>
						<input
							className="border border-gray-300 rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed mt-0.5"
							value={totalFormatted}
							readOnly
							tabIndex={-1}
						/>
						<Hint>
							Soma: Jóia + Adicional + Depend. Aplicado por
							contrato na geração.
						</Hint>
					</div>
				</FormRow>
			</FormSection>
			<FormSection title="Parcelas e Renovação">
				<FormRow cols={3}>
					<div>
						<FormInput
							label="Nº Parcelas"
							type="number"
							min={0}
							value={String(form.nrparc)}
							onChange={(e) =>
								setC("nrparc", parseInt(e.target.value) || 0)
							}
						/>
						<Hint>Parcelas para pagamento da jóia</Hint>
					</div>
					<div>
						<FormInput
							label="1ª a Gerar"
							type="number"
							min={0}
							value={String(form.parcger)}
							onChange={(e) =>
								setC("parcger", parseInt(e.target.value) || 0)
							}
						/>
						<Hint>Número da primeira parcela a ser gerada</Hint>
					</div>
					<div>
						<FormInput
							label="Validade (meses)"
							type="number"
							min={0}
							value={String(form.nrmesval)}
							onChange={(e) =>
								setC("nrmesval", parseInt(e.target.value) || 0)
							}
						/>
						<Hint>Duração máxima do contrato em meses</Hint>
					</div>
				</FormRow>
				<FormRow cols={2}>
					<div>
						<FormSelect
							label="Renov. no Vencimento"
							value={form.renvenc}
							onChange={(e) => setC("renvenc", e.target.value)}
							options={SIM_NAO_OPTS}
						/>
						<Hint>Renova ao atingir o prazo de vencimento</Hint>
					</div>
					<div>
						<FormSelect
							label="Renov. na Utilização"
							value={form.renuso}
							onChange={(e) => setC("renuso", e.target.value)}
							options={SIM_NAO_OPTS}
						/>
						<Hint>Renova ao registrar um atendimento</Hint>
					</div>
				</FormRow>
			</FormSection>
			<FormSection title="Mensagens">
				<FormRow cols={2}>
					<FormInput
						label="Mensagem 1"
						value={form.mensag1 ?? ""}
						onChange={(e) => setC("mensag1", e.target.value)}
						maxLength={55}
					/>
					<FormInput
						label="Mensagem 2"
						value={form.mensag2 ?? ""}
						onChange={(e) => setC("mensag2", e.target.value)}
						maxLength={55}
					/>
				</FormRow>
			</FormSection>
			{saveError && (
				<p className="text-sm text-red-600 mt-2">{saveError}</p>
			)}
		</Modal>
	);
}

// ─── Componente público ───────────────────────────────────────────────────────

export function CategoriaWizardModal(props: CategoriaWizardModalProps) {
	if (!USE_WIZARD) return <CategoriaModalClassico {...props} />;
	return <CategoriaModalWizard {...props} />;
}

// ─── Layout wizard ────────────────────────────────────────────────────────────

function CategoriaModalWizard({
	isOpen,
	onClose,
	onSave,
	editing,
	form,
	setC,
	strVljoia,
	setStrVljoia,
	strVladicional,
	setStrVladicional,
	strVldepend,
	setStrVldepend,
	totalFormatted,
	contratoCount,
	saving,
	saveError,
	primary,
}: CategoriaWizardModalProps) {
	const [stepIdx, setStepIdx] = useState(0);
	const classCod = String(form.classcod).trim();

	if (!isOpen && stepIdx !== 0) setStepIdx(0);

	function renderStep() {
		switch (STEPS[stepIdx].id) {
			case "plano-valores":
				return (
					<div className="space-y-7">
						{/* Identificação */}
						<div>
							<SectionTitle>Identificação do Plano</SectionTitle>
							<div className="space-y-4">
								<FormRow cols={2}>
									<FormInput
										label="Código"
										value={form.classcod}
										onChange={(e) =>
											setC("classcod", e.target.value)
										}
										maxLength={2}
										required
										disabled
									/>
									<FormInput
										label="Descrição do Plano"
										value={form.descricao}
										onChange={(e) =>
											setC("descricao", e.target.value)
										}
										maxLength={35}
										required
									/>
								</FormRow>
								<Toggle
									checked={form.prior === "S"}
									onChange={(v) =>
										setC("prior", v ? "S" : "N")
									}
									label="Cobrança por período fixo (mensal)"
									hint="Ativado = cobra mensalmente · Desativado = cobra por utilização/atendimento"
									primary={primary}
								/>
							</div>
						</div>

						{/* Valores */}
						<div>
							<SectionTitle>Valores da Cobrança</SectionTitle>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<label className={labelCls}>
										Valor de Adesão (Jóia)
									</label>
									<input
										className={inputCls + " mt-0.5"}
										value={strVljoia}
										onChange={(e) =>
											setStrVljoia(
												maskCurrency(e.target.value),
											)
										}
										placeholder="R$ 0,00"
									/>
									<Hint>
										Taxa de adesão — cobrada uma única vez
									</Hint>
								</div>
								<div>
									<label className={labelCls}>
										{strVladicional.startsWith("-") ? (
											<>
												<span className="text-red-600">
													Desconto
												</span>{" "}
												<span className="text-xs font-normal text-gray-400">
													(+ para valor adicional)
												</span>
											</>
										) : (
											<>
												Valor Adicional{" "}
												<span className="text-xs font-normal text-gray-400">
													(- para desconto)
												</span>
											</>
										)}
									</label>
									<input
										className={inputCls + " mt-0.5"}
										value={strVladicional}
										onChange={(e) =>
											setStrVladicional(
												maskCurrencyAdicional(
													e.target.value,
												),
											)
										}
										placeholder="R$ 0,00"
									/>
									<Hint>
										Acréscimo (+) ou desconto (-) fixo
									</Hint>
								</div>
								<div>
									<label className={labelCls}>
										Por Inscrito no Contrato
									</label>
									<input
										className={inputCls + " mt-0.5"}
										value={strVldepend}
										onChange={(e) =>
											setStrVldepend(
												maskCurrency(e.target.value),
											)
										}
										placeholder="R$ 0,00"
									/>
									<Hint>
										Valor por inscrito registrado no
										contrato
									</Hint>
								</div>
							</div>

							{/* Ajuste total */}
							{/* 				<div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
								<div className="flex items-center justify-between px-4 py-3 bg-slate-50">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Total
									</span>
									<span className="text-base font-bold text-slate-700">
										{totalFormatted || "R$ 0,00"}
									</span>
								</div>
								<div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
									<p className="text-xs text-amber-700 leading-snug">
										Este valor{" "}
										<strong>não é o custo do plano</strong>.
										Na geração de cobrança, o sistema parte
										do valor definido na circular ou
										informado na tela — e aplica os ajustes
										desta categoria contrato por contrato
										(acréscimo ou desconto).
									</p>
								</div>
							</div> */}
						</div>
					</div>
				);

			case "parcelas-mensagens":
				return (
					<div className="space-y-7">
						{/* Parcelas da Jóia */}
						<div>
							<SectionTitle>Parcelamento da Jóia</SectionTitle>
							<FormRow cols={3}>
								<div>
									<FormInput
										label="Nº de Parcelas"
										type="number"
										min={0}
										value={String(form.nrparc)}
										onChange={(e) =>
											setC(
												"nrparc",
												parseInt(e.target.value) || 0,
											)
										}
									/>
									<Hint>
										Total de parcelas para quitar a jóia
									</Hint>
								</div>
								<div>
									<FormInput
										label="1ª Parcela a Gerar"
										type="number"
										min={0}
										value={String(form.parcger)}
										onChange={(e) =>
											setC(
												"parcger",
												parseInt(e.target.value) || 0,
											)
										}
									/>
									<Hint>
										Número da primeira parcela gerada
									</Hint>
								</div>
								<div>
									<FormInput
										label="Validade do Plano (meses)"
										type="number"
										min={0}
										value={String(form.nrmesval)}
										onChange={(e) =>
											setC(
												"nrmesval",
												parseInt(e.target.value) || 0,
											)
										}
									/>
									<Hint>Duração máxima do contrato</Hint>
								</div>
							</FormRow>
						</div>

						{/* Renovação Automática */}
						<div>
							<SectionTitle>Renovação Automática</SectionTitle>
							<div className="grid grid-cols-2 gap-3">
								<Toggle
									checked={form.renvenc === "S"}
									onChange={(v) =>
										setC("renvenc", v ? "S" : "N")
									}
									label="Renovar no Vencimento"
									hint="Renova automaticamente ao atingir o prazo"
									primary={primary}
								/>
								<Toggle
									checked={form.renuso === "S"}
									onChange={(v) =>
										setC("renuso", v ? "S" : "N")
									}
									label="Renovar na Utilização"
									hint="Renova automaticamente ao registrar atendimento"
									primary={primary}
								/>
							</div>
						</div>

						{/* Mensagens */}
						<div>
							<SectionTitle>Avisos ao Contratante</SectionTitle>
							<div className="space-y-4">
								<div>
									<FormInput
										label="Mensagem Principal"
										value={form.mensag1 ?? ""}
										onChange={(e) =>
											setC("mensag1", e.target.value)
										}
										maxLength={55}
									/>
									<Hint>
										Exibida na comunicação com o contratante
									</Hint>
								</div>
								<div>
									<FormInput
										label="Mensagem Complementar"
										value={form.mensag2 ?? ""}
										onChange={(e) =>
											setC("mensag2", e.target.value)
										}
										maxLength={55}
									/>
									<Hint>Instrução ou aviso adicional</Hint>
								</div>
							</div>
						</div>
					</div>
				);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title=""
			hideHeader
			noPadding
			size="xl"
		>
			<div
				className="flex flex-row overflow-hidden"
				style={{ height: "min(82vh, 700px)" }}
			>
				{/* ── Sidebar ── */}
				<div className="w-64 shrink-0 bg-white border-r border-slate-100 p-6 flex flex-col gap-2">
					<div className="flex items-center gap-3 mb-6">
						<div
							className="p-2 rounded-xl text-white shadow-lg"
							style={{ backgroundColor: primary }}
						>
							<IcoSettings />
						</div>
						<div>
							<h2 className="font-bold text-slate-800 leading-tight text-sm">
								{editing
									? `Categoria ${classCod}`
									: "Nova Categoria"}
							</h2>
							<p className="text-xs text-slate-400 font-medium">
								Configuração Geral
							</p>
						</div>
					</div>

					<nav className="flex flex-col gap-1">
						{STEPS.map((step, idx) => {
							const active = stepIdx === idx;
							const done = idx < stepIdx;
							return (
								<button
									key={step.id}
									onClick={() => setStepIdx(idx)}
									className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold text-left border-l-4 ${
										active
											? "bg-blue-50 shadow-sm"
											: "border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
									}`}
									style={
										active
											? {
													color: primary,
													borderColor: primary,
												}
											: undefined
									}
								>
									<span
										style={{
											color: active
												? primary
												: done
													? "#10b981"
													: "#94a3b8",
										}}
									>
										{step.icon}
									</span>
									<span className="flex-1">{step.label}</span>
									{done && <IcoCheck />}
								</button>
							);
						})}
					</nav>

					<div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
						<p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
							Contratos Vinculados
						</p>
						<p className="text-2xl font-bold text-slate-700">
							{contratoCount}
						</p>
					</div>
				</div>

				{/* ── Conteúdo ── */}
				<div className="flex-1 flex flex-col min-h-0 bg-white h-[500px] overflow-auto">
					<div className="shrink-0 px-8 py-6 border-b border-slate-50 flex items-start justify-between">
						<div>
							<h1 className="text-lg font-bold text-slate-800 tracking-tight">
								{STEPS[stepIdx].label}
							</h1>
							<p className="text-sm text-slate-400 mt-1">
								{STEPS[stepIdx].subtitle}
							</p>
						</div>
						<button
							onClick={onClose}
							className="text-slate-300 hover:text-slate-600 transition-colors mt-1"
						>
							<svg
								className="w-5 h-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>

					<div className="flex-1 min-h-0 overflow-y-auto px-8 pl-6 pr-6 pb-6 pt-2">
						{renderStep()}
						{saveError && (
							<p className="text-sm text-red-600 mt-4 p-3 bg-red-50 rounded-xl">
								{saveError}
							</p>
						)}
					</div>

					<div className="shrink-0 px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-white">
						<button
							onClick={() =>
								setStepIdx((i) => Math.max(0, i - 1))
							}
							disabled={stepIdx === 0}
							className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
								stepIdx === 0
									? "text-slate-300 cursor-not-allowed"
									: "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
							}`}
						>
							<IcoChevronLeft /> Voltar
						</button>

						<div className="flex items-center gap-3">
							<button
								onClick={onClose}
								className="px-5 py-2.5 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-800 transition-all"
							>
								Cancelar
							</button>
							{stepIdx < STEPS.length - 1 ? (
								<button
									onClick={() => setStepIdx((i) => i + 1)}
									className="flex items-center gap-2 px-7 py-2.5 rounded-2xl font-bold text-sm text-white transition-all"
									style={{ backgroundColor: primary }}
								>
									Próximo <IcoChevronRight />
								</button>
							) : (
								<button
									onClick={onSave}
									disabled={saving}
									className="flex items-center gap-2 px-7 py-2.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60 transition-all"
									style={{ backgroundColor: primary }}
								>
									{saving
										? "Salvando..."
										: "Confirmar Categoria"}{" "}
									{!saving && <IcoChevronRight />}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
