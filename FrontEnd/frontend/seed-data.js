#!/usr/bin/env node
/**
 * seed-data.js
 * Popula os arquivos DBF com dados ficticios para testes
 *
 * Uso:   node seed-data.js [caminho-da-pasta]
 * Padrão: node seed-data.js  →  cria em ./dados-teste/
 *
 * Exemplo Windows:
 *   node seed-data.js "C:\ESD\Dados"
 */

const fs   = require('fs')
const path = require('path')
const { CAMPOS, CODE_LEN } = require('./dbf-schema.cjs')

const targetDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'dados-teste')

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
  console.log('Pasta criada:', targetDir)
}

// ─── helpers DBF ─────────────────────────────────────────────────────────────

function padRight(str, len) {
  return String(str ?? '').padEnd(len, ' ').slice(0, len)
}

function padLeft(str, len) {
  return String(str ?? '').padStart(len, ' ').slice(-len)
}

function fmtDate(dateStr) {
  // aceita 'YYYY-MM-DD' ou Date ou vazio
  if (!dateStr) return '        '
  if (dateStr instanceof Date) {
    const y = dateStr.getFullYear()
    const m = String(dateStr.getMonth() + 1).padStart(2, '0')
    const d = String(dateStr.getDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }
  return String(dateStr).replace(/-/g, '').slice(0, 8).padEnd(8, ' ')
}

function fmtNum(value, length, decimals) {
  if (value === null || value === undefined || value === '') return ' '.repeat(length)
  const n = Number(value)
  const s = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n))
  return s.padStart(length, ' ').slice(-length)
}

/** Constrói buffer DBF binário para os registros fornecidos */
function buildDbf(fields, records) {
  const headerSize  = 32 + fields.length * 32 + 1
  const recordSize  = 1 + fields.reduce((a, f) => a + f.length, 0)
  const totalSize   = headerSize + records.length * recordSize + 1
  const buf         = Buffer.alloc(totalSize, 0)

  const now = new Date()
  buf[0] = 3
  buf[1] = now.getFullYear() - 1900
  buf[2] = now.getMonth() + 1
  buf[3] = now.getDate()
  buf.writeUInt32LE(records.length, 4)
  buf.writeUInt16LE(headerSize,     8)
  buf.writeUInt16LE(recordSize,     10)

  // descritores de campo
  let off = 32
  for (const f of fields) {
    buf.write(f.name.toUpperCase().slice(0, 11).padEnd(11, '\0'), off, 'ascii')
    buf[off + 11] = f.type.charCodeAt(0)
    buf[off + 16] = f.length
    buf[off + 17] = f.decimals
    off += 32
  }
  buf[off] = 0x0D  // header terminator

  // registros
  off = headerSize
  for (const rec of records) {
    buf[off] = 0x20  // ' ' = não deletado
    off++
    for (const f of fields) {
      const val = rec[f.name.toLowerCase()] ?? rec[f.name] ?? ''
      let chunk = ''
      switch (f.type) {
        case 'C': chunk = padRight(val, f.length); break
        case 'D': chunk = fmtDate(val);            break
        case 'N': chunk = fmtNum(val, f.length, f.decimals); break
        case 'M': chunk = padRight('', 10);        break
        default:  chunk = padRight(val, f.length); break
      }
      buf.write(chunk, off, 'ascii')
      off += f.length
    }
  }
  buf[off] = 0x1A  // EOF
  return buf
}

function write(name, fields, records) {
  const buf  = buildDbf(fields, records)
  const file = path.join(targetDir, name + '.DBF')
  fs.writeFileSync(file, buf)
  console.log(`  ✔ ${name}.DBF  (${records.length} registros)`)
}


// ─── dados ficticios ──────────────────────────────────────────────────────────

console.log('\nGerando dados ficticios em:', targetDir, '\n')

