# 15 — Base web 0.2.0

Data: 11/09/2026. Primeira interface executável, local e sem dados operacionais. Usa React/Vite, FullCalendar Standard 6.1.21, i18next, React Hook Form, Zod e componentes visuais partilhados. Não é uma versão pronta para receber clientes.

## Executar

Na raiz do projeto: `npm ci`, depois `npm run dev`. Abrir http://127.0.0.1:5173. Para verificar: `npm run build`, `npm run check`, `npm run test:ui`. Os testes de browser usam Microsoft Edge instalado; em CI é instalado Chromium com o canal msedge. O servidor só escuta localhost. Nenhum alojamento foi criado.

## O que pode ser experimentado

- Menu lateral desktop e barra inferior móvel; Mais dá acesso às restantes abas.
- Áreas de proprietário, motorista e cliente, com rotas partilháveis no fragmento da URL e histórico do browser. O seletor superior escolhe uma pré-visualização: não é autenticação nem controlo de acesso.
- Idioma PT/EN, guardado no parâmetro lang da URL. Textos, data, números e moeda usam o idioma escolhido. O idioma não converte EUR nem altera o instante de uma viagem.
- Agenda dia/semana/mês/lista. Inicialmente vazia, com exemplo visual apenas depois de marcar Mostrar exemplo. Exemplos fixos em 11/09/2026; ao ativar o exemplo a agenda navega para essa data.
- FullCalendar recebe instantes com offset e apresenta Europe/Lisbon com o plugin Luxon. Os exemplos são só visuais: não constituem disponibilidade nem são escritos em base de dados. Arrastar está desligado até existir validação no servidor.
- Detalhes de evento em diálogo nativo com Escape e devolução de foco.
- Pacotes: simulador de 1–6 passageiros com preço fictício de 200 EUR até duas pessoas, mais 35 EUR por adicional. Usa a função quote do domínio, incluindo sinal e saldo sem duplicação de fórmulas financeiras.
- Configurações: formulário validado para experimentar margem mínima, tolerância e deslocação. Calcula max(mínimo, deslocação+tolerância). Não guarda configurações; recarregar repõe os valores aprovados de exemplo.
- Outras abas: cabeçalhos, estrutura, pesquisa vazia e estados sem dados. Financeiro apresenta travessões, não saldos zero inventados.

## Organização do código

| Caminho | Responsabilidade |
|---|---|
| src/domain | Regras puras já existentes; sem dependências React. |
| src/web/main.tsx | Arranque React e estilos. |
| src/web/App.tsx | Composição do shell e pré-visualizações vazias. Dividir cada aba num módulo próprio ao implementar dados reais. |
| src/web/navigation.ts | Destinos por área e interpretação das rotas da pré-visualização. |
| src/web/i18n.ts | Catálogos PT/EN com chaves verificadas por TypeScript. |
| src/web/pages | Calendário carregado apenas quando necessário e simuladores locais. |
| src/ui/components | Botão, cabeçalho, secção, linhas, atalhos e estado vazio reutilizáveis. |
| src/ui/styles/tokens.css | Fonte, cores, raios, espaçamentos e sombras aprovados. |
| src/web/styles.css | Composição responsiva e adaptação visual do calendário. |
| tests/browser | Testes de navegação, dimensões, idioma, simuladores e calendário. |

O botão adapta o padrão Radix Slot/CVA do shadcn/ui a CSS próprio, preservando os tokens. Não foi importado um template completo nem instalado Tailwind. Ver inventário e avisos em THIRD_PARTY_NOTICES.txt. DayPicker, TanStack Table, Leaflet, Recharts e React Email continuam selecionados para etapas futuras; não são necessários para as listas ainda vazias.

## Limites e sequência

BAS-04 e UI-02 estão EM CURSO: scaffold e primeiras primitivas prontos, mas persistência, segurança, CI executada remotamente e catálogo completo de estados ainda faltam. CAL-04 continua PLANEADA; a prova visual não satisfaz os critérios de agenda operacional.

Este incremento antecipa apenas a prova visual de BAS-04 a pedido do utilizador. Não contorna BAS-02/BAS-03: uma reserva real continua bloqueada até existir transação de motorista/veículo, autenticação e regras no servidor. Não há credenciais, chamadas Supabase, dados pessoais, localStorage, pagamentos ou envio de mensagens.

Próximo incremento funcional: contratos de persistência e prova transacional BAS-02/BAS-03, depois identidade/autorizações. A UI recebe os adaptadores e casos de uso definidos nessa etapa; não passa a gravar reservas diretamente pelo calendário. Não publicar este seletor de pré-visualizações como login de produção.

## Compatibilidade e validação

FullCalendar foi fixado na linha 6.1.21, sem plugins Premium. A documentação de referência da pesquisa já apresenta v7; os imports desta base seguem os pacotes/README da versão instalada. Uma migração para v7 exige tarefa própria e revisão de timezone/estilos.

Build inclui verificação TypeScript de domínio, exemplos, testes e UI. Testes de browser usam fuso America/New_York para verificar que o exemplo continua às 09:00 em Lisboa. A troca de hora com entradas do utilizador e conflitos transacionais continua pendente em CAL-01/02/03.

Capturas locais regeneráveis em artifacts: início desktop/mobile, configurações mobile e calendário mobile. A pasta é ignorada no Git. Comparação visual realizada sobre essas quatro capturas. A varredura automática de navegação e largura não substitui revisão completa de acessibilidade, zoom 200%, Safari e Android.
