# Estado atual e limites de continuidade

Referência: v0.2.88, 16/09/2026. Alterações mais recentes: pedidos completos do cliente persistidos no navegador e apresentados ao proprietário/CRM, tarifa demo guardável e aplicada ao cálculo, e editor de tours com área/local, foto e novas áreas, além da barra inicial compacta (52 px), botões e caixas de pesquisa do planeamento compactos, pins alinhados, um único resumo de booking, cartões finais separados, calendário principal com pop-up arredondado de data, mês e ano sem horários duplicados e bandeiras PNG maiores sem moldura quadrada no seletor de idioma, sem planeta duplicado, incluindo a opção ativa e a bandeira dos Estados Unidos para inglês; regras funcionais mantidas. Este é o ponto de entrada atual; os relatórios numerados antigos preservam evidência da versão indicada, não o estado final de todo o produto.

## Produto e regras que ligam os módulos

Operação privada de proprietário/motorista e parceiros convidados. Cliente inicia em Descobrir, planeia percurso, vê estimativa, seleciona data/hora e depois motorista/carro, fornece dados e envia pedido. Aceitação antecede sinal; consulta acompanha o pedido.

Sinal 25%, saldo 75% no início, extras depois. Beneficiário é o motorista executor. X do proprietário é acordo separado, sem transferência automática. Cancelamento/reagendamento tem fronteira de 24h; antecedência padrão 2h e tour 48h. Valores exemplificativos (10 EUR base, 2 EUR/km, tour 200 EUR, adicional 35 EUR) não são tarifas reais. Ver [decisões](01-escopo.md) e [matemática](03-regras.md).

Pedido de 15/09: serviço 24h, horários ocupados deixam de aparecer, margem mínima de uma hora. Serviço 15–16 permite próximo início às 17, se nenhum outro conflito existir. A duração real da viagem não se torna automaticamente uma hora; deslocação maior pode exigir margem maior conforme DEC-21. Datas futuras são escolhidas por “Escolher outra data”.

## Mapa do código existente

