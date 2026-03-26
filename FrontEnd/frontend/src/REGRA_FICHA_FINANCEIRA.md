# Regra de Negócio — Ficha Financeira do Contrato

> Documento de referência para o cálculo e exibição da Ficha Financeira na tela de contrato (`ContratoModal.tsx`).
> A Ficha é uma **estimativa** — mostra o que o contrato deve gerar por mês/período com base nos dados cadastrados.

---

## 1. Visão Geral

A Ficha Financeira consolida dois canais de cobrança independentes:

| Canal | Fonte | Geração |
|---|---|---|
| Mensalidade / Circular | CIRCULAR + CLASSES | `gerarDebitosTipo2` / `gerarDebitosTipo3` |
| Carné / Joia | TCARNES via `vlcarne` | `GerarCarne` → EMCARNE |

Os dois canais são **somados** no total estimado do footer.

---

## 2. Resolução da Categoria Efetiva

```
tipcont preenchido e ≠ "00"  →  usa categoria do contrato (tipcont)
tipcont vazio ou "00"        →  usa classe padrão do grupo (arqgrup.classe) como fallback
```

**Importante:** quando o fallback é ativado (sem categoria explícita no contrato):
- `vlmensal` e `vldepend` da CLASSES **não entram no cálculo**
- Apenas o `circular.valor` é usado na estimativa de mensalidade
- A Ficha exibe **"Sem categoria"** no card de identificação

Quando há categoria explícita (`tipcont` preenchido), o fallback é usado **somente para calcular** (nunca exibido como categoria do contrato).

---

## 3. Canal 1 — Mensalidade / Circular

### Fórmula (val_01f9 / adp_p001)

**Com categoria explícita:**

```
Não-VIP (prior ≠ 'S'):
  valor = circular.valor + vlmensal + nrdepend × vldepend

VIP (prior = 'S'):
  valor = (circular.valor + vlmensal + nrdepend × vldepend) × mforma
```

**Sem categoria explícita (usouFallback = true):**

```
valor = circular.valor   (vlmensal = 0, vldepend = 0)
```

### Componentes

| Campo | Fonte | Descrição |
|---|---|---|
| `circular.valor` (`rvlaux`) | `CIRCULAR.DBF` | Valor aditivo da circular do grupo. Se não houver circular, = 0 |
| `vlmensal` | `CLASSES.vlmensal` | Valor mensal da categoria. Pode ser negativo (desconto) |
| `vldepend` | `CLASSES.vldepend` | Valor por dependente |
| `nrdepend` | `GRUPOS.nrdepend` | Número de dependentes do contrato |
| `mforma` | `GRUPOS.formapgto` | Periodicidade: 1=mensal, 2=bimestral, 3=trimestral, 6=semestral, 12=anual |
| `prior` | `CLASSES.prior` | `S` = VIP (multiplica por mforma) · outros = padrão |

### Última circular

A Ficha usa a circular com o **maior número** (`circ`) em `CIRCULAR.DBF` para o grupo do contrato.
Se não existir circular, `rvlaux = 0` e a estimativa usa apenas os valores da categoria.

---

## 4. Canal 2 — Carné / Joia (EMCARNE)

Processo **completamente separado** da geração de débitos de manutenção.

```
vlcarne (GRUPOS) → TCARNES.tip → vali / parf
vlPorParcela = floor(vali / parf × 10) / 10   (arredondamento emc_01f9)
```

| Campo | Fonte | Descrição |
|---|---|---|
| `vlcarne` | `GRUPOS.vlcarne` | Código do tipo de carnê (FK → `TCARNES.tip`). Vazio = sem carnê |
| `vali` | `TCARNES.vali` | Valor total da joia |
| `parf` | `TCARNES.parf` | Número de parcelas |
| `vlPorParcela` | calculado | Valor de cada parcela (arredondado para baixo em R$ 0,10) |

> `TCARNES.tipcob` (periodicidade do carnê: M/B/T/S/A) é independente de `GRUPOS.formapgto`.
> A Ficha exibe o valor por parcela sem ajustar pela periodicidade do carnê.

---

## 5. Total Estimado (footer)

```
totalMensal = valorMensalidade + (carne?.vlPorParcela ?? 0)
```

Exibido fixo no footer do modal independente do scroll ou tamanho de tela.

---

## 6. Card de Identificação

| Campo | Exibe | Observação |
|---|---|---|
| Categoria | `tipcont` do contrato | "Sem categoria" se vazio (mesmo que fallback calcule com grupo) |
| Grupo | `GRUPOS.grupo` | — |
| Últ. Circular | `#NNN` da última circular encontrada | "—" se não houver |
| Tipo | VIP / Padrão | Baseado em `CLASSES.prior` |
| Periodicidade | Mensal / Bimestral / etc. | Baseado em `mforma` |
| Dependentes | `GRUPOS.nrdepend` | — |

---

## 7. Quando a Ficha Não Exibe Valores

| Situação | Comportamento |
|---|---|
| Sem circular para o grupo | `rvlaux = 0` · mensalidade = só vlmensal + dependentes |
| Sem categoria e sem circular | Total = R$ 0,00 |
| Sem `vlcarne` | Bloco Carné exibe "Nenhum carné vinculado" |
| `classesTable` não carregada | Ficha exibe "Carregando dados financeiros..." |
