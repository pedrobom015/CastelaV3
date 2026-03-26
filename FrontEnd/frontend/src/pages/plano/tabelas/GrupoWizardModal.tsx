/**
 * GrupoWizardModal — modal compartilhado entre GruposPage e Categorias.
 * USE_WIZARD = true  → layout wizard com etapas
 * USE_WIZARD = false → layout clássico (formulário único)
 */

const USE_WIZARD = true;

import { useState } from "react";
import type { DbfRecord } from "../../../types/models";
import { Modal } from "../../../components/common/Modal";
import { Btn } from "../../../components/common/PageHeader";
import { DataTable, type Column } from "../../../components/common/DataTable";
import { type ArqgrupRec, GrupoFormFields } from "./GrupoFormFields";
import { FormInput, FormSelect } from "../../../components/common/FormField";

// ─── Colunas de participantes (chaves corretas de GRUPOS.DBF) ─────────────────

const PARTICIP_COLS: Column[] = [
	{ key: "codigo", label: "Contrato", width: "100px", align: "center" },
	{ key: "nome", label: "Nome", width: "200px" },
	{ key: "tipcont", label: "Categoria", width: "80px", align: "center" },
	{ key: "saitxa", label: "Ini. Cobrança", width: "110px", align: "center" },
	{ key: "nrdepend", label: "Depend.", width: "80px", align: "center" },
	{ key: "situacao", label: "Situação", width: "80px", align: "center" },
];

// ─── Etapas ───────────────────────────────────────────────────────────────────

type StepId = "ident-partic" | "regras-circular";

const STEPS: {
	id: StepId;
	label: string;
	subtitle: string;
	icon: React.ReactNode;
}[] = [
	{
		id: "ident-partic",
		label: "Identificação e Participantes",
		subtitle:
			"Dados do grupo, intervalo de contratos e contratos vinculados",
		icon: <IcoUsers />,
	},
	{
		id: "regras-circular",
		label: "Regras e Circular",
		subtitle:
			"Regras de emissão, remissão e controle da circular de cobrança",
		icon: <IcoShield />,
	},
];

// ─── Helpers visuais ─────────────────────────────────────────────────────────

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

