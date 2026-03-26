# Análise — Modos de Cobrança do Plano

> Simplificação das regras de negócio para entendimento rápido.
> Baseado em `REGRA_NEGOCIO_GRUPOS.md` e `REGRA_FICHA_FINANCEIRA.md`.

---

## A pergunta central

> **"O que este contrato vai pagar e quando?"**

A resposta depende de **três variáveis independentes** no contrato:
1. Se tem **categoria** (`tipcont`)
2. Se é **VIP** (`CLASSES.prior = 'S'`)
3. Se tem **carné de venda** (`vlcarne`)

---

## Mapa dos Modos de Cobrança

```
CONTRATO
  │
  ├── MANUTENÇÃO (TAXAS.DBF) ──────────────────────────────────────────
  │     │
  │     ├── Modo A: Padrão por circular (tipo='2')
  │     │     Quem: prior ≠ 'S'
  │     │     Quando: a cada circular emitida para o grupo
  │     │     Valor: circular.valor + vlmensal + nrdepend × vldepend
  │     │
  │     ├── Modo B: VIP por periodicidade (tipo='3' via GeracaoMes)
  │     │     Quem: prior = 'S'
  │     │     Quando: a cada N circulares (N = formapgto)
  │     │     Valor: (circular.valor + vlmensal + nrdepend × vldepend) × mforma
  │     │
  │     ├── Modo C: Periódico anual (tipo='3' via GeracaoPeriodicos)
  │     │     Quem: qualquer contrato, gerado pela tela de Periódicos
  │     │     Quando: gera 12/mforma parcelas de uma vez por ano
  │     │     Valor: vlparc + (vlmensal + nrdepend × vldepend) × mforma
  │     │
  │     └── Modo D: Por período/data (tipo='4' via GeracaoPeriodo)
  │           Quem: qualquer contrato, baseado na data do último débito
  │           Quando: próxima parcela após ultvct, dentro do período solicitado
  │           Valor: (vlparc + vlmensal + nrdepend × vldepend) × mforma
  │
  └── JÓIA DE ADESÃO (EMCARNE.DBF) ────────────────────────────────────
        Modo E: Carné de venda
              Quem: contrato com vlcarne preenchido
              Quando: parcelas definidas em TCARNES (periodicidade própria)
              Valor: floor(TCARNES.vali / TCARNES.parf × 10) / 10
```

---

## Diferença crítica entre os modos

| | Modo A | Modo B | Modo C | Modo D | Modo E |
|---|---|---|---|---|---|
| Tabela gerada | TAXAS | TAXAS | TAXAS | TAXAS | EMCARNE |
| `tipo` na taxa | `2` | `3` | `3` | `4` | — |
| Disparador | Circular emitida | Circular + skip VIP | Tela Periódicos | Tela Período | Tela GerarCarne |
| `vlparc` usado? | Não | Não | Sim (flat) | Sim (× mforma) | — |
| Multiplica mforma? | Não | Sim | Parcialmente | Sim (tudo) | Não |
| Precisa de categoria? | Sim | Sim | Sim | Sim | Não |

---

## O papel de cada campo no contrato

```
GRUPOS.tipcont   → qual categoria → vlmensal, vldepend, prior (VIP?)
GRUPOS.formapgto → mforma → periodicidade (1=mensal, 2=bimestral...)
GRUPOS.nrdepend  → quantos dependentes → multiplica vldepend
GRUPOS.vlcarne   → código do carné → TCARNES → parcelas da jóia
GRUPOS.saitxa    → início da cobrança (MMAA) ou '9999' = remido
GRUPOS.qtcircs   → contagem de circulares pagas → remissão
```

---

## Quando o contrato NÃO gera débito (guardas)

Um contrato é **ignorado** na geração se qualquer condição abaixo for verdadeira:

| Condição | Regra |
|---|---|
| Inativo/Cancelado | `situacao ≠ '1'` e `≠ 'A'` |
| Remido por taxa | `saitxa = '9999'` |
| Remido por circulares | `qtcircs >= (funerais+1) × qtdremir` (com `poratend='S'`) |
| Remido por circulares | `qtcircs >= qtdremir` (sem `poratend='S'`) |
| Cobrança ainda não iniciou | `saitxa (MMAA) > mesref` |
| Já cobrado nesta circular | `codigo + tipo + circ` já existe em TAXAS |
| VIP fora do ciclo | `prior='S'` e `circ < ultcirc + formapgto` |

---

## Variações por combinação de grupo + categoria

### Caso 1: Contrato sem categoria, sem VIP
```
Cobrança = circular.valor apenas
Modo: A (tipo='2'), sem vlmensal nem vldepend
```

### Caso 2: Contrato com categoria padrão, sem VIP
```
Cobrança = circular.valor + vlmensal + nrdepend × vldepend
Modo: A (tipo='2')
```

### Caso 3: Contrato VIP (prior='S')
```
Cobrança = (circular.valor + vlmensal + nrdepend × vldepend) × mforma
Modo: B (tipo='3'), gerado a cada N circulares conforme formapgto
Exemplo formapgto=06 (semestral): paga 1 vez a cada 6 circulares, valor × 6
```

### Caso 4: Contrato com carné de venda (jóia parcelada)
```
Cobrança adicional = TCARNES.vali / TCARNES.parf (arredondado)
Tabela: EMCARNE (separada das TAXAS de manutenção)
Independe de categoria ou VIP — é um stream paralelo
```

### Caso 5: Geração periódica anual (tela Periódicos)
```
Gera 12/mforma parcelas de uma vez
Valor = vlparc (adicional) + (vlmensal + nrdepend × vldepend) × mforma
Modo: C (tipo='3')
```

---

## Resumo visual do que chega ao cliente por mês

```
Todo mês (Modo A/B):
  ┌─────────────────────────────────────────┐
  │ circular.valor                          │  ← varia por circular
  │ + vlmensal       (se tem categoria)     │  ← fixo da categoria
  │ + nrdepend × vldepend (se tem depend.)  │  ← por dependente
  │ × mforma         (se VIP)               │  ← acumula periodicidade
  └─────────────────────────────────────────┘

+ Parcela do carné (se tem vlcarne):
  ┌─────────────────────────────────────────┐
  │ TCARNES.vali / TCARNES.parf             │  ← fixo até quitar a jóia
  └─────────────────────────────────────────┘
```

---

## Pontos de atenção

1. **Modos C e D são manuais** — só geram quando o operador acessa a tela específica. Modos A/B são os da operação diária (circular do mês).

2. **vlparc nos modos C e D tem semânticas diferentes:**
   - Modo C: `vlparc` é somado **antes** de multiplicar → valor fixo adicional à parcela
   - Modo D: `vlparc` entra **dentro** da multiplicação → representa valor mensal escalado

3. **Carné (Modo E) nunca passa por TAXAS** — é EMCARNE. Não aparece em relatórios de taxas pendentes.

4. **Remissão** zera manutenção mas NÃO zera carné de venda — são tabelas independentes.

5. **Categoria do grupo como fallback** vale para cálculo de débitos, mas contratos sem `tipcont` explícito não recebem `vlmensal` na Ficha Financeira da tela de contrato — exibe apenas o circular.
