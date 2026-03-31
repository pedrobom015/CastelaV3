import { useState } from "react";
import {
	FormInput,
	FormSelect,
	FormTextarea,
	FormSection,
	FormRow,
} from "../../../components/common/FormField";
import { toDateInputValue } from "../../../utils/formatters";
import type { Grupo } from "../../../types/models";

const SITUACAO_OPTS = [
	{ value: "", label: "-- Selecione --" },
	{ value: "1", label: "Ativo" },
	{ value: "2", label: "Cancelado" },
	{ value: "3", label: "Suspenso" },
	{ value: "4", label: "Inadimplente" },
	{ value: "0", label: "Inativo" },
];

const ESTCIVIL_OPTS = [
	{ value: "", label: "-- Selecione --" },
	{ value: "SO", label: "Solteiro(a)" },
	{ value: "CA", label: "Casado(a)" },
	{ value: "DI", label: "Divorciado(a)" },
	{ value: "VI", label: "Viúvo(a)" },
	{ value: "SE", label: "Separado(a)" },
	{ value: "UN", label: "União Estável" },
];

const FORMAPGTO_OPTS = [
	{ value: "", label: "-- Selecione --" },
	{ value: "01", label: "Mensal" },
	{ value: "02", label: "Bimestral" },
	{ value: "03", label: "Trimestral" },
	{ value: "04", label: "Quadrimestral" },
	{ value: "06", label: "Semestral" },
	{ value: "12", label: "Anual" },
];

type FieldKey =
	| "codigo"
	| "situacao"
	| "nrsorteio"
	| "nome"
	| "cpf"
	| "rg"
	| "nascto_"
	| "estcivil"
	| "relig"
	| "natural"
	| "endereco"
	| "bairro"
	| "cidade"
	| "uf"
	| "cep"
	| "complem"
	| "telefone"
	| "contato"
	| "email"
	| "admissao"
	| "tcarencia"
	| "renovar"
	| "formapgto"
	| "diapgto"
	| "saitxa"
	| "vendedor"
	| "cobrador"
	| "regiao"
	| "circinic"
	| "ultcirc"
	| "qtcircs"
	| "qtcircpg"
	| "funerais"
	| "nrdepend"
	| "particv"
	| "particf"
	| "em_"
	| "por"
	| "ultimp_"
	| "atend1"
	| "atend2"
	| "ender_"
	| "obs";

