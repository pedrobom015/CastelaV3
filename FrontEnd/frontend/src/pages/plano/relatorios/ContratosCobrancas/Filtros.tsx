import { FormInput, FormSelect } from "../../../../components/common/FormField";

export const SITUACAO_OPTS = [
	{ value: "", label: "Todas" },
	{ value: "1", label: "Ativo" },
	{ value: "2", label: "Cancelado" },
	{ value: "3", label: "Suspenso" },
];

export const FILTROS_EMPTY = {
	codigoIni: "",
	codigoFim: "",
	cobrador: "",
	situacao: "",
	grupo: "",
	dataIni: "",
	dataFim: "",
};

export type Filtros = typeof FILTROS_EMPTY;

interface Props {
	filtros: Filtros;
	setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
	filtersOpen: boolean;
	setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ContratosCobrancasFiltros({
	filtros,
	setFiltros,
	filtersOpen,
	setFiltersOpen,
}: Props) {
	const activeBadges = [
		filtros.codigoIni && `Cód >= ${filtros.codigoIni}`,
		filtros.codigoFim && `Cód <= ${filtros.codigoFim}`,
		filtros.cobrador && `Cobrador: ${filtros.cobrador}`,
		filtros.grupo && `Grupo: ${filtros.grupo}`,
		filtros.situacao &&
			`Sit: ${SITUACAO_OPTS.find((o) => o.value === filtros.situacao)?.label}`,
		filtros.dataIni && `Adm >= ${filtros.dataIni}`,
		filtros.dataFim && `Adm <= ${filtros.dataFim}`,
	].filter(Boolean) as string[];

	function set(field: keyof Filtros, value: string) {
		setFiltros((p) => ({ ...p, [field]: value }));
	}

	return (
		<div className="bg-white rounded border border-gray-200 mb-4">
			<div
				className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none hover:bg-gray-50 transition-colors rounded-t"
				onClick={() => setFiltersOpen((o) => !o)}
			>
				<span className="text-xs text-gray-500">{filtersOpen ? '▲' : '▼'}</span>
			<span className="text-sm font-medium text-gray-600">Filtros</span>
				{activeBadges.length > 0 && (
					<span className="bg-blue-900 text-white text-xs px-1.5 py-0.5 rounded-full">
						{activeBadges.length}
					</span>
				)}
				{!filtersOpen &&
					activeBadges.map((b, i) => (
						<span
							key={i}
							className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full"
						>
							{b}
						</span>
					))}
				{activeBadges.length > 0 && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setFiltros(FILTROS_EMPTY);
						}}
						className="text-xs text-gray-400 hover:text-red-500 transition-colors"
					>
						Limpar
					</button>
				)}
			</div>

			{filtersOpen && (
				<div className="border-t border-gray-100 px-3 py-3">
					<div className="grid grid-cols-4 gap-3 mb-3">
						<FormInput
							label="Cód. Inicial"
							value={filtros.codigoIni}
							onChange={(e) => set("codigoIni", e.target.value)}
							maxLength={9}
						/>
						<FormInput
							label="Cód. Final"
							value={filtros.codigoFim}
							onChange={(e) => set("codigoFim", e.target.value)}
							maxLength={9}
						/>
						<FormInput
							label="Cobrador"
							value={filtros.cobrador}
							onChange={(e) => set("cobrador", e.target.value.toUpperCase())}
							maxLength={3}
						/>
						<FormInput
							label="Grupo"
							value={filtros.grupo}
							onChange={(e) => set("grupo", e.target.value.toUpperCase())}
							maxLength={2}
						/>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<FormSelect
							label="Situação"
							value={filtros.situacao}
							onChange={(e) => set("situacao", e.target.value)}
							options={SITUACAO_OPTS}
						/>
						<FormInput
							label="Data Admissão Início"
							type="date"
							value={filtros.dataIni}
							onChange={(e) => set("dataIni", e.target.value)}
						/>
						<FormInput
							label="Data Admissão Fim"
							type="date"
							value={filtros.dataFim}
							onChange={(e) => set("dataFim", e.target.value)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
