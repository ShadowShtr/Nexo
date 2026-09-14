# Plataforma de transporte premium — base web 0.2.38

Base para um proprietário/motorista que gere a operação e atribui serviços a parceiros. O nome é provisório. Entrega por etapas: primeiro regras e contratos, depois persistência, serviços e telas, finalmente integrações e lançamento.

## O que já existe

- Especificação funcional, arquitetura, modelo de dados, matemática, calendário, configurações e plano de implementação por aba.
- Código TypeScript executável para preço, tours, sinal, espera, cancelamento/reagendamento, conflitos de agenda, acertos e estados de reserva.
- Testes automáticos, exemplo de orçamento e base web React/Vite com dependências fixadas.
- Navegação PT/EN, calendário visual e simuladores locais. Ver [guia da base web](docs/15-base-web.md).
- Repositório Git local, changelog e tarefas rastreáveis.

## O que ainda não existe

API operacional ligada às abas, catálogo persistente, consulta autenticada, notificações, ligação do adaptador de cálculo rodoviário ao fluxo de produção, MB WAY e reembolsos reais. A interface autenticada e as migrações foram validadas apenas no Supabase local; nenhum projeto Supabase remoto foi ligado.

## Executar

Requisito: Node.js 24.x. Na raiz deste projeto:

```sh
npm ci
npm run dev
# Verificações
npm run build
npm run check
npm run test:ui
```

Abrir http://127.0.0.1:5173 depois de iniciar o servidor. O Node executa os testes de domínio com remoção de tipos; npm run build inclui agora verificação estática com TypeScript. npm run test:ui usa Microsoft Edge.

## Ordem de leitura

1. [Escopo e decisões](docs/01-escopo.md)
2. [Arquitetura e organização](docs/02-arquitetura.md)
3. [Regras e matemática](docs/03-regras.md)
4. [Calendário e disponibilidade](docs/04-calendario.md)
5. [Configurações do proprietário](docs/05-configuracoes.md)
6. [Modelo de dados](docs/06-dados.md)
7. [Contratos e integrações](docs/07-api-integracoes.md)
8. [Qualidade, versões e entrega](docs/08-entrega.md)
9. [Plano por etapas](docs/09-roadmap.md)
10. [Índice das tarefas por aba](docs/tasks/README.md)
11. [Evidência de validação e limites](docs/10-validacao.md)
12. [Viabilidade de custo zero e rotas](docs/11-viabilidade-custos-rotas.md)
13. [Sistema visual: fonte, cores, espaçamentos e componentes](docs/12-design-system.md)
14. [Aplicação visual em cada aba](docs/13-mapa-visual-abas.md)
15. [Bibliotecas prontas e plano de reutilização](docs/14-reutilizacao-github.md)

## Estrutura atual

```text
docs/                 especificação e tarefas
src/domain/           regras puras, sem UI, banco ou rede
src/ui/styles/        tokens CSS do sistema visual
design/references/    imagens originais de referência
tests/                cenários de negócio executáveis
examples/             demonstração com valores fictícios
src/web/              aplicação React, rotas, idiomas e simuladores
scripts/              validação documental
CHANGELOG.md          histórico de versões
AGENTS.md             instruções para futuras implementações
```

Cada tarefa tem dependências, trabalho, critérios de aceitação e evidência exigida. Supabase foi escolhido para persistência; Vercel é a preferência de hospedagem, com custo comercial por resolver. Ver estudo de viabilidade.

BAS-02 tem contratos e prova PostgreSQL local validados. Ver [persistência e testes](docs/16-prova-persistencia.md). BAS-03 concluiu as migrações operacionais e o restauro local; ver [evidência do schema](docs/19-schema-operacional.md). O próximo bloco é concluir SEC-01 e ligar a interface autenticada.

Identidade, permissões, convite privado e login local: [evidência](docs/17-identidade-local.md). Nenhuma ligação à MO Limpezas ou a outro Supabase.

Agenda interativa de teste: abrir http://127.0.0.1:5173/?demo=1#/owner/calendar. [Roteiro](docs/18-teste-calendario.md).

Mapa do percurso: abrir `http://127.0.0.1:5173/?demo=1#/customer/booking`, avançar para o passo Percurso e escolher transfer ou tour. A rota é fictícia e não é usada como cálculo rodoviário real.