interface SidebarField {
	key: FieldKey;
	label: string;
}
interface SidebarSection {
	title: string;
	fields: SidebarField[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
	{
		title: "Identificação",
		fields: [
			{ key: "codigo", label: "Código" },
			{ key: "situacao", label: "Situação" },
			{ key: "nrsorteio", label: "Nº Sorteio" },
			{ key: "nome", label: "Nome Completo" },
			{ key: "cpf", label: "CPF" },
			{ key: "rg", label: "RG" },
			{ key: "nascto_", label: "Data Nascimento" },
			{ key: "estcivil", label: "Estado Civil" },
			{ key: "relig", label: "Religião" },
			{ key: "natural", label: "Naturalidade" },
		],
	},
	{
		title: "Endereço",
		fields: [
			{ key: "endereco", label: "Endereço" },
			{ key: "bairro", label: "Bairro" },
			{ key: "cidade", label: "Cidade" },
			{ key: "uf", label: "UF" },
			{ key: "cep", label: "CEP" },
			{ key: "complem", label: "Complemento" },
		],
	},
	{
		title: "Contato",
		fields: [
			{ key: "telefone", label: "Telefone" },
			{ key: "contato", label: "Contato" },
			{ key: "email", label: "E-mail" },
		],
	},
	{
		title: "Dados do Plano",
		fields: [
			{ key: "admissao", label: "Data Admissão" },
			{ key: "tcarencia", label: "Término Carência" },
			{ key: "renovar", label: "Renovar em" },
			{ key: "formapgto", label: "Periodicidade" },
			{ key: "diapgto", label: "Dia Pgto" },
			{ key: "saitxa", label: "Sai Taxa" },
		],
	},
	{
		title: "Responsáveis",
		fields: [
			{ key: "vendedor", label: "Vendedor" },
			{ key: "cobrador", label: "Cobrador" },
			{ key: "regiao", label: "Região" },
		],
	},
	{
		title: "Circulares e Cobertura",
		fields: [
			{ key: "circinic", label: "Circ. Inicial" },
			{ key: "ultcirc", label: "Últ. Circular" },
			{ key: "qtcircs", label: "Qt. Circulares" },
			{ key: "qtcircpg", label: "Qt. Circs Pagas" },
			{ key: "funerais", label: "Funerais" },
			{ key: "nrdepend", label: "Nr. Dependentes" },
			{ key: "particv", label: "Partic. Vivos" },
			{ key: "particf", label: "Partic. Falecidos" },
		],
	},
	{
		title: "Controle",
		fields: [
			{ key: "em_", label: "Incluído em" },
			{ key: "por", label: "Por" },
			{ key: "ultimp_", label: "Últ. Impressão" },
			{ key: "atend1", label: "Atendimento 1" },
			{ key: "atend2", label: "Atendimento 2" },
			{ key: "ender_", label: "Ender. Atualiz." },
		],
	},
	{
		title: "Observações",
		fields: [{ key: "obs", label: "Observações" }],
	},
];

const DEFAULT_VISIBLE = new Set<FieldKey>([
	// Dados Pessoais — todos visíveis por padrão
	"codigo",
	"situacao",
	"nome",
	"cpf",
	"rg",
	"nascto_",
	"estcivil",
	"relig",
	"natural",
	"endereco",
	"bairro",
	"cidade",
	"uf",
	"cep",
	"complem",
	"telefone",
	"contato",
	"email",
	"admissao",
	"formapgto",
	"diapgto",

	// Dados do Contrato e Financeiro
	"nrsorteio",
	"tcarencia",
	"renovar",
	"saitxa",
	"vendedor",
	"cobrador",
	"regiao",
	"circinic",
	"ultcirc",
	"qtcircs",
	"qtcircpg",
	"funerais",
	"nrdepend",
	"particv",
	"particf",

	// Auditoria e Controle Interno
	"em_",
	"por",
	"ultimp_",
	"atend1",
	"atend2",
	"ender_",
	"obs",
]);

interface Opt {
	value: string;
	label: string;
}

export interface ContratoFormTabsProps {
	form: Grupo;
	setField: (field: keyof Grupo, value: unknown) => void;
	dateKey: (field: keyof Grupo) => string;
	dateProps: (field: keyof Grupo) => {
		defaultValue: string;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
	};
	readOnly: boolean;
	mode: "include" | "edit" | "view";
	vendedorOpts: Opt[];
	cobradorOpts: Opt[];
	regiaoOpts: Opt[];
}

export function ContratoFormTabs({
	form,
	setField,
	dateKey,
	dateProps,
	readOnly,
	mode,
	vendedorOpts,
	cobradorOpts,
	regiaoOpts,
}: ContratoFormTabsProps) {
	const [visibleFields, setVisibleFields] =
		useState<Set<FieldKey>>(DEFAULT_VISIBLE);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	function toggleField(key: FieldKey) {
		setVisibleFields((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}

	const vis = (key: FieldKey) => visibleFields.has(key);

	function vcols(keys: FieldKey[]): 2 | 3 | 4 {
		const count = keys.filter((k) => vis(k)).length;
		return Math.min(4, Math.max(2, count)) as 2 | 3 | 4;
	}

	return (
		<div className="flex gap-4 tab-content">
			{/* Conteúdo principal do formulário */}
			<div className="flex-1 flex flex-col gap-3 min-w-0">
				{/* ── Dados Pessoais ── */}
				<FormSection title="Identificação">
					{(vis("codigo") ||
						vis("situacao") ||
						vis("nrsorteio") ||
						vis("admissao") ||
						vis("formapgto") ||
						vis("diapgto")) && (
						<FormRow
							cols={
								Math.min(
									6,
									Math.max(
										2,
										[
											"codigo",
											"situacao",
											"nrsorteio",
											"admissao",
											"formapgto",
											"diapgto",
										].filter((k) => vis(k as FieldKey))
											.length,
									),
								) as 2 | 3 | 4 | 5 | 6
							}
						>
							{vis("codigo") && (
								<FormInput
									label="Código"
									value={form.codigo}
									onChange={(e) =>
										setField("codigo", e.target.value)
									}
									disabled={mode !== "include"}
									maxLength={9}
								/>
							)}
							{vis("situacao") && (
								<FormSelect
									label="Situação"
									value={form.situacao}
									onChange={(e) =>
										setField("situacao", e.target.value)
									}
									disabled={readOnly}
									options={SITUACAO_OPTS}
								/>
							)}
							{vis("nrsorteio") && (
								<FormInput
									label="Nº Sorteio"
									value={form.nrsorteio}
									onChange={(e) =>
										setField("nrsorteio", e.target.value)
									}
									disabled={readOnly}
									maxLength={10}
								/>
							)}
							{vis("admissao") && (
								<FormInput
									label="Data Admissão"
									type="date"
									key={dateKey("admissao")}
									{...dateProps("admissao")}
									disabled={readOnly}
								/>
							)}
							{vis("formapgto") && (
								<FormSelect
									label="Periodicidade"
									value={form.formapgto}
									onChange={(e) =>
										setField("formapgto", e.target.value)
									}
									disabled={readOnly}
									options={FORMAPGTO_OPTS}
								/>
							)}
							{vis("diapgto") && (
								<FormInput
									label="Dia Pagamento"
									value={form.diapgto}
									onChange={(e) =>
										setField("diapgto", e.target.value)
									}
									disabled={readOnly}
									maxLength={2}
								/>
							)}
						</FormRow>
					)}

					{(vis("cpf") || vis("rg") || vis("nome")) && (
						<FormRow cols={6}>
							{vis("nome") && (
								<FormInput
									label="Nome Completo"
									value={form.nome}
									className="col-span-4"
									onChange={(e) =>
										setField(
											"nome",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={40}
									required
								/>
							)}
							{vis("cpf") && (
								<FormInput
									label="CPF"
									className="col-span-1"
									value={form.cpf}
									onChange={(e) =>
										setField(
											"cpf",
											e.target.value.replace(/\D/g, ""),
										)
									}
									disabled={readOnly}
									maxLength={11}
									placeholder="99999999999"
								/>
							)}
							{vis("rg") && (
								<FormInput
									label="RG"
									className="col-span-1"
									value={form.rg}
									onChange={(e) =>
										setField(
											"rg",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={20}
								/>
							)}
						</FormRow>
					)}
					{(vis("estcivil") ||
						vis("relig") ||
						vis("natural") ||
						vis("nascto_")) && (
						<FormRow
							cols={vcols([
								"nascto_",
								"estcivil",
								"relig",
								"natural",
							])}
						>
							{vis("nascto_") && (
								<FormInput
									label="Data Nascimento"
									type="date"
									key={dateKey("nascto_")}
									{...dateProps("nascto_")}
									disabled={readOnly}
								/>
							)}
							{vis("estcivil") && (
								<FormSelect
									label="Estado Civil"
									value={form.estcivil}
									onChange={(e) =>
										setField("estcivil", e.target.value)
									}
									disabled={readOnly}
									options={ESTCIVIL_OPTS}
								/>
							)}
							{vis("relig") && (
								<FormInput
									label="Religião"
									value={form.relig}
									onChange={(e) =>
										setField("relig", e.target.value)
									}
									disabled={readOnly}
									maxLength={40}
								/>
							)}
							{vis("natural") && (
								<FormInput
									label="Naturalidade"
									value={form.natural}
									onChange={(e) =>
										setField(
											"natural",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={25}
								/>
							)}
						</FormRow>
					)}
				</FormSection>

				<FormSection title="Endereço">
					{(vis("endereco") || vis("complem")) && (
						<FormRow cols={vcols(["endereco", "complem"])}>
							{vis("endereco") && (
								<FormInput
									label="Endereço"
									value={form.endereco}
									onChange={(e) =>
										setField(
											"endereco",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={50}
								/>
							)}
							{vis("complem") && (
								<FormInput
									label="Complemento"
									value={form.complem}
									onChange={(e) =>
										setField(
											"complem",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={35}
								/>
							)}
						</FormRow>
					)}
					{(vis("bairro") ||
						vis("cidade") ||
						vis("uf") ||
						vis("cep")) && (
						<FormRow
							cols={vcols(["bairro", "cidade", "uf", "cep"])}
						>
							{vis("bairro") && (
								<FormInput
									label="Bairro"
									value={form.bairro}
									onChange={(e) =>
										setField(
											"bairro",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={35}
								/>
							)}
							{vis("cidade") && (
								<FormInput
									label="Cidade"
									value={form.cidade}
									onChange={(e) =>
										setField(
											"cidade",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={35}
								/>
							)}
							{vis("uf") && (
								<FormInput
									label="UF"
									value={form.uf}
									onChange={(e) =>
										setField(
											"uf",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={2}
								/>
							)}
							{vis("cep") && (
								<FormInput
									label="CEP"
									value={form.cep}
									onChange={(e) =>
										setField(
											"cep",
											e.target.value.replace(/\D/g, ""),
										)
									}
									disabled={readOnly}
									maxLength={8}
									placeholder="99999999"
								/>
							)}
						</FormRow>
					)}
				</FormSection>

				{(vis("telefone") || vis("contato") || vis("email")) && (
					<FormSection title="Contato">
						<FormRow cols={vcols(["telefone", "contato", "email"])}>
							{vis("telefone") && (
								<FormInput
									label="Telefone"
									value={form.telefone}
									onChange={(e) =>
										setField("telefone", e.target.value)
									}
									disabled={readOnly}
									maxLength={14}
								/>
							)}
							{vis("contato") && (
								<FormInput
									label="Contato"
									value={form.contato}
									onChange={(e) =>
										setField(
											"contato",
											e.target.value.toUpperCase(),
										)
									}
									disabled={readOnly}
									maxLength={25}
								/>
							)}
							{vis("email") && (
								<FormInput
									label="E-mail"
									value={form.email}
									onChange={(e) =>
										setField("email", e.target.value)
									}
									disabled={readOnly}
									maxLength={50}
									type="email"
								/>
							)}
						</FormRow>
					</FormSection>
				)}

				{/* ── Dados do Contrato ── */}
				{(vis("tcarencia") || vis("renovar") || vis("saitxa")) && (
					<FormSection title="Dados do Plano">
						{(vis("tcarencia") ||
							vis("renovar") ||
							vis("saitxa")) && (
							<FormRow
								cols={vcols(["tcarencia", "renovar", "saitxa"])}
							>
								{vis("tcarencia") && (
									<FormInput
										label="Término Carência"
										type="date"
										key={dateKey("tcarencia")}
										{...dateProps("tcarencia")}
										disabled={readOnly}
									/>
								)}
								{vis("renovar") && (
									<FormInput
										label="Renovar em"
										type="date"
										key={dateKey("renovar")}
										{...dateProps("renovar")}
										disabled={readOnly}
									/>
								)}
								{vis("saitxa") && (
									<FormInput
										label="Sai Taxa"
										value={form.saitxa}
										onChange={(e) =>
											setField("saitxa", e.target.value)
										}
										disabled={readOnly}
										maxLength={4}
										placeholder="99/99"
									/>
								)}
							</FormRow>
						)}
					</FormSection>
				)}

				{(vis("vendedor") || vis("cobrador") || vis("regiao")) && (
					<FormSection title="Responsáveis">
						<FormRow
							cols={vcols(["vendedor", "cobrador", "regiao"])}
						>
							{vis("vendedor") && (
								<FormSelect
									label="Vendedor"
									value={form.vendedor}
									options={vendedorOpts}
									onChange={(e) =>
										setField("vendedor", e.target.value)
									}
									disabled={readOnly}
								/>
							)}
							{vis("cobrador") && (
								<FormSelect
									label="Cobrador"
									value={form.cobrador}
									options={cobradorOpts}
									onChange={(e) =>
										setField("cobrador", e.target.value)
									}
									disabled={readOnly}
								/>
							)}
							{vis("regiao") && (
								<FormSelect
									label="Região"
									value={form.regiao}
									options={regiaoOpts}
									onChange={(e) =>
										setField("regiao", e.target.value)
									}
									disabled={readOnly}
								/>
							)}
						</FormRow>
					</FormSection>
				)}

				{(vis("circinic") ||
					vis("ultcirc") ||
					vis("qtcircs") ||
					vis("qtcircpg") ||
					vis("funerais") ||
					vis("nrdepend") ||
					vis("particv") ||
					vis("particf")) && (
					<FormSection title="Circulares e Cobertura">
						{(vis("circinic") ||
							vis("ultcirc") ||
							vis("qtcircs") ||
							vis("qtcircpg")) && (
							<FormRow
								cols={vcols([
									"circinic",
									"ultcirc",
									"qtcircs",
									"qtcircpg",
								])}
							>
								{vis("circinic") && (
									<FormInput
										label="Circ. Inicial"
										value={form.circinic}
										onChange={(e) =>
											setField("circinic", e.target.value)
										}
										disabled={readOnly}
										maxLength={3}
									/>
								)}
								{vis("ultcirc") && (
									<FormInput
										label="Últ. Circular"
										value={form.ultcirc}
										onChange={(e) =>
											setField("ultcirc", e.target.value)
										}
										disabled={readOnly}
										maxLength={3}
									/>
								)}
								{vis("qtcircs") && (
									<FormInput
										label="Qt. Circulares"
										value={String(form.qtcircs)}
										onChange={(e) =>
											setField(
												"qtcircs",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
								{vis("qtcircpg") && (
									<FormInput
										label="Qt. Circs Pagas"
										value={String(form.qtcircpg)}
										onChange={(e) =>
											setField(
												"qtcircpg",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
							</FormRow>
						)}
						{(vis("funerais") ||
							vis("nrdepend") ||
							vis("particv") ||
							vis("particf")) && (
							<FormRow
								cols={vcols([
									"funerais",
									"nrdepend",
									"particv",
									"particf",
								])}
							>
								{vis("funerais") && (
									<FormInput
										label="Funerais"
										value={String(form.funerais)}
										onChange={(e) =>
											setField(
												"funerais",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
								{vis("nrdepend") && (
									<FormInput
										label="Nr. Dependentes"
										value={String(form.nrdepend)}
										onChange={(e) =>
											setField(
												"nrdepend",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
								{vis("particv") && (
									<FormInput
										label="Partic. Vivos"
										value={String(form.particv)}
										onChange={(e) =>
											setField(
												"particv",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
								{vis("particf") && (
									<FormInput
										label="Partic. Falecidos"
										value={String(form.particf)}
										onChange={(e) =>
											setField(
												"particf",
												parseInt(e.target.value) || 0,
											)
										}
										disabled={readOnly}
										type="number"
									/>
								)}
							</FormRow>
						)}
					</FormSection>
				)}

				{(vis("em_") ||
					vis("por") ||
					vis("ultimp_") ||
					vis("atend1") ||
					vis("atend2") ||
					vis("ender_")) && (
					<FormSection title="Controle">
						{(vis("em_") || vis("por") || vis("ultimp_")) && (
							<FormRow cols={vcols(["em_", "por", "ultimp_"])}>
								{vis("em_") && (
									<FormInput
										label="Incluído em"
										type="date"
										value={toDateInputValue(form.em_)}
										disabled
									/>
								)}
								{vis("por") && (
									<FormInput
										label="Por"
										value={form.por}
										disabled
									/>
								)}
								{vis("ultimp_") && (
									<FormInput
										label="Últ. Impressão"
										type="date"
										value={toDateInputValue(form.ultimp_)}
										disabled
									/>
								)}
							</FormRow>
						)}
						{(vis("atend1") || vis("atend2") || vis("ender_")) && (
							<FormRow
								cols={vcols(["atend1", "atend2", "ender_"])}
							>
								{vis("atend1") && (
									<FormInput
										label="Atendimento 1"
										value={form.atend1}
										onChange={(e) =>
											setField(
												"atend1",
												e.target.value.toUpperCase(),
											)
										}
										disabled={readOnly}
										maxLength={15}
									/>
								)}
								{vis("atend2") && (
									<FormInput
										label="Atendimento 2"
										value={form.atend2}
										onChange={(e) =>
											setField(
												"atend2",
												e.target.value.toUpperCase(),
											)
										}
										disabled={readOnly}
										maxLength={15}
									/>
								)}
								{vis("ender_") && (
									<FormInput
										label="Ender. Atualiz."
										type="date"
										value={toDateInputValue(form.ender_)}
										disabled
									/>
								)}
							</FormRow>
						)}
					</FormSection>
				)}

				{vis("obs") && (
					<FormSection title="Observações">
						<FormTextarea
							value={form.obs ?? ""}
							onChange={(e) => setField("obs", e.target.value)}
							disabled={readOnly}
							rows={4}
						/>
					</FormSection>
				)}
			</div>

			{/* Sidebar direita colapsável — visibilidade dos campos */}
			<div className="flex-shrink-0 flex sticky top-0 self-start max-h-[calc(100vh-220px)]">
				{/* Painel de campos (desliza horizontalmente) */}
				<div
					className="overflow-y-auto overflow-x-hidden border-l border-gray-200 pl-3 transition-all duration-300"
					style={{ width: sidebarOpen ? 176 : 0, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
				>
					<div className="w-44">
						<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
							Exibir Campos
						</p>
						{SIDEBAR_SECTIONS.map((section) => (
							<div key={section.title} className="mb-3">
								<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
									{section.title}
								</p>
								<div className="flex flex-col gap-0.5">
									{section.fields.map((field) => (
										<label
											key={field.key}
											className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 hover:text-gray-800 select-none"
										>
											<input
												type="checkbox"
												checked={vis(field.key)}
												onChange={() => toggleField(field.key)}
												className="rounded border-gray-300 text-blue-600 w-3 h-3 flex-shrink-0"
											/>
											<span className="leading-tight">
												{field.label}
											</span>
										</label>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Aba vertical clicável */}
				<button
					onClick={() => setSidebarOpen((o) => !o)}
					title={sidebarOpen ? "Fechar painel" : "Exibir Campos"}
					className="flex items-center justify-center w-5 flex-shrink-0 rounded-l border border-r-0 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer select-none"
				>
					<span
						className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest"
						style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
					>
						{sidebarOpen ? '✕ Campos' : '⊞ Campos'}
					</span>
				</button>
			</div>
		</div>
	);
}
