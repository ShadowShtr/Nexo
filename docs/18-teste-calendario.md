# Agenda de teste — 0.2.3

Abrir `http://127.0.0.1:5173/?demo=1#/owner/calendar`. Ativar “Dados de teste” se necessário. A agenda começa em 11/09/2026; existem seis viagens até 13/09/2026, três motoristas e quatro carros.

## Testar

1. Usar Data, setas e Dia/Semana/Mês/Agenda. Filtrar motorista e veículo. Cinza representa a margem simulada após cada serviço.
2. Clicar numa viagem para editar. O formulário abre acima da agenda. “Nova viagem de teste” permite adicionar outra.
3. Com Miguel/Classe E, testar 11/09 às 09:30–10:00: deve recusar sobreposição com TEST-001.
4. Testar 10:45–11:00: deve recusar margem insuficiente.
5. Testar 11:30–12:00: deve aceitar com regras iniciais. Há 60 minutos desde a primeira viagem e até à seguinte, mesmo com outro carro no serviço seguinte.
6. Alterar motorista mantendo Classe E às 09:30 continua a conflitar: o carro é partilhado. Alterar motorista E carro permite testar recursos independentes.
7. Em Regras da simulação, mudar deslocação para 90: margem efetiva passa a max(60,90+15)=105 minutos. Novas tentativas passam por essa regra.
8. Abrir uma viagem e “Cancelar viagem de teste”: deixa de bloquear e aumenta a contagem de canceladas. “Repor dados de teste” restaura as seis viagens, preservando os filtros e as regras escolhidas.

PT/EN e horas de Lisboa em todas as vistas. Datas inexistentes ou ambíguas na mudança de hora são recusadas. Um relógio de teste fixo em 10/09/2026 permite repetir estes exemplos mesmo noutras datas.

## Limites explícitos

Esta é uma sandbox em memória, sem gravação no Supabase e sem chamadas a outros sistemas. Navegar dentro da aplicação conserva as viagens da agenda enquanto o módulo permanece carregado; atualizar a página restaura o cenário. Outras abas usam um catálogo estático de exemplos e não refletem edições feitas nesta agenda. Não há pagamentos, mensagens, cálculo rodoviário ou reservas reais.

Reutiliza `checkSchedule` e `requiredGapMinutes`, mas não implementa ainda transações concorrentes, jornada de trabalho, associação motorista/carro, capacidade, preços, antecedência comercial ou autenticação. Todos os carros ficam selecionáveis nesta sandbox para testar conflitos de recurso partilhado. Parceiro vê apenas o motorista fictício Miguel e não tem controlos de edição; isto é uma pré-visualização, não autorização real.

As faixas cinzentas mostram margem hipotética aplicada uniformemente após cada evento; com filtros “Todos”, não significam indisponibilidade de toda a frota. O motor valida os vizinhos anteriores e seguintes do motorista e do carro escolhidos.

Cinco testes Playwright cobrem navegação/layout anterior, catálogos, pesquisa, idiomas, criação recusada/aceite, cancelamento e reposição. Testes executados com navegador no fuso America/New_York para verificar apresentação em Lisboa. Build e testes de domínio mantidos.

Referências: [FullCalendar eventClick](https://fullcalendar.io/docs/eventClick) e [Luxon 3.7.2](https://moment.github.io/luxon/api-docs/index.html).
