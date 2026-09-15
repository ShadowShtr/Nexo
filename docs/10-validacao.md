# 10 — Evidência da versão 0.1.0

Data: 2026-09-09. Ambiente local Windows; Node.js v24.16.0. Dados de testes fictícios. Não foram feitos pagamentos, notificações externas nem publicação.

## Incremento 0.2.71 — 15/09/2026

O planeador apresenta as 24 horas publicadas pelo proprietário e retira os intervalos já ocupados, incluindo uma margem de 60 minutos após cada serviço. A criação, o reagendamento e o cancelamento de pedidos atualizam a agenda da sessão.

## Incremento 0.2.70 — 15/09/2026

O CTA “Ver rota e preço” usa agora o asset de rota da marca (`/route-landmark.png`), mantendo sombra e proporção dos ícones 3D do fluxo do cliente.

## Incremento 0.2.69 — 15/09/2026

A página de consulta não mostra mais o CTA duplicado “Marcar viagem”; o fluxo continua acessível pela área principal Descobrir.

## Incremento 0.2.68 — 15/09/2026

Os cartões de pré-visualização da rota e do pedido de teste têm agora separação vertical de 1,25rem, preservando a leitura no telemóvel.

## Incremento 0.2.67 — 15/09/2026

A confirmação do pedido foi reorganizada em blocos com espaçamento, ações responsivas e instruções de pagamento demonstrativas por MB WAY e WhatsApp. Os pins de localização do planeador foram reduzidos para 32px. Não existe cobrança real.

## Incremento 0.2.66 — 15/09/2026

O fluxo do cliente usa os assets 3D de localização, relógio, calendário e carro com sombra. Os banners aplicam o recorte de imagem apenas à foto principal, mantendo os ícones internos no tamanho correto.

## Incremento 0.2.65 — 15/09/2026

Após calcular o percurso, o planeador mostra dias e horários disponíveis em uma lista compacta. A escolha é guardada no handoff e aparece na data/hora de recolha da etapa seguinte.

## Incremento 0.2.64 — 15/09/2026

O conteúdo descritivo dos banners de Lisboa–Sintra e Porto foi deslocado para a zona escura inferior do gradiente, com o botão mantido dentro do cartão.

## Incremento 0.2.63 — 15/09/2026

Ícones, títulos e descrições dos cartões iniciais ficam alinhados ao centro. Os ícones foram aumentados ligeiramente sem alterar a grelha de três colunas em telemóvel.

## Incremento 0.2.62 — 15/09/2026

Os ícones dos cartões foram centralizados e aumentados ligeiramente. O botão “Para onde?” recebeu texto e lupa em cinza mais discreto, preservando contraste e foco visível.

## Incremento 0.2.61 — 15/09/2026

Em telemóvel, a grelha de descoberta mostra três cartões por linha. O tamanho dos cartões, textos e ilustrações foi reduzido para eliminar espaço vazio e aproximar a referência visual da Bolt.

## Incremento 0.2.60 — 15/09/2026

Os cartões iniciais usam seis ilustrações 3D diferentes, com ícones reduzidos para cerca de 40–42 px em ecrãs móveis, mantendo fundo transparente e sombra discreta.

## Incremento 0.2.59 — 15/09/2026

Os seis cartões iniciais de tour usam agora as ilustrações 3D da aplicação, com a bússola enviada nos cartões personalizáveis. As imagens mantêm fundo transparente, escala contida e sombra discreta.

## Incremento 0.2.58 — 15/09/2026

Durante o fluxo de marcação do cliente, “Descobrir” permanece identificado como a área principal no menu inferior; “Marcar viagem” não é apresentado como separador.

## Incremento 0.2.57 — 15/09/2026

Os ícones dos cartões de tour passaram a usar apenas o traço cinza, sem fundo branco, com uma sombra suave para manter a leitura sobre o cartão cinza.

## Incremento 0.2.56 — 15/09/2026

A miniatura da viatura ficou ligeiramente maior e recebeu uma sombra suave no contorno, mantendo o fundo transparente sobre o campo branco.

