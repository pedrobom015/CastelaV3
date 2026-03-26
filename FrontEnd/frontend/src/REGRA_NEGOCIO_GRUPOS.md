# Regra de Negócio — Grupos, Categorias e Cobrança

> Documento de referência para o sistema Presserv — Módulo Plano.
> Baseado no sistema legado (Harbour/DBF) e na implementação atual (React/TypeScript).

---

## 1. Visão Geral

O módulo de plano opera com três entidades principais, em hierarquia:

```
CLASSES.DBF (Categoria)
    └── ARQGRUP.DBF (Grupo)
            └── GRUPOS.DBF (Contrato / Titular)
```

Cada nível herda referências do nível acima, mas pode ter configurações específicas.

---

## 2. Categoria (CLASSES.DBF)

### O que é
Define um **plano de cobrança** — os valores e regras aplicados à cobrança de um contrato.

### Campos principais

| Campo | Tipo | Descrição |
|---|---|---|
| `classcod` | C(2) | Código da categoria (chave) |
| `descricao` | C(35) | Nome do plano |
| `prior` | C(1) | `S` = plano VIP/por mês · `N` = por atendimento/rateio |
| `vljoia` | N | Taxa de adesão (cobrada uma única vez) |
| `vlmensal` | N | Valor adicional mensal (acréscimo ou desconto se negativo) |
| `vldepend` | N | Valor cobrado por dependente incluso no contrato |
| `vltotal` | N | Jóia + Adicional + Dependente (calculado) |
| `nrparc` | N | Parcelas para pagamento da jóia |
| `nrmesval` | N | Duração máxima do contrato em meses |
| `renvenc` | C(1) | Renova automaticamente no vencimento |
| `renuso` | C(1) | Renova automaticamente no atendimento |

### Regras
- `prior = 'S'` → cobrança mensal fixa (VIP); gerado na **mesma rotina** da geração tipo 2, porém com `tipo='3'` na taxa (em vez de `'2'`). Isso segue o legado `adp_p001.prg`: `IIF(CLASSES->prior=[S],[3],[2])`.
- `prior ≠ 'S'` (ex: `'N'`) → geração padrão com `tipo='2'`.
- `vlmensal` pode ser negativo → representa desconto sobre a mensalidade base.
- `vltotal` é calculado automaticamente pela interface: `vljoia + vlmensal + vldepend`.

---

## 3. Grupo (ARQGRUP.DBF)

### O que é
Agrupa contratos para fins de cobrança coletiva (circular de cobrança). Um grupo pertence a uma categoria e define as datas de emissão das circulares.

### Campos principais

| Campo | Tipo | Descrição |
|---|---|---|
| `grup` | C(2) | Código do grupo (chave) |
| `classe` | C(2) | **Categoria padrão** do grupo (FK → `CLASSES.classcod`) |
| `inicio` | C(9) | Primeiro nº de contrato do grupo |
| `final` | C(9) | Último nº de contrato do grupo |
| `ultcirc` | C(3) | Última circular emitida |
| `proxcirc` | C(3) | Próxima circular a emitir |
| `emissao_` | D | Data da última emissão |
| `maxproc` | N | Máx. processos pendentes para bloquear emissão |
| `acumproc` | N | Processos acumulados para liberar emissão |
| `qtdremir` | N | Nº de taxas pagas para remissão (isenção) |
| `periodic` | N | Intervalo mínimo em dias entre circulares |
| `cpadmiss` | C(1) | Comparar data de admissão com atendimento antes de autorizar |
| `contrat` | N | Nº de contratos (atualizado ao vivo de GRUPOS.DBF) |
| `partic` | N | Nº de participantes (titular + dependentes) |

### Regra da categoria padrão
O campo `classe` define **qual categoria é usada como padrão** para todos os contratos novos criados neste grupo. Ao cadastrar um novo contrato e informar o grupo, o sistema preenche automaticamente o campo `tipcont` do contrato com o valor de `arqgrup.classe`.

---

## 4. Contrato / Titular (GRUPOS.DBF)

### O que é
Cada registro representa um contrato individual (titular + dependentes). É a entidade base da cobrança.

### Campos relevantes para cobrança

