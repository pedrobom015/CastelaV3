# Frontend CRUD — Módulo Tabelas Base P01 (Tailwind + Zustand)

Criar as telas CRUD das **12 tabelas base** do SQL P01 para o **CastelaV2**, obedecendo RIGOROSAMENTE as seguintes diretrizes:

> 🔴 **RESTRIÇÕES ARQUITETURAIS:**
> - **Obrigatório:** Tailwind CSS para toda a estilização.
> - **Obrigatório:** `react-router-dom` para rotas e `zustand` para gerenciamento de estado.
> - **Obrigatório:** Criar Componentes UI "Headless/Raw" (TableGrid de alta densidade customizado, Forms, Modals).
> - **PROIBIDO:** O uso de Material UI (MUI), React-Admin, Ant Design ou qualquer biblioteca de UI empacotada. Layout corporativo e limpo (Corporate layout).

---

## 1. Módulos e Tabelas Alvo

Em conformidade com o README (`/GestaoContratos`, `/Financeiro`, `/Atendimento` em vez de pastas técnicas), vamos organizar as tabelas utilitárias do P01 sob um módulo base de **Cadastros Gerais / Apoio**.

| Tabela | Nome da Rota / Componente | Estrutura de Campos no Frontend |
|---|---|---|
| `gender` | Genêros | `name` |
| `document_type` | Tipos de Documento | `description` |
| `address_type` | Tipos de Endereço | `name` |
| `state` | Estados | `name`, `uf`, `codigo_ibge` |
| `city` | Cidades | `name`, `codigo_ibge` + Dropdown Estado (`state_id`) |
| `currency` | Moedas | `currency_code`, `currency_name`, `currency_symbol`, `decimal_places`, `rounding_method`, Dropdown Status Ativo |
| `status` | Códigos de Status Geral | `status_code`, `status_name`, `description`, Cor (Visual Color Picker Hex), Toggles/Checkbox (flags Booleanos) |
| `payment_status` | Status de Pagamento | `name`, `code`, Cor (Picker Hex), Toggles, Ordem Automática |
| `contract_status` | Status do Contrato | `name`, `code`, Cor, Toggles, Ordem |
| `state_machine_transitions`| Regras de Transição | Select Origem (`from`), Select Destino ([to](file:///c:/app/CastelaV2/FrontEnd/src/App.jsx#95-105)), Toggles Booleanos |
| `status_reason` | Motivos de Status | `reason`, `description` |

*(A tabela `schema_version` é gerida exclusivamente por scripts de banco e não terá CRUD no frontend).*

---

## 2. Arquitetura de Componentes Customizados (Design System Raw)

Antes de criar as páginas, vamos construir componentes base em `c:\app\CastelaV2\FrontEnd\src\components\ui\`:

### `TableGrid` (High-Density Data Table)
- **Tecnologia:** `<table>` nativa estilizada intensamente com Tailwind (ex: `divide-y divide-gray-200`, `text-sm`, `whitespace-nowrap`).
- Cabeçalhos colados (sticky header) se necessário.
- Botões de ação (Editar/Excluir) limpos e embutidos na linha via ícones vetoriais genéricos (ex: Lucide-react / Heroicons ou SVG inline em vez de MUI Icons).

### `FormBuilder` & Inputs
- TextInputs, Selects, Toggles (Switches nativos) estritamente controlados via classes Tailwind (anéis de foco ring-blue-500, bordas cinzas neutras).
- Os forms serão renderizados dentro de modais centralizados.

### `Modal` (Dialogo Flutuante)
- Fundo semitransparente (backdrop-blur flex items-center justify-center fixe z-50 bg-black/50)
- Container branco arredondado para exibir os formulários de inserção/alteração.

---

## 3. Estrutura de Rotas e Zustand

### `src/store/` (Zustand)
- `useModalStore`: Controla visibilidade global de popups e formulários CRUD ativos (id selecionado, modo Edit vs Create).
- `useDataStore`: Responsável apenas pelo carregamento temporário de tabelas dependentes (ex: Cache da lista de Estados para uso imediato no Select do form da Cidade).

### [src/App.tsx](file:///c:/app/Demo-frontend/frontend/src/App.tsx) & Router
Em vez do `Admin` do React-Admin, teremos um layout corporativo com menu fixo à esquerda e topbar.

```tsx
<Routes>
  <Route element={<MainLayout />}>
    <Route path="/cadastros/generos" element={<GendersPage />} />
    <Route path="/cadastros/cidades" element={<CitiesPage />} />
    <Route path="/cadastros/status" element={<StatusPage />} />
    {/* ... rotas mapeadas acima */}
  </Route>
</Routes>
```

---

## 4. Estilos de Código e Refatoração (A Fazer)

- Atualmente a pasta `c:\app\CastelaV2\FrontEnd` parece conter resquícios de `App.jsx` usando React-Admin e MUI.
- **Ação Imediata:** A implementação APAGARÁ o uso de `@mui/material`, `@mui/icons-material`, e `react-admin` do `package.json`, reinstalando e limpando os arquivos em `.jsx` para substituí-los pelo padrão raw Tailwind em TypeScript/JSX. (Requer confirmação de substituição).

---

## 5. Verificação de Entrega

1. O layout final deve apresentar grids de alta densidade para cada uma das 11 tabelas.
2. Todo o pacote `node_modules` gerado estará dependente apenas de bibliotecas como `react`, `react-router-dom`, `zustand`, talvez `lucide-react` para os ícones, Tailwind (postcss, autoprefixer).
3. Testar a experiência visual — sem comportamentos "padrão/encapsulados" opacos. Total controle das renderizações da tabela e fluxos.
