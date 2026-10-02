# Checkup para apresentação — 02/10/2026

## Decisão

**Adequado para demonstração guiada, com limitações declaradas. Não aprovado para operação real.** A existência de testes aprovados não significa que todas as respostas da interface sejam corretas. Foram encontradas divergências reproduzíveis de preço e validação. Esta tarefa auditou e atualizou testes; não corrigiu o comportamento da aplicação.

Referência auditada: v0.2.90, commit inicial `0da6cc3`, branch `main`, sincronizada com `nexo/main` no início. A página pública respondeu HTTP 200. A validação funcional detalhada foi local; não houve auditoria das políticas, dados ou credenciais do Supabase remoto.

## Evidência executada

| Verificação | Resultado |
|---|---|
| Regras unitárias | 90 testes aprovados |
| PostgreSQL isolado | 11 testes aprovados: concorrência, bloqueios, idempotência, rollback, expiração e snapshots |
| Supabase local | 13 testes aprovados: autenticação, papéis, RLS, revogação e schema |
| Autenticação pela interface | Login/logout do proprietário e restrições de motorista aprovados |
| Build | TypeScript e Vite aprovados; aviso de bundle principal grande |
| Browser funcional | 38 testes aprovados na execução final (55,3 s); expectativas antigas atualizadas para o comportamento atualmente aprovado |
| Varredura visual | 20 rotas × 3 larguras (320/390/1440) × 2 idiomas = 120 combinações |

A varredura não encontrou overflow horizontal do documento, barra móvel ausente, imagens carregadas partidas ou erros JavaScript durante a navegação simples. Não testa todos os estados internos. `overflow-x: hidden` pode ocultar conteúdo mal dimensionado. Nos testes adicionais apareceram um erro intermitente de Leaflet (`_leaflet_pos`) e avisos React `flushSync`; ainda precisam de reprodução isolada. Não afirmar ausência global de erros.

Ambiente: Windows, Edge/Chromium automatizado, dados fictícios, PostgreSQL e Supabase locais isolados. **Não houve teste em iPhone físico, Safari/WebKit, pagamento real, envio de notificações ou operação entre dois dispositivos.** As pesquisas externas têm cobertura com respostas controladas; não é garantia de qualidade para qualquer morada real.

## Problemas que impedem respostas fiáveis

| Prioridade | Constatação e evidência | Correção necessária |
|---|---|---|
| Alta | Tour fictício cadastrado por **345 €** aparece no planeador por **200 €**. `openOwnerTour` perde a identidade/tarifa do pacote no handoff. | Transportar o tour escolhido até ao orçamento e calcular com a sua versão de preço; testar catálogo → reserva. |
| Alta | Operações da interface continuam a usar estado local/localStorage. Autenticação existe, mas os casos de uso transacionais não estão integralmente ligados às páginas. | Ligar interface à API e persistência autorizada; validar dois dispositivos antes de aceitar reservas reais. |
| Alta | Geolocalização concedida no Porto: callback ignora latitude/longitude e apenas escreve “A minha localização”. | Usar coordenadas recebidas no percurso, orçamento e resumo; tratar recusa e erro. |
| Alta | Nome contendo apenas espaços, telefone `abc` e NIF `000000000` avançam para “Rever pedido”. | Normalizar/validar dados no contrato partilhado e no servidor; mensagens específicas por campo. |
| Alta | Relógios de demonstração fixos em setembro coexistem com a data real de outubro. “Próximas viagens” inclui viagens de setembro, sem filtragem/ordenação futura. | Unificar relógio de cenário e rotular demo; em operação usar instantes reais e ordenar próximos serviços. |
| Alta | Motoristas/carros do pedido são listas fixas separadas do catálogo. Alterações ao catálogo não garantem consistência no pedido. | Fonte única de recursos, capacidade e estado ativo, com revalidação no servidor. |
| Alta | Duração de pacote de dois dias não equivale ao intervalo usado pela validação local, que usa minutos de rota/espera. | Definir e aplicar intervalo operacional do pacote em disponibilidade e bloqueio de recursos. |
| Média | Botões “Perfil” e “Mais opções” do início do proprietário não têm ação; cliques não alteram página ou conteúdo. | Implementar destino ou retirar até existir. |
| Média | Explicação da tarifa no planeador mantém 2 €/km e 35 € fixos, embora o cálculo possa usar configurações diferentes. | Produzir texto e cálculo a partir do mesmo orçamento. |
| Média | “Faturação hoje” soma orçamentos/pedidos, não necessariamente dinheiro recebido. | Separar valor reservado, recebido e pendente. |
| Média | Dia/semana da agenda limitam a grelha a 06–23h, mas há oferta de horários 24h. | Tornar todos os serviços visíveis e testar reservas de madrugada. |
| Média | Seletor de serviço nas configurações tem fonte calculada de 13,76 px em larguras móveis. | Garantir campos móveis com tamanho adequado e validar foco/teclado em Safari real. |
| Média | Mapa apresenta erro intermitente durante interações; timers de atualização e transições precisam de revisão do ciclo de vida. | Reproduzir alternância de rota/saída durante zoom e testar limpeza dos recursos. |

