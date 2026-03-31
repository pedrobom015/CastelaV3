// Tipos TypeScript mapeados diretamente das estruturas DBF do sistema ADP

export interface Grupo {
	codigo: string; // C(9)  - número do contrato
	grupo: string; // C(2)  - tipo/grupo
	situacao: string; // C(1)  - situação
	nome: string; // C(35)
	nascto_: Date | null; // D(8)
	estcivil: string; // C(2)  - estado civil
	cpf: string; // C(11)
	rg: string; // C(20)
	endereco: string; // C(50)
	bairro: string; // C(35)
	cidade: string; // C(35)
	uf: string; // C(2)
	cep: string; // C(8)
	natural: string; // C(25) - naturalidade
	relig: string; // C(40) - religião
	contato: string; // C(25)
	telefone: string; // C(14)
	tipcont: string; // C(2)  - categoria do contrato (classcod em CLASSES.DBF)
	vlcarne: string; // C(3)
	formapgto: string; // C(2)  - forma de pagamento
	seguro: number; // N(2)
	admissao: Date | null; // D(8)  - data admissão
	tcarencia: Date | null; // D(8)  - término carência
	saitxa: string; // C(4)  - 99/99
	diapgto: string; // C(2)  - dia pagamento
	vendedor: string; // C(3)
	regiao: string; // C(3)
	cobrador: string; // C(3)
	obs: string; // M(10) - memo
	renovar: Date | null; // D(8)
	funerais: number; // N(2)
	circinic: string; // C(3)  - circular inicial
	ultcirc: string; // C(3)  - última circular
	qtcircs: number; // N(3)
	qtcircpg: number; // N(3)
	titular: string; // C(3)
	particv: number; // N(2)  - participação vendedor
	particf: number; // N(2)  - participação família
	nrdepend: number; // N(2)  - nº dependentes
	ultimp_: Date | null; // D(8)  - último impresso
	ender_: Date | null; // D(8)  - data atualização endereço
	ultend: string; // C(10)
	em_: Date | null; // D(8)  - data inclusão
	por: string; // C(10) - usuário
	atend1: string; // C(15)
	atend2: string; // C(15)
	ultnraux: string; // C(3)
	ultdtaux: Date | null; // D(8)
	ultvlaux: number; // N(11,2)
	email: string; // C(50)
	segmesref: Date | null; // D(8)
	segcodcob: string; // C(3)
	segservcod: string; // C(3)
	nrsorteio: string; // C(9)
	complem: string; // C(35)
}

export interface Inscrit {
	codigo: string; // C(9)  - código do contrato
	grau: string; // C(1)
	seq: number; // N(2)
	ehtitular: string; // C(1)
	nome: string; // C(35)
	nascto_: Date | null; // D(8)
	estcivil: string; // C(2)
	interdito: string; // C(1)
	sexo: string; // C(1)
	tcarencia: Date | null; // D(8)
	lancto_: Date | null; // D(8)
	vivofalec: string; // C(1)
	falecto_: Date | null; // D(8)
	tipo: string; // C(3)
	procnr: string; // C(7)
	por: string; // C(10)
	flag_excl: string; // C(1)
	cpf: string; // C(15)
	segmesref: Date | null;
	segpercen: number;
	segcodcob: string;
	segservcod: string;
}

export interface Taxa {
	codigo: string; // C(9)
	tipo: string; // C(1)
	circ: string; // C(3)
	emissao_: Date | null; // D(8)
	valor: number; // N(9,2)
	pgto_: Date | null; // D(8)
	valorpg: number; // N(9,2)
	cobrador: string; // C(3)
	forma: string; // C(1)
	baixa_: Date | null; // D(8)
	por: string; // C(10)
	stat: string; // C(1)
	filial: string; // C(2)
	flag_excl: string; // C(1)
	cedente: string; // C(7)
	nnumero: string; // C(20)
	codlan: string; // C(20)
}

export interface Cancel {
	cnumero: string; // C(9)
	filial: string; // C(2)
	ccodigo: string; // C(9)
	cgrupo: string; // C(2)
	cmotivo: string; // C(20)
	lancto_: Date | null; // D(8)
	por: string; // C(10)
	procto_: Date | null; // D(8)
}