## Incremento 0.2.55 — 15/09/2026

A seleção de motorista e carro passou a mostrar uma miniatura da viatura junto de “Carro disponível”, sem o painel grande separado, e os nomes dos motoristas deixaram de ter o ícone de pessoa. A verificação inclui a presença da miniatura e a ausência dos ícones nos nomes.

## Incremento 0.2.54 — 15/09/2026

A entrada duplicada “Marcar viagem” foi removida do menu inferior da área de cliente. A página de marcação permanece acessível pelo fluxo principal. A verificação inclui teste de navegação móvel.

## Incremento 0.2.53 — 15/09/2026

Ícones contextuais foram aplicados aos botões de ação e as ilustrações 3D de motorista e viatura foram integradas na seleção do serviço. Build, testes e verificação visual foram executados após a alteração.

## Verificações

- `node --test tests/*.test.ts`: suíte de regras puras, incluindo preços, 10.000 splits monetários, espera, limite exato de 24h, instantes com offset, conflitos de recursos e margem de 60 min, expiração e acertos.
- `node examples/booking.ts`: tour para quatro pessoas; total 270 EUR, sinal 67,50 EUR, saldo 202,50 EUR.
- `node scripts/check-docs.mjs`: links locais, IDs únicos, campos mínimos das tarefas, dependências existentes e ausência de ciclos.
- Inspeção de arquitetura: não há rede, persistência ou UI a fingir funcionalidades concluídas. BAS-01 é a única tarefa concluída; 43 tarefas permanecem planeadas em 18 módulos.

Resultado final desta execução: 31 testes aprovados, zero falhas. Validação documental aprovada. A execução TypeScript por Node remove tipos, mas não substitui compilador/typecheck; BAS-04 inclui essa ferramenta.

## Incremento 0.2.52 — 15/09/2026

Ao avançar do planeador para motorista e carro, a aplicação transfere a rota escolhida em memória de sessão. A etapa de seleção mostra o mesmo mapa, origem, paragens, destino, distância, duração e cálculo; a revisão e o pedido guardam a sequência completa. A rota de referência antiga fica reservada à abertura direta da marcação. Resultado: 87 testes Node, 29 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.51 — 15/09/2026

Cada paragem do planeador passou a apresentar setas de subir e descer junto ao botão de remoção. Os limites ficam desativados na primeira e na última paragem, o destino continua fixo no fim e a nova sequência é refletida no mapa, na lista numerada e no cálculo. Resultado: 87 testes Node, 29 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.50 — 15/09/2026

Os campos de rota foram reordenados para mostrar partida, paragens e destino na mesma sequência usada pelo mapa e pelo cálculo do percurso. Resultado: 87 testes Node, 28 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.49 — 15/09/2026

O planeador mostra no máximo três locais recentes. Os restantes continuam disponíveis pela pesquisa e pelas sugestões filtradas do endereço. Resultado: 87 testes Node, 28 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.48 — 15/09/2026

A descoberta ganhou um destaque fotográfico do Porto com seis paragens pré-selecionadas, todas editáveis no planeador, e mais espaço entre o título, a grelha e os destaques. Resultado: 87 testes Node, 28 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.47 — 15/09/2026

A primeira tela do cliente passou a apresentar seis opções de tour, com Porto e um percurso personalizável adicional. A grelha usa três colunas a partir de 600px e duas em ecrãs menores; cartões, cabeçalho e pesquisa receberam ritmo tipográfico e espaçamento revistos. Resultado: 87 testes Node, 27 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.46 — 15/09/2026

A pesquisa passou a distinguir `Lote` de `n.º`, removeu a lista local de números não comprovados e preserva o lote escrito pelo cliente quando o fornecedor só devolve o arruamento. Nessa situação, a interface declara “ponto aproximado na rua”. Geoapify fica preparado como fonte principal mediante chave e Photon é o fallback sem chave no desenvolvimento; o parâmetro `lang=pt`, não suportado pelo Photon, foi removido. O Nominatim público deixou de alimentar o autocomplete. Resultado: 87 testes Node, 26 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.45 — 14/09/2026

