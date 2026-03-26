/**
 * Inicialização dos arquivos DBF
 * Baseado em adp_estr.prg do sistema original ADP
 * Cria os arquivos DBF que não existem no diretório selecionado
 */

import type { DbfField } from "./DbfReader";

// Estruturas de todos os DBFs do sistema (mapeadas de adp_estr.prg)
export const DBF_STRUCTURES: Record<string, DbfField[]> = {
	GRUPOS: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "grupo", type: "C", length: 2, decimals: 0 },
		{ name: "situacao", type: "C", length: 1, decimals: 0 },
		{ name: "nome", type: "C", length: 35, decimals: 0 },
		{ name: "nascto_", type: "D", length: 8, decimals: 0 },
		{ name: "estcivil", type: "C", length: 2, decimals: 0 },
		{ name: "cpf", type: "C", length: 11, decimals: 0 },
		{ name: "rg", type: "C", length: 20, decimals: 0 },
		{ name: "endereco", type: "C", length: 50, decimals: 0 },
		{ name: "bairro", type: "C", length: 35, decimals: 0 },
		{ name: "cidade", type: "C", length: 35, decimals: 0 },
		{ name: "uf", type: "C", length: 2, decimals: 0 },
		{ name: "cep", type: "C", length: 8, decimals: 0 },
		{ name: "natural", type: "C", length: 25, decimals: 0 },
		{ name: "relig", type: "C", length: 40, decimals: 0 },
		{ name: "contato", type: "C", length: 25, decimals: 0 },
		{ name: "telefone", type: "C", length: 14, decimals: 0 },
		{ name: "tipcont", type: "C", length: 2, decimals: 0 },
		{ name: "vlcarne", type: "C", length: 3, decimals: 0 },
		{ name: "formapgto", type: "C", length: 2, decimals: 0 },
		{ name: "seguro", type: "N", length: 2, decimals: 0 },
		{ name: "admissao", type: "D", length: 8, decimals: 0 },
		{ name: "tcarencia", type: "D", length: 8, decimals: 0 },
		{ name: "saitxa", type: "C", length: 4, decimals: 0 },
		{ name: "diapgto", type: "C", length: 2, decimals: 0 },
		{ name: "vendedor", type: "C", length: 3, decimals: 0 },
		{ name: "regiao", type: "C", length: 3, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "obs", type: "M", length: 10, decimals: 0 },
		{ name: "renovar", type: "D", length: 8, decimals: 0 },
		{ name: "funerais", type: "N", length: 2, decimals: 0 },
		{ name: "circinic", type: "C", length: 3, decimals: 0 },
		{ name: "ultcirc", type: "C", length: 3, decimals: 0 },
		{ name: "qtcircs", type: "N", length: 3, decimals: 0 },
		{ name: "qtcircpg", type: "N", length: 3, decimals: 0 },
		{ name: "titular", type: "C", length: 3, decimals: 0 },
		{ name: "particv", type: "N", length: 2, decimals: 0 },
		{ name: "particf", type: "N", length: 2, decimals: 0 },
		{ name: "nrdepend", type: "N", length: 2, decimals: 0 },
		{ name: "ultimp_", type: "D", length: 8, decimals: 0 },
		{ name: "ender_", type: "D", length: 8, decimals: 0 },
		{ name: "ultend", type: "C", length: 10, decimals: 0 },
		{ name: "em_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "atend1", type: "C", length: 15, decimals: 0 },
		{ name: "atend2", type: "C", length: 15, decimals: 0 },
		{ name: "ultnraux", type: "C", length: 3, decimals: 0 },
		{ name: "ultdtaux", type: "D", length: 8, decimals: 0 },
		{ name: "ultvlaux", type: "N", length: 11, decimals: 2 },
		{ name: "email", type: "C", length: 50, decimals: 0 },
		{ name: "segmesref", type: "D", length: 8, decimals: 0 },
		{ name: "segcodcob", type: "C", length: 3, decimals: 0 },
		{ name: "segservcod", type: "C", length: 3, decimals: 0 },
		{ name: "nrsorteio", type: "C", length: 10, decimals: 0 },
		{ name: "complem", type: "C", length: 35, decimals: 0 },
	],
	INSCRITS: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "grau", type: "C", length: 1, decimals: 0 },
		{ name: "seq", type: "N", length: 2, decimals: 0 },
		{ name: "ehtitular", type: "C", length: 1, decimals: 0 },
		{ name: "nome", type: "C", length: 35, decimals: 0 },
		{ name: "nascto_", type: "D", length: 8, decimals: 0 },
		{ name: "estcivil", type: "C", length: 2, decimals: 0 },
		{ name: "interdito", type: "C", length: 1, decimals: 0 },
		{ name: "sexo", type: "C", length: 1, decimals: 0 },
		{ name: "tcarencia", type: "D", length: 8, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "vivofalec", type: "C", length: 1, decimals: 0 },
		{ name: "falecto_", type: "D", length: 8, decimals: 0 },
		{ name: "tipo", type: "C", length: 3, decimals: 0 },
		{ name: "procnr", type: "C", length: 7, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "flag_excl", type: "C", length: 1, decimals: 0 },
		{ name: "cpf", type: "C", length: 15, decimals: 0 },
		{ name: "segmesref", type: "D", length: 8, decimals: 0 },
		{ name: "segpercen", type: "N", length: 6, decimals: 2 },
		{ name: "segcodcob", type: "C", length: 3, decimals: 0 },
		{ name: "segservcod", type: "C", length: 3, decimals: 0 },
	],
	TAXAS: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "pgto_", type: "D", length: 8, decimals: 0 },
		{ name: "valorpg", type: "N", length: 9, decimals: 2 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "forma", type: "C", length: 1, decimals: 0 },
		{ name: "baixa_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "stat", type: "C", length: 1, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
		{ name: "flag_excl", type: "C", length: 1, decimals: 0 },
		{ name: "cedente", type: "C", length: 7, decimals: 0 },
		{ name: "nnumero", type: "C", length: 20, decimals: 0 },
		{ name: "codlan", type: "C", length: 20, decimals: 0 },
	],
	CANCELS: [
		{ name: "cnumero", type: "C", length: 6, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
		{ name: "ccodigo", type: "C", length: 6, decimals: 0 },
		{ name: "cgrupo", type: "C", length: 2, decimals: 0 },
		{ name: "cmotivo", type: "C", length: 20, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "procto_", type: "D", length: 8, decimals: 0 },
	],
	PRCESSOS: [
		{ name: "processo", type: "C", length: 9, decimals: 0 },
		{ name: "categ", type: "C", length: 2, decimals: 0 },
		{ name: "saiu", type: "C", length: 3, decimals: 0 },
		{ name: "grup", type: "C", length: 2, decimals: 0 },
		{ name: "num", type: "C", length: 6, decimals: 0 },
		{ name: "grau", type: "C", length: 1, decimals: 0 },
		{ name: "seq", type: "N", length: 2, decimals: 0 },
		{ name: "seg", type: "C", length: 35, decimals: 0 },
		{ name: "ends", type: "C", length: 40, decimals: 0 },
		{ name: "bais", type: "C", length: 25, decimals: 0 },
		{ name: "cids", type: "C", length: 25, decimals: 0 },
		{ name: "fal", type: "C", length: 35, decimals: 0 },
		{ name: "sep", type: "C", length: 35, decimals: 0 },
		{ name: "dfal", type: "D", length: 8, decimals: 0 },
		{ name: "codlan", type: "C", length: 20, decimals: 0 },
	],
	EMCARNE: [
		{ name: "seq", type: "C", length: 6, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "vendedor", type: "C", length: 3, decimals: 0 },
		{ name: "tip", type: "C", length: 2, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "vencto_", type: "D", length: 8, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "etiqueta_", type: "D", length: 8, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "parok", type: "N", length: 2, decimals: 0 },
		{ name: "intlan", type: "C", length: 8, decimals: 0 },
	],
	TCARNES: [
		{ name: "tip", type: "C", length: 2, decimals: 0 },
		{ name: "tipcob", type: "C", length: 1, decimals: 0 },
		{ name: "formapgto", type: "C", length: 2, decimals: 0 },
		{ name: "pari", type: "N", length: 1, decimals: 0 },
		{ name: "vali", type: "N", length: 8, decimals: 2 },
		{ name: "parf", type: "N", length: 2, decimals: 0 },
		{ name: "parm", type: "N", length: 1, decimals: 0 },
	],
	BOLETOS: [
		{ name: "seq", type: "C", length: 6, decimals: 0 },
		{ name: "nnumero", type: "C", length: 10, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "em_", type: "D", length: 8, decimals: 0 },
	],
	LBXBOLET: [
		{ name: "nrlote", type: "C", length: 6, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "nfcc", type: "C", length: 6, decimals: 0 },
		{ name: "totdesp", type: "N", length: 9, decimals: 2 },
		{ name: "totcred", type: "N", length: 9, decimals: 2 },
		{ name: "totliq", type: "N", length: 9, decimals: 2 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "em_", type: "D", length: 8, decimals: 0 },
		{ name: "ldesp", type: "N", length: 9, decimals: 2 },
		{ name: "lcred", type: "N", length: 9, decimals: 2 },
	],
	BXBOLET: [
		{ name: "nrlote", type: "C", length: 6, decimals: 0 },
		{ name: "seq", type: "C", length: 5, decimals: 0 },
		{ name: "nnumero", type: "C", length: 10, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "vldesp", type: "N", length: 9, decimals: 2 },
		{ name: "flag_excl", type: "C", length: 1, decimals: 0 },
	],
	CLASSES: [
		{ name: "classcod", type: "C", length: 2, decimals: 0 },
		{ name: "descricao", type: "C", length: 35, decimals: 0 },
		{ name: "contrat", type: "N", length: 6, decimals: 0 },
		{ name: "prior", type: "C", length: 1, decimals: 0 },
		{ name: "vljoia", type: "N", length: 11, decimals: 2 },
		{ name: "nrparc", type: "N", length: 2, decimals: 0 },
		{ name: "parcger", type: "N", length: 2, decimals: 0 },
		{ name: "vlmensal", type: "N", length: 11, decimals: 2 },
		{ name: "vldepend", type: "N", length: 11, decimals: 2 },
		{ name: "nrmesval", type: "N", length: 2, decimals: 0 },
		{ name: "renvenc", type: "C", length: 1, decimals: 0 },
		{ name: "renuso", type: "C", length: 1, decimals: 0 },
		{ name: "vltotal", type: "N", length: 11, decimals: 2 },
		{ name: "mensag1", type: "C", length: 30, decimals: 0 },
		{ name: "mensag2", type: "C", length: 30, decimals: 0 },
	],
	ARQGRUP: [
		{ name: "grup", type: "C", length: 2, decimals: 0 },
		{ name: "classe", type: "C", length: 2, decimals: 0 },
		{ name: "inicio", type: "C", length: 6, decimals: 0 },
		{ name: "final", type: "C", length: 6, decimals: 0 },
		{ name: "acumproc", type: "N", length: 2, decimals: 0 },
		{ name: "maxproc", type: "N", length: 2, decimals: 0 },
		{ name: "cpadmiss", type: "C", length: 1, decimals: 0 },
		{ name: "periodic", type: "N", length: 3, decimals: 0 },
		{ name: "qtdremir", type: "N", length: 3, decimals: 0 },
		{ name: "poratend", type: "C", length: 1, decimals: 0 },
		{ name: "ultcirc", type: "C", length: 3, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "procpend", type: "N", length: 3, decimals: 0 },
		{ name: "contrat", type: "N", length: 6, decimals: 0 },
		{ name: "partic", type: "N", length: 6, decimals: 0 },
		{ name: "proxcirc", type: "C", length: 3, decimals: 0 },
	],
	REGIAO: [
		{ name: "codigo", type: "C", length: 3, decimals: 0 },
		{ name: "regiao", type: "C", length: 30, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
	],
	COBRADOR: [
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "funcao", type: "C", length: 1, decimals: 0 },
		{ name: "nome", type: "C", length: 30, decimals: 0 },
		{ name: "endereco", type: "C", length: 30, decimals: 0 },
		{ name: "bairro", type: "C", length: 20, decimals: 0 },
		{ name: "cidade", type: "C", length: 25, decimals: 0 },
		{ name: "telefone", type: "C", length: 14, decimals: 0 },
		{ name: "cpf", type: "C", length: 11, decimals: 0 },
		{ name: "obs", type: "M", length: 10, decimals: 0 },
		{ name: "percent", type: "N", length: 5, decimals: 1 },
		{ name: "superv", type: "C", length: 3, decimals: 0 },
	],
	CIRCULAR: [
		{ name: "grupo", type: "C", length: 2, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "procpend", type: "N", length: 2, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "mesref", type: "C", length: 4, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "menscirc", type: "C", length: 60, decimals: 0 },
		{ name: "menscirc1", type: "C", length: 35, decimals: 0 },
		{ name: "menscirc2", type: "C", length: 35, decimals: 0 },
		{ name: "emitidos", type: "N", length: 6, decimals: 0 },
		{ name: "pagos", type: "N", length: 6, decimals: 0 },
		{ name: "cancelados", type: "N", length: 6, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "funcionar", type: "C", length: 10, decimals: 0 },
		{ name: "impress_", type: "D", length: 8, decimals: 0 },
	],
	FNCS: [
		{ name: "codigo", type: "C", length: 3, decimals: 0 },
		{ name: "nome", type: "C", length: 35, decimals: 0 },
		{ name: "profiss", type: "C", length: 15, decimals: 0 },
		{ name: "nacional", type: "C", length: 15, decimals: 0 },
		{ name: "estciv", type: "C", length: 2, decimals: 0 },
		{ name: "nascto_", type: "D", length: 8, decimals: 0 },
		{ name: "endereco", type: "C", length: 30, decimals: 0 },
		{ name: "bairro", type: "C", length: 25, decimals: 0 },
		{ name: "cidade", type: "C", length: 25, decimals: 0 },
		{ name: "cpf", type: "C", length: 11, decimals: 0 },
		{ name: "telefone", type: "C", length: 14, decimals: 0 },
		{ name: "percent", type: "N", length: 5, decimals: 1 },
		{ name: "obs", type: "M", length: 10, decimals: 0 },
	],
	JUROS: [
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "multa", type: "N", length: 5, decimals: 2 },
		{ name: "mltcaren", type: "N", length: 3, decimals: 0 },
		{ name: "juros", type: "N", length: 5, decimals: 3 },
		{ name: "jrscaren", type: "N", length: 3, decimals: 0 },
	],
	HISTORIC: [
		{ name: "historico", type: "C", length: 3, decimals: 0 },
		{ name: "descricao", type: "C", length: 40, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "origem", type: "C", length: 3, decimals: 0 },
		{ name: "recdesp", type: "C", length: 1, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "intlan", type: "C", length: 8, decimals: 0 },
		{ name: "codlan", type: "C", length: 20, decimals: 0 },
	],
	CGRUPOS: [
		{ name: "numero", type: "C", length: 6, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "grupo", type: "C", length: 2, decimals: 0 },
		{ name: "motivo", type: "C", length: 1, decimals: 0 },
		{ name: "canclto_", type: "D", length: 8, decimals: 0 },
		{ name: "cancpor", type: "C", length: 10, decimals: 0 },
		{ name: "reintnum", type: "C", length: 6, decimals: 0 },
		{ name: "motreint", type: "C", length: 30, decimals: 0 },
		{ name: "reintem_", type: "D", length: 8, decimals: 0 },
		{ name: "reintpor", type: "C", length: 10, decimals: 0 },
		{ name: "codreint", type: "C", length: 8, decimals: 0 },
		{ name: "situacao", type: "C", length: 1, decimals: 0 },
		{ name: "nome", type: "C", length: 35, decimals: 0 },
		{ name: "nascto_", type: "D", length: 8, decimals: 0 },
		{ name: "estcivil", type: "C", length: 2, decimals: 0 },
		{ name: "cpf", type: "C", length: 11, decimals: 0 },
		{ name: "rg", type: "C", length: 20, decimals: 0 },
		{ name: "endereco", type: "C", length: 50, decimals: 0 },
		{ name: "bairro", type: "C", length: 35, decimals: 0 },
		{ name: "cidade", type: "C", length: 35, decimals: 0 },
		{ name: "uf", type: "C", length: 2, decimals: 0 },
		{ name: "cep", type: "C", length: 8, decimals: 0 },
		{ name: "telefone", type: "C", length: 14, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "vendedor", type: "C", length: 3, decimals: 0 },
		{ name: "obs", type: "M", length: 10, decimals: 0 },
	],
	CSTSEG: [
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "hora", type: "C", length: 5, decimals: 0 },
		{ name: "quem", type: "C", length: 10, decimals: 0 },
		{ name: "historic", type: "C", length: 3, decimals: 0 },
		{ name: "contrato", type: "C", length: 6, decimals: 0 },
		{ name: "complement", type: "C", length: 35, decimals: 0 },
		{ name: "qtdade", type: "N", length: 5, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
	],
	TXPROC: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "emissao_", type: "D", length: 8, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "pgto_", type: "D", length: 8, decimals: 0 },
		{ name: "valorpg", type: "N", length: 9, decimals: 2 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "forma", type: "C", length: 1, decimals: 0 },
		{ name: "baixa_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "stat", type: "C", length: 1, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
		{ name: "atp", type: "C", length: 1, decimals: 0 },
		{ name: "atc", type: "C", length: 1, decimals: 0 },
		{ name: "atr", type: "C", length: 1, decimals: 0 },
	],
	TX2VIA: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
	],
	PRADENDO: [
		{ name: "codigo", type: "C", length: 4, decimals: 0 },
		{ name: "produto", type: "C", length: 30, decimals: 0 },
		{ name: "unid", type: "C", length: 2, decimals: 0 },
		{ name: "reftec", type: "M", length: 10, decimals: 0 },
		{ name: "grupo", type: "C", length: 10, decimals: 0 },
		{ name: "depto", type: "C", length: 10, decimals: 0 },
		{ name: "qd_min", type: "N", length: 4, decimals: 0 },
		{ name: "qd_ped", type: "N", length: 5, decimals: 0 },
		{ name: "qd_rec", type: "N", length: 5, decimals: 0 },
		{ name: "qd_ven", type: "N", length: 5, decimals: 0 },
		{ name: "qd_loc", type: "N", length: 5, decimals: 0 },
		{ name: "qd_est", type: "N", length: 6, decimals: 0 },
		{ name: "preco_cus", type: "N", length: 12, decimals: 2 },
		{ name: "custo_", type: "D", length: 8, decimals: 0 },
		{ name: "preco_ven", type: "N", length: 12, decimals: 2 },
		{ name: "venda_", type: "D", length: 8, decimals: 0 },
		{ name: "dt_ult_atu", type: "D", length: 8, decimals: 0 },
	],
	TFILIAIS: [
		{ name: "codigo", type: "C", length: 2, decimals: 0 },
		{ name: "abrev", type: "C", length: 25, decimals: 0 },
		{ name: "nome", type: "C", length: 50, decimals: 0 },
		{ name: "endereco", type: "C", length: 50, decimals: 0 },
		{ name: "cidade", type: "C", length: 50, decimals: 0 },
		{ name: "ref", type: "M", length: 10, decimals: 0 },
		{ name: "contato", type: "C", length: 20, decimals: 0 },
	],
	TXENTR: [
		{ name: "seq", type: "N", length: 6, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "valor", type: "N", length: 9, decimals: 2 },
		{ name: "cob", type: "C", length: 3, decimals: 0 },
		{ name: "mesref", type: "C", length: 4, decimals: 0 },
		{ name: "pgto_", type: "D", length: 8, decimals: 0 },
		{ name: "valorpg", type: "N", length: 9, decimals: 2 },
		{ name: "forma", type: "C", length: 1, decimals: 0 },
		{ name: "baixa_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
	],
	BXREC: [
		{ name: "ano", type: "C", length: 2, decimals: 0 },
		{ name: "numero", type: "C", length: 6, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "valorpg", type: "N", length: 9, decimals: 2 },
		{ name: "valoraux", type: "N", length: 9, decimals: 2 },
		{ name: "emitido_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "numop", type: "C", length: 6, decimals: 0 },
		{ name: "grupo", type: "C", length: 2, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
		{ name: "intlan", type: "C", length: 8, decimals: 0 },
	],
	ATEND800: [
		{ name: "numero", type: "C", length: 8, decimals: 0 },
		{ name: "data_", type: "D", length: 8, decimals: 0 },
		{ name: "hora", type: "C", length: 5, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "nome", type: "C", length: 35, decimals: 0 },
		{ name: "obs", type: "C", length: 200, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "stat", type: "C", length: 1, decimals: 0 },
		{ name: "por", type: "C", length: 50, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
	],
	ACORDOS: [
		{ name: "numero", type: "C", length: 8, decimals: 0 }, // sequencial global
		{ name: "atend", type: "C", length: 8, decimals: 0 }, // nº atendimento
		{ name: "codigo", type: "C", length: 6, decimals: 0 }, // contrato
		{ name: "parcelas", type: "N", length: 3, decimals: 0 }, // nº parcelas
		{ name: "valor", type: "N", length: 9, decimals: 2 }, // valor total
		{ name: "vlparc", type: "N", length: 9, decimals: 2 }, // valor por parcela
		{ name: "data_", type: "D", length: 8, decimals: 0 }, // data do acordo
		{ name: "por", type: "C", length: 10, decimals: 0 }, // usuário
		{ name: "stat", type: "C", length: 1, decimals: 0 }, // A=ativo Q=quitado
		{ name: "obs", type: "C", length: 100, decimals: 0 },
	],
	ALENDER: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "endereco", type: "C", length: 35, decimals: 0 },
		{ name: "bairro", type: "C", length: 25, decimals: 0 },
		{ name: "cidade", type: "C", length: 25, decimals: 0 },
		{ name: "cep", type: "C", length: 8, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "data_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "dendereco", type: "C", length: 35, decimals: 0 },
		{ name: "dbairro", type: "C", length: 25, decimals: 0 },
		{ name: "dcidade", type: "C", length: 25, decimals: 0 },
		{ name: "dcep", type: "C", length: 8, decimals: 0 },
		{ name: "dcobrador", type: "C", length: 3, decimals: 0 },
		{ name: "dgrupo", type: "C", length: 2, decimals: 0 },
		{ name: "emitido_", type: "D", length: 8, decimals: 0 },
		{ name: "filial", type: "C", length: 2, decimals: 0 },
	],
	BXFCC: [
		{ name: "idfilial", type: "C", length: 2, decimals: 0 },
		{ name: "numero", type: "C", length: 6, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
		{ name: "cobrador", type: "C", length: 3, decimals: 0 },
		{ name: "nomecobr", type: "C", length: 30, decimals: 0 },
		{ name: "despesas", type: "N", length: 11, decimals: 2 },
		{ name: "baixa_", type: "D", length: 8, decimals: 0 },
		{ name: "comtxa", type: "N", length: 5, decimals: 1 },
		{ name: "comtroc", type: "N", length: 5, decimals: 1 },
		{ name: "comcarn", type: "N", length: 5, decimals: 1 },
		{ name: "comoutr", type: "N", length: 5, decimals: 1 },
		{ name: "qtdoutr", type: "N", length: 5, decimals: 0 },
		{ name: "vloutr", type: "N", length: 9, decimals: 2 },
		{ name: "parcpag", type: "N", length: 5, decimals: 0 },
		{ name: "vltaxas", type: "N", length: 9, decimals: 2 },
		{ name: "parctroc", type: "N", length: 5, decimals: 0 },
		{ name: "vltrocas", type: "N", length: 9, decimals: 2 },
		{ name: "parccarn", type: "N", length: 5, decimals: 0 },
		{ name: "vlcarnes", type: "N", length: 9, decimals: 2 },
		{ name: "vlrbaix", type: "N", length: 11, decimals: 2 },
		{ name: "nrccpagar", type: "C", length: 6, decimals: 0 },
		{ name: "numop", type: "C", length: 6, decimals: 0 },
		{ name: "intlan", type: "C", length: 8, decimals: 0 },
	],
	MENSAG: [
		{ name: "seq", type: "C", length: 6, decimals: 0 },
		{ name: "filtro", type: "C", length: 210, decimals: 0 },
		{ name: "mens1", type: "M", length: 10, decimals: 0 },
		{ name: "lancto_", type: "D", length: 8, decimals: 0 },
		{ name: "por", type: "C", length: 10, decimals: 0 },
	],
	PAR_ADM: [
		{ name: "pgrupo", type: "C", length: 2, decimals: 0 },
		{ name: "p_filial", type: "C", length: 2, decimals: 0 },
		{ name: "pcontrato", type: "C", length: 6, decimals: 0 },
		{ name: "pgrau", type: "C", length: 1, decimals: 0 },
		{ name: "pseq", type: "N", length: 2, decimals: 0 },
		{ name: "pverpag", type: "C", length: 1, decimals: 0 },
		{ name: "preplanc", type: "C", length: 1, decimals: 0 },
		{ name: "lastcodigo", type: "C", length: 6, decimals: 0 },
		{ name: "nrcanc", type: "N", length: 6, decimals: 0 },
		{ name: "nrreint", type: "N", length: 6, decimals: 0 },
		{ name: "contarec", type: "C", length: 5, decimals: 0 },
		{ name: "contapag", type: "C", length: 5, decimals: 0 },
		{ name: "histrcfcc", type: "C", length: 3, decimals: 0 },
		{ name: "histrcrec", type: "C", length: 3, decimals: 0 },
		{ name: "histrccar", type: "C", length: 3, decimals: 0 },
		{ name: "histpg", type: "C", length: 3, decimals: 0 },
		{ name: "nrauxrec", type: "C", length: 8, decimals: 0 },
		{ name: "mcodigo", type: "C", length: 6, decimals: 0 },
		{ name: "mtipo", type: "C", length: 1, decimals: 0 },
		{ name: "mcirc", type: "C", length: 3, decimals: 0 },
		{ name: "mgrupvip", type: "C", length: 2, decimals: 0 },
		{ name: "combarra", type: "C", length: 1, decimals: 0 },
		{ name: "cinscr", type: "C", length: 1, decimals: 0 },
		{ name: "comfalec", type: "C", length: 1, decimals: 0 },
		{ name: "mproc1", type: "C", length: 5, decimals: 0 },
		{ name: "mproc2", type: "C", length: 2, decimals: 0 },
		{ name: "mproc3", type: "C", length: 2, decimals: 0 },
		{ name: "impnrrec", type: "C", length: 5, decimals: 0 },
		{ name: "procimp", type: "C", length: 9, decimals: 0 },
		{ name: "pvalor", type: "N", length: 9, decimals: 2 },
		{ name: "pcob", type: "C", length: 3, decimals: 0 },
		{ name: "mmesref", type: "C", length: 4, decimals: 0 },
		{ name: "pnumfcc", type: "C", length: 8, decimals: 0 },
		{ name: "p_cidade", type: "C", length: 25, decimals: 0 },
		{ name: "p_recp", type: "C", length: 1, decimals: 0 },
		{ name: "setup1", type: "C", length: 40, decimals: 0 },
		{ name: "cgcsetup", type: "C", length: 14, decimals: 0 },
		{ name: "setup2", type: "C", length: 50, decimals: 0 },
		{ name: "setup3", type: "C", length: 50, decimals: 0 },
		{ name: "pcedente", type: "C", length: 7, decimals: 0 },
	],
	BXTXAS: [
		{ name: "idfilial", type: "C", length: 2, decimals: 0 },
		{ name: "numero", type: "C", length: 6, decimals: 0 },
		{ name: "seq", type: "C", length: 5, decimals: 0 },
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "tipo", type: "C", length: 1, decimals: 0 },
		{ name: "circ", type: "C", length: 3, decimals: 0 },
		{ name: "valorpg", type: "N", length: 9, decimals: 2 },
		{ name: "procok", type: "C", length: 1, decimals: 0 },
		{ name: "flag_excl", type: "C", length: 1, decimals: 0 },
	],
	ADENDOS: [
		{ name: "codigo", type: "C", length: 6, decimals: 0 },
		{ name: "codproduto", type: "C", length: 4, decimals: 0 },
		{ name: "incluido_", type: "D", length: 8, decimals: 0 },
		{ name: "idxd", type: "C", length: 20, decimals: 0 },
		{ name: "idxm", type: "C", length: 20, decimals: 0 },
		{ name: "flag_excl", type: "C", length: 1, decimals: 0 },
	],
};

// Produtos padrão para PRADENDO (catálogo de adendos funerários)
const PRADENDO_SEED: Record<string, string | number>[] = [
	{
		codigo: "0001",
		produto: "URNA EXECUTIVA MOGNO",
		unid: "UN",
		grupo: "URNAS",
		depto: "FUNERARIO",
		qd_min: 1,
		qd_est: 10,
		preco_ven: 2800.0,
	},
	{
		codigo: "0002",
		produto: "URNA STANDARD PINUS",
		unid: "UN",
		grupo: "URNAS",
		depto: "FUNERARIO",
		qd_min: 2,
		qd_est: 20,
		preco_ven: 1400.0,
	},
	{
		codigo: "0003",
		produto: "ORNAMENTACAO FLORAL BASICA",
		unid: "SV",
		grupo: "FLORES",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 350.0,
	},
	{
		codigo: "0004",
		produto: "ORNAMENTACAO FLORAL PREMIUM",
		unid: "SV",
		grupo: "FLORES",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 900.0,
	},
	{
		codigo: "0005",
		produto: "TRANSLADO LOCAL (ATE 50KM)",
		unid: "SV",
		grupo: "TRANSL",
		depto: "LOGISTICA",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 450.0,
	},
	{
		codigo: "0006",
		produto: "TRANSLADO INTERESTADUAL",
		unid: "SV",
		grupo: "TRANSL",
		depto: "LOGISTICA",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 2200.0,
	},
	{
		codigo: "0007",
		produto: "CREMACAO COMPLETA",
		unid: "SV",
		grupo: "CREMACAO",
		depto: "FUNERARIO",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 2500.0,
	},
	{
		codigo: "0008",
		produto: "VELORIO EM SALA VIP",
		unid: "SV",
		grupo: "VELORIO",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 1200.0,
	},
	{
		codigo: "0009",
		produto: "CARPA COBERTURA EXTERNA",
		unid: "SV",
		grupo: "EQUIP",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 10,
		preco_ven: 250.0,
	},
	{
		codigo: "0010",
		produto: "JAZIGO PERPETUO CEMITERIO",
		unid: "UN",
		grupo: "JAZIGO",
		depto: "CEMITERIO",
		qd_min: 0,
		qd_est: 5,
		preco_ven: 8500.0,
	},
	{
		codigo: "0011",
		produto: "MISSA DE SETIMO DIA",
		unid: "SV",
		grupo: "RELIGIOSO",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 180.0,
	},
	{
		codigo: "0012",
		produto: "CERIMONIAL COMPLETO PREMIUM",
		unid: "SV",
		grupo: "CERIM",
		depto: "CERIMONIAL",
		qd_min: 0,
		qd_est: 99,
		preco_ven: 5500.0,
	},
];

// Codifica string em bytes ASCII com padding
function encodeField(val: unknown, length: number, type: string): number[] {
	const bytes: number[] = [];
	if (type === "D") {
		const d = val instanceof Date ? val : null;
		const s = d
			? `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
			: "        ";
		for (let i = 0; i < length; i++) bytes.push(s.charCodeAt(i) || 0x20);
	} else if (type === "N") {
		const n = Number(val ?? 0);
		const s = String(n || 0)
			.padStart(length, " ")
			.slice(-length);
		for (let i = 0; i < length; i++) bytes.push(s.charCodeAt(i) || 0x20);
	} else if (type === "M") {
		for (let i = 0; i < length; i++) bytes.push(0x20);
	} else {
		const s = String(val ?? "")
			.padEnd(length, " ")
			.slice(0, length);
		for (let i = 0; i < length; i++) bytes.push(s.charCodeAt(i) || 0x20);
	}
	return bytes;
}

// Cria DBF com registros pré-populados
function createDbfWithRecords(
	fields: DbfField[],
	records: Record<string, unknown>[],
): ArrayBuffer {
	const headerSize = 32 + fields.length * 32 + 1;
	const recordSize = 1 + fields.reduce((acc, f) => acc + f.length, 0);
	const totalSize = headerSize + records.length * recordSize + 1;
	const buffer = new ArrayBuffer(totalSize);
	const bytes = new Uint8Array(buffer);
	const view = new DataView(buffer);

	const now = new Date();
	bytes[0] = 3;
	bytes[1] = now.getFullYear() - 1900;
	bytes[2] = now.getMonth() + 1;
	bytes[3] = now.getDate();
	view.setUint32(4, records.length, true);
	view.setUint16(8, headerSize, true);
	view.setUint16(10, recordSize, true);

	// Field descriptors
	let off = 32;
	for (const field of fields) {
		const nameBytes = new TextEncoder().encode(field.name.toUpperCase());
		for (let i = 0; i < 11; i++) bytes[off + i] = nameBytes[i] ?? 0;
		bytes[off + 11] = field.type.charCodeAt(0);
		bytes[off + 16] = field.length;
		bytes[off + 17] = field.decimals;
		off += 32;
	}
	bytes[off] = 0x0d; // header terminator

	// Records
	off = headerSize;
	for (const rec of records) {
		bytes[off++] = 0x20; // deletion flag ' '
		for (const field of fields) {
			const fieldBytes = encodeField(
				rec[field.name] ?? rec[field.name.toLowerCase()],
				field.length,
				field.type,
			);
			for (const b of fieldBytes) bytes[off++] = b;
		}
	}
	bytes[off] = 0x1a; // EOF
	return buffer;
}

// Cria um arquivo DBF vazio com a estrutura definida
function createEmptyDbf(fields: DbfField[]): ArrayBuffer {
	const headerSize = 32 + fields.length * 32 + 1;
	const recordSize = 1 + fields.reduce((acc, f) => acc + f.length, 0);
	const buffer = new ArrayBuffer(headerSize + 1); // sem registros + EOF
	const bytes = new Uint8Array(buffer);
	const view = new DataView(buffer);

	const now = new Date();
	bytes[0] = 3; // dBASE III
	bytes[1] = now.getFullYear() - 1900;
	bytes[2] = now.getMonth() + 1;
	bytes[3] = now.getDate();
	view.setUint32(4, 0, true); // 0 registros
	view.setUint16(8, headerSize, true);
	view.setUint16(10, recordSize, true);

	let offset = 32;
	for (const field of fields) {
		const nameBytes = new TextEncoder().encode(field.name.toUpperCase());
		for (let i = 0; i < 11; i++) bytes[offset + i] = nameBytes[i] ?? 0;
		bytes[offset + 11] = field.type.charCodeAt(0);
		bytes[offset + 16] = field.length;
		bytes[offset + 17] = field.decimals;
		offset += 32;
	}

	bytes[offset] = 0x0d; // header terminator
	bytes[offset + 1] = 0x1a; // EOF
	return buffer;
}

// Verifica quais DBFs existem no diretório e cria os que faltam
export async function initializeDbfs(
	dirHandle: FileSystemDirectoryHandle,
	onProgress?: (msg: string) => void,
): Promise<{ created: string[]; existing: string[] }> {
	const created: string[] = [];
	const existing: string[] = [];

	// Lista arquivos existentes
	const existingFiles = new Set<string>();
	for await (const [name] of dirHandle.entries()) {
		existingFiles.add(name.toUpperCase());
	}

	for (const [dbfName, fields] of Object.entries(DBF_STRUCTURES)) {
		const fileName = `${dbfName}.DBF`;

		if (existingFiles.has(fileName)) {
			// PRADENDO especial: se existir mas estiver vazio, popula com produtos padrão
			if (dbfName === "PRADENDO") {
				try {
					const fh = await dirHandle.getFileHandle(fileName);
					const file = await fh.getFile();
					const buf = await file.arrayBuffer();
					const view = new DataView(buf);
					const recordCount =
						buf.byteLength >= 8 ? view.getUint32(4, true) : 0;
					if (recordCount === 0) {
						onProgress?.(
							`Populando ${fileName} com produtos padrão...`,
						);
						const newBuf = createDbfWithRecords(
							fields,
							PRADENDO_SEED as Record<string, unknown>[],
						);
						const writable = await fh.createWritable();
						await writable.write(newBuf);
						await writable.close();
						created.push(dbfName);
						continue;
					}
				} catch (e) {
					console.warn(
						"Não foi possível verificar/popular PRADENDO.DBF:",
						e,
					);
				}
			}
			existing.push(dbfName);
			continue;
		}

		onProgress?.(`Criando ${fileName}...`);
		try {
			// PRADENDO: cria com produtos padrão para que os adendos funcionem imediatamente
			const buffer =
				dbfName === "PRADENDO"
					? createDbfWithRecords(
							fields,
							PRADENDO_SEED as Record<string, unknown>[],
						)
					: createEmptyDbf(fields);
			const fileHandle = await dirHandle.getFileHandle(fileName, {
				create: true,
			});
			const writable = await fileHandle.createWritable();
			await writable.write(buffer);
			await writable.close();
			created.push(dbfName);
		} catch (e) {
			console.warn(`Não foi possível criar ${fileName}:`, e);
		}
	}

	return { created, existing };
}