export interface Processo {
	processo: string; // C(9)
	categ: string; // C(2)
	saiu: string; // C(3)
	grup: string; // C(2)
	num: string; // C(9)
	grau: string; // C(1)
	seq: number; // N(2)
	seg: string; // C(35) - segurado
	ends: string; // C(40) - endereço
	bais: string; // C(25) - bairro
	cids: string; // C(25) - cidade
	fal: string; // C(35) - falecido
	sep: string; // C(35) - sepultador
	dfal: Date | null; // D(8)  - data falecimento
	codlan: string; // C(20)
}

export interface Emcarne {
	seq: string; // C(9)
	codigo: string; // C(9)
	vendedor: string; // C(3)
	tip: string; // C(2)
	circ: string; // C(3)
	vencto_: Date | null; // D(8)
	emissao_: Date | null; // D(8)
	etiqueta_: Date | null; // D(8)
	filial: string; // C(2)
	lancto_: Date | null; // D(8)
	por: string; // C(10)
	parok: number; // N(2)
	intlan: string; // C(8)
}

export interface Tcarnes {
	tip: string; // C(2)
	tipcob: string; // C(1)
	formapgto: string; // C(2)
	pari: number; // N(1)
	vali: number; // N(8,2)
	parf: number; // N(2)
	parm: number; // N(1)
}

export interface Boleto {
	seq: string; // C(9)
	nnumero: string; // C(10) - nosso número
	codigo: string; // C(9)
	tipo: string; // C(1)
	circ: string; // C(3)
	por: string; // C(10)
	em_: Date | null; // D(8)
}

export interface LbxBolet {
	nrlote: string; // C(9)
	emissao_: Date | null; // D(8)
	nfcc: string; // C(9)
	totdesp: number; // N(9,2)
	totcred: number; // N(9,2)
	totliq: number; // N(9,2)
	por: string; // C(10)
	em_: Date | null; // D(8)
	ldesp: number; // N(9,2)
	lcred: number; // N(9,2)
}

export interface Classes {
	classcod: string; // C(2)
	descricao: string; // C(35)
	contrat: number; // N(6)
	prior: string; // C(1)
	vljoia: number; // N(11,2) - valor joia
	nrparc: number; // N(2)   - nº parcelas
	parcger: number; // N(2)
	vlmensal: number; // N(11,2)- valor mensal
	vldepend: number; // N(11,2)- valor dependente
	nrmesval: number; // N(2)
	renvenc: string; // C(1)
	renuso: string; // C(1)
	vltotal: number; // N(11,2)
	mensag1: string; // C(30)
	mensag2: string; // C(30)
}

export interface Arqgrup {
	grup: string; // C(2)
	classe: string; // C(2)
	inicio: string; // C(9)
	final: string; // C(9)
	acumproc: number; // N(2)
	maxproc: number; // N(2)
	cpadmiss: string; // C(1)
	periodic: number; // N(3)
	qtdremir: number; // N(3)
	poratend: string; // C(1)
	ultcirc: string; // C(3)
	emissao_: Date | null; // D(8)
	procpend: number; // N(3)
	contrat: number; // N(6)
	partic: number; // N(6)
	proxcirc: string; // C(3)
}

export interface Regiao {
	codigo: string; // C(3)
	regiao: string; // C(30)
	cobrador: string; // C(3)
}

export interface Cobrador {
	cobrador: string; // C(3)
	funcao: string; // C(1)
	nome: string; // C(30)
	endereco: string; // C(30)
	bairro: string; // C(20)
	cidade: string; // C(25)
	telefone: string; // C(14)
	cpf: string; // C(11)
	obs: string; // M(10)
	percent: number; // N(5,1)
	superv: string; // C(3)
}

export interface Circular {
	grupo: string; // C(2)
	circ: string; // C(3)
	procpend: number; // N(2)
	emissao_: Date | null; // D(8)
	mesref: string; // C(4)
	valor: number; // N(9,2)
	menscirc: string; // C(60)
	menscirc1: string; // C(35)
	menscirc2: string; // C(35)
	emitidos: number; // N(6)
	pagos: number; // N(6)
	cancelados: number; // N(6)
	lancto_: Date | null; // D(8)
	funcionar: string; // C(10)
	impress_: Date | null; // D(8)
}

export interface Funcionario {
	codigo: string; // C(3)
	nome: string; // C(35)
	profiss: string; // C(15)
	nacional: string; // C(15)
	estciv: string; // C(2)
	nascto_: Date | null; // D(8)
	endereco: string; // C(30)
	bairro: string; // C(25)
	cidade: string; // C(25)
	cpf: string; // C(11)
	telefone: string; // C(14)
	percent: number; // N(5,1)
	obs: string; // M(10)
}