| Campo | Tipo | Descrição |
|---|---|---|
| `codigo` | C(9) | Nº do contrato (chave) |
| `grupo` | C(2) | Grupo ao qual pertence (FK → `ARQGRUP.grup`) |
| `tipcont` | C(2) | **Categoria do contrato** (FK → `CLASSES.classcod`) |
| `situacao` | C(1) | `1`/`A` = Ativo · `2` = Cancelado · `3` = Suspenso |
| `nrdepend` | N | Nº de dependentes |
| `formapgto` | C(2) | Periodicidade: `01`=mensal `02`=bimestral `03`=trimestral `06`=semestral `12`=anual |
| `saitxa` | C(4) | Data de saída de taxa no formato MMAA (ou `9999` = remido) |
| `qtcircs` | N | Total de circulares pagas pelo contrato |
| `ultcirc` | C(3) | Última circular recebida |
| `circinic` | C(3) | Circular inicial do contrato |
| `diapgto` | C(2) | Dia do mês para pagamento |
| `funerais` | N | Nº de funerais realizados (usado no cálculo de remissão) |

---

## 5. Vínculo Contrato ↔ Categoria (campo `tipcont`)

### Regra central
```
tipcont (GRUPOS) → classcod (CLASSES)
```

- O contrato pertence a um **grupo**, mas é cobrado com base na sua **categoria individual** (`tipcont`).
- O grupo define a **categoria padrão** (`arqgrup.classe`), que é copiada para `tipcont` na criação do contrato.
- Se o titular desejar um serviço diferente (urna melhor, atendimento diferenciado etc.), o `tipcont` é alterado para outra categoria — o contrato **continua no mesmo grupo**, mas passa a ser cobrado com os valores daquela categoria específica.

### Fluxo de preenchimento
1. Usuário seleciona o grupo no formulário do contrato.
2. Sistema busca `arqgrup.classe` para o grupo escolhido.
3. Preenche `tipcont` automaticamente com esse valor.
4. Usuário pode alterar `tipcont` manualmente para outra categoria (override).

### Fallback (casos de erro de digitação)
Contratos antigos podem ter `tipcont = "00"` ou vazio por erro de digitação.
**Regra de fallback:**
```
tipcont preenchido e ≠ "00"  →  usa categoria do contrato (tipcont)
tipcont vazio ou "00"        →  usa categoria padrão do grupo (arqgrup.classe)
```
Esse fallback é aplicado:
- Ao abrir o modal de edição do contrato (normaliza o campo na UI).
- Na geração de débitos (geracaoDebitos.ts).

---

## 6. Geração de Débitos

### Arquivos envolvidos
- **Serviço:** `src/services/geracaoDebitos.ts`
- **UI (tipo 2 — mensal):** `src/pages/plano/cobranca/geracao/GeracaoMes.tsx` → `gerarDebitosTipo2` · legado: `adp_p001.prg`
- **UI (tipo 2 — porcentagem):** `src/pages/plano/cobranca/geracao/GeracaoPorcentagem.tsx` → `gerarDebitosTipo2` · legado: `adp_pxp7.prg`
- **UI (tipo 3 — periódico/carné):** `src/pages/plano/cobranca/geracao/GeracaoPeriodicos.tsx` → `gerarDebitosPeriodicos` · legado: `adp_py07.prg`
- **UI (tipo 4 — período):** `src/pages/plano/cobranca/geracao/GeracaoPeriodo.tsx` → `gerarDebitosTipo4` · legado: `adp_px07.prg`

### Tipos de taxa (TAXAS.DBF)
| Tipo | Função | Legado | Frontend |
|---|---|---|---|
| `2` | Taxa mensal por rateio/circular | `adp_p001.prg` · `adp_pxp7.prg` | `GeracaoMes` · `GeracaoPorcentagem` |
| `3` | Periódico / carné (parcelas anuais via TCARNES) | `adp_py07.prg` | `GeracaoPeriodicos` |
| `4` | Parcelas do período (filtro por data do último débito) | `adp_px07.prg` | `GeracaoPeriodo` |

Chave única em TAXAS: `codigo + tipo + circ` (nunca duplicar).

---

### 6.1 Geração Tipo 2 — Débitos do Mês (`gerarDebitosTipo2`)
Baseado em `adp_p001.prg` + `val_01f9.prg` + `rv4401f9.prg`.