// CLASSES (categorias de planos)
write('CLASSES', CAMPOS.CLASSES, [
  { classcod: '01', descricao: 'PLANO FAMILIAR BASICO',    contrat: 6, prior: '1', vljoia: 500.00, nrparc: 5, parcger: 12, vlmensal: 89.90,  vldepend: 29.90, nrmesval: 12, renvenc: 'S', renuso: 'N', vltotal: 89.90,  mensag1: 'Bom atendimento garantido', mensag2: '' },
  { classcod: '02', descricao: 'PLANO INDIVIDUAL GOLD',    contrat: 4, prior: '2', vljoia: 300.00, nrparc: 3, parcger: 12, vlmensal: 59.90,  vldepend:  0.00, nrmesval: 12, renvenc: 'S', renuso: 'N', vltotal: 59.90,  mensag1: '',                        mensag2: '' },
  { classcod: '03', descricao: 'PLANO FAMILIAR PREMIUM',   contrat: 8, prior: '1', vljoia: 800.00, nrparc: 8, parcger: 12, vlmensal: 149.90, vldepend: 49.90, nrmesval: 12, renvenc: 'S', renuso: 'N', vltotal: 149.90, mensag1: 'Servico completo',           mensag2: 'Cobertura total' },
])

// ARQGRUP (grupos/planos)
write('ARQGRUP', CAMPOS.ARQGRUP, [
  { grup: '01', classe: '01', inicio: '000000001', final: '000099999', acumproc: 0, maxproc: 3, cpadmiss: 'D', periodic: 30, qtdremir: 60, poratend: 'S', ultcirc: '012', emissao_: '2026-03-01', procpend: 0, contrat: 8, partic: 20, proxcirc: '013' },
  { grup: '02', classe: '02', inicio: '000100001', final: '000199999', acumproc: 0, maxproc: 2, cpadmiss: 'D', periodic: 30, qtdremir: 36, poratend: 'N', ultcirc: '025', emissao_: '2026-03-01', procpend: 0, contrat: 2, partic:  6, proxcirc: '026' },
  { grup: '03', classe: '03', inicio: '000200001', final: '000299999', acumproc: 0, maxproc: 4, cpadmiss: 'A', periodic: 30, qtdremir: 48, poratend: 'S', ultcirc: '008', emissao_: '2026-03-01', procpend: 0, contrat: 3, partic: 10, proxcirc: '009' },
])

// COBRADOR (cobradores e vendedores)
write('COBRADOR', CAMPOS.COBRADOR, [
  { cobrador: '001', funcao: 'B', nome: 'JOSE DA SILVA',         endereco: 'RUA DAS FLORES 123',     bairro: 'CENTRO',    cidade: 'SAO PAULO', telefone: '(11) 9999-1111', cpf: '11122233344', percent: 10.0, superv: '' },
  { cobrador: '002', funcao: 'V', nome: 'MARIA SANTOS',          endereco: 'AV PAULISTA 456',         bairro: 'BELA VISTA', cidade: 'SAO PAULO', telefone: '(11) 9999-2222', cpf: '22233344455', percent: 8.5,  superv: '' },
  { cobrador: '003', funcao: 'B', nome: 'PEDRO HENRIQUE SOUZA',  endereco: 'RUA DO COMERCIO 789',    bairro: 'NORTE',     cidade: 'SAO PAULO', telefone: '(11) 9999-3333', cpf: '33344455566', percent: 10.0, superv: '001' },
  { cobrador: '004', funcao: 'V', nome: 'ANA LUCIA FERREIRA',    endereco: 'RUA DAS PALMEIRAS 321',  bairro: 'SUL',       cidade: 'SAO PAULO', telefone: '(11) 9999-4444', cpf: '44455566677', percent: 8.0,  superv: '' },
])

// REGIAO
write('REGIAO', CAMPOS.REGIAO, [
  { codigo: '001', regiao: 'CENTRO',        cobrador: '001' },
  { codigo: '002', regiao: 'ZONA NORTE',    cobrador: '003' },
  { codigo: '003', regiao: 'ZONA SUL',      cobrador: '003' },
  { codigo: '004', regiao: 'ZONA LESTE',    cobrador: '001' },
  { codigo: '005', regiao: 'ZONA OESTE',    cobrador: '001' },
])