Quando o utilizador escreve apenas o marcador `lote` ou `n.º`, a interface apresenta os números conhecidos do arruamento e identifica a lista. Ao escrever um valor não cadastrado, mantém apenas opções existentes e não fabrica uma morada. Resultados remotos são filtrados pelos termos da rua. Resultado: 85 testes Node, 26 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.44 — 14/09/2026

Sugestões de ruas passam a tolerar erros de edição de uma ou duas letras em termos relevantes e mantêm os marcadores de lote/número. Para `rua pedro sinta lote 84`, a opção corrigida é `Rua Pedro de Sintra, n.º 84`, com a coordenada do arruamento conhecido. Resultado: 85 testes Node, 25 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.43 — 14/09/2026

Sugestões de morada agora priorizam os termos da rua e ignoram títulos que sejam apenas números quando há uma rua correspondente no catálogo. O mapa Leaflet é mantido entre alterações do formulário e só redesenha a geometria quando as coordenadas mudam, evitando cintilação durante a digitação. Resultado: 85 testes Node, 23 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.42 — 14/09/2026

Consultas de morada passaram a reconhecer marcadores de lote/número e escrita corrida, como `ruapedrodesintralt40`, separando prefixo de rua, conectores e porta antes de consultar o mapa. O resultado de rua é deduplicado e mantém a porta pedida na opção selecionável. Resultado: 85 testes Node, 23 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.41 — 14/09/2026

Números de porta com marcador (`n`, `n.º`, `numero`) passaram a ser extraídos da consulta, enviados ao geocoder e preservados no título selecionável quando a fonte devolve apenas o arruamento. O teste cobre uma pesquisa sobre-especificada com rua, porta e localidade. Resultado: 85 testes Node, 23 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.40 — 14/09/2026

Consultas de rua com localidade adicional passaram a tentar variantes da frase, ordenar os resultados pela correspondência dos termos originais e desistir de uma fonte lenta após 2,5 segundos. Photon foi ligado como fallback público sem chave. Resultado: 85 testes Node, 23 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.39 — 14/09/2026

O catálogo de pesquisa do cliente foi ampliado para locais turísticos, centros comerciais, estações, aeroporto e moradas de demonstração. Origem, destino e todas as paragens partilham correspondência por palavras e usam geocoding remoto como fallback para moradas portuguesas fora do catálogo; uma seleção remota guarda as coordenadas para a rota. Resultado: 85 testes Node, 22 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Fora desta validação

Não realizados: integração de banco, concorrência transacional real, autenticação/autorização, conversão interativa de horários locais, browser/mobile, acessibilidade, provedores de mapas, MB WAY, reembolsos, faturação, notificações e carga. Estão explicitamente planeados nas tarefas. Testar a função de conflito não prova atomicidade entre dois pedidos reais.

## Revisões feitas antes de fechar

- Separado intervalo entre viagens de grelha visual e passo de horários.
- Distinguidos lugares de passageiros do nome comercial do carro.
- Mantidos beneficiário motorista, sinal e comissão pessoal como conceitos distintos.
- Calendário usa vizinhos imediatos por motorista e veículo, evitando bloquear por uma rota histórica irrelevante.
- Rejeitadas datas normalizadas indevidamente e hora 24:00 em vez de adivinhar a data seguinte.
- Hipóteses de aprovação, tolerância adicional e proteção de janela após reagendamento mantidas visíveis.

## Atualização 0.1.1 — 2026-09-09

Aprovação e tolerância foram entretanto confirmadas pelo utilizador; proteção de janela após reagendamento continua hipótese. Acrescentados defaults aprovados e cálculo de antecedência: 120 min normal e 2880 min tours, prevalecendo exigências maiores dos recursos.

`npm run check`: **37 testes aprovados**, zero falhas; **33 documentos, 85 ligações locais e 44 tarefas** validados, sem ciclos de dependência. Seis novos cenários verificam 2h/48h exatas, menos 1ms, herança e mudança de hora. BAS-02 está em curso, Supabase selecionado; prova transacional ainda não implementada.

