import { useState } from "react";
import { useAppStore } from "../../../store/appStore";
import { writeDbfFile } from "../../../services/dbf/DbfReader";
import type { DbfTable } from "../../../services/dbf/DbfReader";
import { PageHeader, Btn } from "../../../components/common/PageHeader";
import type { DbfRecord } from "../../../types/models";
import { CLSINFO_FIELDS, CLSITEM_FIELDS } from "../tabelas/ClsInfoModal";
import { DBF_STRUCTURES } from "../../../services/dbf/initializeDbfs";

// ── Dados fictícios ──────────────────────────────────────────────────────────

const NOMES = [
	"MARIA APARECIDA SILVA",
	"JOÃO CARLOS OLIVEIRA",
	"ANA PAULA SANTOS",
	"PEDRO HENRIQUE COSTA",
	"LUCIA FERREIRA ALVES",
	"ANTONIO JOSE ROCHA",
	"FERNANDA LIMA SOUZA",
	"CARLOS EDUARDO PEREIRA",
	"ROSA MARIA GOMES",
	"FRANCISCO NETO BARBOSA",
	"JULIANA CRISTINA ARAUJO",
	"MARCOS VINICIUS DIAS",
	"PATRICIA RODRIGUES MOURA",
	"RAFAEL AUGUSTO CARVALHO",
	"SILVIA HELENA MARTINS",
	"EDUARDO LUIZ RIBEIRO",
	"CLAUDIA APARECIDA PINTO",
	"RODRIGO CESAR TEIXEIRA",
	"VERA LUCIA CAMPOS",
	"DANIEL FERNANDO NASCIMENTO",
	"BEATRIZ HELENA SOUZA",
	"GABRIEL AUGUSTO LIMA",
	"LETICIA MARIA FERREIRA",
	"LUCAS HENRIQUE COSTA",
	"AMANDA CRISTINA SILVA",
	"THIAGO ROBERTO PEREIRA",
	"CARLA OLIVEIRA SANTOS",
	"RENATO CESAR MARTINS",
	"FABIANA SILVA ROCHA",
	"WELLINGTON JOSE ALVES",
];

const ENDERECOS = [
	"RUA DAS FLORES",
	"AV BRASIL",
	"RUA TIRADENTES",
	"RUA SETE DE SETEMBRO",
	"AV PAULISTA",
	"RUA XV DE NOVEMBRO",
	"AV GETULIO VARGAS",
	"RUA DOM PEDRO",
	"AV INDEPENDENCIA",
	"RUA SANTOS DUMONT",
	"RUA JOSE DE ALENCAR",
	"AV CASTELO BRANCO",
	"RUA MARECHAL DEODORO",
	"AV SAO JOAO",
	"RUA CORONEL FABRICIO",
	"AV REPUBLICA",
	"RUA BARRAO DO RIO BRANCO",
	"AV KENNEDY",
	"RUA VISCONDE DE MAUA",
	"AV AFONSO PENA",
	"RUA MARQUES DE POMBAL",
	"AV DAS NACOES",
	"RUA CORONEL MOREIRA",
	"AV DUQUE DE CAXIAS",
	"RUA MAESTRO CARDIM",
	"AV IPIRANGA",
	"RUA AUGUSTA",
	"AV BRIGADEIRO FARIA LIMA",
	"RUA HADDOCK LOBO",
	"AV REBOUCAS",
];

const BAIRROS = [
	"CENTRO",
	"JARDIM AMERICA",
	"VILA NOVA",
	"BELA VISTA",
	"SANTA CRUZ",
	"JARDIM PAULISTA",
	"NOVA ESPERANCA",
	"SAO JOSE",
	"PARQUE INDUSTRIAL",
	"RESIDENCIAL PARQUE",
	"VILA OPERARIA",
	"JARDIM SUL",
	"ALTO DA BOA VISTA",
	"COHAB",
	"JARDIM PROGRESSO",
];

const CIDADES = [
	"SAO PAULO",
	"CAMPINAS",
	"RIBEIRAO PRETO",
	"SOROCABA",
	"BAURU",
	"MARILIA",
];
const ESTCIVIL = ["CA", "SO", "DI", "VI"];

const NOMES_DEP = [
	"JOSE",
	"MARIA",
	"LUCAS",
	"ANA",
	"PAULO",
	"JULIA",
	"GABRIEL",
	"ISABELA",
	"MATEUS",
	"BEATRIZ",
	"ENZO",
	"LARISSA",
	"HENRIQUE",
	"CAMILA",
	"RAFAEL",
];

// Situações: 25 ativos, 3 cancelados, 2 suspensos
const SITUACOES_30 = [
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"1",
	"2",
	"2",
	"2",
	"3",
	"3",
];

const COBRADORES_COD = ["001", "002", "003", "004"];
const VENDEDORES_COD = ["V01", "V02", "V03"];
const REGIOES_COD = ["R01", "R02", "R03", "R04"];
const GRUPOS_COD = ["0001", "0002", "0003"];

// Valor da última circular por grupo (rvlaux)
const CIRCULAR_VALOR: Record<string, number> = {
	"01": 40.0,
	"02": 60.0,
	"03": 80.0,
};

// ── Seed fixo: cobradores e regiões ─────────────────────────────────────────

