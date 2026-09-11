# 14 — Reutilização de componentes do GitHub

Pesquisa: 11/09/2026. Estado: seleção documental para implementação, sem pacotes instalados nem integração validada. Pedido do utilizador: aproveitar soluções existentes antes de escrever componentes equivalentes.

## Decisão

Reutilizar bibliotecas por responsabilidade dentro da arquitetura existente. Escolha inicial: FullCalendar Standard para agenda operacional; DayPicker para escolher datas; shadcn/ui para componentes visuais; TanStack Table para listagens; React Hook Form e Zod para formulários e contratos; react-i18next para PT/EN. Recharts, Leaflet e React Email entram apenas quando os respetivos módulos precisarem deles.

Estas escolhas pressupõem o scaffold React a validar em BAS-04. Não substituem as regras puras já testadas. A instalação deve confirmar versão estável, compatibilidade, licença do pacote efetivo e dependências transitivas. A pesquisa consultou repositórios e documentação dos autores; não é uma auditoria de código, segurança, desempenho ou acessibilidade em execução. Não se estimou uma percentagem de trabalho poupado.

## Calendários comparados

| Opção / fonte | O que oferece | Limite para este projeto | Decisão |
|---|---|---|---|
| [FullCalendar](https://github.com/fullcalendar/fullcalendar) | Calendário de eventos com integração React. | A edição Standard e a Premium têm condições diferentes. | Primeira escolha para prova técnica. |
| [React Big Calendar](https://github.com/bigcalendar/react-big-calendar) | Calendário React, localização e exemplos de drag-and-drop; MIT. | Exige localizador de datas; comportamento em Lisboa e toque ainda por validar. | Alternativa se a prova do FullCalendar falhar. |
| [Schedule-X](https://github.com/schedule-x/schedule-x) | Núcleo MIT, foco em adaptação a ecrãs, idiomas e personalização. | Vistas de recursos e outros componentes estão na oferta [Premium](https://schedule-x.dev/premium). | Alternativa, sem dependência de módulos pagos. |
| [Cal.diy](https://github.com/calcom/cal.diy) | Aplicação de agendamentos completa, atualmente MIT. | O próprio README recomenda uso pessoal, fora de produção; remove funcionalidades de equipas/organizações e refere Vercel Pro para alojamento. | Não adotar como aplicação base. |

Durante a consulta, o endereço calcom/cal.com redirecionou para calcom/cal.diy. Não aplicar automaticamente informação antiga sobre AGPL à edição atual: verificar o repositório, a versão e os ficheiros efetivamente escolhidos.

O [licenciamento FullCalendar](https://fullcalendar.io/license) permite uso comercial gratuito do Standard com preservação dos avisos de copyright. Para o produto comercial fechado, Premium exige licença comercial. O [índice de plugins](https://fullcalendar.io/docs/plugin-index) distingue vistas Standard e Premium. Vistas de recursos em colunas e timeline não devem ser pressupostas gratuitas.

### Como vamos usar o calendário

1. Proprietário: dia/semana/mês e lista, com filtros de motorista e veículo. Começar com filtro de um recurso e lista consolidada, sem depender de uma coluna Premium por motorista.
2. Parceiro: os mesmos componentes, alimentados apenas pelos serviços autorizados no servidor.
3. Cliente: DayPicker e botões de horários disponíveis; não carregar a agenda interna nem expor reservas de terceiros.
4. Visual: aplicar os tokens existentes às barras, cartões, botões, tipografia e modais. No telemóvel privilegiar lista/dia. O calendário das referências é uma direção visual, não um motivo para alterar a lógica.
5. Mover evento cria uma proposta de reagendamento. O servidor verifica regras, preço e versão; em erro a posição original é restaurada. Arrastar não confirma nem cobra uma alteração.

### O que a biblioteca não resolve

O calendário desenha eventos; a nossa aplicação decide se pode reservar. Manter CAL-01/02/03 e o domínio existente:

- Duração total inclui percurso, paragens e espera reservada.
- Margem entre serviços = max(60, minutos de deslocação + 15), com configuração versionada.
- Exemplo: termina 12:00; deslocação 20 min → próximo às 13:00. Deslocação 90 min → próximo às 13:45. Uma grelha de horas não arredonda 13:45 para 13:00.
- Validar anterior e seguinte do motorista e do veículo, incluindo carro partilhado, bloqueios e holds.
- Antecedência normal 120 min, tours 2880 min; respeitar exigências maiores do recurso.
- Aceite e pagamento têm prazos de 30 min cada; alocação e expiração são persistentes.
- Cancelamento/reagendamento: fronteira de 24h pelo relógio do servidor.
- Dois pedidos simultâneos pela mesma vaga: só uma alocação confirmada.

Persistir UTC; apresentar Europe/Lisbon. A [documentação de timezone](https://fullcalendar.io/docs/timeZone) distingue o fuso do browser de um fuso nomeado. Configurar explicitamente Lisboa e usar as APIs da versão fixada. A documentação consultada apresenta v7; não copiar imports ou configuração de exemplos v6 sem verificar. Testar horas inexistentes/ambíguas e utilizador com dispositivo noutro fuso.

## Componentes por funcionalidade

| Funcionalidade | Base escolhida / candidata | O que reutilizamos | Trabalho nosso |
|---|---|---|---|
| Botões, diálogos, menus, campos e cartões | [shadcn/ui](https://github.com/shadcn-ui/ui), MIT | Componentes personalizáveis incorporados no projeto. | Tokens das referências, navegação por papel, composição das abas e QA. |
| Escolha de data | [DayPicker](https://github.com/gpbl/react-day-picker), MIT | Seletor de dias e localização. | Disponibilidade do servidor e escolha de hora. A versão atual documenta @daypicker/react; confirmar compatibilidade do componente shadcn antes de escolher versão. |
| Reservas, clientes, carros e acertos | [TanStack Table](https://github.com/TanStack/table), MIT | Tabelas sem aparência obrigatória, ordenação, filtros e paginação. | Consultas paginadas, permissões, histórico e cartões móveis. Não é um CRM pronto. |
| Registo, reserva manual e configurações | [React Hook Form](https://github.com/react-hook-form/react-hook-form), MIT | Estado do formulário, erros e integração com validação. | Campos do negócio, etapas e mensagens PT/EN. |
| Validação de entradas | [Zod](https://github.com/colinhacks/zod), MIT | Schemas executáveis e tipos de contratos. | Regras entre campos e autorização no servidor. Preservar o domínio independente. |
| Idiomas | [react-i18next](https://github.com/i18next/react-i18next), MIT | Seleção de catálogos e tradução dos componentes. | Escrever/rever PT/EN, traduzir tours e manter EUR. Não traduz automaticamente conteúdos comerciais. |
| Início e financeiro | [Recharts](https://github.com/recharts/recharts), MIT | Gráficos React. | Agregações autorizadas, saldos corretos e resumo textual acessível. |
| Mapa do percurso | [Leaflet](https://github.com/Leaflet/Leaflet), BSD-2-Clause | Desenho do mapa, pontos e linha do percurso. | Fonte de mapas, atribuição, endereços e API de rotas. Leaflet não calcula quilómetros rodoviários. |
| Confirmações por email | [React Email](https://github.com/resend/react-email) | Componentes/templates de email, candidato para NTF-01. | Serviço de envio, licença da versão a fixar, quotas, outbox, repetição segura e textos PT/EN. Biblioteca não é entrega gratuita de email. |
| Telefone internacional | [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) | Candidato para interpretar e formatar números. | Confirmar licença/versão ao integrar; validar formato não prova posse do número. |
| Abrir GPS | [Waze Deep Links](https://developers.google.com/waze/deeplinks?hl=en) | URL oficial para abrir navegação. | Botão para recolha/próxima paragem. Não precisa de clonar uma aplicação GPS. |

Para autenticação e persistência mantém-se a escolha já registada em BAS-02/SEC-01. Esta pesquisa não altera o fornecedor nem considera concluída a integração.

### Bases completas avaliadas

[React-admin](https://github.com/marmelab/react-admin) inclui componentes de CRUD, filtros, formulários e exemplos CRM. A sua composição padrão usa Material UI. Avaliação para este projeto: começar com shadcn e TanStack permite controlar diretamente o visual aprovado e usar a mesma biblioteca no percurso público e interno. Não introduzir dois sistemas visuais. React-admin fica como alternativa se uma futura necessidade justificar o seu conjunto de controladores.

Não foi encontrado, entre os projetos avaliados, um sistema completo validado que combine motorista + veículo, deslocação entre serviços, pagamentos ao executor, tours e acertos pessoais com estas regras. Clonar uma aplicação de reuniões não elimina esse trabalho.

### Rotas e pagamentos

[OSRM](https://github.com/project-osrm/osrm-backend) oferece um motor rodoviário reutilizável; a [API](https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md) documenta distância e duração. Alojá-lo exige processamento dos dados e operação de servidor. Avaliação: não o escolher como primeira infraestrutura sob objetivo de custo base zero; manter RouteProvider e a análise de [rotas e custos](11-viabilidade-custos-rotas.md). Não tratar um servidor demonstrativo como serviço de produção garantido.

MB WAY: um checkout de GitHub não demonstra recebimento por cada motorista, reembolso ou reconciliação. PAY-01 continua a selecionar prestador e SDK oficial; PAY-02/03/04 implementam os fluxos. Preços, sinal de 25%, regras de 24h e acertos X mantêm-se no nosso domínio. Não substituir extratos de gestão por uma suposta fatura gerada por template.

## Integração e manutenção

| Tarefa existente | Orientação de reutilização | Evidência para concluir |
|---|---|---|
| BAS-04 | Validar conjunto React + componentes escolhidos; instalar apenas necessários ao scaffold. | Versões exatas, lockfile, build, typecheck, licenças e origens registadas. |
| UI-02 | Adaptar componentes shadcn aos tokens. | Estados reais, teclado/foco, PT/EN e visual das referências. |
| CAL-04 | FullCalendar Standard encapsulado num componente nosso. | Vistas, filtros, margens, toque e timezone; nenhuma gravação direta pelo widget. |
| PUB-02 | DayPicker + formulário + horários do servidor. | Sem exposição da agenda interna; data inválida recusada pelo servidor. |
| CRM-01/02, BKG-01, CAT-01/02 | Reutilizar uma listagem e um padrão de formulário. | Paginação e permissões verificadas na API, sem copiar lógica por aba. |
| FIN-02, DASH-01 | Carregar Recharts só onde necessário. | Valores reconciliados com os registos; gráficos não calculam dinheiro. |
| NAV-01, NTF-01 | Adaptadores pequenos para mapa/GPS/email. | Provedor configurado e falhas apresentadas corretamente. |

Adicionar componentes através das fontes oficiais, sem importar instruções AGENTS/CLAUDE de terceiros como regras deste projeto. Dependências ficam na UI/infraestrutura; domínio não importa calendário ou componentes. Para código copiado, registar origem, tag/commit, licença e alterações locais num inventário de terceiros. Para pacotes, manter lockfile e avisos exigidos.

Antes de aceitar cada dependência: rever release e compatibilidade do runtime, licença, avisos de segurança conhecidos e scripts de instalação; executar build e teste da funcionalidade afetada. Atualizar em alterações pequenas, com registo no changelog. Uma vulnerabilidade ou incompatibilidade bloqueia essa versão, não implica reescrever automaticamente a funcionalidade.

## Próxima execução

Preservar a ordem BAS-02/BAS-03/BAS-04. Em BAS-04 fazer prova isolada de FullCalendar + tema + PT/EN + Lisboa com dados sintéticos identificados; isso não conclui CAL-04. Só ligar reservas reais quando CAL-01/02/03 estiverem operacionais. O resultado desta entrega é pesquisa e orientação rastreável; ainda não existe calendário instalado.