export interface Juros {
	tipo: string; // C(1)
	multa: number; // N(5,2)
	mltcaren: number; // N(3)
	juros: number; // N(5,3)
	jrscaren: number; // N(3)
}

export interface Historic {
	historico: string; // C(3)
	descricao: string; // C(40)
	tipo: string; // C(1)
	origem: string; // C(3)
	recdesp: string; // C(1)
	codigo: string; // C(9)
	intlan: string; // C(8)
	codlan: string; // C(20)
}

export interface Cgrupo {
	numero: string; // C(9)
	codigo: string; // C(9)
	grupo: string; // C(2)
	motivo: string; // C(1)
	canclto_: Date | null; // D(8)
	cancpor: string; // C(10)
	reintnum: string; // C(9)
	motreint: string; // C(30)
	reintem_: Date | null; // D(8)
	reintpor: string; // C(10)
	codreint: string; // C(8)
	situacao: string; // C(1)
	nome: string; // C(35)
	nascto_: Date | null; // D(8)
	estcivil: string; // C(2)
	cpf: string; // C(11)
	rg: string; // C(20)
	endereco: string; // C(50)
	bairro: string; // C(35)
	cidade: string; // C(35)
	uf: string; // C(2)
	cep: string; // C(8)
	natural: string; // C(25)
	relig: string; // C(40)
	contato: string; // C(25)
	telefone: string; // C(14)
	admissao: Date | null; // D(8)
	cobrador: string; // C(3)
	vendedor: string; // C(3)
	obs: string; // M(10)
}

export interface Produto {
	codigo: string; // C(4)
	produto: string; // C(30)
	unid: string; // C(2)
	reftec: string; // M(10)
	grupo: string; // C(10)
	depto: string; // C(10)
	qd_min: number; // N(4)
	qd_ped: number; // N(5)
	qd_rec: number; // N(5)
	qd_ven: number; // N(5)
	qd_loc: number; // N(5)
	qd_est: number; // N(6)
	preco_cus: number; // N(12,2)
	custo_: Date | null; // D(8)
	preco_ven: number; // N(12,2)
	venda_: Date | null; // D(8)
	dt_ult_atu: Date | null; // D(8)
}

export interface Filial {
	codigo: string; // C(2)
	abrev: string; // C(25)
	nome: string; // C(50)
	endereco: string; // C(50)
	cidade: string; // C(50)
	ref: string; // M(10)
	contato: string; // C(20)
}

export interface Txentr {
	seq: number; // N(6)
	codigo: string; // C(9)
	tipo: string; // C(1)
	circ: string; // C(3)
	valor: number; // N(9,2)
	cob: string; // C(3)
	mesref: string; // C(4)
	pgto_: Date | null; // D(8)
	valorpg: number; // N(9,2)
	forma: string; // C(1)
	baixa_: Date | null; // D(8)
	por: string; // C(10)
}

export interface Bxrec {
	ano: string; // C(2)
	numero: string; // C(9)
	codigo: string; // C(9)
	tipo: string; // C(1)
	circ: string; // C(3)
	valorpg: number; // N(9,2)
	valoraux: number; // N(9,2)
	emitido_: Date | null; // D(8)
	por: string; // C(10)
	numop: string; // C(9)
	grupo: string; // C(2)
	filial: string; // C(2)
	intlan: string; // C(8)
}

export interface Alender {
	codigo: string; // C(9)
	endereco: string; // C(35)
	bairro: string; // C(25)
	cidade: string; // C(25)
	cep: string; // C(8)
	cobrador: string; // C(3)
	data_: Date | null; // D(8)
	por: string; // C(10)
	dendereco: string; // C(35)
	dbairro: string; // C(25)
	dcidade: string; // C(25)
	dcep: string; // C(8)
	dcobrador: string; // C(3)
	dgrupo: string; // C(2)
	emitido_: Date | null; // D(8)
	filial: string; // C(2)
}