function Hint({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs text-gray-400 italic mt-0.5 leading-tight">
			{children}
		</p>
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
				className="relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
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
function IcoUsers() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}
function IcoShield() {
	return (
		<svg
			className="w-4 h-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
		>
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

export interface GrupoWizardModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	editing: boolean;
	form: ArqgrupRec;
	set: (
		field: keyof ArqgrupRec,
		value: string | number | Date | null,
	) => void;
	classeOpts: { value: string; label: string }[];
	liveContrat: number;
	livePartic: number;
	participRecords: DbfRecord[];
	saving: boolean;
	saveError: string;
	primary: string;
}

// ─── Layout clássico (formulário único) ──────────────────────────────────────

function GrupoModalClassico({
	isOpen,
	onClose,
	onSave,
	editing,
	form,
	set,
	classeOpts,
	liveContrat,
	livePartic,
	saving,
	saveError,
	primary,
}: Omit<GrupoWizardModalProps, "participRecords">) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={
				editing
					? `Editar Grupo — ${String(form.grup).trim()}`
					: "Novo Grupo"
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
			<GrupoFormFields
				form={form}
				set={set}
				classeOpts={classeOpts}
				liveContrat={liveContrat}
				livePartic={livePartic}
			/>
			{saveError && (
				<p className="text-sm text-red-600 mt-2">{saveError}</p>
			)}
		</Modal>
	);
}

// ─── Componente público — alterna entre os dois layouts ───────────────────────

export function GrupoWizardModal(props: GrupoWizardModalProps) {
	if (!USE_WIZARD) return <GrupoModalClassico {...props} />;
	return <GrupoModalWizard {...props} />;
}

// ─── Layout wizard ────────────────────────────────────────────────────────────

function GrupoModalWizard({
	isOpen,
	onClose,
	onSave,
	editing,
	form,
	set,
	classeOpts,
	liveContrat,
	livePartic,
	participRecords,
	saving,
	saveError,
	primary,
}: GrupoWizardModalProps) {
	const [stepIdx, setStepIdx] = useState(0);
	const grupCod = String(form.grup).trim();
	const emissaoVal =
		form.emissao_ instanceof Date
			? form.emissao_.toISOString().split("T")[0]
			: "";

	if (!isOpen && stepIdx !== 0) setStepIdx(0);

	function renderStep() {
		switch (STEPS[stepIdx].id) {
			case "ident-partic":
				return (
					<div className="space-y-5">
						{/* Stats resumo */}
						<div className="grid grid-cols-3 gap-3">
							<div className="flex flex-col items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Contratos
								</span>
								<span className="text-xl font-bold text-slate-700">
									{liveContrat}
								</span>
							</div>
							<div className="flex flex-col items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Participantes
								</span>
								<span className="text-xl font-bold text-slate-700">
									{livePartic}
								</span>
							</div>
							<div className="flex flex-col items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
								<span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
									Proc. Pendentes
								</span>
								<span className="text-xl font-bold text-slate-700">
									{form.procpend}
								</span>
							</div>
						</div>

						{/* Dados do grupo */}
						<div>
							<SectionTitle>Dados do Grupo</SectionTitle>
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormInput
										label="Código do Grupo"
										value={form.grup}
										onChange={(e) =>
											set("grup", e.target.value)
										}
										maxLength={2}
										required
										disabled
									/>
									<FormSelect
										label="Categoria Padrão"
										value={form.classe}
										onChange={(e) =>
											set("classe", e.target.value)
										}
										options={classeOpts}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<FormInput
											label="Nº Inicial de Contratos"
											value={form.inicio}
											onChange={(e) =>
												set("inicio", e.target.value)
											}
											maxLength={9}
										/>
										<Hint>
											Primeiro contrato pertencente a este
											grupo
										</Hint>
									</div>
									<div>
										<FormInput
											label="Nº Final de Contratos"
											value={form.final}
											onChange={(e) =>
												set("final", e.target.value)
											}
											maxLength={9}
										/>
										<Hint>
											Último contrato pertencente a este
											grupo
										</Hint>
									</div>
								</div>
							</div>
						</div>

						{/* Participantes */}
						<div>
							<SectionTitle>
								Contratos Vinculados
								{participRecords.length > 0 && (
									<span className="ml-2 text-slate-500 normal-case font-normal">
										— {participRecords.length} encontrado(s)
									</span>
								)}
							</SectionTitle>
							{participRecords.length === 0 ? (
								<p className="text-sm text-slate-400 py-8 text-center">
									Nenhum contrato encontrado para este grupo.
								</p>
							) : (
								<DataTable
									columns={PARTICIP_COLS}
									data={participRecords}
									pageSize={5}
								/>
							)}
						</div>
					</div>
				);

			case "regras-circular":
				return (
					<div className="space-y-7">
						{/* Regras de emissão */}
						<div>
							<SectionTitle>Regras de Emissão</SectionTitle>
							<div className="space-y-4">
								<div className="grid grid-cols-4 gap-4">
									<div>
										<FormInput
											label="Qt. p/ Emitir"
											type="number"
											min={0}
											value={String(form.acumproc)}
											onChange={(e) =>
												set(
													"acumproc",
													parseInt(e.target.value) ||
														0,
												)
											}
										/>
										<Hint>
											Emite recibo ao acumular N processos
										</Hint>
									</div>
									<div>
										<FormInput
											label="Máx. Pendentes"
											type="number"
											min={0}
											value={String(form.maxproc)}
											onChange={(e) =>
												set(
													"maxproc",
													parseInt(e.target.value) ||
														0,
												)
											}
										/>
										<Hint>
											Bloqueia acima de N pendentes
										</Hint>
									</div>
									<div>
										<FormInput
											label="Período Mín. (dias)"
											type="number"
											min={0}
											value={String(form.periodic)}
											onChange={(e) =>
												set(
													"periodic",
													parseInt(e.target.value) ||
														0,
												)
											}
										/>
										<Hint>
											Intervalo mínimo entre circulares
										</Hint>
									</div>
									<div>
										<FormInput
											label="Qt. Taxas Remissão"
											type="number"
											min={0}
											value={String(form.qtdremir)}
											onChange={(e) =>
												set(
													"qtdremir",
													parseInt(e.target.value) ||
														0,
												)
											}
										/>
										<Hint>
											Taxas pagas p/ isenção de cobrança
										</Hint>
									</div>
								</div>
								<Toggle
									checked={form.cpadmiss === "S"}
									onChange={(v) =>
										set("cpadmiss", v ? "S" : "N")
									}
									label="Comparar Admissão & Atendimento"
									hint="Verifica a data de admissão antes de autorizar o atendimento"
									primary={primary}
								/>
							</div>
						</div>

						{/* Circular de cobrança */}
						<div className="pt-2">
							<SectionTitle>Circular de Cobrança</SectionTitle>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<FormInput
										label="Última Circular"
										value={form.ultcirc}
										onChange={(e) =>
											set("ultcirc", e.target.value)
										}
										maxLength={3}
									/>
									<Hint>
										Última circular emitida para este grupo
									</Hint>
								</div>
								<div>
									<FormInput
										label="Próxima Circular"
										value={form.proxcirc}
										onChange={(e) =>
											set("proxcirc", e.target.value)
										}
										maxLength={3}
									/>
									<Hint>
										Número da próxima circular a emitir
									</Hint>
								</div>
								<div>
									<FormInput
										label="Data de Emissão"
										type="date"
										value={emissaoVal}
										onChange={(e) =>
											set(
												"emissao_",
												e.target.value
													? new Date(
															e.target.value +
																"T00:00:00",
														)
													: null,
											)
										}
									/>
									<Hint>
										Data da última emissão registrada
									</Hint>
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
				style={{ height: "min(82vh, 680px)" }}
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
								{editing ? `Grupo ${grupCod}` : "Novo Grupo"}
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
							{liveContrat}
						</p>
					</div>
				</div>

				{/* ── Conteúdo ── */}
				<div className="flex-1 flex flex-col min-h-0 bg-white">
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

					<div className="flex-1 overflow-y-auto px-8 pl-6 pr-6 pb-6 pt-2">
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
									{saving ? "Salvando..." : "Confirmar Grupo"}{" "}
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
