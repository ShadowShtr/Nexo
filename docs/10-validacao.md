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