// CIRCULAR (historico de circulares emitidas)
write('CIRCULAR', CAMPOS.CIRCULAR, [
  { grupo: '01', circ: '010', procpend: 0, emissao_: '2026-01-05', mesref: '0126', valor: 89.90, menscirc: 'Mensalidade Janeiro/2026',  menscirc1: '', menscirc2: '', emitidos: 8, pagos: 7, cancelados: 0, lancto_: '2026-01-05', funcionar: 'ADMIN', impress_: '2026-01-06' },
  { grupo: '01', circ: '011', procpend: 0, emissao_: '2026-02-05', mesref: '0226', valor: 89.90, menscirc: 'Mensalidade Fevereiro/2026', menscirc1: '', menscirc2: '', emitidos: 8, pagos: 6, cancelados: 0, lancto_: '2026-02-05', funcionar: 'ADMIN', impress_: '2026-02-06' },
  { grupo: '01', circ: '012', procpend: 0, emissao_: '2026-03-05', mesref: '0326', valor: 89.90, menscirc: 'Mensalidade Marco/2026',     menscirc1: '', menscirc2: '', emitidos: 8, pagos: 4, cancelados: 0, lancto_: '2026-03-05', funcionar: 'ADMIN', impress_: '2026-03-06' },
  { grupo: '02', circ: '023', procpend: 0, emissao_: '2026-01-05', mesref: '0126', valor: 59.90, menscirc: 'Mensalidade Janeiro/2026',  menscirc1: '', menscirc2: '', emitidos: 2, pagos: 2, cancelados: 0, lancto_: '2026-01-05', funcionar: 'ADMIN', impress_: '2026-01-06' },
  { grupo: '02', circ: '024', procpend: 0, emissao_: '2026-02-05', mesref: '0226', valor: 59.90, menscirc: 'Mensalidade Fevereiro/2026', menscirc1: '', menscirc2: '', emitidos: 2, pagos: 1, cancelados: 0, lancto_: '2026-02-05', funcionar: 'ADMIN', impress_: '2026-02-06' },
  { grupo: '02', circ: '025', procpend: 0, emissao_: '2026-03-05', mesref: '0326', valor: 59.90, menscirc: 'Mensalidade Marco/2026',     menscirc1: '', menscirc2: '', emitidos: 2, pagos: 0, cancelados: 0, lancto_: '2026-03-05', funcionar: 'ADMIN', impress_: '2026-03-06' },
])

