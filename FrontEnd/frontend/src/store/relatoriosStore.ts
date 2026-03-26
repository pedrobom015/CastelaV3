import { create } from "zustand";
import type { DbfRecord } from "../types/models";

interface FiltrosContratosCobrancas {
	codigoIni: string;
	codigoFim: string;
	cobrador: string;
	situacao: string;
	grupo: string;
	dataIni: string;
	dataFim: string;
}

interface ContratosCobrancasCache {
	resultado: DbfRecord[];
	filtros: FiltrosContratosCobrancas;
	geradoEm: Date | null;
}

interface RelatoriosStore {
	contratosCobrancas: ContratosCobrancasCache | null;
	setContratosCobrancas: (
		resultado: DbfRecord[],
		filtros: FiltrosContratosCobrancas,
	) => void;
	clearContratosCobrancas: () => void;
}

export const useRelatoriosStore = create<RelatoriosStore>((set) => ({
	contratosCobrancas: null,

	setContratosCobrancas: (resultado, filtros) =>
		set({ contratosCobrancas: { resultado, filtros, geradoEm: new Date() } }),

	clearContratosCobrancas: () => set({ contratosCobrancas: null }),
}));
