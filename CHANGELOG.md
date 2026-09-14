# Changelog

## 0.2.22 — 2026-09-14

- Gerador de slots do calendário por timezone IANA, jornada, antecedência e datas bloqueadas.
- Grelha de uma hora preserva a duração real do serviço e rejeita horários locais ambíguos ou inexistentes em DST.

## 0.2.21 — 2026-09-14

- Política server-side de cancelamento e reagendamento com token do cliente e concorrência por versão.
- 24 horas exatas devolvem o sinal elegível; motorista cancelante devolve o total pago; reagendamento cria cotação/proposta nova e preserva o original.

## 0.2.20 — 2026-09-14

- Ledger financeiro append-only para cobranças, reembolsos, fases e motorista beneficiário.
- Eventos de pagamento aceites apenas após verificação do webhook, com idempotência, moeda/valor esperado e limite de reembolso.

## 0.2.19 — 2026-09-14

- Máquina de estados server-side para ofertas, pagamento, alocação e execução da reserva.
- Aceite/recusa restritos ao motorista atribuído; confirmação exige pagamento sucedido e recurso garantido; execução exige saldo registado.
- `expectedVersion` impede alterações obsoletas e preserva estados terminais.

## 0.2.18 — 2026-09-14

- Contrato de comandos administrativo para motoristas, veículos e associações temporais.
- Autorização exclusiva do proprietário ativo, isolamento por organização, publicação server-side e rejeição de sobreposição por motorista ou veículo.
- Preparação server-side de cotações com rota obrigatória, snapshot de tarifa/versionamento e cálculo 25/75% sem confiar no total do navegador.
- Rodapé da aplicação atualizado para refletir a versão corrente.

## 0.2.17 — 2026-09-14

- Editor demo de pacotes bilingues com duração fixa de dois dias.
- Base, pessoa adicional e antecedência mínima de 48 horas por pacote.

## 0.2.16 — 2026-09-14

- CRM demo do proprietário com nome, email, telefone, NIF e notas internas.
- Pesquisa imediata e validação de NIF de nove dígitos.

## 0.2.15 — 2026-09-14

- Vista do motorista com serviços atribuídos, cliente, rota e Waze.
- Execução demo com transições confirmada, a caminho, no local, em viagem e concluída.

## 0.2.14 — 2026-09-14

- Aba de reservas demo permite marcação manual originada por WhatsApp/telefone.
- A marcação escolhe cliente, motorista, veículo, percurso e passageiros, calcula o orçamento e bloqueia conflitos de agenda.

## 0.2.13 — 2026-09-14

- Pedido demo permite reagendamento de uma hora dentro da janela de 24 horas.
- A nova hora passa novamente pelo motor de conflitos e preserva o registo original no histórico da sessão.

## 0.2.12 — 2026-09-14

- Simulador de preço local na aba Configurações para transfer e tour.
- Campos de base, distância, tarifa/km, noite, espera e divisão 25/75% reutilizam o motor de preços.

## 0.2.11 — 2026-09-14

- Fluxo de cliente testa consulta do código após criar um pedido.
- Consulta aceita espaços e letras minúsculas e mantém o estado do pedido encontrado.

## 0.2.10 — 2026-09-14

- Consulta de pedidos demo por código de confirmação normalizado.
- Validação estrita de referências impede caracteres inesperados e comprimentos inválidos.

## 0.2.9 — 2026-09-14

- Catálogo demo permite associação de vários motoristas ao mesmo veículo.
- A contagem de veículos associados acompanha as alterações no perfil do motorista.

## 0.2.8 — 2026-09-14

- Catálogo de teste para motoristas e veículos com cadastro, estado ativo/inativo e validação de capacidade.
- Contratos de catálogo bilingue e limites de lugares, bagagem, antecedência e suplemento.
- CAT-01/CAT-02 avançam para EM CURSO; mutações persistentes aguardam endpoint autenticado do proprietário.

## 0.2.7 — 2026-09-14

- Áreas internas protegidas por sessão Supabase, membership ativa e papel; modo de demonstração explicitamente separado.
- Login e conclusão de convite PT/EN, palavra-passe mínima e término de sessão local.
- Convite privado de parceiro no servidor, perfil em rascunho e compensação se o provisionamento falhar.
- 42 testes Node, 12 Auth/PostgREST/PostgreSQL, 10 Playwright e login visual real aprovados. BAS-04 e SEC-01 concluídas.

## 0.2.6 — 2026-09-14

- Schema operacional versionado para veículos, associações, cotações imutáveis, reservas, alocações exclusivas, idempotência e outbox.
- RLS e privilégios mínimos nas 12 tabelas públicas; dados internos e cotações sem leitura direta pelo motorista.
- Concorrência real rejeita a segunda alocação sobreposta; rollback transacional não deixa registos órfãos.
- Reset local repetido, 11 testes Auth/PostgREST/PostgreSQL, lint e advisors Supabase aprovados. BAS-03 concluída.

