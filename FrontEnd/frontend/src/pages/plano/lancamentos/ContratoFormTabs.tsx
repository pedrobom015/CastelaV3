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
	activeTab: "dados" | "contrato";
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
	activeTab,
	mode,
	vendedorOpts,
	cobradorOpts,
	regiaoOpts,
}: ContratoFormTabsProps) {
	return (
		<>
			{activeTab === "dados" && (
				<div key="dados" className="flex flex-col gap-3 tab-content">
					<FormSection title="Identificação">
						<FormRow cols={3}>
							<FormInput
								label="Código"
								value={form.codigo}
								onChange={(e) =>
									setField("codigo", e.target.value)
								}
								disabled={mode !== "include"}
								maxLength={9}
							/>
							<FormSelect
								label="Situação"
								value={form.situacao}
								onChange={(e) =>
									setField("situacao", e.target.value)
								}
								disabled={readOnly}
								options={SITUACAO_OPTS}
							/>
							<FormInput
								label="Nº Sorteio"
								value={form.nrsorteio}
								onChange={(e) =>
									setField("nrsorteio", e.target.value)
								}
								disabled={readOnly}
								maxLength={10}
							/>
						</FormRow>
						<FormInput
							label="Nome Completo"
							value={form.nome}
							onChange={(e) =>
								setField("nome", e.target.value.toUpperCase())
							}
							disabled={readOnly}
							maxLength={35}
							required
						/>
						<FormRow cols={3}>
							<FormInput
								label="CPF"
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
							<FormInput
								label="RG"
								value={form.rg}
								onChange={(e) =>
									setField("rg", e.target.value.toUpperCase())
								}
								disabled={readOnly}
								maxLength={20}
							/>
							<FormInput
								label="Data Nascimento"
								type="date"
								key={dateKey("nascto_")}
						{...dateProps("nascto_")}
								disabled={readOnly}
							/>
						</FormRow>
						<FormRow cols={3}>
							<FormSelect
								label="Estado Civil"
								value={form.estcivil}
								onChange={(e) =>
									setField("estcivil", e.target.value)
								}
								disabled={readOnly}
								options={ESTCIVIL_OPTS}
							/>
							<FormInput
								label="Religião"
								value={form.relig}
								onChange={(e) =>
									setField("relig", e.target.value)
								}
								disabled={readOnly}
								maxLength={40}
							/>
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
						</FormRow>
					</FormSection>

					<FormSection title="Endereço">
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
						<FormRow cols={3}>
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
							<FormRow cols={2}>
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
							</FormRow>
						</FormRow>
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
					</FormSection>

					<FormSection title="Contato">
						<FormRow cols={3}>
							<FormInput
								label="Telefone"
								value={form.telefone}
								onChange={(e) =>
									setField("telefone", e.target.value)
								}
								disabled={readOnly}
								maxLength={14}
							/>
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
						</FormRow>
					</FormSection>
				</div>
			)}

			{activeTab === "contrato" && (
				<div
					key="contrato"
					className="flex flex-col gap-3 tab-content"
				>
					<FormSection title="Dados do Plano">
						<FormRow cols={3}>
							<FormInput
								label="Data Admissão"
								type="date"
								key={dateKey("admissao")}
						{...dateProps("admissao")}
								disabled={readOnly}
							/>
							<FormInput
								label="Término Carência"
								type="date"
								key={dateKey("tcarencia")}
						{...dateProps("tcarencia")}
								disabled={readOnly}
							/>
							<FormInput
								label="Renovar em"
								type="date"
								key={dateKey("renovar")}
						{...dateProps("renovar")}
								disabled={readOnly}
							/>
						</FormRow>
						<FormRow cols={3}>
							<FormSelect
								label="Forma Pgto"
								value={form.formapgto}
								onChange={(e) =>
									setField("formapgto", e.target.value)
								}
								disabled={readOnly}
								options={FORMAPGTO_OPTS}
							/>
							<FormInput
								label="Dia Pgto"
								value={form.diapgto}
								onChange={(e) =>
									setField("diapgto", e.target.value)
								}
								disabled={readOnly}
								maxLength={2}
							/>
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
						</FormRow>
				</FormSection>

				<FormSection title="Responsáveis">
						<FormRow cols={3}>
							<FormSelect
								label="Vendedor"
								value={form.vendedor}
								options={vendedorOpts}
								onChange={(e) =>
									setField("vendedor", e.target.value)
								}
								disabled={readOnly}
							/>
							<FormSelect
								label="Cobrador"
								value={form.cobrador}
								options={cobradorOpts}
								onChange={(e) =>
									setField("cobrador", e.target.value)
								}
								disabled={readOnly}
							/>
							<FormSelect
								label="Região"
								value={form.regiao}
								options={regiaoOpts}
								onChange={(e) =>
									setField("regiao", e.target.value)
								}
								disabled={readOnly}
							/>
						</FormRow>
					</FormSection>

					<FormSection title="Circulares e Cobertura">
						<FormRow cols={4}>
							<FormInput
								label="Circ. Inicial"
								value={form.circinic}
								onChange={(e) =>
									setField("circinic", e.target.value)
								}
								disabled={readOnly}
								maxLength={3}
							/>
							<FormInput
								label="Últ. Circular"
								value={form.ultcirc}
								onChange={(e) =>
									setField("ultcirc", e.target.value)
								}
								disabled={readOnly}
								maxLength={3}
							/>
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
						</FormRow>
						<FormRow cols={4}>
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
							<FormInput
								label=" Partic. Falecidos"
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
						</FormRow>
					</FormSection>

					<FormSection title="Controle">
						<FormRow cols={3}>
							<FormInput
								label="Incluído em"
								type="date"
								value={toDateInputValue(form.em_)}
								disabled
							/>
							<FormInput label="Por" value={form.por} disabled />
							<FormInput
								label="Últ. Impressão"
								type="date"
								value={toDateInputValue(form.ultimp_)}
								disabled
							/>
						</FormRow>
						<FormRow cols={3}>
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
							<FormInput
								label="Ender. Atualiz."
								type="date"
								value={toDateInputValue(form.ender_)}
								disabled
							/>
						</FormRow>
					</FormSection>

					<FormSection title="Observações">
						<FormTextarea
							value={form.obs}
							onChange={(e) => setField("obs", e.target.value)}
							disabled={readOnly}
							rows={4}
						/>
					</FormSection>
				</div>
			)}
		</>
	);
}