Pesquisa de viabilidade é documental, com fontes em 11-viabilidade-custos-rotas.md. Não foi feita chamada autenticada de routing, criado projeto Supabase ou realizado deploy. O changelog Supabase em Markdown não esteve acessível; a página HTML foi consultada como alternativa. Nenhuma funcionalidade remota Supabase foi implementada nesta atualização.


## Atualização 0.1.2 — sistema visual

Documentação e tokens de estilo, sem alteração de domínio. Cinco referências originais copiadas sem edição. Validação documental: 36 documentos, 128 ligações locais e 47 tarefas. Oito pares de texto/fundo da paleta têm contraste calculado superior a 4,5:1 (menor resultado: 5,22:1). Isto não substitui validação da composição em browser. Nenhuma tela foi renderizada ou declarada implementada; UI-02 e UI-03 permanecem planeadas. Testes funcionais não repetidos porque não houve mudança nas regras.


## Atualização 0.1.3 — reutilização GitHub

Pesquisa documental em 11/09/2026 com fontes dos autores e mapeamento de bibliotecas para as tarefas. Validação: 37 documentos, 135 ligações locais e 48 tarefas; sem ciclos. git diff --check passou. Nenhum pacote instalado, build de interface ou teste de integração realizado. Testes de domínio não repetidos porque esta versão altera apenas documentação e metadados de versão. BAS-05 concluída significa pesquisa concluída; compatibilidade das bibliotecas e calendário operacional continuam por demonstrar.


## Atualização 0.2.0 — base web

11/09/2026: npm run build passou (TypeScript e Vite); 37 testes de domínio e 3 testes Playwright passaram. A navegação foi percorrida em 18 rotas e sete larguras (320, 375, 390, 430, 768, 1024, 1440), com verificação de overflow horizontal e erros de execução. Testados PT/EN, margem de 105 min para deslocação de 90+15, erro de entrada, ausência de persistência simulada, preço/sinal/saldo de tour e calendário às 09:00 de Lisboa com browser em Nova Iorque.

Inspecionadas capturas de início desktop/mobile, configurações e calendário móvel; ajustados rótulo acessível de idioma e formatação de horas. Testes de browser repetidos após essas correções e alterações visuais finais: todos aprovados. Validação documental: 38 documentos, 139 ligações locais, 48 tarefas. Auditoria npm durante a instalação reportou zero vulnerabilidades conhecidas; não equivale a auditoria completa.

Workflow CI preparado, ainda não executado remotamente. Sem Supabase, autenticação, reservas persistentes, pagamentos ou envio de notificações. BAS-04 e UI-02 continuam em curso; CAL-04 continua planeada. A pré-visualização de áreas não prova autorização. Não foi concluída a revisão de zoom 200%, Safari/Android nem de DST interativo.


## Atualização 0.2.1 — prova transacional

11/09/2026: 11 testes de integração PostgreSQL local aprovados, incluindo lock real observado em pg_stat_activity, dupla marcação, idempotência, rollback integral, expiração e isolamento de recursos/atores. Build/TypeScript e 37 testes de domínio passaram. RLS habilitado em oito tabelas privadas; acesso sem privilégios negado; sem policies públicas, SECURITY DEFINER ou integração Auth. O teste usa proprietário da base: não prova RLS de produção.

Docker disponível com PostgreSQL 17; script de arranque testado contra contentor identificado. Cada execução remove apenas a base de testes gerada por ela. Não se aplicaram migrações Supabase nem se alteraram projetos remotos. Testes de browser não repetidos, porque o código de interface não mudou. Ver 16-prova-persistencia.md e ADR-008.

## Incremento 0.2.2 — 11/09/2026