export interface Bxfcc {
	idfilial: string; // C(2)
	numero: string; // C(9)
	lancto_: Date | null; // D(8)
	por: string; // C(10)
	cobrador: string; // C(3)
	nomecobr: string; // C(30)
	despesas: number; // N(11,2)
	baixa_: Date | null; // D(8)
	comtxa: number; // N(5,1)
	comtroc: number; // N(5,1)
	comcarn: number; // N(5,1)
	comoutr: number; // N(5,1)
	qtdoutr: number; // N(5)
	vloutr: number; // N(9,2)
	parcpag: number; // N(5)
	vltaxas: number; // N(9,2)
	parctroc: number; // N(5)
	vltrocas: number; // N(9,2)
	parccarn: number; // N(5)
	vlcarnes: number; // N(9,2)
	vlrbaix: number; // N(11,2)
	nrccpagar: string; // C(9)
	numop: string; // C(9)
	intlan: string; // C(8)
}

export interface Mensag {
	seq: string; // C(9)
	filtro: string; // C(210)
	mens1: string; // M(10)
	lancto_: Date | null; // D(8)
	por: string; // C(10)
}

export interface ParAdm {
	pgrupo: string; // C(2)
	p_filial: string; // C(2)
	pcontrato: string; // C(9)
	pgrau: string; // C(1)
	pseq: number; // N(2)
	pverpag: string; // C(1)
	preplanc: string; // C(1)
	lastcodigo: string; // C(9)
	nrcanc: number; // N(6)
	nrreint: number; // N(6)
	contarec: string; // C(5)
	contapag: string; // C(5)
	histrcfcc: string; // C(3)
	histrcrec: string; // C(3)
	histrccar: string; // C(3)
	histpg: string; // C(3)
	nrauxrec: string; // C(8)
	mcodigo: string; // C(9)
	mtipo: string; // C(1)
	mcirc: string; // C(3)
	mgrupvip: string; // C(2)
	combarra: string; // C(1)
	cinscr: string; // C(1)
	comfalec: string; // C(1)
	mproc1: string; // C(5)
	mproc2: string; // C(2)
	mproc3: string; // C(2)
	impnrrec: string; // C(5)
	procimp: string; // C(9)
	pvalor: number; // N(9,2)
	pcob: string; // C(3)
	mmesref: string; // C(4)
	pnumfcc: string; // C(8)
	p_cidade: string; // C(25)
	p_recp: string; // C(1)
	setup1: string; // C(40)
	cgcsetup: string; // C(14)
	setup2: string; // C(50)
	setup3: string; // C(50)
	pcedente: string; // C(7)
}

export interface Cstseg {
	emissao_: Date | null; // D(8)
	hora: string; // C(5)
	quem: string; // C(10)
	historic: string; // C(3)
	contrato: string; // C(9)
	complement: string; // C(35)
	qtdade: number; // N(5)
	valor: number; // N(9,2)
	tipo: string; // C(1)
	circ: string; // C(3)
}

export interface Txproc {
	codigo: string; // C(9)
	tipo: string; // C(1)
	circ: string; // C(3)
	emissao_: Date | null; // D(8)
	valor: number; // N(9,2)
	pgto_: Date | null; // D(8)
	valorpg: number; // N(9,2)
	cobrador: string; // C(3)
	forma: string; // C(1)
	baixa_: Date | null; // D(8)
	por: string; // C(10)
	stat: string; // C(1)
	filial: string; // C(2)
	atp: string; // C(1)
	atc: string; // C(1)
	atr: string; // C(1)
}

export interface Ccobran {
	// CCOBRAN - consulta débitos gerados (TAXAS view)
	codigo: string;
	tipo: string;
	circ: string;
	emissao_: Date | null;
	valor: number;
	pgto_: Date | null;
	valorpg: number;
	cobrador: string;
	stat: string;
}

export interface ClsInfo {
	classcod: string; // C(4) — FK → CLASSES.classcod
	subtitulo: string; // C(80)
	descricao: string; // C(254)
	cobertura: string; // C(200)
	preco_exib: number; // N(8,2) — preço de exibição
	url_contrat: string; // C(100)
	url_saiba: string; // C(100)
	ordem: number; // N(3,0) — ordem de exibição
	destaque: boolean; // L(1)
}

export interface ClsItem {
	classcod: string; // C(4) — FK → CLASSES.classcod
	ordem: number; // N(3,0)
	descricao: string; // C(100)
	status: string; // C(1) — I=incluído O=opcional N=não incluído
}

// Tipo genérico para registros DBF
export type DbfRecord = Record<string, string | number | Date | null | boolean>;

// Informações do diretório de trabalho
export interface WorkDir {
	handle: FileSystemDirectoryHandle | null;
	path: string;
}
