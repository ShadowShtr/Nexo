# Plataforma de transporte premium — fundação 0.1.0

Base para um proprietário/motorista que gere a operação e atribui serviços a parceiros. O nome é provisório. Entrega por etapas: primeiro regras e contratos, depois persistência, serviços e telas, finalmente integrações e lançamento.

## O que já existe

- Especificação funcional, arquitetura, modelo de dados, matemática, calendário, configurações e plano de implementação por aba.
- Código TypeScript executável para preço, tours, sinal, espera, cancelamento/reagendamento, conflitos de agenda, acertos e estados de reserva.
- Testes automáticos e exemplo de orçamento. Sem dependências externas nesta fase.
- Repositório Git local, changelog e tarefas rastreáveis.

## O que ainda não existe

Interface, API, autenticação, base de dados persistente, notificações, cálculo rodoviário real, MB WAY e reembolsos reais. Os módulos atuais são funções puras; não são um sistema operacional nem garantem concorrência sem a futura camada transacional. Nada foi publicado. Nenhuma tarefa de tela está marcada como concluída.

## Executar

Requisito: Node.js 24.x. Na raiz deste projeto:

```sh
npm test
npm run demo
npm run check:docs
```

O Node executa TypeScript com remoção de tipos. Isso não faz verificação estática de tipos. O compilador TypeScript e o respetivo check serão adicionados na tarefa BAS-04 quando a aplicação web for inicializada com dependências fixadas.

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

## Estrutura atual

```text
docs/                 especificação e tarefas
src/domain/           regras puras, sem UI, banco ou rede
tests/                cenários de negócio executáveis
examples/             demonstração com valores fictícios
scripts/              validação documental
CHANGELOG.md          histórico de versões
AGENTS.md             instruções para futuras implementações
```

Cada tarefa tem dependências, trabalho, critérios de aceitação e evidência exigida. O próximo bloco é BAS-02/BAS-03: contratos de persistência e testes de concorrência, seguido do scaffold web BAS-04. Decisões de pagamento podem ser investigadas em paralelo ao desenvolvimento de agenda e CRM, mas bloqueiam a cobrança real.
