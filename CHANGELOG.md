# Changelog

## 0.2.54 — 2026-09-15

- removida a entrada duplicada “Marcar viagem” do menu inferior do cliente; o planeador continua disponível na primeira etapa.

## 0.2.53 — 2026-09-15

- adicionados ícones contextuais aos botões de ação nos fluxos de cliente, proprietário, motorista, catálogo, agenda e autenticação;
- adicionadas ilustrações 3D de motorista e viatura à seleção do serviço;
- uniformizados o espaçamento e o alinhamento dos ícones em botões e cartões de seleção.

## 0.2.52 — 2026-09-15

- PUB-01: a etapa de motorista e carro agora recebe a rota escolhida no planeador, incluindo origem, paragens, destino, distância e duração.
- PUB-01: o mapa da seleção e da revisão usa o mesmo percurso entregue pelo cliente; a rota antiga só aparece quando a marcação é aberta diretamente.
- 87 testes Node, 29 testes de navegador, build e validação documental aprovados.

## 0.2.51 — 2026-09-15

- PUB-01: cada paragem passou a ter controlos de subir e descer, com limites desativados nas extremidades; o destino mantém-se sempre no fim.
- PUB-01: ao mover uma paragem, o mapa, a lista numerada e o cálculo passam a usar imediatamente a nova sequência.
- 87 testes Node, 29 testes de navegador, build e validação documental aprovados.

## 0.2.50 — 2026-09-15

- PUB-01: campos de rota agora exibem a ordem real da viagem: partida, paragens e destino.
- PUB-01: o mapa e a lista numerada mantêm a mesma sequência usada no cálculo do percurso.
- 87 testes Node, 28 testes de navegador, build e validação documental aprovados.

## 0.2.49 — 2026-09-15

- UI-03: a lista de locais recentes no planeador foi limitada às três entradas mais recentes para reduzir a rolagem.
- PUB-01: endereços adicionais continuam acessíveis pela pesquisa e pelas sugestões filtradas do campo.
- 87 testes Node, 28 testes de navegador, build e validação documental aprovados.

## 0.2.48 — 2026-09-15

- UI-03: a descoberta ganhou um destaque visual do Porto com seis paragens pré-selecionadas e rota editável no planeador.
- UI-03: o título dos cartões recebeu maior respiro vertical e a lista de destaques mantém distância consistente entre fotografias.
- 87 testes Node, 28 testes de navegador, build e validação documental aprovados.

## 0.2.47 — 2026-09-15

- UI-03: primeira tela do cliente ganhou seis cartões de tour, incluindo Porto e um segundo percurso personalizável.
- UI-03: grelha responsiva, espaçamento interno e hierarquia tipográfica foram ajustados para manter os títulos e descrições legíveis em ecrãs estreitos.
- 87 testes Node, 27 testes de navegador, build e validação documental aprovados.

## 0.2.46 — 2026-09-15

- PUB-01: lotes e números de porta ficam distintos; `Rua Pedro de Sintra, lote 86` sugere `Rua Pedro de Sintra, Lote 86`.
- PUB-01: Geoapify pode ser configurado como autocomplete principal e Photon funciona como fallback de desenvolvimento com idioma suportado; o Nominatim público deixou de ser usado para autocomplete.
- PUB-01: quando a fonte só conhece a rua, o lote digitado é preservado com aviso de ponto aproximado, sem afirmar uma porta exata nem inventar listas de unidades.
- 87 testes Node, 26 testes de navegador, build e validação documental aprovados.

## 0.2.45 — 2026-09-14

- PUB-01: ao escrever `lote` ou `n.º` sem valor, a morada mostra a lista de números conhecidos do arruamento.
- PUB-01: números fora da lista não são inventados; resultados remotos são filtrados pela rua pesquisada.
- 85 testes de domínio, 26 testes de navegador, build e validação documental aprovados.

## 0.2.44 — 2026-09-14

- PUB-01: sugestões locais toleram pequenos erros de escrita, como `sinta` → `Sintra`, sem perder o número do lote.
- PUB-01: `lote 84` passa a sugerir a rua correspondente do catálogo em vez de listar ruas homónimas de outras localidades.
- 85 testes de domínio, 25 testes de navegador, build e validação documental aprovados.