| Área | Ficheiros / responsabilidade |
|---|---|
| Entrada e rotas | src/web/App.tsx, navigation.ts, main.tsx; seleção de área, hash e demonstração. |
| Descoberta e planeador | src/web/pages/CustomerDiscoverSandbox.tsx; categorias, promos, moradas, estimativa e calendário. |
| Pedido e consulta | src/web/pages/CustomerSandbox.tsx, demo-request-store.ts e demo-config.ts; passos, escolha, dados, resumo, cancelamento/reagendamento e handoff demo para o proprietário/CRM. |
| Agenda demo | src/web/pages/CalendarSandbox.tsx, src/web/customer-availability.ts; agenda local e filtragem de horas. |
| Outras abas demo | CatalogSandbox, BookingSandbox, CustomerCrmSandbox, DriverServicesSandbox, TourSandbox, SettingsPage e DemoPage em src/web/pages; Booking/CRM leem pedidos recebidos e Tour/Settings guardam configuração demo no navegador. |
| UI comum | src/ui/components, src/ui/styles/tokens.css, src/web/styles.css e src/web/i18n.ts. |
| Mapas e moradas | src/web/components/RouteMap.tsx, demo-routes.ts, services/address-search.ts; adaptador rodoviário em src/infrastructure/routing/osrm.ts. |
| Domínio puro | src/domain: pricing, policy, calendar, slots, lead-time, booking, settlement, payment-ledger, defaults, validation. |
| Casos de uso | src/application: prepare-quote, request-reservation, booking-command, booking-change, payment-command, catalog-admin, invite-driver e reservation-ports. |
| Contratos | src/contracts: schemas de reserva, consulta, clientes, catálogo e tours. |
| Identidade / banco | src/modules/identity, src/web/auth, src/infrastructure; provas db/proofs e migrações supabase/migrations. |
| Verificação | tests/*.test.ts, tests/browser, tests/integration, tests/supabase, scripts e .github/workflows/check.yml. |
| Assets | public para imagens utilizadas; design/references para referências fornecidas. |

Não criar uma aplicação nova paralela nem mudar para outro framework para uma alteração de tela. A arquitetura alvo em docs/02 descreve também pastas futuras: procurar primeiro o módulo já existente.

## Implementado versus integrado

- Núcleo de regras e casos de uso com testes unitários. Provas de transações/concorrência em PostgreSQL e schema/autenticação locais têm evidência histórica nos documentos 16–19.
- UI React/Vite PT/EN com demonstrações e fluxo cliente. As abas Sandbox não constituem uma API operacional.
- Seleção de datas futuras usa input date nativo e grelha de horas livres. Não é app iOS nem reprodução exata do seletor Apple.
- MB WAY e WhatsApp aparecem no resumo demo, com número fictício. Não há cobrança real, confirmação automática de comprovativo, webhook operacional ou contacto comercial definido.
- Adaptador OSRM existe; a pré-visualização ainda usa percursos/estimativas demonstrativos. Autocomplete remoto não torna a cotação rodoviária real.
- Supabase remoto, publicação e operação com dados reais continuam por configurar/integrar. SEC-01 tem evidência local concluída; isso não conclui todo o fluxo operacional.

## Limites conhecidos que a próxima máquina deve preservar como pendências

1. pm.owner.calendar e pm.customer.route-handoff são sessionStorage. Não sincronizam disponibilidade entre utilizadores, PCs ou sessões independentes e não protegem concorrência real.
2. O pedido completo demo e algumas configurações usam localStorage para sobreviver a recarregamentos e ser partilhados entre abas do mesmo navegador. Isso não é persistência multiutilizador, backup, autenticação nem sincronização entre PCs; CalendarSandbox e catálogo de motoristas/carros continuam demonstrações locais.
3. saveCustomerCalendarBooking transforma recursos em * (bloqueio global demo). Produção deve usar recursos concretos e disponibilidade transacional; não bloquear toda a frota indevidamente.
4. O helper de horas não implementa toda a política do motor: usa duração mínima de 60 minutos, apenas estados explícitos para expiração e não a validade temporal completa dos holds. 24h atravessando meia-noite precisa verificar também exceções/dias seguintes.
5. Atalhos de datas e relógios são fixos em setembro/2026; “outra data” amplia seleção, mas não transforma o demo em calendário de produção baseado na hora atual/antecedência.
6. Há validação final adicional no pedido. Unificar fonte de disponibilidade entre prévia, recursos e confirmação antes de produção; uma hora visível não é garantia de reserva.
7. Teste Playwright de datas futuras passou, mas a interação pela ferramenta do browser local manteve 14/09 numa tentativa de escolher 20/09. Causa não resolvida (evento do seletor/ferramenta ou UI); repetir manualmente num iPhone real e verificar a data no passo seguinte. Não declarar validação iOS concluída.
8. Tours de dois dias precisam alocação de todos os intervalos do pacote; minutos de condução isolados não provam ocupação correta de dois dias.
9. Tarifas, beneficiários e contacto de comprovativos precisam vir de configuração autorizada. Um comprovativo enviado não confirma pagamento automaticamente.
10. Relatórios de testes em artifacts não são versionados. Os testes fonte são reproduzíveis; um clone não contém screenshots locais nem evidência de novas execuções.

As afirmações antigas “horários desaparecem automaticamente” descrevem a simulação da mesma sessão. Para clientes reais são necessárias API, persistência e atualização partilhada. Não promover essa simulação a garantia operacional.

## Próximas alterações coerentes

Usar tarefas PUB/CAL/NAV/PRC/BKG/PAY existentes, sem as marcar concluídas apenas pela UI. Prioridades técnicas quando forem solicitadas: reproduzir seleção futura em dispositivo real; unificar disponibilidade com regras de domínio; ligar casos de uso a persistência e autorização; validar slots/recursos concorrentemente; ligar rota real e pagamento conforme decisões comerciais.

Evidência anterior: build e 90 testes unitários aprovados em v0.2.72; dois testes de browser focados em margem e datas futuras. Isso não equivale à suíte E2E completa nem a testes de banco repetidos nessa versão.

## Como atualizar este documento

Após cada alteração significativa, atualizar referência, mapa se mudou, funcionalidades realmente integradas, limites resolvidos/novos e validação executada. Nunca apagar um limite só porque um botão foi desenhado. Guardar contexto e tarefa responsável para que o próximo computador continue do mesmo ponto.