**Critérios de inclusão do contrato:**
1. Pertence ao grupo selecionado (ou todos, se grupo em branco).
2. `situacao = '1'` ou `'A'` (ativo).
3. Não está remido — ver seção 7 (formula depende de `poratend`).
4. `saitxa ≠ '9999'` e **`saitxa (MMAA) <= mesref`** — `saitxa` é o **início** da cobrança; bloqueia se `saitxa > mesref` (cobrança ainda não começou).
5. `prior = 'S'` → gera com `tipo='3'` · `prior ≠ 'S'` → gera com `tipo='2'` (todos incluídos, só o tipo muda).
6. A combinação `codigo + tipo + circ` ainda não existe em TAXAS.
7. **VIP skip (rv4401f9):** contrato VIP (`prior='S'`) só gera nova taxa quando `circ ≥ ultcirc + formapgto`. Garante que VIP paga na periodicidade correta (ex: semestral = a cada 6 circulares), não a cada circular.

**Cálculo do valor (val_01f9):**
```
classeEfetiva = tipcont se ≠ "00"/vazio, senão arqgrup.classe
vlmensal      = CLASSES[classeEfetiva].vlmensal
vldepend      = CLASSES[classeEfetiva].vldepend
mforma        = max(1, grupos->formapgto)
rvlaux        = circular.valor  (valor adicional da circular, pode ser 0)

VIP (prior='S'):
  valor = arredondar((rvlaux + vlmensal + nrdepend × vldepend) × mforma)

Não-VIP (rnraux=1, sem CPRCIRC):
  valor = arredondar(rvlaux + vlmensal + nrdepend × vldepend)

Se valor = 0: usa params.valorFallback (valor informado na tela)
```

> Nota: o `rvlaux` (circular.valor) é um componente aditivo, não substitutivo. VIP multiplica por `mforma`; não-VIP não multiplica.

**Atualiza GRUPOS e ARQGRUP após geração:**
- `GRUPOS.qtcircs += 1`
- `GRUPOS.ultcirc = max(ultcirc, circ gerada)`
- `GRUPOS.circinic = circ gerada` se `circinic = '000'` ou vazio
- `ARQGRUP.ultcirc = max(ultcirc, circ gerada)` (nível do grupo)
- `ARQGRUP.emissao_ = data de emissão da última circular gerada`

---

### 6.2 Geração Tipo 3 — Periódico / Carné (`gerarDebitosPeriodicos`)
Baseado em `adp_py07.prg`.

**Diferença principal do tipo 2:**
Gera **um ano inteiro de parcelas** de uma só vez, com periodicidade definida por `formapgto`.

**Periodicidade (`formapgto` / `mforma`):**
| formapgto | mforma | Parcelas/ano |
|---|---|---|
| `01` | 1 | 12 |
| `02` | 2 | 6 |
| `03` | 3 | 4 |
| `06` | 6 | 2 |
| `12` | 12 | 1 |

**Cálculo do valor da parcela (adp_py07):**
```
classeEfetiva = tipcont se ≠ "00"/vazio, senão arqgrup.classe
vlmensal      = CLASSES[classeEfetiva].vlmensal
vldepend      = CLASSES[classeEfetiva].vldepend
mforma        = max(1, grupos->formapgto)

vlparcela = arredondar(vlparc + (vlmensal + nrdepend × vldepend) × mforma)
```

> `vlparc` é buscado automaticamente de TCARNES pelo legado (lookup por grupo/mforma). No frontend é informado pelo usuário como "Vlr. Adicional" (padrão 0).

**Arredondamento (conforme adp_pxp7):**
```
valor += 0.05
valor  = floor(valor × 10) / 10
```
Exemplos:
- R$ 30,02 → R$ 30,00
- R$ 30,07 → R$ 30,10
- R$ 41,56 → R$ 41,60

**Critérios de inclusão:**
- Mesmos critérios do tipo 2.
- Filtra pelo intervalo de contratos `inicio`/`final` do grupo.
- Verifica a última circular de tipo 3 já existente em TAXAS para continuar a numeração.
- Datas de vencimento avançam pelo período (`mforma` meses por parcela).

---

### 6.3 Geração Tipo 4 — Débitos do Período (`gerarDebitosTipo4`)
Baseado em `adp_px07.prg`.

**Diferença fundamental do tipo 3:**
- `tipo='4'` na taxa (não '3')
- `vlparc` é multiplicado pela periodicidade (`vlparc × mforma`), não somado flat
- Filtro por **data do último débito** (tipo 3 ou 4), não por existência de circ
- Parâmetros: `vini` (limite superior do último vencimento) e `vfim` (data da 1ª parcela)

