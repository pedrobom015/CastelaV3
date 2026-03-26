# ADP Web — Como Usar

## Requisitos

- Node.js 18+ instalado
- Navegador moderno (Chrome ou Edge recomendado — necessário para File System Access API)

npm run start-app

````
Abrir no navegador: http://localhost:3000

## Build para produção
```bash
npm run build
````

Os arquivos ficam em `dist/` — basta servir com qualquer servidor HTTP.

## Primeiro acesso

1. Abra o sistema no navegador
2. Clique em **"Selecionar diretório de dados"**
3. Navegue até a pasta onde estão os arquivos `.DBF` do sistema original (ex: `C:\ESD\Codigo Atual\`)
4. Clique em **"Selecionar"** / **"Allow"** para conceder acesso
5. Aguarde o carregamento de todos os arquivos DBF
6. Informe seu nome de usuário
7. Clique em **"Entrar no Sistema"**

## Observações importantes

- O sistema abre os arquivos `.DBF` diretamente da pasta selecionada (sem cópia)
- Alterações (inclusão/edição/exclusão) são gravadas diretamente no arquivo `.DBF` original
- **Recomendado:** fazer backup antes de realizar alterações massivas
- O sistema funciona **offline** — não precisa de internet após instalado
- A pasta de dados é lembrada entre sessões (localStorage), mas o acesso ao diretório precisa ser reautorizado a cada sessão por segurança do navegador

## Módulos implementados

### Lançamentos

- ✅ Contratos (GRUPOS.DBF) — CRUD completo + visualização de taxas e inscritos
- ✅ Cancelamentos (CANCELS.DBF) — CRUD completo
- ✅ Reintegração (CGRUPOS.DBF) — visualização
- ✅ Processos (PRCESSOS.DBF) — CRUD completo

### Vendas

- ✅ Gerar Carnê do Contrato — geração no EMCARNE.DBF
- ✅ Lançamento/Carnês (EMCARNE.DBF) — CRUD
- ✅ Tabela de Carnês (TCARNES.DBF) — CRUD

### Cobrança

- ✅ Consulta Débitos Gerados (TAXAS.DBF)
- ✅ Custos Adicionais (CSTSEG.DBF) — CRUD
- ✅ Boletos Bancários (BOLETOS.DBF) — CRUD + impressão
- ✅ Baixa de Boletos (LBXBOLET + BXBOLET)
- ✅ Taxas a Processar (TXPROC.DBF) — CRUD

### Relatórios (com impressão)

- ✅ Contratos & Cobranças
- ✅ Taxas Pendentes
- ✅ Pagas por Período
- ✅ Inscritos/Dependentes
- ✅ Resumo Mensal por Cobrador

### Tabelas

- ✅ Categoria dos Planos (CLASSES.DBF)
- ✅ Grupos (ARQGRUP.DBF)
- ✅ Regiões (REGIAO.DBF)
- ✅ Cobradores/Vendedores (COBRADOR.DBF)
- ✅ Circulares (CIRCULAR.DBF)
- ✅ Funcionários (FNCS.DBF)
- ✅ Parâmetro de Juros (JUROS.DBF)
- ✅ Histórico Padrão (HISTORIC.DBF)
- ✅ Contratos Cancelados (CGRUPOS.DBF)
- ✅ Produtos (PRADENDO.DBF)
- ✅ Filiais (TFILIAIS.DBF)
- ✅ Entregues aos Cobradores (TXENTR.DBF)
- ✅ Recebimento de Taxas (BXREC.DBF)
- ✅ Endereços (ALENDER.DBF)
- ✅ Acerto Pagos e Trocas (BXFCC.DBF)
- ✅ Mensagens p/Contrato (MENSAG.DBF)

### Apoio

- ✅ Parâmetros (PAR_ADM.DBF)
- ✅ Backup (exportação manual)
- ✅ Plano de Senhas
- ✅ Sobre o Sistema

### Módulos marcados 🚧 (em desenvolvimento)

Emissão de carnês impressa, modelos de cobrança impressos, geração automática de débitos, 2ª via de taxas, etiquetas, e demais relatórios específicos.