// GRUPOS (contratos — o principal)
write('GRUPOS', CAMPOS.GRUPOS, [
  {
    codigo: '000000001', grupo: '01', situacao: 'A',
    nome: 'JOAO DA SILVA',
    nascto_: '1965-03-15', estcivil: 'CA', cpf: '12345678901', rg: '12345678-X',
    endereco: 'RUA DAS FLORES 100',       bairro: 'CENTRO',     cidade: 'SAO PAULO', uf: 'SP', cep: '01001000',
    natural: 'SAO PAULO', relig: 'CATOLICA',
    contato: 'MARIA DA SILVA', telefone: '(11) 9111-1111', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2020-01-10', tcarencia: '2020-07-10',
    saitxa: '',     diapgto: '10', vendedor: '002', regiao: '001', cobrador: '001',
    renovar: '2027-01-10', funerais: 0, circinic: '001', ultcirc: '012',
    qtcircs: 36, qtcircpg: 32, titular: '001', particv: 2, particf: 3, nrdepend: 3,
    ultimp_: '2026-03-05', em_: '2020-01-10', por: 'ADMIN',
    email: 'joao.silva@email.com',
  },
  {
    codigo: '000000002', grupo: '01', situacao: 'A',
    nome: 'MARIA APARECIDA SOUZA',
    nascto_: '1972-08-20', estcivil: 'CA', cpf: '23456789012', rg: '23456789-Y',
    endereco: 'AV BRASIL 250',            bairro: 'NORTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '02020020',
    natural: 'CAMPINAS', relig: 'EVANGELICA',
    contato: 'CARLOS SOUZA', telefone: '(11) 9222-2222', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2019-05-20', tcarencia: '2019-11-20',
    saitxa: '',     diapgto: '05', vendedor: '004', regiao: '002', cobrador: '003',
    renovar: '2026-05-20', funerais: 0, circinic: '001', ultcirc: '012',
    qtcircs: 46, qtcircpg: 44, titular: '001', particv: 1, particf: 2, nrdepend: 2,
    ultimp_: '2026-03-05', em_: '2019-05-20', por: 'ADMIN',
    email: 'maria.souza@email.com',
  },
  {
    codigo: '000000003', grupo: '02', situacao: 'A',
    nome: 'PEDRO HENRIQUE ALVES',
    nascto_: '1958-11-05', estcivil: 'VI', cpf: '34567890123', rg: '34567890-Z',
    endereco: 'RUA DO COMERCIO 33',       bairro: 'SUL',        cidade: 'SAO PAULO', uf: 'SP', cep: '04040040',
    natural: 'SANTOS', relig: 'ESPIRITA',
    contato: '',               telefone: '(11) 9333-3333', tipcont: '01',
    vlcarne: 'B02', formapgto: '02', seguro: 0,
    admissao: '2021-03-01', tcarencia: '2021-09-01',
    saitxa: '',     diapgto: '01', vendedor: '002', regiao: '003', cobrador: '001',
    renovar: '2028-03-01', funerais: 0, circinic: '021', ultcirc: '025',
    qtcircs: 24, qtcircpg: 23, titular: '001', particv: 0, particf: 0, nrdepend: 0,
    ultimp_: '2026-03-05', em_: '2021-03-01', por: 'ADMIN',
    email: '',
  },
  {
    codigo: '000000004', grupo: '01', situacao: 'A',
    nome: 'ANA PAULA FERREIRA',
    nascto_: '1980-06-30', estcivil: 'SO', cpf: '45678901234', rg: '45678901-A',
    endereco: 'RUA DAS PALMEIRAS 421',    bairro: 'LESTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '03030030',
    natural: 'SAO PAULO', relig: 'CATOLICA',
    contato: 'JOAO FERREIRA', telefone: '(11) 9444-4444', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2022-07-15', tcarencia: '2023-01-15',
    saitxa: '',     diapgto: '15', vendedor: '004', regiao: '004', cobrador: '001',
    renovar: '2029-07-15', funerais: 0, circinic: '001', ultcirc: '012',
    qtcircs: 20, qtcircpg: 19, titular: '001', particv: 0, particf: 0, nrdepend: 0,
    ultimp_: '2026-03-05', em_: '2022-07-15', por: 'ADMIN',
    email: 'ana.ferreira@email.com',
  },
  {
    codigo: '000000005', grupo: '01', situacao: 'A',
    nome: 'CARLOS EDUARDO LIMA',
    nascto_: '1945-12-10', estcivil: 'CA', cpf: '56789012345', rg: '56789012-B',
    endereco: 'AV KENNEDY 88',            bairro: 'OESTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '05050050',
    natural: 'RIBEIRAO PRETO', relig: 'PROTESTANTE',
    contato: 'LUCIA LIMA', telefone: '(11) 9555-5555', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2018-10-05', tcarencia: '2019-04-05',
    saitxa: '',     diapgto: '05', vendedor: '002', regiao: '005', cobrador: '003',
    renovar: '2025-10-05', funerais: 1, circinic: '001', ultcirc: '012',
    qtcircs: 54, qtcircpg: 51, titular: '001', particv: 2, particf: 1, nrdepend: 4,
    ultimp_: '2026-03-05', em_: '2018-10-05', por: 'ADMIN',
    email: 'carlos.lima@email.com',
  },
  {
    codigo: '000000006', grupo: '03', situacao: 'A',
    nome: 'LUIZA HELENA COSTA',
    nascto_: '1990-04-22', estcivil: 'SO', cpf: '67890123456', rg: '67890123-C',
    endereco: 'RUA IPIRANGA 777',         bairro: 'CENTRO',     cidade: 'GUARULHOS', uf: 'SP', cep: '07070070',
    natural: 'GUARULHOS', relig: 'CATOLICA',
    contato: '', telefone: '(11) 9666-6666', tipcont: '02',
    vlcarne: 'C03', formapgto: '03', seguro: 0,
    admissao: '2023-02-28', tcarencia: '2023-08-28',
    saitxa: '',     diapgto: '28', vendedor: '002', regiao: '001', cobrador: '001',
    renovar: '2030-02-28', funerais: 0, circinic: '006', ultcirc: '008',
    qtcircs: 13, qtcircpg: 12, titular: '001', particv: 0, particf: 0, nrdepend: 0,
    ultimp_: '2026-03-05', em_: '2023-02-28', por: 'ADMIN',
    email: 'luiza.costa@email.com',
  },
  {
    codigo: '000000007', grupo: '02', situacao: 'A',
    nome: 'ROBERTO JOSE MARTINS',
    nascto_: '1955-09-18', estcivil: 'CA', cpf: '78901234567', rg: '78901234-D',
    endereco: 'RUA SETE DE SETEMBRO 55',  bairro: 'NORTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '02020025',
    natural: 'MOGI DAS CRUZES', relig: 'ESPIRITA',
    contato: 'SANDRA MARTINS', telefone: '(11) 9777-7777', tipcont: '01',
    vlcarne: 'B02', formapgto: '02', seguro: 0,
    admissao: '2020-06-10', tcarencia: '2020-12-10',
    saitxa: '',     diapgto: '10', vendedor: '004', regiao: '002', cobrador: '003',
    renovar: '2027-06-10', funerais: 0, circinic: '021', ultcirc: '025',
    qtcircs: 33, qtcircpg: 31, titular: '001', particv: 1, particf: 1, nrdepend: 1,
    ultimp_: '2026-03-05', em_: '2020-06-10', por: 'ADMIN',
    email: '',
  },
  {
    codigo: '000000008', grupo: '01', situacao: 'C',  // cancelado
    nome: 'FRANCISCA OLIVEIRA',
    nascto_: '1968-02-14', estcivil: 'DI', cpf: '89012345678', rg: '89012345-E',
    endereco: 'RUA DAS ACAIAS 12',        bairro: 'SUL',        cidade: 'SAO PAULO', uf: 'SP', cep: '04040045',
    natural: 'SAO PAULO', relig: 'CATOLICA',
    contato: '', telefone: '(11) 9888-8888', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2019-09-01', tcarencia: '2020-03-01',
    saitxa: '0109', diapgto: '01', vendedor: '002', regiao: '003', cobrador: '001',
    renovar: '', funerais: 0, circinic: '001', ultcirc: '009',
    qtcircs: 10, qtcircpg: 7, titular: '001', particv: 0, particf: 0, nrdepend: 0,
    ultimp_: '2020-10-05', em_: '2019-09-01', por: 'ADMIN',
    email: '',
  },
  {
    codigo: '000000009', grupo: '01', situacao: 'A',
    nome: 'ANTONIO CARLOS ROCHA',
    nascto_: '1975-07-08', estcivil: 'CA', cpf: '90123456789', rg: '90123456-F',
    endereco: 'RUA CAMPOS SALES 200',     bairro: 'LESTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '03030035',
    natural: 'BAURU', relig: 'PROTESTANTE',
    contato: 'CLAUDIA ROCHA', telefone: '(11) 9999-9999', tipcont: '01',
    vlcarne: 'A01', formapgto: '01', seguro: 1,
    admissao: '2021-11-20', tcarencia: '2022-05-20',
    saitxa: '',     diapgto: '20', vendedor: '004', regiao: '004', cobrador: '003',
    renovar: '2028-11-20', funerais: 0, circinic: '001', ultcirc: '012',
    qtcircs: 28, qtcircpg: 27, titular: '001', particv: 1, particf: 2, nrdepend: 2,
    ultimp_: '2026-03-05', em_: '2021-11-20', por: 'ADMIN',
    email: 'antonio.rocha@email.com',
  },
  {
    codigo: '000000010', grupo: '01', situacao: 'A',
    nome: 'ROSA MARIA PEREIRA',
    nascto_: '1983-01-25', estcivil: 'SO', cpf: '01234567890', rg: '01234567-G',
    endereco: 'AV MARGINAL 1500',         bairro: 'OESTE',      cidade: 'SAO PAULO', uf: 'SP', cep: '05050055',
    natural: 'SAO PAULO', relig: 'CATOLICA',
    contato: '', telefone: '(11) 9000-0000', tipcont: '02',
    vlcarne: 'A01', formapgto: '01', seguro: 0,
    admissao: '2024-03-01', tcarencia: '2024-09-01',
    saitxa: '',     diapgto: '01', vendedor: '002', regiao: '005', cobrador: '001',
    renovar: '2031-03-01', funerais: 0, circinic: '001', ultcirc: '012',
    qtcircs: 12, qtcircpg: 11, titular: '001', particv: 0, particf: 0, nrdepend: 0,
    ultimp_: '2026-03-05', em_: '2024-03-01', por: 'ADMIN',
    email: 'rosa.pereira@email.com',
  },
])