**Lógica de filtro (adp_px07):**
1. Para cada contrato, busca o último TAXAS com `tipo='3'` ou `'4'` → obtém `ultvct` e `ultimoCirc`
2. Se `ultvct > vini` → ignora (último débito já passou do limite solicitado)
3. Calcula `dtproxvcto`:
   - Sem histórico: começa em `vfim + 1 mês`
   - Com histórico: `ultvct + (1 + mforma)` meses
4. Se `dtproxvcto > último dia do mês de vfim` → ignora (próxima parcela cai após o período)
5. Ajusta `dtproxvcto` com `saitxa` (nunca cobrar antes do início permitido)

**Cálculo do valor da parcela (adp_px07 linha 371–372):**
```
vlparcela = arredondar((vlparc + vlmensal + nrdepend × vldepend) × mforma)
```
> `vlparc` é escalado pela periodicidade — representa um valor mensal adicional, diferente do tipo 3 onde `vlparc` é o total da parcela.

**Gera:** `12 / mforma` parcelas anuais, avançando `mforma` meses por parcela.

---

## 7. Verificação de Remissão

Um contrato é considerado **remido** (isento de novas cobranças) quando `saitxa = '9999'` **ou** quando:

```
qtcircs >= limite

onde limite depende de ARQGRUP.poratend:
  poratend = 'S'  →  limite = (MAX(funerais, 0) + 1) × qtdremir
  poratend ≠ 'S'  →  limite = qtdremir
```

**Fonte:** `rv4401f9.prg` linha 27:
```
mqtcircs >= IIF(ARQGRUP->poratend=[S], (MAX(GRUPOS->funerais,0)+1), 1) * ARQGRUP->qtdremir
```

- `poratend = 'S'` → o limite cresce proporcionalmente ao número de funerais realizados (plano com remissão progressiva).
- `poratend ≠ 'S'` → limite fixo igual a `qtdremir`, independente de funerais.

Contratos remidos são ignorados na geração de débitos.

---

## 8. Carnê de Venda — vlcarne / TCARNES / EMCARNE

### O que é

O carnê de venda é o processo de cobrança da **jóia de entrada** (taxa de adesão ao plano). É **completamente separado** da geração de débitos de manutenção (TAXAS). Não passa pelo `gerarDebitosTipo2` nem pelo `gerarDebitosPeriodicos`.

### Campo `vlcarne` em GRUPOS

- Armazena o **código do tipo de carnê** (`TCARNES.tip`) atribuído ao contrato.
- É preenchido quando a venda é lançada (processo GerarCarne).
- O help do legado confirma: *"Será preenchido quando for lançada a venda do contrato."*
- **Não é um valor monetário** — é uma chave de referência.

### Tabela TCARNES

Define a estrutura do carnê de venda para cada tipo:

| Campo | Descrição |
|---|---|
| `tip` | Código do tipo (chave, 2 chars) — referenciado por `vlcarne` |
| `tipcob` | Tipo de geração da cobrança (M=Mensal, B=Bimestral, T=Trimestral, S=Semestral, A=Anual) |
| `formapgto` | Método de cobrança (01=Mensalidade, 02=Carnê, 03=Débito Automático, 04=Boleto, 05=Cartão) |
| `pari` | Parcela inicial |
| `vali` | Valor total da venda |
| `parf` | Número de parcelas |

> ⚠️ O `TCARNES.tipcob` (M/B/T/S/A) é independente do `GRUPOS.formapgto` (01/02/03/06/12). Um define a periodicidade da venda, o outro define a periodicidade da taxa de manutenção.

### Fluxo GerarCarne → EMCARNE

```
vlcarne (GRUPOS) → TCARNES (estrutura)
                        ↓
                   GerarCarne
                        ↓
                   EMCARNE.DBF (registros do carnê de venda)
```

O `adp_pxp7.prg` e o `gerarDebitosPeriodicos` **não utilizam vlcarne nem TCARNES**. Confirmado na leitura do código legado.

---

## 9. Alinhamento: legado vs frontend

### 9.1 `gerarDebitosPeriodicos` — fórmula corrigida (adp_py07)

Fórmula corrigida para alinhar com `adp_py07.prg` (não `adp_px07`):