const COBRADOR_SEED: DbfRecord[] = [
	{
		cobrador: "001",
		funcao: "C",
		nome: "JOAO CARLOS SILVA",
		endereco: "RUA DAS ACACIAS, 10",
		bairro: "CENTRO",
		cidade: "SAO PAULO",
		telefone: "(11) 98001-0001",
		cpf: "111.111.111-01",
		obs: "",
		percent: 5.0,
		superv: "",
	},
	{
		cobrador: "002",
		funcao: "C",
		nome: "MARIA SANTOS PEREIRA",
		endereco: "AV BRASIL, 200",
		bairro: "JARDIM AMERICA",
		cidade: "SAO PAULO",
		telefone: "(11) 98001-0002",
		cpf: "222.222.222-02",
		obs: "",
		percent: 5.0,
		superv: "",
	},
	{
		cobrador: "003",
		funcao: "C",
		nome: "PEDRO ALVES COSTA",
		endereco: "RUA TIRADENTES, 55",
		bairro: "VILA NOVA",
		cidade: "SAO PAULO",
		telefone: "(11) 98001-0003",
		cpf: "333.333.333-03",
		obs: "",
		percent: 4.5,
		superv: "",
	},
	{
		cobrador: "004",
		funcao: "C",
		nome: "ANA LUCIA FERREIRA",
		endereco: "RUA SETE DE SETEMBRO, 7",
		bairro: "BELA VISTA",
		cidade: "SAO PAULO",
		telefone: "(11) 98001-0004",
		cpf: "444.444.444-04",
		obs: "",
		percent: 4.5,
		superv: "",
	},
	{
		cobrador: "V01",
		funcao: "V",
		nome: "CARLOS ROBERTO VENDAS",
		endereco: "AV PAULISTA, 1000",
		bairro: "CENTRO",
		cidade: "SAO PAULO",
		telefone: "(11) 97001-0001",
		cpf: "555.555.555-05",
		obs: "",
		percent: 3.0,
		superv: "",
	},
	{
		cobrador: "V02",
		funcao: "V",
		nome: "LUCIA COMERCIAL LIMA",
		endereco: "RUA XV DE NOVEMBRO, 30",
		bairro: "CENTRO",
		cidade: "CAMPINAS",
		telefone: "(19) 97001-0002",
		cpf: "666.666.666-06",
		obs: "",
		percent: 3.0,
		superv: "",
	},
	{
		cobrador: "V03",
		funcao: "V",
		nome: "ROBERTO SOUZA VENDAS",
		endereco: "AV GETULIO VARGAS, 88",
		bairro: "JARDIM SUL",
		cidade: "BAURU",
		telefone: "(14) 97001-0003",
		cpf: "777.777.777-07",
		obs: "",
		percent: 2.5,
		superv: "",
	},
];

const REGIAO_SEED: DbfRecord[] = [
	{ codigo: "R01", regiao: "ZONA NORTE", cobrador: "001" },
	{ codigo: "R02", regiao: "ZONA SUL", cobrador: "002" },
	{ codigo: "R03", regiao: "ZONA LESTE", cobrador: "003" },
	{ codigo: "R04", regiao: "ZONA OESTE", cobrador: "004" },
];

const CLASSES_SEED: DbfRecord[] = [
	{
		classcod: "01",
		descricao: "Essencial",
		contrat: 0,
		prior: "N",
		vljoia: 200.0,
		nrparc: 4,
		parcger: 0,
		vlmensal: 29.9,
		vldepend: 0,
		nrmesval: 12,
		renvenc: "S",
		renuso: "N",
		vltotal: 0,
		mensag1: "",
		mensag2: "",
	},
	{
		classcod: "02",
		descricao: "Família I",
		contrat: 0,
		prior: "N",
		vljoia: 350.0,
		nrparc: 6,
		parcger: 0,
		vlmensal: 39.9,
		vldepend: 10.0,
		nrmesval: 12,
		renvenc: "S",
		renuso: "N",
		vltotal: 0,
		mensag1: "",
		mensag2: "",
	},
	{
		classcod: "03",
		descricao: "TOTAL+",
		contrat: 0,
		prior: "N",
		vljoia: 600.0,
		nrparc: 6,
		parcger: 0,
		vlmensal: 59.9,
		vldepend: 19.0,
		nrmesval: 12,
		renvenc: "S",
		renuso: "N",
		vltotal: 0,
		mensag1: "",
		mensag2: "",
	},
];

const CLSINFO_SEED: DbfRecord[] = [
	{
		classcod: "01",
		subtitulo: "Plano individual a partir de:",
		descricao:
			"Plano individual a partir de R$19,90. Você pode personalizar seu Plano Essencial incluindo até 10 pessoas. Pague um pequeno valor extra por dependente e escolha apenas os itens que desejar, cada um com acréscimo acessível.",
		cobertura: "",
		preco_exib: 19.9,
		url_contrat: "",
		url_saiba: "",
		ordem: 1,
		destaque: false,
	},
	{
		classcod: "02",
		subtitulo: "",
		descricao: "",
		cobertura:
			"Titular e cônjuge (até 65 anos) + Filhos (até 33 anos) + Pai, mãe, sogro e sogra (sem limite de idade)",
		preco_exib: 89.9,
		url_contrat: "",
		url_saiba: "",
		ordem: 2,
		destaque: true,
	},
	{
		classcod: "03",
		subtitulo: "",
		descricao: "",
		cobertura:
			"Titular e cônjuge (até 70 anos) + Filhos (sem limite de idade) + Pai, mãe, sogro e sogra + Mais 2 dependentes (até 50 anos)",
		preco_exib: 139.9,
		url_contrat: "",
		url_saiba: "",
		ordem: 3,
		destaque: false,
	},
];