// INSCRITS (inscritos/dependentes dos contratos)
write('INSCRITS', CAMPOS.INSCRITS, [
  // Contrato 000001 — Joao da Silva + esposa + 2 filhos
  { codigo: '000000001', grau: '1', seq:  1, ehtitular: 'S', nome: 'JOAO DA SILVA',         nascto_: '1965-03-15', estcivil: 'CA', interdito: 'N', sexo: 'M', tcarencia: '2020-07-10', lancto_: '2020-01-10', vivofalec: 'V', tipo: 'TIT', por: 'ADMIN', flag_excl: 'N', cpf: '12345678901' },
  { codigo: '000000001', grau: '2', seq:  2, ehtitular: 'N', nome: 'MARIA DA SILVA',         nascto_: '1967-06-20', estcivil: 'CA', interdito: 'N', sexo: 'F', tcarencia: '2020-07-10', lancto_: '2020-01-10', vivofalec: 'V', tipo: 'CON', por: 'ADMIN', flag_excl: 'N', cpf: '12345678902' },
  { codigo: '000000001', grau: '3', seq:  3, ehtitular: 'N', nome: 'LUCAS DA SILVA',         nascto_: '1995-09-10', estcivil: 'SO', interdito: 'N', sexo: 'M', tcarencia: '2020-07-10', lancto_: '2020-01-10', vivofalec: 'V', tipo: 'FIL', por: 'ADMIN', flag_excl: 'N', cpf: '' },
  { codigo: '000000001', grau: '3', seq:  4, ehtitular: 'N', nome: 'JULIA DA SILVA',         nascto_: '1998-12-05', estcivil: 'SO', interdito: 'N', sexo: 'F', tcarencia: '2020-07-10', lancto_: '2020-01-10', vivofalec: 'V', tipo: 'FIL', por: 'ADMIN', flag_excl: 'N', cpf: '' },
  // Contrato 000002 — Maria + esposo + 1 filho
  { codigo: '000000002', grau: '1', seq:  1, ehtitular: 'S', nome: 'MARIA APARECIDA SOUZA',  nascto_: '1972-08-20', estcivil: 'CA', interdito: 'N', sexo: 'F', tcarencia: '2019-11-20', lancto_: '2019-05-20', vivofalec: 'V', tipo: 'TIT', por: 'ADMIN', flag_excl: 'N', cpf: '23456789012' },
  { codigo: '000000002', grau: '2', seq:  2, ehtitular: 'N', nome: 'CARLOS SOUZA',            nascto_: '1970-04-15', estcivil: 'CA', interdito: 'N', sexo: 'M', tcarencia: '2019-11-20', lancto_: '2019-05-20', vivofalec: 'V', tipo: 'CON', por: 'ADMIN', flag_excl: 'N', cpf: '23456789013' },
  { codigo: '000000002', grau: '3', seq:  3, ehtitular: 'N', nome: 'GABRIEL SOUZA',           nascto_: '2002-11-30', estcivil: 'SO', interdito: 'N', sexo: 'M', tcarencia: '2019-11-20', lancto_: '2019-05-20', vivofalec: 'V', tipo: 'FIL', por: 'ADMIN', flag_excl: 'N', cpf: '' },
  // Contrato 000003 — Pedro (individual)
  { codigo: '000000003', grau: '1', seq:  1, ehtitular: 'S', nome: 'PEDRO HENRIQUE ALVES',   nascto_: '1958-11-05', estcivil: 'VI', interdito: 'N', sexo: 'M', tcarencia: '2021-09-01', lancto_: '2021-03-01', vivofalec: 'V', tipo: 'TIT', por: 'ADMIN', flag_excl: 'N', cpf: '34567890123' },
  // Contrato 000005 — Carlos + esposa + 2 filhos + 1 pai
  { codigo: '000000005', grau: '1', seq:  1, ehtitular: 'S', nome: 'CARLOS EDUARDO LIMA',    nascto_: '1945-12-10', estcivil: 'CA', interdito: 'N', sexo: 'M', tcarencia: '2019-04-05', lancto_: '2018-10-05', vivofalec: 'V', tipo: 'TIT', por: 'ADMIN', flag_excl: 'N', cpf: '56789012345' },
  { codigo: '000000005', grau: '2', seq:  2, ehtitular: 'N', nome: 'LUCIA LIMA',              nascto_: '1948-07-22', estcivil: 'CA', interdito: 'N', sexo: 'F', tcarencia: '2019-04-05', lancto_: '2018-10-05', vivofalec: 'V', tipo: 'CON', por: 'ADMIN', flag_excl: 'N', cpf: '56789012346' },
  { codigo: '000000005', grau: '3', seq:  3, ehtitular: 'N', nome: 'ANDERSON LIMA',           nascto_: '1975-03-18', estcivil: 'CA', interdito: 'N', sexo: 'M', tcarencia: '2019-04-05', lancto_: '2018-10-05', vivofalec: 'V', tipo: 'FIL', por: 'ADMIN', flag_excl: 'N', cpf: '' },
  { codigo: '000000005', grau: '3', seq:  4, ehtitular: 'N', nome: 'PATRICIA LIMA',           nascto_: '1978-09-11', estcivil: 'CA', interdito: 'N', sexo: 'F', tcarencia: '2019-04-05', lancto_: '2018-10-05', vivofalec: 'V', tipo: 'FIL', por: 'ADMIN', flag_excl: 'N', cpf: '' },
  { codigo: '000000005', grau: '4', seq:  5, ehtitular: 'N', nome: 'OSCAR LIMA',              nascto_: '1920-11-01', estcivil: 'VI', interdito: 'N', sexo: 'M', tcarencia: '2019-04-05', lancto_: '2018-10-05', vivofalec: 'V', tipo: 'PAI', por: 'ADMIN', flag_excl: 'N', cpf: '' },
])