## 0.2.5 — 2026-09-14

- Mapa Leaflet no percurso e na revisão do cliente, com recolha, paragem, destino, distância, duração e fallback textual.
- Geometria fictícia claramente identificada; tiles OSM apenas na demonstração e atribuição visível.
- Link HTTPS oficial do Waze por coordenadas nos serviços do motorista.
- Oito testes de interface e dois testes de navegação; NAV-01 continua em curso até existir rota real e validação física.

## 0.2.4 — 2026-09-11

- Percurso de teste do cliente: motorista/carro, viagem, dados, orçamento, pedido, consulta e cancelamento.
- Validação de capacidade, antecedência e conflitos contra dados fictícios; preços pelo domínio existente.
- Sete testes de interface aprovados. Sem pagamento ou persistência real.


## 0.2.3 — 2026-09-11

- Dados fictícios opt-in para motoristas, carros, clientes, tours e viagens.
- Agenda de teste com filtros, criação/edição/cancelamento em memória, margem simulada e conflitos por motorista/veículo.
- Formulários PT/EN, horas de Lisboa, cenários reproduzíveis e testes de navegador. Sem escrita no Supabase.


## 0.2.2 — 2026-09-11

- Supabase local exclusivo premium-mobility, portas próprias e registo público desativado.
- Duas migrações de identidade/RLS, incluindo revogação anónima explícita para reconstrução reprodutível.
- Módulo de login e memberships; sete testes reais de Auth/PostgREST, isolamento e revogação.
- BAS-03/SEC-01 em curso. Interface ainda é pré-visualização; convites, login visual e schema operacional pendentes.


## 0.2.1 — 2026-09-11

### Adicionado
- Contratos de reserva preparada e UnitOfWork; adaptador PostgreSQL experimental em schema privado.
- Locks ordenados de motorista/veículo, idempotência, snapshots e gravação atómica de reserva/alocações/outbox.
- PostgreSQL local isolado e 11 testes reais de concorrência, rollback, expiração e restrições. BAS-02 concluída.
- Sem migrações remotas nem ligação de reservas reais à interface.


## 0.2.0 — 2026-09-11

### Adicionado
- Base local React/Vite, TypeScript, versões exatas e lockfile; workflow de CI preparado.
- Navegação de pré-visualização PT/EN para proprietário, motorista e cliente; estilos das referências e componentes partilhados.
- FullCalendar Standard 6.1.21 com Lisboa/Luxon, vistas dia/semana/mês/lista, exemplo opt-in e detalhe acessível.
- Simulador de tours ligado ao domínio e formulário validado de margem, sem guardar nem alterar regras.
- Testes Playwright e estados vazios explícitos; sem API, login ou pagamentos reais. BAS-04/UI-02 em curso.

## 0.1.3 — 2026-09-11

### Adicionado
- Pesquisa de bibliotecas no GitHub, comparação de calendários e distinção entre componentes gratuitos e módulos Premium.
- Seleção documental de componentes reutilizáveis por aba, fontes, limites e critérios de integração.
- BAS-05 concluída para pesquisa; BAS-04, UI-02 e CAL-04 orientadas para reutilização. Nenhuma dependência instalada ou funcionalidade operacional declarada.

## 0.1.2 — 2026-09-09

### Adicionado
- Sistema visual baseado nas cinco referências enviadas, com cores, tipografia, medidas, componentes e aplicação por aba.
- Tokens CSS independentes de framework e referências originais no projeto.
- Tarefas UI-01/02/03: especificação concluída, componentes e QA planeados; instruções visuais ligadas às tarefas existentes.
- Nenhuma tela foi implementada nesta etapa; sem mudança de hospedagem ou regras de negócio.

## 0.1.1 — 2026-09-09

### Atualizado
- Aprovados aceite antes do sinal, prazos 30+30 min, margem max(60, deslocação+15), antecedência normal 2h e tours 48h.
- Aprovados substituição ou reembolso integral quando motorista cancela, reprecificação de reagendamento e X fixo por serviço aceite pelo parceiro.
- Registados Supabase e preferência Vercel, com estudo de custos e limitações comerciais.
- Adicionados defaults aprovados e regra testável de antecedência. Sem mudança de hospedagem ou criação de recursos externos.

## 0.1.0 — 2026-09-09

### Adicionado
- Fundação documental e tarefas por aba, com estados explícitos e dependências.
- Regras puras de orçamento, tours com duas pessoas incluídas, espera, sinal, política de 24h, agenda, estados e acertos.
- Testes das fronteiras de negócio e exemplo executável.

### Limites
- Sem aplicação web, persistência, integrações reais ou deployment.
- Aprovação antes de pagamento, prazos de aceitação/pagamento e composição da margem de agenda são hipóteses identificadas para validação.
- Cobrança direta por motorista depende de seleção e validação de um prestador de pagamentos.