| Parâmetro | Descrição | UI label |
|---|---|---|
| `vlparc` | Valor adicional somado **antes** da multiplicação pela periodicidade | "Vlr. Adicional" |
| `porcparc` | Percentual de reajuste aplicado **após** o cálculo | "% Reajuste" |

**Fórmula correta (adp_py07 linha 314–315):**
```
vlparcela = arredondar(vlparc + (vlmensal + nrdepend × vldepend) × mforma)
// se porcparc ≠ 0: vlparcela = arredondar(vlparcela × (1 + porcparc/100))
```

> Diferença crítica: `vlparc` é somado **fora** da multiplicação por `mforma`. No legado, `vlparc` já é o valor total da parcela periódica buscado de TCARNES — não deve ser multiplicado pela periodicidade.

### 9.2 `gerarDebitosPeriodicos` — filtro de data

O legado filtra por `vini_` (data do último vencimento a considerar) e só inclui contratos cujo último débito vence **até** `vini_`. O frontend usa `vencimentoFim` como ponto de partida para calcular as datas, sem esse filtro por data do último débito.

### 9.3 Tipo das taxas periódicas

O legado (`adp_pxp7`) deixa o usuário escolher o tipo (1=Jóia, 2=Taxa, 3=Carnê, 4=Acerto...). O frontend fixa `tipo='3'` para geração periódica. Simplificação intencional.

---

## 11. Tabela CIRCULAR

Para cada par `grupo + circ`, o sistema busca um registro em `CIRCULAR`:

- `circular.emissao_` → usada como data de vencimento (substitui a data da UI se existir).
- `circular.valor` (`rvlaux`) → **componente aditivo** na fórmula do valor, não substituto:
  - VIP: `(circular.valor + vlmensal + nrdepend×vldepend) × mforma`
  - Não-VIP: `circular.valor + vlmensal + nrdepend×vldepend`

Se `CIRCULAR` não existir para o par, `circular.valor = 0` e a data vem da UI — o resultado da fórmula com `rvlaux=0` é a base pura da categoria.

---

## 12. Resumo do Fluxo Completo

```
1. Usuário abre tela de geração
   → Seleciona grupo, circular, data de emissão

2. Para cada contrato do grupo:
   a. Verifica situacao (ativo?)
   b. Verifica remissão:
      - saitxa = '9999' → remido
      - poratend='S': qtcircs >= (MAX(funerais,0)+1)*qtdremir → remido
      - poratend≠'S': qtcircs >= qtdremir → remido
   c. Verifica saitxa — é o INÍCIO da cobrança (saitxa <= mesref para incluir)
   d. Resolve categoria efetiva:
      - tipcont válido → usa tipcont
      - tipcont "00"/vazio → usa arqgrup.classe
   e. Resolve tipo da taxa:
      - prior = 'S' → tipo = '3' (VIP periodicidade fixa)
      - prior ≠ 'S' → tipo = '2' (mensal por rateio/circular)
   f. VIP skip (rv4401f9): se prior='S' e circ < ultcirc + formapgto → pula esta circular
   g. Calcula valor (val_01f9):
      - VIP:     arredondar((circular.valor + vlmensal + nrdepend×vldepend) × mforma)
      - Não-VIP: arredondar(circular.valor + vlmensal + nrdepend×vldepend)
      - Se 0: usa valorFallback da UI
   h. Verifica chave código+tipo+circ em TAXAS (não duplicar)
   i. Cria registro em TAXAS (stat='1')
   j. Atualiza GRUPOS: qtcircs+=1, ultcirc=max, circinic se vazio
   k. Atualiza ARQGRUP: ultcirc=max(grupo), emissao_=data emissão

3. Resultado: lista de gerados e ignorados (com motivo)
```

---

## 13. Arquivos DBF Envolvidos

| Arquivo | Entidade | Chave |
|---|---|---|
| `CLASSES.DBF` | Categorias de plano | `classcod` |
| `ARQGRUP.DBF` | Grupos de cobrança | `grup` |
| `GRUPOS.DBF` | Contratos / Titulares | `codigo` |
| `INSCRITS.DBF` | Inscritos (titular + dependentes) | `codigo + seq` |
| `TAXAS.DBF` | Débitos gerados | `codigo + tipo + circ` |
| `CIRCULAR.DBF` | Valores e datas por circular do grupo | `grupo + circ` |
| `COBRADOR.DBF` | Cobradores e vendedores | `cobrador` |
| `REGIAO.DBF` | Regiões de cobrança | `codigo` |
