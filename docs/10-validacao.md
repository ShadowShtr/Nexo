# 10 — Evidência da versão 0.1.0

Data: 2026-09-09. Ambiente local Windows; Node.js v24.16.0. Dados de testes fictícios. Não foram feitos pagamentos, notificações externas nem publicação.

## Verificações

- `node --test tests/*.test.ts`: suíte de regras puras, incluindo preços, 10.000 splits monetários, espera, limite exato de 24h, instantes com offset, conflitos de recursos e margem de 60 min, expiração e acertos.
- `node examples/booking.ts`: tour para quatro pessoas; total 270 EUR, sinal 67,50 EUR, saldo 202,50 EUR.
- `node scripts/check-docs.mjs`: links locais, IDs únicos, campos mínimos das tarefas, dependências existentes e ausência de ciclos.
- Inspeção de arquitetura: não há rede, persistência ou UI a fingir funcionalidades concluídas. BAS-01 é a única tarefa concluída; 43 tarefas permanecem planeadas em 18 módulos.

Resultado final desta execução: 31 testes aprovados, zero falhas. Validação documental aprovada. A execução TypeScript por Node remove tipos, mas não substitui compilador/typecheck; BAS-04 inclui essa ferramenta.

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

