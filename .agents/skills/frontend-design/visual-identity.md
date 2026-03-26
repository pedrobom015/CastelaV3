Identidade Visual do Projeto Admin--FrontEnd
Este documento descreve a identidade visual extraída do código-fonte do projeto.

🎨 Cores
Nome	Hexadecimal	Uso Principal
Primary Main	#ff914d	Cor principal, botões, destaques (Laranja)
Primary Secondary	#69628c	Elementos secundários (Roxo/Cinza)
Primary Soft	#fcf1ea	Fundos suaves (Laranja muito claro)
Sidebar BG	#eff2f5	Fundo da barra lateral (Cinza claro)
Background	#f0f0f0	Fundo global da aplicação
Button Hover	#043273	Estado hover dos botões (Azul escuro)
Button Border	#c7c0b9	Borda padrão dos botões
Status OK	#a6ffc8	Indicador de status positivo
Status Erro	#ffa6a6	Indicador de status negativo
🅰️ Tipografia
A aplicação utiliza duas fontes principais, carregadas via @font-face no
index.css
:

Orbitron: Usada em títulos, botões e na tela de login. Transmite uma sensação moderna/futurista.
Inter: Usada em inputs e textos de corpo (body), garantindo legibilidade.
🖼️ Logos e Assets
Os arquivos de imagem estão localizados em src/assets/img/:

Login:
Logo: logo.svg
Background: page.svg (com efeito backdrop-filter: blur(10px))
Ícones Sociais: google.svg, microsoft.svg
Sidebar:
Logo Pequeno: logo02.png
Ícone de Ajuda: HELP.png
Ícone de Status: status.png
📐 Layout e Estilo
Login
Background: Imagem page.svg cobrindo a tela inteira com efeito de desfoque.
Card: Centralizado, com sombra (box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2)), bordas arredondadas (border-radius: 5px) e fundo aliceblue.
Botões: Estilo "pílula" ou arredondados, com sombras e efeitos de escala no hover.
Aplicação Principal (Layout Material UI)
Framework: React Admin com Material UI (MUI).
Tema Personalizado: Definido em src/assets/themes/themes.jsx.
Sidebar: Largura dinâmica (280px aberta, 80px fechada) com transição suave. Fundo #eff2f5.
AppBar: Cor de fundo dinâmica baseada na unidade/contexto.
Tabelas (Datagrid):
Cabeçalhos: Padding 10px, fonte normal (weight 400).
Células: Padding reduzido, borda inferior laranja suave (rgb(231, 189, 127)).
🧩 Componentes Customizados
Botões:
Cor laranja (rgba(255,102,0,1)).
Hover transforma para azul escuro (#043273) e aumenta a escala (1.1).
Sombra suave que aumenta no hover.
Inputs:
Borda cinza (#ccc), arredondados (5px), padding interno de 10px.