// TAXAS (cobranças geradas — regras do sistema original adm_r002.prg)
//
// Chave primária: codigo + tipo + circ  (única por registro)
// tipo: '1'=Jóia  '2'=Taxa mensal  '3'=Periódico
// stat: '1'=Gerada  '2'=Impressa  '6'=BxRecepção (pago)  '9'=Bx Plano
// Só gera taxa para contratos ATIVOS (situacao='A') com carência vencida
// Cada contrato tem UMA taxa por circular (sem duplicatas na chave)
//
const taxasData = []

// Contratos ativos com carência já vencida (tcarencia < hoje)
// 000008 = cancelado → não gera; demais ativos conforme adm_r002.prg
const contratosAtivos = [
  { codigo: '000000001', grupo: '01', cobrador: '001' },
  { codigo: '000000002', grupo: '01', cobrador: '003' },
  { codigo: '000000003', grupo: '02', cobrador: '001' },
  { codigo: '000000004', grupo: '01', cobrador: '001' },
  { codigo: '000000005', grupo: '01', cobrador: '003' },
  { codigo: '000000006', grupo: '03', cobrador: '001' },
  { codigo: '000000007', grupo: '02', cobrador: '003' },
  { codigo: '000000009', grupo: '01', cobrador: '003' },
  { codigo: '000000010', grupo: '01', cobrador: '001' },
]