37 testes de domínio e 7 testes reais Auth/PostgREST aprovados; build/typecheck e 41 documentos/145 ligações validados. Duas migrações reconstruídas via reset exclusivamente local; testes de acesso aprovados após reconstrução. Advisors sem avisos/erros no nível warn. Não equivale a restauro de backup operacional. Testes visuais e os 11 testes da prova PostgreSQL anterior não foram repetidos neste incremento sem alterações nessas áreas. CI de autenticação preparado, execução remota não realizada.

## Incremento 0.2.5 — 14/09/2026

Mapa do percurso validado no fluxo móvel do cliente, em PT/EN, com rota de transfer e tour com paragem. Oito testes Playwright aprovados: percurso cliente, conflitos, orçamento, consulta/cancelamento, filtros e agenda anterior, além do formato do link Waze. Dois testes Node validam ordem dos pontos e parâmetros do deep link. Tiles externos são bloqueados nos testes automatizados; linha, marcadores, resumo e fallback textual permanecem verificáveis. Build, TypeScript, testes de domínio e documentação validados. Não houve teste em dispositivo Android/iOS, cálculo rodoviário real, pesquisa de moradas ou localização em tempo real.

## Incremento 0.2.6 — 14/09/2026

Migração operacional criada pela CLI Supabase 2.117.0 e aplicada duas vezes a partir de uma base local limpa. Onze testes reais aprovados: sete de identidade/RLS e quatro de schema operacional, incluindo duas transações concorrentes na mesma vaga, rollback integral e privilégios anónimos. `supabase db lint` não encontrou erros; advisors de segurança e desempenho não encontraram problemas no nível warn. Nenhum projeto remoto foi ligado ou alterado.

## Incremento 0.2.7 — 14/09/2026

Áreas internas protegidas por sessão e membership, login PT/EN, conclusão de convite e logout implementados. Convite privado do parceiro validado contra Auth local e compensado quando o perfil falha. Resultado: 42 testes Node, 12 testes Auth/PostgREST/PostgreSQL, 10 testes Playwright e teste visual real de login aprovados; build e TypeScript aprovados. Nenhuma secret key foi incluída no browser ou no repositório.

## Incremento 0.2.8 — 14/09/2026

Catálogo de demonstração de motoristas e veículos adicionado com cadastro bilingue, ativação/desativação, capacidade de passageiros, bagagem, antecedência e suplemento. Três testes de contrato e um fluxo Playwright cobrem os limites; o catálogo continua sem escrita real por browser até existir o endpoint owner.

## Incremento 0.2.9 — 14/09/2026

Associação de vários motoristas ao mesmo veículo adicionada ao catálogo de demonstração. O teste Playwright confirma a associação e a suíte ficou com 45 testes Node; build e validação documental continuam aprovados.

## Incremento 0.2.10 — 14/09/2026

Consulta de pedidos demo por código de confirmação adicionada. O contrato normaliza espaços/maiúsculas e rejeita referências fora do formato; a consulta de produção ainda deverá combinar o código com um fator adicional e endpoint autenticado.

## Incremento 0.2.11 — 14/09/2026

O fluxo Playwright do cliente cria um pedido, consulta o código normalizado e confirma o estado antes do cancelamento. Os dados continuam fictícios e em memória.

## Incremento 0.2.12 — 14/09/2026

Simulador de preço local adicionado às configurações. O teste de interface confirma transfer de 35 km com base de 10 € e divisão 25/75%; build, 46 testes Node e suíte Playwright de configurações aprovados.

## Incremento 0.2.13 — 14/09/2026

O fluxo do cliente consulta o código, propõe reagendamento de uma hora, verifica disponibilidade e mantém o estado atualizado antes do cancelamento. Build, 46 testes Node e 3 testes Playwright do cliente aprovados.

## Incremento 0.2.14 — 14/09/2026

Marcação manual demo adicionada ao proprietário com origem WhatsApp/telefone, seleção de recursos, mapa, preço e verificação de conflitos. Build e 4 testes Playwright de demonstração aprovados.

## Incremento 0.2.15 — 14/09/2026

Vista de serviços do motorista adicionada com deep link Waze e transições de execução até concluído. Build e 5 testes Playwright de demonstração aprovados.

