/**
 * GrupoFormFields — formulário compartilhado entre Categorias.tsx e GruposPage.tsx
 * Contém todos os campos do ARQGRUP com textos de ajuda (Hint) abaixo de cada campo.
 */
import type { DbfRecord } from "../../../types/models";
import {
	FormInput,
	FormSelect,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";

// ─── Type & empty factory (exportados para os dois consumidores) ──────────────

export type ArqgrupRec = DbfRecord & {
	grup: string;
	classe: string;
	inicio: string;
	final: string;
	acumproc: number;
	maxproc: number;
	cpadmiss: string;
	periodic: number;
	qtdremir: number;
	poratend: string;
	ultcirc: string;
	emissao_: Date | null;
	procpend: number;
	contrat: number;
	partic: number;
	proxcirc: string;
};

export function emptyGrupo(): ArqgrupRec {
	return {
		grup: "",
		classe: "",
		inicio: "",
		final: "",
		acumproc: 0,
		maxproc: 0,
		cpadmiss: "",
		periodic: 0,
		qtdremir: 0,
		poratend: "",
		ultcirc: "",
		emissao_: null,
		procpend: 0,
		contrat: 0,
		partic: 0,
		proxcirc: "",
	};
}

// ─── Helpers internos ────────────────────────────────────────────────────────

const SIM_NAO_OPTS = [
	{ value: "", label: "-- --" },
	{ value: "S", label: "S - Sim" },
	{ value: "N", label: "N - Não" },
];

function Hint({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs text-gray-400 italic mt-0.5 leading-tight">
			{children}
		</p>
	);
}

/** Barra compacta de estatísticas somente leitura */
export function GrupoStatBar({
	contrat,
	partic,
	procpend,
}: {
	contrat: number;
	partic: number;
	procpend: number;
}) {
	return (
		<div className="flex flex-wrap gap-x-4 gap-y-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500">
			<span>
				<b className="text-gray-800">{contrat}</b> contratos ativos
			</span>
			<span className="hidden sm:inline text-gray-300">|</span>
			<span>
				<b className="text-gray-800">{partic}</b> participantes
			</span>
			<span className="hidden sm:inline text-gray-300">|</span>
			<span>
				<b className="text-gray-800">{procpend}</b> proc. pendentes
			</span>
		</div>
	);
}

// ─── Props compartilhadas pelas seções ───────────────────────────────────────

export interface GrupoSectionProps {
	form: ArqgrupRec;
	set: (field: keyof ArqgrupRec, value: string | number | Date | null) => void;
	classeOpts?: { value: string; label: string }[];
	liveContrat?: number;
	livePartic?: number;
}

// ─── Seções exportadas individualmente (usadas pelo wizard em GruposPage) ─────

export function GrupoSecIdentificacao({ form, set, classeOpts = [] }: GrupoSectionProps) {
	return (
		<FormSection title="Identificação">
			<FormRow cols={2}>
				<FormInput label="Grupo" value={form.grup} onChange={(e) => set("grup", e.target.value)} maxLength={2} required disabled />
				<FormSelect label="Classe" value={form.classe} onChange={(e) => set("classe", e.target.value)} options={classeOpts} />
			</FormRow>
			<FormRow cols={2}>
				<div>
					<FormInput label="Nº Inicial" value={form.inicio} onChange={(e) => set("inicio", e.target.value)} maxLength={9} />
					<Hint>Primeiro número de contrato pertencente a este grupo</Hint>
				</div>
				<div>
					<FormInput label="Nº Final" value={form.final} onChange={(e) => set("final", e.target.value)} maxLength={9} />
					<Hint>Último número de contrato pertencente a este grupo</Hint>
				</div>
			</FormRow>
		</FormSection>
	);
}

export function GrupoSecEmissao({ form, set }: GrupoSectionProps) {
	return (
		<FormSection title="Emissão de Recibos">
			<FormRow cols={2}>
				<div>
					<FormInput label="Quantidade de Processos" type="number" min={0} value={String(form.acumproc)} onChange={(e) => set("acumproc", parseInt(e.target.value) || 0)} />
					<Hint>Emitir recibo quando o grupo acumular ao menos N processos</Hint>
				</div>
				<div>
					<FormInput label="Máx. Proc." type="number" min={0} value={String(form.maxproc)} onChange={(e) => set("maxproc", parseInt(e.target.value) || 0)} />
					<Hint>Bloquear emissão se houver mais de N processos pendentes</Hint>
				</div>
			</FormRow>
			<FormRow cols={3}>
				<div>
					<FormSelect label="Comp. Admissão & Atendimento?" value={form.cpadmiss} onChange={(e) => set("cpadmiss", e.target.value)} options={SIM_NAO_OPTS} />
					<Hint>Compara a data de admissão com a do atendimento antes de autorizar</Hint>
				</div>
				<div>
					<FormInput label="Período Mínimo" type="number" min={0} value={String(form.periodic)} onChange={(e) => set("periodic", parseInt(e.target.value) || 0)} />
					<Hint>Intervalo mínimo de N dias entre circulares emitidas para o grupo</Hint>
				</div>
				<div>
					<FormInput label="Qt. Remissão" type="number" min={0} value={String(form.qtdremir)} onChange={(e) => set("qtdremir", parseInt(e.target.value) || 0)} />
					<Hint>Número de taxas pagas para o contrato ser considerado remido (isento de novas cobranças)</Hint>
				</div>
			</FormRow>
		</FormSection>
	);
}

export function GrupoSecCirculares({ form, set, liveContrat, livePartic }: GrupoSectionProps) {
	const emissaoValue = form.emissao_ instanceof Date ? form.emissao_.toISOString().split("T")[0] : "";
	return (
		<>
			<FormSection title="Circulares">
				<FormRow cols={3}>
					<FormInput label="Última Circular" value={form.ultcirc} onChange={(e) => set("ultcirc", e.target.value)} maxLength={3} />
					<div>
						<FormInput label="Emitir Circular Nº" value={form.proxcirc} onChange={(e) => set("proxcirc", e.target.value)} maxLength={3} />
						<Hint>Número da próxima circular a ser emitida para este grupo</Hint>
					</div>
					<FormInput label="Dt. Emissão" type="date" value={emissaoValue} onChange={(e) => set("emissao_", e.target.value ? new Date(e.target.value + "T00:00:00") : null)} />
				</FormRow>
			</FormSection>
			<GrupoStatBar contrat={liveContrat ?? form.contrat} partic={livePartic ?? form.partic} procpend={form.procpend} />
		</>
	);
}

// ─── Componente principal (Categorias.tsx usa este) ───────────────────────────

interface GrupoFormFieldsProps extends GrupoSectionProps {
	classeOpts: { value: string; label: string }[];
}

export function GrupoFormFields({ form, set, classeOpts, liveContrat, livePartic }: GrupoFormFieldsProps) {
	return (
		<>
			<GrupoSecIdentificacao form={form} set={set} classeOpts={classeOpts} />
			<GrupoSecEmissao form={form} set={set} />
			<GrupoSecCirculares form={form} set={set} liveContrat={liveContrat} livePartic={livePartic} />
		</>
	);
}