const atrasoExtra = { '000000001': 1, '000000002': 2, '000000005': 1 }

// Circulares grupo 01 (jan/fev/mar 2026)
const circsG01 = [
  { circ: '010', emissao: '2026-01-05' },
  { circ: '011', emissao: '2026-02-05' },
  { circ: '012', emissao: '2026-03-05' },
]
// Circulares grupo 02 (jan/fev/mar 2026)
const circsG02 = [
  { circ: '023', emissao: '2026-01-05' },
  { circ: '024', emissao: '2026-02-05' },
  { circ: '025', emissao: '2026-03-05' },
]
// Circulares grupo 03 (jan/fev/mar 2026)
const circsG03 = [
  { circ: '006', emissao: '2026-01-05' },
  { circ: '007', emissao: '2026-02-05' },
  { circ: '008', emissao: '2026-03-05' },
]

const valorPorGrupo = { '01': 89.90, '02': 59.90, '03': 149.90 }

// Quantas circulares cada contrato tem em ATRASO (para testar o Acordo)
// 000000001 → 2 pendentes (fev + mar)
// 000000002 → 3 pendentes (jan + fev + mar) — máximo atraso
// 000000005 → 2 pendentes (fev + mar)
// demais → 1 pendente (só mar)
for (const ct of contratosAtivos) {
  const circs = ct.grupo === '01' ? circsG01 : ct.grupo === '02' ? circsG02 : circsG03
  const valor = valorPorGrupo[ct.grupo]
  const nPendentes = 1 + (atrasoExtra[ct.codigo] || 0)  // quantas circs ficam pendentes no final

  for (let i = 0; i < circs.length; i++) {
    const c    = circs[i]
    // pago = todos exceto os últimos nPendentes
    const pago = i < (circs.length - nPendentes)
    const dtPgto = pago ? c.emissao.replace('-05', '-12') : ''

    taxasData.push({
      codigo:    ct.codigo,
      tipo:      '2',           // '2' = Taxa mensal (adm_r002.prg)
      circ:      c.circ,        // sequencial do grupo — chave única: codigo+tipo+circ
      emissao_:  c.emissao,
      valor:     valor,
      pgto_:     dtPgto,
      valorpg:   pago ? valor : 0,
      cobrador:  ct.cobrador,
      forma:     pago ? '1' : '',  // '1'=Dinheiro
      baixa_:    dtPgto,
      por:       pago ? 'ADMIN' : '',
      stat:      pago ? '6' : '2', // '6'=BxRecepção (pago)  '2'=Impressa (pendente)
      filial:    '01',
      flag_excl: ' ',
    })
  }
}

write('TAXAS', CAMPOS.TAXAS, taxasData)

// PAR_ADM (parametros)
write('PAR_ADM', CAMPOS.PAR_ADM, [
  {
    pgrupo: '01', p_filial: '01', pcontrato: '000000010', pgrau: '1', pseq: 1,
    pverpag: 'S', preplanc: 'N', lastcodigo: '000000010',
    nrcanc: 1, nrreint: 0,
    contarec: '11001', contapag: '21001',
    histrcfcc: '001', histrcrec: '002', histrccar: '003', histpg: '004',
    p_cidade: 'SAO PAULO', p_recp: 'S',
    setup1: 'PRESSERV FUNERARIA LTDA',
    cgcsetup: '12345678000195',
    setup2: 'AV PAULISTA 1000 - BELA VISTA',
    setup3: 'SAO PAULO - SP - CEP 01310-100',
    pcedente: '1234567',
  }
])

console.log('\nConcluido! Selecione a pasta acima no sistema para ver os dados.\n')