## Incremento 0.2.16 — 14/09/2026

CRM demo adicionado com validação de dados fiscais e pesquisa. Build, 47 testes Node e 6 testes Playwright de demonstração aprovados.

## Incremento 0.2.17 — 14/09/2026

Editor demo de tours bilingues adicionado com duração obrigatória de dois dias, preço para duas pessoas e adicional. Build, 48 testes Node e 10 testes Playwright aprovados.

## Incremento 0.2.18 — 14/09/2026

Contrato administrativo server-side do catálogo adicionado. O proprietário ativo é o único ator autorizado; a organização é obtida da sessão, perfis ativos recebem `publishedAt` do servidor e associações são rejeitadas quando sobrepõem motorista ou veículo. A preparação de cotações passou a exigir rota, resolver tarifa/capacidade do servidor e guardar snapshot com validade e versão; o total do navegador é ignorado. A janela de associação é semiaberta, por isso termina exatamente quando a seguinte começa. Resultado: 58 testes Node aprovados; typecheck, build e validação documental repetidos após a alteração.

## Incremento 0.2.19 — 14/09/2026

Máquina de estados de reservas adicionada no servidor lógico. O caso exige motorista atribuído para aceite/execução, pagamento sucedido e alocação garantida para confirmação, saldo registado antes de iniciar e `expectedVersion` para concorrência otimista. Resultado: 63 testes Node aprovados; typecheck, build e suíte de navegador repetidos.

## Incremento 0.2.20 — 14/09/2026

Ledger append-only e contrato de eventos de pagamento adicionados. Cobranças e reembolsos conservam histórico, o beneficiário é resolvido pelo contexto server-side e eventos não verificados, duplicados ou acima do valor recebido são rejeitados. Resultado: 69 testes Node aprovados; typecheck, build e documentação repetidos.

## Incremento 0.2.21 — 14/09/2026

Política de cancelamento e reagendamento server-side adicionada. O fluxo exige token do cliente ou ator interno, respeita 24 horas decorridas, diferencia reembolso de cancelamento pelo motorista e cria proposta/cotação nova sem alterar a reserva original. Resultado: 75 testes Node aprovados; typecheck, build e documentação repetidos.

## Incremento 0.2.22 — 14/09/2026

Gerador de slots local do calendário adicionado. A grelha configurável não encurta a duração do serviço, filtra antecedência e datas bloqueadas e rejeita horas DST inexistentes ou ambíguas. Resultado: 81 testes Node aprovados; typecheck, build e documentação repetidos.

## Incremento 0.2.23 — 14/09/2026

Extensão de schema Supabase criada pela CLI e aplicada numa base local limpa: janelas/exceções do calendário, eventos de pagamento e propostas de alteração, todas com RLS e grants mínimos. Lint e advisors de segurança/desempenho não encontraram problemas; 13 testes Auth/PostgREST locais passaram.

## Incremento 0.2.24 — 14/09/2026

Adaptador OSRM server-side adicionado para distância e duração de estrada. O adaptador exige coordenadas, HTTPS remoto e rota devolvida pelo provedor; arredonda para cima e não inventa fallback quando falha. Resultado: 85 testes Node aprovados; typecheck, build e documentação repetidos.

## Incremento 0.2.25 — 14/09/2026

Documentação do motorista alinhada com as guardas do caso de uso server-side. Validação documental repetida sem alteração de comportamento.

## Incremento 0.2.26 — 14/09/2026

A interface recebeu ajustes responsivos no calendário: os botões de vista passam a ocupar linhas legíveis no telemóvel, cada botão mantém alvo táctil e a lista evita truncamento. O fluxo do cliente ganhou um indicador visual de passo e os rótulos dos formulários foram uniformizados. Resultado: 15 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.27 — 14/09/2026

Cartões de seleção, badges de estado, textareas e grupos de associação passaram a reutilizar os tokens de superfície, foco, raio e sucesso. A validação mantém os 85 testes Node, os 15 testes Playwright, build TypeScript/Vite e verificação documental aprovados.