const CLSITEM_SEED: DbfRecord[] = [
	// ── Essencial (01) ────────────────────────────────────────────────────────
	{ classcod: "01", ordem: 1, descricao: "Atendimento 24h", status: "I" },
	{ classcod: "01", ordem: 2, descricao: "Cobertura nacional", status: "I" },
	{
		classcod: "01",
		ordem: 3,
		descricao: "Profissionais de execução e atendimento especializados",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 4,
		descricao: "Providência de documentos",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 5,
		descricao: "Translado até 100 km (adicional opcional até 1.000 km)",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 6,
		descricao: "Serviço geral de autofúnebre",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 7,
		descricao: "Preparação do corpo e necromaquiagem",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 8,
		descricao: "Taxa sala de velório (municipal)",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 9,
		descricao: "Taxa de sepultamento (municipal)",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 10,
		descricao: "Sala de velório com montagem completa",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 11,
		descricao: "Urna (caixão) de alta qualidade",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 12,
		descricao: "Ornamentação de urna com véu especial",
		status: "I",
	},
	{ classcod: "01", ordem: 13, descricao: "Cesta de café", status: "I" },
	{ classcod: "01", ordem: 14, descricao: "Coroa de flores", status: "O" },
	{ classcod: "01", ordem: 15, descricao: "Cremação", status: "O" },
	{ classcod: "01", ordem: 16, descricao: "Jazigo", status: "N" },
	{
		classcod: "01",
		ordem: 17,
		descricao: "Cartão auxílio-alimentação",
		status: "N",
	},
	{
		classcod: "01",
		ordem: 18,
		descricao: "Apoio psicológico e orientação jurídica",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 19,
		descricao: "Equipamentos de reabilitação (locação)",
		status: "I",
	},
	{
		classcod: "01",
		ordem: 20,
		descricao: "Telemedicina com consultas 24h",
		status: "N",
	},
	{
		classcod: "01",
		ordem: 21,
		descricao: "Crédito para medicamentos",
		status: "N",
	},
	// ── Família I (02) ────────────────────────────────────────────────────────
	{ classcod: "02", ordem: 1, descricao: "Atendimento 24h", status: "I" },
	{ classcod: "02", ordem: 2, descricao: "Cobertura nacional", status: "I" },
	{
		classcod: "02",
		ordem: 3,
		descricao: "Profissionais de execução e atendimento especializados",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 4,
		descricao: "Providência de documentos",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 5,
		descricao: "Translado até 100 km (adicional opcional até 1.000 km)",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 6,
		descricao: "Serviço geral de autofúnebre",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 7,
		descricao: "Preparação do corpo e necromaquiagem",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 8,
		descricao: "Taxa sala de velório (municipal)",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 9,
		descricao: "Taxa de sepultamento (municipal)",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 10,
		descricao: "Sala de velório com montagem completa",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 11,
		descricao: "Urna (caixão) de alta qualidade",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 12,
		descricao: "Ornamentação de urna com véu especial",
		status: "I",
	},
	{ classcod: "02", ordem: 13, descricao: "Cesta de café", status: "I" },
	{ classcod: "02", ordem: 14, descricao: "Coroa de flores", status: "O" },
	{ classcod: "02", ordem: 15, descricao: "Cremação", status: "O" },
	{ classcod: "02", ordem: 16, descricao: "Jazigo", status: "N" },
	{
		classcod: "02",
		ordem: 17,
		descricao: "Cartão auxílio-alimentação",
		status: "N",
	},
	{
		classcod: "02",
		ordem: 18,
		descricao: "Apoio psicológico e orientação jurídica",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 19,
		descricao: "Equipamentos de reabilitação (empréstimo 60 dias)",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 20,
		descricao: "Telemedicina 24h (titular + 3 dependentes)",
		status: "I",
	},
	{
		classcod: "02",
		ordem: 21,
		descricao: "Crédito para medicamentos",
		status: "N",
	},
	// ── TOTAL+ (03) ───────────────────────────────────────────────────────────
	{ classcod: "03", ordem: 1, descricao: "Atendimento 24h", status: "I" },
	{ classcod: "03", ordem: 2, descricao: "Cobertura nacional", status: "I" },
	{
		classcod: "03",
		ordem: 3,
		descricao: "Profissionais de execução e atendimento especializados",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 4,
		descricao: "Providência de documentos",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 5,
		descricao: "Translado até 300 km (adicional opcional até 1.000 km)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 6,
		descricao: "Serviço geral de autofúnebre",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 7,
		descricao: "Preparação do corpo e necromaquiagem",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 8,
		descricao: "Taxa sala de velório (municipal/particular)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 9,
		descricao: "Taxa de sepultamento (municipal/particular)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 10,
		descricao: "Sala de velório com montagem completa",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 11,
		descricao: "Urna (caixão) de alta qualidade superior",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 12,
		descricao: "Ornamentação de urna com véu especial",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 13,
		descricao: "Cesta de café completa e exclusiva",
		status: "I",
	},
	{ classcod: "03", ordem: 14, descricao: "Coroa de flores", status: "I" },
	{ classcod: "03", ordem: 15, descricao: "Cremação", status: "I" },
	{ classcod: "03", ordem: 16, descricao: "Jazigo", status: "N" },
	{
		classcod: "03",
		ordem: 17,
		descricao: "Cartão auxílio-alimentação (por 6 meses)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 18,
		descricao: "Apoio psicológico e orientação jurídica",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 19,
		descricao: "Equipamentos de reabilitação (empréstimo 90 dias)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 20,
		descricao: "Telemedicina 24h (titular + todos os dependentes)",
		status: "I",
	},
	{
		classcod: "03",
		ordem: 21,
		descricao: "Crédito para medicamentos (cartão recorrente/CPFL)",
		status: "I",
	},
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function rnd<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
function rndInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pad(n: number, len = 9) {
	return String(n).padStart(len, "0");
}
function pad3(n: number) {
	return String(n).padStart(3, "0");
}

function fakePhone() {
	return `(${rndInt(11, 99)}) 9${rndInt(1000, 9999)}-${rndInt(1000, 9999)}`;
}
function fakeCpf() {
	const d = Array.from({ length: 9 }, () => rndInt(0, 9));
	return d.join("").replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3-00");
}

function addMonths(d: Date, m: number): Date {
	const r = new Date(d);
	r.setMonth(r.getMonth() + m);
	return r;
}

function addDays(d: Date, days: number): Date {
	const r = new Date(d);
	r.setDate(r.getDate() + days);
	return r;
}

/** Formata data no formato MMAA (ex: janeiro 2028 → "0128") */
function toMMAA(d: Date): string {
	return (
		String(d.getMonth() + 1).padStart(2, "0") +
		String(d.getFullYear()).slice(2)
	);
}

function emptyTable(
	existing: DbfTable | undefined,
	tableName?: string,
): DbfTable {
	const existingFields = existing?.header?.fields ?? [];
	const fields =
		existingFields.length > 0
			? existingFields
			: tableName
				? (DBF_STRUCTURES[tableName.toUpperCase()] ?? [])
				: [];
	return {
		header: {
			...(existing?.header ?? {
				version: 3,
				lastUpdate: new Date(),
				recordCount: 0,
				headerSize: 0,
				recordSize: 0,
			}),
			fields,
		},
		records: [],
	};
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SeedData() {
	const { getTable, setTable, dirHandle } = useAppStore();
	const [log, setLog] = useState<string[]>([]);
	const [running, setRunning] = useState(false);
	const [done, setDone] = useState(false);

	async function handleGenerate() {
		if (!dirHandle) {
			alert("Selecione o diretório DBF primeiro (Setup).");
			return;
		}
		setRunning(true);
		setDone(false);
		setLog([]);
		const lines: string[] = [];
		const push = (s: string) => {
			lines.push(s);
			setLog([...lines]);
		};

		try {
			const hoje = new Date();

			const gruposTable = getTable("grupos");
			const taxasTable = getTable("taxas");
			const inscritsTable = getTable("inscrits");
			const cobradorTable = getTable("cobrador");
			const regiaoTable = getTable("regiao");
			const classesTable = getTable("classes");
			const circularTable = getTable("circular");
			const adencobTable = getTable("adencob");
			const adendosTable = getTable("adendos");

			// ── COBRADOR (seed se não existir) ───────────────────────────────────────
			const cobradorJaSeeded = (cobradorTable?.records ?? []).some(
				(r) => !r._deleted && String(r.cobrador ?? "").trim() === "001",
			);
			if (cobradorJaSeeded) {
				push("ℹ️  COBRADOR.DBF já possui dados — mantendo.");
			} else {
				push("💾 Gerando COBRADOR.DBF...");
				const t = {
					...emptyTable(cobradorTable),
					records: COBRADOR_SEED,
				};
				await writeDbfFile(dirHandle, "COBRADOR", t);
				setTable("cobrador", t);
				push(
					`✅ ${COBRADOR_SEED.length} cobradores/vendedores gravados`,
				);
			}

			// ── REGIAO (seed se não existir) ─────────────────────────────────────────
			const regiaoJaSeeded = (regiaoTable?.records ?? []).some(
				(r) =>
					!r._deleted &&
					REGIOES_COD.includes(String(r.codigo ?? "").trim()),
			);
			if (regiaoJaSeeded) {
				push("ℹ️  REGIAO.DBF já possui dados — mantendo.");
			} else {
				push("💾 Gerando REGIAO.DBF...");
				const t = { ...emptyTable(regiaoTable), records: REGIAO_SEED };
				await writeDbfFile(dirHandle, "REGIAO", t);
				setTable("regiao", t);
				push(`✅ ${REGIAO_SEED.length} regiões gravadas`);
			}

			// ── CLASSES (sempre apaga e repopula) ────────────────────────────────────
			push("");
			push("🗑️  Recriando CLASSES.DBF...");
			const newClasses = {
				...emptyTable(classesTable),
				records: CLASSES_SEED,
			};
			await writeDbfFile(dirHandle, "CLASSES", newClasses);
			setTable("classes", newClasses);
			push(
				`✅ ${CLASSES_SEED.length} categorias gravadas (Essencial / Família I / TOTAL+)`,
			);

			// ── CLSINFO (sempre apaga e repopula) ────────────────────────────────────
			push("🗑️  Recriando CLSINFO.DBF...");
			const clsInfoTable = getTable("clsinfo");
			const newClsInfo = {
				header: {
					version: 3,
					lastUpdate: new Date(),
					recordCount: CLSINFO_SEED.length,
					headerSize: 0,
					recordSize: 0,
					fields: CLSINFO_FIELDS,
				},
				records: CLSINFO_SEED,
			};
			await writeDbfFile(dirHandle, "CLSINFO", newClsInfo);
			setTable("clsinfo", {
				...(clsInfoTable ?? newClsInfo),
				...newClsInfo,
			});
			push(`✅ ${CLSINFO_SEED.length} registros CLSINFO gravados`);

			// ── CLSITEM (sempre apaga e repopula) ────────────────────────────────────
			push("🗑️  Recriando CLSITEM.DBF...");
			const clsItemTable = getTable("clsitem");
			const newClsItem = {
				header: {
					version: 3,
					lastUpdate: new Date(),
					recordCount: CLSITEM_SEED.length,
					headerSize: 0,
					recordSize: 0,
					fields: CLSITEM_FIELDS,
				},
				records: CLSITEM_SEED,
			};
			await writeDbfFile(dirHandle, "CLSITEM", newClsItem);
			setTable("clsitem", {
				...(clsItemTable ?? newClsItem),
				...newClsItem,
			});
			push(`✅ ${CLSITEM_SEED.length} itens CLSITEM gravados`);

			// ── CIRCULAR (sempre apaga e repopula — uma circular por grupo) ───────────
			push("🗑️  Recriando CIRCULAR.DBF...");
			const circularSeed: DbfRecord[] = GRUPOS_COD.map((g, idx) => ({
				grupo: g,
				circ: pad3(idx + 1),
				procpend: 0,
				emissao_: new Date(hoje.getFullYear(), hoje.getMonth(), 1, 12),
				mesref: toMMAA(hoje),
				valor: 0.0,
				menscirc: "",
				menscirc1: "",
				menscirc2: "",
				emitidos: 0,
				pagos: 0,
				cancelados: 0,
			}));
			const newCircular = {
				...emptyTable(circularTable),
				records: circularSeed,
			};
			await writeDbfFile(dirHandle, "CIRCULAR", newCircular);
			setTable("circular", newCircular);
			push(
				`✅ ${circularSeed.length} circulares gravadas (grupos ${GRUPOS_COD.join(", ")})`,
			);

			// ── Limpa GRUPOS / TAXAS / INSCRITS ─────────────────────────────────────
			push("");
			push("🗑️  Limpando GRUPOS / TAXAS / INSCRITS...");

			const novasGrupos: DbfRecord[] = [];
			const novasTaxas: DbfRecord[] = [];
			const novosInscrits: DbfRecord[] = [];
			const novosAdencob: DbfRecord[] = [];
			const novosAdendos: DbfRecord[] = [];

			// Produtos fixos para ADENCOB (referência a PRADENDO)
			// tipcob: M=Mensal B=Bimestral T=Trimestral S=Semestral A=Anual
			const ADENCOB_PRODUTOS = [
				{
					codproduto: "0001",
					nome: "Multiassistência",
					valor: 89.9,
					tipcob: "M",
				},
				{
					codproduto: "0004",
					nome: "Bom Pet",
					valor: 59.9,
					tipcob: "M",
				},
				{
					codproduto: "0005",
					nome: "Bom Med",
					valor: 99.9,
					tipcob: "S",
				}, // Semestral
				{
					codproduto: "0006",
					nome: "Bom Auto",
					valor: 79.9,
					tipcob: "A",
				}, // Anual
			];
			const TIPCOB_MULT_SEED: Record<string, number> = {
				M: 1,
				B: 2,
				T: 3,
				S: 6,
				A: 12,
			};
			let adencobSeq = 1;

			// Gera admissões distribuídas: cada contrato em um mês diferente dos últimos 36
			// Divide os 30 contratos em fatias de ~1 mês cada para cobrir ~30 meses
			const admissaoPorContrato = Array.from({ length: 30 }, (_, i) => {
				const mesesAtras = (rndInt(i * 1, i * 1 + 5) % 36) + 1; // distribui entre 1..36 meses atrás
				const d = addMonths(hoje, -mesesAtras);
				return new Date(
					d.getFullYear(),
					d.getMonth(),
					rndInt(1, 20),
					12,
				);
			}).sort((a, b) => a.getTime() - b.getTime()); // ordena do mais antigo para o mais recente

			push("");

			for (let i = 0; i < 30; i++) {
				const codigo = pad(i + 1);
				const admissao = admissaoPorContrato[i];
				const situacao = SITUACOES_30[i];
				const cobrador = rnd(COBRADORES_COD);
				const vendedor = rnd(VENDEDORES_COD);
				const regiao = rnd(REGIOES_COD);
				const grupo = GRUPOS_COD[i % GRUPOS_COD.length]; // distribui entre grupos
				const rvlaux = CIRCULAR_VALOR[grupo] ?? 0; // valor da circular do grupo
				const qtDep = rndInt(0, 4); // 0..4 dependentes
				// Individual (01) só para contratos sem dependentes; demais revezam entre Basico/Premium
				const tipcont =
					qtDep === 0
						? ["01", "02", "03"][i % 3] // sem dep.: pode ser qualquer cat.
						: ["02", "03"][i % 2]; // com dep.: apenas Basico ou Premium
				const cat = CLASSES_SEED.find(
					(c) => String(c.classcod) === tipcont,
				);
				const vlmensal = Number(cat?.vlmensal ?? 89.9);
				const vldepend = Number(cat?.vldepend ?? 0);
				const vlMensal = rvlaux + vlmensal + qtDep * vldepend; // circular + categoria + deps
				const carencia = addMonths(admissao, 3);

				// saitxa: MMAA de um mês futuro (contrato ainda vigente)
				const vencContrato = addMonths(hoje, rndInt(12, 60));
				const saitxa =
					situacao === "1" ? toMMAA(vencContrato) : toMMAA(hoje);

				// ── Contrato ──────────────────────────────────────────────────────────
				// Calcula circulares: 1 por mês desde admissão até hoje
				const mesesDesdeAdmissao = Math.max(
					1,
					(hoje.getFullYear() - admissao.getFullYear()) * 12 +
						(hoje.getMonth() - admissao.getMonth()) +
						1,
				);
				const qtCircsTotal = Math.min(mesesDesdeAdmissao, 36); // max 36 circulares
				// Última fica em aberto, o restante pago
				const qtCircsPagas = Math.max(0, qtCircsTotal - 1);

				novasGrupos.push({
					codigo,
					grupo,
					situacao,
					nome: NOMES[i],
					nascto_: new Date(
						rndInt(1950, 1985),
						rndInt(0, 11),
						rndInt(1, 28),
						12,
					),
					estcivil: rnd(ESTCIVIL),
					cpf: fakeCpf(),
					rg: String(rndInt(1000000, 9999999)),
					endereco: `${ENDERECOS[i]}, ${rndInt(1, 999)}`,
					bairro: rnd(BAIRROS),
					cidade: rnd(CIDADES),
					uf: "SP",
					cep: `${rndInt(10000, 99999)}-${rndInt(100, 999)}`,
					natural: rnd(CIDADES),
					relig: "",
					contato: "",
					telefone: fakePhone(),
					tipcont: tipcont,
					vlcarne: String(vlMensal),
					formapgto: "01",
					seguro: 0,
					admissao: admissao,
					tcarencia: new Date(
						carencia.getFullYear(),
						carencia.getMonth(),
						carencia.getDate(),
						12,
					),
					saitxa,
					diapgto: String(rndInt(5, 20)),
					vendedor,
					regiao,
					cobrador,
					obs: "",
					renovar: null,
					funerais: rndInt(0, 2),
					circinic: "001",
					ultcirc: pad3(qtCircsTotal),
					qtcircs: qtCircsTotal,
					qtcircpg: qtCircsPagas,
					titular: "S",
					particv: 0,
					particf: 0,
					nrdepend: qtDep,
					ultimp_: null,
					ender_: null,
					ultend: "",
					em_: admissao,
					por: "SEED",
					atend1: "",
					atend2: "",
					ultnraux: "",
					ultdtaux: null,
					ultvlaux: 0,
					email: "",
					segmesref: null,
					segcodcob: "",
					segservcod: "",
					nrsorteio: "",
					complem: "",
				});

				// ── Inscrito 0: Titular (o próprio contratante) ───────────────────────
				novosInscrits.push({
					codigo,
					grau: "1",
					seq: 0,
					ehtitular: "S",
					nome: NOMES[i],
					nascto_: new Date(
						rndInt(1950, 1985),
						rndInt(0, 11),
						rndInt(1, 28),
						12,
					),
					estcivil: rnd(["CA", "SO"]),
					interdito: "N",
					sexo: rnd(["M", "F"]),
					tcarencia: new Date(
						carencia.getFullYear(),
						carencia.getMonth(),
						1,
						12,
					),
					lancto_: admissao,
					vivofalec: "V",
					falecto_: null,
					tipo: "T",
					procnr: "",
					por: "SEED",
					flag_excl: "",
					cpf: fakeCpf(),
					segmesref: null,
					segpercen: 0,
					segcodcob: "",
					segservcod: "",
				});

				// ── Inscritos 1..qtDep: Dependentes ──────────────────────────────────
				const sobrenomeTitular = NOMES[i].split(" ").slice(1).join(" ");
				for (let s = 1; s <= qtDep; s++) {
					const grau = s === 1 ? "1" : "2"; // cônjuge ou filho
					novosInscrits.push({
						codigo,
						grau,
						seq: s,
						ehtitular: "N",
						nome: `${rnd(NOMES_DEP)} ${sobrenomeTitular}`,
						nascto_: new Date(
							rndInt(1970, 2015),
							rndInt(0, 11),
							rndInt(1, 28),
							12,
						),
						estcivil: grau === "1" ? rnd(["CA", "SO"]) : "",
						interdito: "N",
						sexo: rnd(["M", "F"]),
						tcarencia: new Date(
							carencia.getFullYear(),
							carencia.getMonth(),
							1,
							12,
						),
						lancto_: admissao,
						vivofalec: "V",
						falecto_: null,
						tipo: "D",
						procnr: "",
						por: "SEED",
						flag_excl: "",
						cpf: "",
						segmesref: null,
						segpercen: 0,
						segcodcob: "",
						segservcod: "",
					});
				}

				// ── Taxas: tipo '2' (mensal) uma por circular ─────────────────────────
				for (let c = 1; c <= qtCircsTotal; c++) {
					const emissao = addMonths(admissao, c - 1);
					const isPago = c <= qtCircsPagas;
					const pgto = isPago
						? addMonths(emissao, rndInt(0, 1))
						: null;
					const circ = pad3(c);
					novasTaxas.push({
						codigo,
						tipo: "2",
						circ,
						emissao_: new Date(
							emissao.getFullYear(),
							emissao.getMonth(),
							5,
							12,
						),
						valor: vlMensal,
						pgto_: pgto
							? new Date(
									pgto.getFullYear(),
									pgto.getMonth(),
									rndInt(1, 28),
									12,
								)
							: null,
						valorpg: isPago ? vlMensal : 0,
						cobrador,
						forma: isPago ? rnd(["D", "C", "P", "B"]) : "",
						baixa_: isPago
							? new Date(
									pgto!.getFullYear(),
									pgto!.getMonth(),
									rndInt(1, 28),
									12,
								)
							: null,
						por: "SEED",
						stat: isPago ? "B" : "A",
						filial: "01",
						flag_excl: "",
						cedente: "PRESSERV",
						nnumero: "",
						codlan: "",
					});
				}

				// ── ADENCOB + TAXAS tipo '5': 4/5 dos contratos recebem um produto permanente ──
				// Cicla pelos 4 produtos; i%5===4 → sem produto
				const produtoIdx = i % 5;
				if (produtoIdx < ADENCOB_PRODUTOS.length) {
					const prod = ADENCOB_PRODUTOS[produtoIdx];
					const tipcobProd = prod.tipcob ?? "M";
					const multProd = TIPCOB_MULT_SEED[tipcobProd] ?? 1;
					const valorTaxa = prod.valor * multProd;

					// Registro ADENDOS
					novosAdendos.push({
						codigo,
						codproduto: prod.codproduto,
						incluido_: admissao,
						idxd: "",
						idxm: "",
						flag_excl: " ",
						por: "SEED",
					});

					// Registro ADENCOB com tipcob correto
					const seqAdencob = pad3(adencobSeq++);
					novosAdencob.push({
						seq: seqAdencob,
						codigo,
						codproduto: prod.codproduto,
						valor: prod.valor,
						nparcelas: 0,
						permanente: "S",
						tipcob: tipcobProd,
						formapgto: "01",
						datainicio_: admissao,
						em_: admissao,
						por: "SEED",
						flag_excl: "",
					});

					if (multProd === 1) {
						// Mensal: uma taxa tipo '5' por circular (comportamento original)
						for (let c = 1; c <= qtCircsTotal; c++) {
							const emissao = addMonths(admissao, c - 1);
							const isPago = c <= qtCircsPagas;
							const pgto = isPago
								? addMonths(emissao, rndInt(0, 1))
								: null;
							novasTaxas.push({
								codigo,
								tipo: "5",
								circ: pad3(c),
								emissao_: new Date(
									emissao.getFullYear(),
									emissao.getMonth(),
									5,
									12,
								),
								valor: prod.valor,
								pgto_: pgto
									? new Date(
											pgto.getFullYear(),
											pgto.getMonth(),
											rndInt(1, 28),
											12,
										)
									: null,
								valorpg: isPago ? prod.valor : 0,
								cobrador,
								forma: isPago ? rnd(["D", "C", "P", "B"]) : "",
								baixa_: isPago
									? new Date(
											pgto!.getFullYear(),
											pgto!.getMonth(),
											rndInt(1, 28),
											12,
										)
									: null,
								por: "SEED",
								stat: isPago ? "B" : "A",
								filial: "01",
								flag_excl: "",
								cedente: "PRESSERV",
								nnumero: "",
								codlan: seqAdencob,
							});
						}
					} else {
						// Não-mensal: uma taxa por ciclo, primeira cobrança ~30 dias após admissão.
						// Cada ciclo pago gera a próxima cobrança N meses depois.
						// Gera todos os ciclos passados (pagos) + o próximo em aberto.
						let emissaoAtual = addDays(admissao, 30);
						let circProd = 1;
						while (true) {
							const isPago = emissaoAtual < hoje;
							const pgto = isPago
								? addMonths(emissaoAtual, rndInt(0, 1))
								: null;
							novasTaxas.push({
								codigo,
								tipo: "5",
								circ: pad3(circProd++),
								emissao_: new Date(
									emissaoAtual.getFullYear(),
									emissaoAtual.getMonth(),
									emissaoAtual.getDate(),
									12,
								),
								valor: valorTaxa,
								pgto_: pgto
									? new Date(
											pgto.getFullYear(),
											pgto.getMonth(),
											rndInt(1, 28),
											12,
										)
									: null,
								valorpg: isPago ? valorTaxa : 0,
								cobrador,
								forma: isPago ? rnd(["D", "C", "P", "B"]) : "",
								baixa_: isPago
									? new Date(
											pgto!.getFullYear(),
											pgto!.getMonth(),
											rndInt(1, 28),
											12,
										)
									: null,
								por: "SEED",
								stat: isPago ? "B" : "A",
								filial: "01",
								flag_excl: "",
								cedente: "PRESSERV",
								nnumero: "",
								codlan: seqAdencob,
							});
							// Para ao gerar a primeira taxa em aberto (próxima cobrança)
							if (!isPago) break;
							emissaoAtual = addMonths(emissaoAtual, multProd);
						}
					}
				}

				const admStr = `${String(admissao.getMonth() + 1).padStart(2, "0")}/${admissao.getFullYear()}`;
				const catNome = String(cat?.descricao ?? tipcont);
				const prodInfo =
					produtoIdx < ADENCOB_PRODUTOS.length
						? ` + ${ADENCOB_PRODUTOS[produtoIdx].nome} (${ADENCOB_PRODUTOS[produtoIdx].tipcob})`
						: "";
				push(
					`✅ ${codigo} — ${NOMES[i]} — ${catNome}${prodInfo} — R$ ${vlMensal.toFixed(2)} — admissão ${admStr} — ${qtCircsTotal} taxas (${qtCircsPagas} pagas) — ${qtDep + 1} insc.`,
				);
			}

			// ── Salva ────────────────────────────────────────────────────────────────
			push("");
			push("💾 Salvando GRUPOS.DBF...");
			const newGrupos = {
				...emptyTable(gruposTable),
				records: novasGrupos,
			};
			await writeDbfFile(dirHandle, "GRUPOS", newGrupos);
			setTable("grupos", newGrupos);

			push("💾 Salvando TAXAS.DBF...");
			const newTaxas = { ...emptyTable(taxasTable), records: novasTaxas };
			await writeDbfFile(dirHandle, "TAXAS", newTaxas);
			setTable("taxas", newTaxas);

			push("💾 Salvando INSCRITS.DBF...");
			const newInscrits = {
				...emptyTable(inscritsTable),
				records: novosInscrits,
			};
			await writeDbfFile(dirHandle, "INSCRITS", newInscrits);
			setTable("inscrits", newInscrits);

			push("💾 Salvando ADENDOS.DBF...");
			const newAdendos = {
				...emptyTable(adendosTable, "ADENDOS"),
				records: novosAdendos,
			};
			await writeDbfFile(dirHandle, "ADENDOS", newAdendos);
			setTable("adendos", newAdendos);

			push("💾 Salvando ADENCOB.DBF...");
			const newAdencob = {
				...emptyTable(adencobTable, "ADENCOB"),
				records: novosAdencob,
			};
			await writeDbfFile(dirHandle, "ADENCOB", newAdencob);
			setTable("adencob", newAdencob);

			push("");
			push(
				`🎉 Concluído! 30 contratos · ${novasTaxas.length} taxas · ${novosInscrits.length} inscritos · ${novosAdencob.length} produtos (ADENDOS+ADENCOB)`,
			);
			setDone(true);
		} catch (e) {
			push(`❌ Erro: ${e}`);
		} finally {
			setRunning(false);
		}
	}

	return (
		<div className="p-4 max-w-3xl">
			<PageHeader
				title="Gerar Dados de Teste"
				subtitle="Apaga e recria 30 contratos com inscritos, taxas distribuídas por mês e cobradores"
				actions={
					<Btn
						onClick={handleGenerate}
						disabled={running}
						icon="⚡"
						size="lg"
					>
						{running ? "Gerando..." : "Gerar Dados de Teste"}
					</Btn>
				}
			/>

			{!done && log.length === 0 && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
					<p className="font-semibold mb-2">
						⚠️ Esta operação apaga e recria os dados
					</p>
					<ul className="list-disc list-inside space-y-1 text-yellow-700">
						<li>
							<strong>COBRADOR / REGIAO</strong> — mantidos se já
							existirem
						</li>
						<li>
							<strong>CLASSES</strong> — apagado e recriado
							(Individual / Basico / Premium)
						</li>
						<li>
							<strong>GRUPOS</strong> — apagado e recriado com 30
							contratos
						</li>
						<li>
							<strong>INSCRITS</strong> — apagado: titular (seq=0)
							+ dependentes por contrato
						</li>
						<li>
							<strong>TAXAS</strong> — apagado: tipo 2 (mensal) e
							tipo 5 (produto permanente), 1 em aberto por
							contrato
						</li>
						<li>
							<strong>ADENCOB</strong> — apagado: 2/3 dos
							contratos recebem produto permanente
							(Multiassistência ou Bom Descanso)
						</li>
						<li>
							<strong>Admissões</strong> distribuídas nos últimos
							~30 meses para gráficos variados
						</li>
						<li>
							<strong>Situações</strong> — 25 ativos, 3
							cancelados, 2 suspensos
						</li>
					</ul>
				</div>
			)}

			{log.length > 0 && (
				<div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300 max-h-96 overflow-y-auto">
					{log.map((line, i) => (
						<div
							key={i}
							className={
								line.startsWith("❌")
									? "text-red-400"
									: line.startsWith("💾")
										? "text-blue-300"
										: line.startsWith("🎉")
											? "text-yellow-300 font-bold"
											: line.startsWith("ℹ️")
												? "text-gray-400"
												: line.startsWith("🗑️")
													? "text-orange-300"
													: ""
							}
						>
							{line || <br />}
						</div>
					))}
				</div>
			)}

			{done && (
				<div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4 text-green-800 text-sm font-medium">
					Dados gerados! Navegue para{" "}
					<strong>Lançamentos → Contratos</strong> para ver os
					registros.
				</div>
			)}
		</div>
	);
}