O acesso `?demo=1` contorna autenticação para a demonstração. Isso não prova acesso indevido à base remota, mas esta área não deve conter informação real nem ser apresentada como ambiente privado operacional. Pagamento/WhatsApp apresentados no fluxo não constituem integração financeira ou envio confirmado.

Referências principais: [planeador](../src/web/pages/CustomerDiscoverSandbox.tsx), [pedido](../src/web/pages/CustomerSandbox.tsx), [início do proprietário](../src/web/pages/OwnerHomeSandbox.tsx), [agenda](../src/web/pages/CalendarSandbox.tsx), [mapa](../src/web/components/RouteMap.tsx), [controlo de acesso](../src/web/auth/AuthGate.tsx).

## Estrutura e desempenho

Há boa separação em domínio, casos de uso, contratos e infraestrutura, com testes financeiros e de concorrência úteis. O problema é a distância entre essa base e as páginas `Sandbox`: estado, tarifas, recursos e datas são repetidos. Priorizar a integração dessa estrutura antes de acrescentar páginas.

O planeador concentra lógica e JSX extenso num único ficheiro. CSS global acumula regras móveis contraditórias e correções com `!important`. Extrair formulário, pesquisa, orçamento e calendário em componentes pequenos, centralizar relógio/configuração e remover regras substituídas reduz regressões.

Os 26 PNG de origem somam cerca de 22,6 MB; os 26 WebP correspondentes, 430 KB: redução aproximada de 98%. É uma melhoria concreta, mas o bundle JavaScript principal continua com cerca de 663 KB (199 KB gzip). Medir carregamento com rede móvel limitada, separar páginas pesadas/mapa/calendário e carregar imagens abaixo da dobra sob demanda. Não foi medido tempo de primeira carga num telemóvel físico nesta auditoria.

## Identidade menos genérica

1. Substituir slogans como “Escolhe a tua aventura” por ações específicas de transporte: “Reserve a sua viagem” e “Destino”. Uniformizar pt-PT e tratamento por “si”.
2. No proprietário, mostrar operação real: próximos serviços ordenados, valores recebidos e alertas acionáveis. Remover saudação fixa “Vitor” e frases de passageiro.
3. Reduzir cartões dentro de cartões, sombras e arredondamentos repetidos; usar mais linhas simples para informação operacional.
4. Preservar logo PM e ícones aprovados, mas uniformizar tamanho/peso. Retirar brilhos decorativos sem função e cores de destaque fora da identidade.
5. Usar fotografias reais da frota e serviços quando disponíveis. Não inventar testemunhos, números ou benefícios.
6. Juntar categorias redundantes como “Tour à medida” e “Tour personalizado”. Mostrar apenas ações com funcionamento completo.

## Ordem recomendada antes da apresentação

1. Corrigir preço de tour, geolocalização, validação e datas; acrescentar testes que reproduzam cada falha.
2. Corrigir botões sem ação, disponibilidade e coerência entre catálogo e pedido.
3. Rever mapa, campos de data/hora, teclado e barra fixa num iPhone real, incluindo scroll e mudança de orientação.
4. Afinar textos e hierarquia visual; ensaiar um percurso completo com dados fictícios claramente identificados.
5. Para operação real, concluir API/persistência, sincronização, autorização e pagamentos; executar testes de ponta a ponta contra esse ambiente.

## Reprodução e alterações desta auditoria

Com servidor local em `127.0.0.1:5173`, executar `node scripts/presentation-audit.mjs` e `node scripts/presentation-probes.mjs`. Geram evidência local em `artifacts/checkup` (não versionada). Os probes demonstram problemas; não são testes de aceitação aprovados.

Os testes browser foram alinhados com WebP, campos inicialmente vazios, barra fixa, título Início, tarifa por distância e seletor móvel de vista. Não foram enfraquecidas as verificações para esconder os problemas de negócio acima: estes são lacunas identificadas fora da cobertura anterior e continuam pendentes.