## Incremento 0.2.29 — 14/09/2026

O percurso público passou a começar por origem e destino, com sugestão de localização atual e fallback editável, mapa de pré-visualização, distância/duração, escolha posterior de motorista e carro, registo completo, revisão e divisão 25/75 do valor. O pedido permanece pendente de aceite antes do pagamento; consulta, reagendamento e cancelamento continuam demonstráveis em memória. Resultado: 85 testes Node, 15 testes Playwright, build TypeScript/Vite e validação documental aprovados. Geolocalização, cálculo rodoviário e pagamento reais continuam dependentes de serviços de produção.

## Incremento 0.2.30 — 14/09/2026

A descoberta do cliente passou a usar a composição Glovo solicitada: pesquisa no topo, botão de horário, quatro categorias de tours e promoção Lisboa–Sintra com imagem local e navegação inferior. O clique abre a reserva já no serviço tour. Resultado: 85 testes Node, 16 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.31 — 14/09/2026

O botão de pesquisa da descoberta passou a abrir o planeador inline, sem trocar de aba. A origem fica sugerida e editável, a localização atual tem fallback, locais recentes preenchem o destino e o cliente vê o mapa, os 62 km, a duração prevista, o preço do pacote de 200,00 € e o sinal de 25% antes de avançar para motorista e carro. Resultado: 85 testes Node, 17 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.32 — 14/09/2026

Ao abrir a pesquisa, o mapa aparece imediatamente na mesma tela, centrado na origem sugerida e com uma mensagem para escolher o destino. Depois de selecionar um local recente ou escrever um endereço, o mapa passa a mostrar a rota do tour; o preço só é confirmado pelo botão “Ver rota e preço”, antes da etapa de motorista e carro. Resultado: 85 testes Node, 17 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.33 — 14/09/2026

O mapa deixou de reaproveitar a rota Lisboa–Sintra quando o cliente escreve outro destino. O planeador reconhece destinos demo como Carregado, desenha os pontos correspondentes e impede a cotação enquanto o endereço não for reconhecido, evitando uma rota visualmente incorreta. Resultado: 85 testes Node, 18 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.34 — 14/09/2026

As sugestões de morada passaram a aparecer diretamente abaixo do campo enquanto o cliente digita. A lista filtra nomes e endereços, permite selecionar Carregado e outros locais demo e mantém a cotação bloqueada até haver um destino reconhecido. Resultado: 85 testes Node, 18 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.35 — 14/09/2026

O catálogo de demonstração passou a incluir as moradas completas do exemplo enviado, incluindo Avenida Cabo da Boa Esperança L65 e Estação Carregado. A pesquisa parcial “AVENIDA CABO DA BOA ESPERANÇA” apresenta a sugestão imediatamente e a seleção atualiza o destino do mapa. Resultado: 85 testes Node, 19 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.36 — 14/09/2026

O ponto de Avenida Cabo da Boa Esperança L65 usa agora a coordenada geográfica do arruamento em Carregado (CP 2580-469). O enquadramento do mapa inclui explicitamente o ponto de recolha e o destino, mesmo quando a geometria recebida é simplificada. Resultado: 85 testes Node, 19 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.37 — 14/09/2026

A pesquisa genérica deixou de reutilizar a cotação fixa de tour: calcula transfer com base de 10,00 €, 2,00 €/km e sinal de 25%; tours continuam com pacote de 2 dias. O botão “+” adiciona e remove paragens no cartão, soma cada trecho conhecido e oculta os locais recentes após a escolha do destino. Resultado: 85 testes Node, 20 testes Playwright, build TypeScript/Vite e validação documental aprovados.

## Incremento 0.2.38 — 14/09/2026

As sugestões de morada foram generalizadas para origem, destino e todas as paragens. A seleção “shopping vasco” preenche Vasco da Gama Shopping e torna o trecho elegível para o mapa e a cotação. Resultado: 85 testes Node, 20 testes Playwright, build TypeScript/Vite e validação documental aprovados.