## 0.2.43 — 2026-09-14

- PUB-01: resultados de morada priorizam a rua correspondente e deixam de exibir números próximos sem relação quando existe correspondência local.
- PUB-01: o mapa Leaflet mantém a instância e atualiza apenas geometria e marcadores, evitando piscar a cada letra digitada.
- 12 testes de cliente, 85 testes de domínio, build e validação documental aprovados.

## 0.2.42 — 2026-09-14

- PUB-01: lotes e números reconhecem `lt`, `lote`, `n`, `n.º` e `numero`; o resultado selecionado usa o número confirmado na consulta.
- PUB-01: consultas corridas sem espaços são separadas para pesquisa de ruas e marcadores de porta, mantendo uma sugestão baseada no mapa.
- 23 testes de navegador, 85 testes de domínio, build e validação documental aprovados.

## 0.2.41 — 2026-09-14

- PUB-01: números de porta escritos como `n 40`, `n.º 40` ou `numero 40` são preservados nas sugestões e na morada selecionada.
- PUB-01: a consulta mantém números que fazem parte do nome da rua e valida a pesquisa com localidade e porta.
- 23 testes de navegador, 85 testes de domínio, build e validação documental aprovados.

## 0.2.40 — 2026-09-14

- PUB-01: pesquisas longas de rua deixam de falhar quando o utilizador acrescenta a localidade; são tentadas variantes da frase e os resultados são ordenados pela correspondência com todos os termos.
- PUB-01: cada pedido de geocoding tem timeout curto e fallback para Photon, mantendo a pesquisa utilizável quando o Nominatim está lento ou limitado.
- 23 testes de navegador, 85 testes de domínio, build e validação documental aprovados.

## 0.2.39 — 2026-09-14

- PUB-01: catálogo de sugestões ampliado com pontos turísticos de Sintra/Lisboa, centros comerciais, estações, aeroporto e moradas de teste.
- PUB-01: pesquisa por palavras funciona em origem, destino e paragens; quando não há correspondência local, a morada é procurada por geocoding em tempo real e as coordenadas ficam ligadas à rota.
- 22 testes de navegador, 85 testes de domínio, build e validação documental aprovados.

## 0.2.38 — 2026-09-14

- PUB-01: origem, destino e todas as paragens usam a mesma pesquisa inline com sugestões selecionáveis e correspondência por palavras.
- PUB-01: acrescentado o local de teste Vasco da Gama Shopping, incluindo alias “shopping vasco” e coordenadas para o cálculo da rota.
- 20 testes de navegador, build e validação documental aprovados.

## 0.2.37 — 2026-09-14

- PUB-01: a pesquisa genérica passa a cotar como transfer; o tour só é usado quando o cliente escolhe uma opção de tour.
- PUB-01: a cotação de transfer usa base de 10,00 € + 2,00 €/km e divide o valor em sinal de 25% e saldo de 75%, sem reutilizar o preço fixo do tour.
- PUB-01: o botão “+” adiciona paragens editáveis no próprio cartão; a distância soma cada trecho e os locais recentes desaparecem depois de escolher o destino.
- 20 testes de navegador, build e validação documental aprovados.

## 0.2.36 — 2026-09-14

- PUB-01: o ponto de Avenida Cabo da Boa Esperança L65 passa a usar a coordenada geográfica do arruamento em Carregado (CP 2580-469), com o mapa a enquadrar sempre os dois pontos da rota.
- 19 testes de navegador, build e validação documental aprovados.

## 0.2.35 — 2026-09-14

- PUB-01: o catálogo de sugestões inclui moradas completas do percurso Carregado, como Avenida Cabo da Boa Esperança L65 e Estação Carregado.
- PUB-01: a pesquisa parcial filtra e apresenta a morada correspondente no próprio painel, mantendo o mapa e a cotação ligados à opção escolhida.
- 19 testes de navegador, build e validação documental aprovados.

## 0.2.34 — 2026-09-14

- PUB-01: sugestões de morada agora aparecem visivelmente enquanto o cliente digita, com correspondência por nome e endereço e seleção direta para atualizar o mapa.
- UI-02: o campo de destino mantém uma lista acessível de opções e explica quando o endereço ainda não foi reconhecido.
- 18 testes de navegador, build e validação documental aprovados.

