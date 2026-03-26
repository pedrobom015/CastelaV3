import { useState, useMemo } from "react";
import { useAppStore } from "../../../../store/appStore";
import { useRelatoriosStore } from "../../../../store/relatoriosStore";
import { PrintPreviewModal } from "../../../../components/common/PrintPreviewModal";
import { PageHeader, Btn } from "../../../../components/common/PageHeader";
import { getRecords, filterRecords } from "../../../../utils/dbfHelpers";
import type { DbfRecord } from "../../../../types/models";
import { buildPrintHtml } from "./print";
import { ContratosCobrancasFiltros, FILTROS_EMPTY } from "./Filtros";
import type { Filtros } from "./Filtros";
import { ContratosCobrancasTabela } from "./Tabela";

const PAGE_SIZE = 10;

export function ContratosCobrancasPage() {
	const { getTable } = useAppStore();
	const { contratosCobrancas, setContratosCobrancas, clearContratosCobrancas } =
		useRelatoriosStore();

	const [filtros, setFiltros] = useState<Filtros>(
		contratosCobrancas?.filtros ?? FILTROS_EMPTY,
	);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [resultado, setResultado] = useState<DbfRecord[]>(
		contratosCobrancas?.resultado ?? [],
	);
	const [gerado, setGerado] = useState(contratosCobrancas !== null);
	const [page, setPage] = useState(0);
	const [printHtml, setPrintHtml] = useState<string | null>(null);

	const gruposTable = getTable("grupos");
	const taxasTable = getTable("taxas");

	function getTaxasSummary(codigo: string) {
		if (!taxasTable) return { total: 0, pago: 0, pendente: 0 };
		const taxas = filterRecords(taxasTable, "codigo", codigo);
		const total = taxas.reduce((a, t) => a + Number(t.valor ?? 0), 0);
		const pago = taxas.reduce((a, t) => a + Number(t.valorpg ?? 0), 0);
		return { total, pago, pendente: total - pago };
	}

	const totais = useMemo(() => {
		let totalGeral = 0;
		let pagoGeral = 0;
		resultado.forEach((r) => {
			const s = getTaxasSummary(String(r.codigo ?? ""));
			totalGeral += s.total;
			pagoGeral += s.pago;
		});
		return { totalGeral, pagoGeral, pendente: totalGeral - pagoGeral };
	}, [resultado]);

	function gerarRelatorio() {
		let grupos = getRecords(gruposTable);
		if (filtros.codigoIni) grupos = grupos.filter((r) => String(r.codigo ?? "") >= filtros.codigoIni);
		if (filtros.codigoFim) grupos = grupos.filter((r) => String(r.codigo ?? "") <= filtros.codigoFim);
		if (filtros.cobrador) grupos = grupos.filter((r) => String(r.cobrador ?? "").trim() === filtros.cobrador.trim());
		if (filtros.situacao) grupos = grupos.filter((r) => String(r.situacao ?? "").trim() === filtros.situacao);
		if (filtros.grupo) grupos = grupos.filter((r) => String(r.grupo ?? "").trim() === filtros.grupo.trim());
		setResultado(grupos);
		setContratosCobrancas(grupos, filtros);
		setGerado(true);
		setPage(0);
	}

	function handleLimpar() {
		clearContratosCobrancas();
		setResultado([]);
		setGerado(false);
		setFiltros(FILTROS_EMPTY);
		setPage(0);
	}

	return (
		<div>
			<PageHeader
				title="Contratos & Cobranças"
				subtitle={
					contratosCobrancas?.geradoEm
						? `Gerado às ${contratosCobrancas.geradoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — ${contratosCobrancas.resultado.length} contrato(s)`
						: undefined
				}
				actions={
					<>
						{gerado && <Btn variant="secondary" onClick={handleLimpar}>Limpar</Btn>}
						{gerado && (
							<Btn
								variant="secondary"
								icon="🖨️"
								onClick={() => setPrintHtml(buildPrintHtml(resultado, getTaxasSummary, totais))}
							>
								Imprimir
							</Btn>
						)}
						<Btn onClick={gerarRelatorio}>Gerar Relatório</Btn>
					</>
				}
			/>

			<PrintPreviewModal
				html={printHtml}
				onClose={() => setPrintHtml(null)}
				title="Prévia — Contratos & Cobranças"
			/>

			<ContratosCobrancasFiltros
				filtros={filtros}
				setFiltros={setFiltros}
				filtersOpen={filtersOpen}
				setFiltersOpen={setFiltersOpen}
			/>

			{gerado && (
				<ContratosCobrancasTabela
					resultado={resultado}
					totais={totais}
					getTaxasSummary={getTaxasSummary}
					page={page}
					setPage={setPage}
					pageSize={PAGE_SIZE}
				/>
			)}
		</div>
	);
}
