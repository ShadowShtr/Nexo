# ADR-008 — Transação PostgreSQL por motorista e veículo

Estado: ACEITE para prova técnica BAS-02. Data: 11/09/2026.

Contexto: a função pura de conflito não impede dois pedidos de ler a mesma vaga livre.

Decisão: UnitOfWork com uma conexão pg, READ COMMITTED, locks FOR UPDATE nos dois recursos em ordem de UUID e revalidação após o lock. Deduplicar comandos antes de adquirir recursos. Gravar pedido, alocações, snapshots e outbox no mesmo commit.

Alternativas: escritas REST separadas não preservam atomicidade; função RPC transacional continua alternativa de produção em BAS-03, respeitando as mesmas regras. SERIALIZABLE exigiria retries adicionais; o protocolo de locks é suficiente para esta prova fechada.

Consequências: todos os caminhos de escrita da agenda terão de seguir o protocolo. Estimativas de rota devem estar preparadas antes da transação. Não expor credenciais pg ao cliente.

Migração: ainda nenhuma; o schema pm_proof é descartável. Schema Supabase final, papéis e migrações serão gerados/validados em BAS-03/SEC-01. A arquitetura não se compromete com runtime Node de produção antes da escolha de alojamento.

Evidência: [prova, contratos e 11 testes PostgreSQL](../16-prova-persistencia.md).
