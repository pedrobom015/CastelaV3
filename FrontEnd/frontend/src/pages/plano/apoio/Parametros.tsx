import { useState, useEffect } from "react";
import { useAppStore } from "../../../store/appStore";
import { PageHeader, Btn } from "../../../components/common/PageHeader";
import {
	FormInput,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";
import { getRecords } from "../../../utils/dbfHelpers";
import type { DbfRecord } from "../../../types/models";
import { writeDbfFile } from "../../../services/dbf/DbfReader";

type ParAdmRec = DbfRecord & {
	pgrupo: string;
	p_filial: string;
	pcontrato: string;
	lastcodigo: string;
	nrcanc: string;
	nrreint: string;
	contarec: string;
	contapag: string;
	p_cidade: string;
	p_recp: string;
	setup1: string;
	cgcsetup: string;
	setup2: string;
	setup3: string;
	pcedente: string;
	combarra: string;
	cinscr: string;
};

function emptyRec(): ParAdmRec {
	return {
		pgrupo: "",
		p_filial: "",
		pcontrato: "",
		lastcodigo: "",
		nrcanc: "",
		nrreint: "",
		contarec: "",
		contapag: "",
		p_cidade: "",
		p_recp: "",
		setup1: "",
		cgcsetup: "",
		setup2: "",
		setup3: "",
		pcedente: "",
		combarra: "",
		cinscr: "",
	};
}

export function Parametros() {
	const { getTable, setTable, dirHandle, setParametros } = useAppStore();
	const [form, setForm] = useState<ParAdmRec>(emptyRec());
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [originalRec, setOriginalRec] = useState<DbfRecord | null>(null);
	const isDirty = originalRec ? JSON.stringify(form) !== JSON.stringify(originalRec) : true;

	useEffect(() => {
		const table = getTable("par_adm");
		const recs = getRecords(table);
		if (recs.length > 0) {
			const rec = recs[0] as ParAdmRec;
			setForm({ ...rec });
			setOriginalRec(rec);
		}
	}, [getTable]);

	async function handleSave() {
		if (!dirHandle) return;
		setSaving(true);
		setSaved(false);
		try {
			const currentTable = getTable("par_adm");
			const newRec: ParAdmRec = { ...form };
			let updatedRecords: DbfRecord[];
			if (originalRec && currentTable) {
				updatedRecords = currentTable.records.map((r) =>
					r === originalRec ? newRec : r,
				);
			} else if (currentTable) {
				updatedRecords =
					currentTable.records.length === 0
						? [newRec]
						: [newRec, ...currentTable.records.slice(1)];
			} else {
				updatedRecords = [newRec];
			}
			const newTable = currentTable
				? { ...currentTable, records: updatedRecords }
				: {
						header: {
							version: 3,
							lastUpdate: new Date(),
							recordCount: 1,
							headerSize: 0,
							recordSize: 0,
							fields: [],
						},
						records: updatedRecords,
					};
			setTable("par_adm", newTable);
			await writeDbfFile(dirHandle, "PAR_ADM.DBF", newTable);
			setOriginalRec(newRec);
			// Atualiza parametros no store
			setParametros(newRec as unknown as Record<string, string | number>);
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} finally {
			setSaving(false);
		}
	}

	function set(field: keyof ParAdmRec, value: string) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	return (
		<div className="p-4 max-w-4xl ">
			<PageHeader
				title="Parâmetros do Sistema"
				subtitle="PAR_ADM.DBF — Configurações gerais do sistema"
				actions={
					<Btn
						onClick={handleSave}
						disabled={saving || !isDirty}
						size="lg"
						icon="💾"
					>
						{saving ? "Salvando..." : "Salvar Parâmetros"}
					</Btn>
				}
			/>

			{saved && (
				<div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-800 text-sm font-medium">
					Parâmetros salvos com sucesso!
				</div>
			)}

			<div className="space-y-4">
				<FormSection title="Identificação do Sistema">
					<FormRow cols={3}>
						<FormInput
							label="Grupo Principal"
							value={form.pgrupo}
							onChange={(e) => set("pgrupo", e.target.value)}
							maxLength={30}
						/>
						<FormInput
							label="Filial Padrão"
							value={form.p_filial}
							onChange={(e) => set("p_filial", e.target.value)}
							maxLength={2}
						/>
						<FormInput
							label="Último Contrato"
							value={form.pcontrato}
							onChange={(e) => set("pcontrato", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
					<FormRow cols={3}>
						<FormInput
							label="Último Código"
							value={form.lastcodigo}
							onChange={(e) => set("lastcodigo", e.target.value)}
							maxLength={10}
						/>
						<FormInput
							label="Nº Cancelamento"
							value={form.nrcanc}
							onChange={(e) => set("nrcanc", e.target.value)}
							maxLength={10}
						/>
						<FormInput
							label="Nº Reintegração"
							value={form.nrreint}
							onChange={(e) => set("nrreint", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
					<FormRow cols={2}>
						<FormInput
							label="Cidade Padrão"
							value={form.p_cidade}
							onChange={(e) => set("p_cidade", e.target.value)}
							maxLength={30}
						/>
						<FormInput
							label="P. Recebimento"
							value={form.p_recp}
							onChange={(e) => set("p_recp", e.target.value)}
							maxLength={10}
						/>
					</FormRow>
				</FormSection>

				<FormSection title="Contas Contábeis">
					<FormRow cols={2}>
						<FormInput
							label="Conta Recebimento"
							value={form.contarec}
							onChange={(e) => set("contarec", e.target.value)}
							maxLength={20}
						/>
						<FormInput
							label="Conta Pagamento"
							value={form.contapag}
							onChange={(e) => set("contapag", e.target.value)}
							maxLength={20}
						/>
					</FormRow>
				</FormSection>

				<FormSection title="Configurações de Boleto">
					<FormRow cols={2}>
						<FormInput
							label="Cedente"
							value={form.pcedente}
							onChange={(e) => set("pcedente", e.target.value)}
							maxLength={30}
						/>
						<FormInput
							label="Código de Barras"
							value={form.combarra}
							onChange={(e) => set("combarra", e.target.value)}
							maxLength={20}
						/>
					</FormRow>
					<FormInput
						label="Código de Inscrição"
						value={form.cinscr}
						onChange={(e) => set("cinscr", e.target.value)}
						maxLength={20}
					/>
				</FormSection>

				<FormSection title="Configurações do Setup">
					<FormRow cols={2}>
						<FormInput
							label="CNPJ/CGC"
							value={form.cgcsetup}
							onChange={(e) => set("cgcsetup", e.target.value)}
							maxLength={18}
						/>
						<FormInput
							label="Setup 1"
							value={form.setup1}
							onChange={(e) => set("setup1", e.target.value)}
							maxLength={20}
						/>
					</FormRow>
					<FormRow cols={2}>
						<FormInput
							label="Setup 2"
							value={form.setup2}
							onChange={(e) => set("setup2", e.target.value)}
							maxLength={20}
						/>
						<FormInput
							label="Setup 3"
							value={form.setup3}
							onChange={(e) => set("setup3", e.target.value)}
							maxLength={20}
						/>
					</FormRow>
				</FormSection>
			</div>
		</div>
	);
}