## 0.2.33 — 2026-09-14

- PUB-01/NAV-01: o mapa do planeador passa a usar o destino reconhecido, incluindo Carregado, em vez de reutilizar a geometria fixa de Sintra.
- PUB-01: destinos não reconhecidos mantêm o mapa no ponto de partida e pedem uma sugestão válida, evitando mostrar uma rota sem relação com o endereço digitado.
- 18 testes de navegador, build e validação documental aprovados.

## 0.2.32 — 2026-09-14

- PUB-01: o planeador inline passa a mostrar o mapa imediatamente ao abrir a pesquisa, centrado no ponto de partida; ao escolher o destino, a mesma pré-visualização transforma-se na rota calculada.
- UI-02: o painel mantém campos, mapa e ação principal na mesma área e remove a navegação inferior durante o planeamento para preservar o botão de cálculo.
- 17 testes de navegador, build e validação documental aprovados.

## 0.2.31 — 2026-09-14

- PUB-01: a pesquisa da descoberta deixou de trocar imediatamente de aba; agora abre um planeador inline com origem sugerida, localização atual, locais recentes e destino editável.
- PUB-01/02: o cliente pode calcular na mesma tela o mapa do tour, distância de 62 km, duração prevista, preço de 200,00 €, sinal de 25% e depois avançar para escolher motorista e carro.
- 17 testes de navegador, build e validação documental aprovados.

## 0.2.30 — 2026-09-14

- UI-02/PUB-01: descoberta do cliente redesenhada no padrão Glovo indicado: barra “Para onde?”, seletor “Mais tarde”, categorias de tours em quadrados e navegação inferior Início/Próximas viagens/Conta.
- TOUR-02: destaque Lisboa → Sintra com imagem local, duração de dois dias e chamada para abrir o fluxo de reserva; o asset pode ser substituído pelos 3D finais.
- 16 testes de navegador, build e validação documental aprovados.

## 0.2.29 — 2026-09-14

- PUB-01/02: fluxo do cliente começa pela origem/destino, sugere localização atual com fallback editável, apresenta mapa, distância e duração e permite escolher serviço, data, passageiros e espera.
- PUB-02: seleção de motorista e carro passa a ocorrer depois da rota; capacidade, NIF, contacto, revisão, sinal de 25% e saldo de 75% ficam visíveis antes do pedido. As duas tarefas passam a EM CURSO enquanto persistência, deep links e integrações reais são preparados.
- Consulta, cancelamento e reagendamento continuam ligados ao código de confirmação; o pedido fica a aguardar aceitação do motorista antes de qualquer pagamento.
- Build, validação documental e 15 testes de navegador aprovados.

## 0.2.28 — 2026-09-14

- CAL-04/UI-02: agenda com painéis de vidro, filtros alinhados, tipografia e separação revista, vistas segmentadas e eventos legíveis.
- PUB-01/02: novo fluxo de entrada por destino documentado, ainda não implementado.
- Build e 15 testes de navegador aprovados.

## 0.2.27 — 2026-09-14

- Cartões selecionáveis, badges de estado, textareas e associações de catálogo uniformizados com os tokens visuais.

## 0.2.26 — 2026-09-14

- Ajustes visuais responsivos para o calendário no telemóvel: controlos separados, botões legíveis e lista sem truncamento.
- Indicador visual do passo no fluxo do cliente, rótulos de formulário mais claros e rodapé alinhado com a versão publicada.

## 0.2.25 — 2026-09-14

- Documentação do motorista atualizada com as guardas server-side de execução e saldo.

## 0.2.24 — 2026-09-14

- Adaptador de rota rodoviária OSRM configurável no servidor para distância e duração reais.
- HTTPS obrigatório para provedores remotos, timeout, coordenadas ordenadas e falha explícita sem estimativa fictícia.

## 0.2.23 — 2026-09-14

- Migração Supabase local para janelas/exceções do calendário, eventos de pagamento e propostas de alteração.
- RLS e grants mínimos aplicados às quatro tabelas; testes locais cobrem chaves de tenant, inserção válida e ausência de acesso anónimo.

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



