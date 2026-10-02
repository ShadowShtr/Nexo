# Checkup para apresentação — 02/10/2026

## Decisão

### Correção v0.2.92 — 02/10/2026

As quatro falhas reproduzidas na revisão abaixo foram corrigidas:

- Motorista sem carro: seleção mostra indisponibilidade, bloqueia avanço e permite escolher outro motorista, sem erro de renderização.
- Capacidade manual: o orçamento só é calculado com capacidade válida; excesso de passageiros impede guardar e a escolha de carro maior recupera o formulário.
- Antecedência: planeador e envio final usam a regra de horas decorridas. Tour de 168 horas rejeita 167 horas e aceita exatamente 168; 49 horas preservam o primeiro dia realmente elegível.
- Horário de inverno: cliente, Marcações e Agenda usam a mesma conversão dos dados iniciais para UTC com Europe/Lisbon. TEST-001 mantém 09:00 em setembro e novembro.

Validação e comandos desta correção estão em [evidência](10-validacao.md). Operação real, backend e iPhone físico continuam fora da validação. As conclusões v0.2.91 abaixo são históricas.

### Revisão independente do commit 18a030b — 02/10/2026

**Resultado histórico da revisão v0.2.91: correção incompleta.** As quatro falhas foram reproduzidas nessa revisão; a resolução posterior está registada acima em v0.2.92.

| Prioridade | Caso reproduzido | Causa e localização |
|---|---|---|
| P1 | Adicionar um motorista ativo sem carro associado e selecioná-lo no pedido do cliente deixa a página em branco: `Cannot read properties of undefined (reading 'capacity')`. | `CustomerSandbox.tsx:254` guarda `-1` quando não encontra carro; a renderização em `CustomerSandbox.tsx:122` acede a `cars[car].capacity`. A integração nova do catálogo expõe este estado normal. |
| P1 | Tour com antecedência de 168 horas aceita pedido com apenas 160 horas: relógio 10/11/2026 08:00, reserva 17/11/2026 00:00. O pedido fica guardado sem alerta. | `CustomerDiscoverSandbox.tsx:458` arredonda a antecedência para dias; `CustomerSandbox.tsx:182` valida apenas a antecedência padrão, ignorando `handoff.tour.minimumNoticeHours`. Aplicar o mesmo limite por instante na pesquisa e confirmação. |
| P1 | Na marcação manual, escolher seis passageiros enquanto o carro selecionado tem quatro lugares deixa a página em branco: `Capacidade insuficiente`. | `BookingSandbox.tsx:206` chama `quote` durante a renderização sem tratar o erro de capacidade. Falha preexistente que continua após a correção. |
| P2 | Com `demoDate=2026-11-10`, TEST-001 aparece às 08:00 em Marcações e às 09:00 na Agenda de 11/11. | `BookingSandbox.tsx:27` conserva `+01:00` fixo nas reservas iniciais, embora as datas agora sejam dinâmicas. Converter também estas datas com Europe/Lisbon. |

Evidência: quatro casos executados em contextos Edge isolados, idioma pt-PT, servidor local 5175 e dados fictícios; resultados locais em `artifacts/review-luna.json`. Os dois erros de renderização deixam o corpo da página vazio. A reserva com antecedência insuficiente foi confirmada em localStorage. `npm run check` aprovou 90 testes e a documentação; build aprovado com o aviso de tamanho já conhecido. A nova execução da suíte browser registou os 42 cenários aprovados, mas o processo ainda não encerrou; o término da execução não está confirmado. Estes casos adicionais mostram lacunas dessa cobertura. Sem alteração funcional, push ou deploy nesta revisão.

### Conclusão original v0.2.91

**Adequado para demonstração guiada após as correções v0.2.91; não aprovado para operação real.** As falhas reproduzidas nesta revisão foram corrigidas nos fluxos demo e cobertas por testes. A versão real continua sem API/persistência ligada às páginas, pagamentos ou operação entre dispositivos.

Linha base: v0.2.90, commit `ef10050`, branch `main`, sincronizada com `nexo/main` antes desta revisão. Alterações v0.2.91 ainda locais neste momento. A página pública respondeu HTTP 200. Não foram auditadas políticas, dados ou credenciais do Supabase remoto.

## Evidência executada

| Verificação | Resultado |
|---|---|
| Regras unitárias | 90 testes aprovados; incluindo NIF, contactos, preços, antecedência e calendário |
| PostgreSQL isolado | 11 testes aprovados na auditoria base; não repetidos nesta correção, que não alterou servidor nem migrações |
| Supabase local | 13 testes aprovados na auditoria base; não repetidos nesta correção |
| Autenticação pela interface | Login/logout e restrições de motorista aprovados na auditoria base; não repetidos |
| Build | TypeScript e Vite aprovados. Entrada principal: 504,21 KB (156,43 KB gzip), abaixo da linha base de 663 KB (199 KB gzip); permanece aviso acima de 500 KB |
| Browser funcional | 42 testes aprovados no Edge/Chromium, incluindo preços de tours, moradas Leiria, validação, geolocalização demo, pagamentos fictícios removidos, catálogo, reservas e navegação móvel |
| Varredura visual | 280 combinações aprovadas após as correções; sem erros JS, overflow horizontal, barra móvel ausente, campos pequenos ou imagens partidas |

Ambiente: Windows, Edge/Chromium automatizado e dados fictícios. Os testes de PostgreSQL/Supabase e a autenticação UI são evidência da linha base; não houve alterações nessas integrações. **Não houve teste em iPhone físico, Safari/WebKit, pagamento real, notificações ou operação entre dispositivos.** Pesquisas externas e rotas não garantem precisão para qualquer morada. A varredura avalia dimensões e estados simples, não todos os estados de cada página.

## Falhas da linha base e estado após correção

| Prioridade | Constatação reproduzida na linha base | Resultado v0.2.91 |
|---|---|---|
| Alta | O tour do catálogo custava **345 €**, mas o planeador mostrava **200 €**. | **Corrigido na demo.** Identidade, preço, duração e antecedência do pacote seguem no handoff. Teste catálogo → orçamento aprovado. |
| Alta | Reservas e configurações da interface usam localStorage/sessionStorage, sem persistência partilhada. | **Pendente para operação real.** Nada nesta revisão liga as páginas à API/Supabase; a demo funciona só neste navegador. |
| Alta | Geolocalização ignorava coordenadas concedidas. | **Corrigido na demo.** Coordenadas do dispositivo passam à origem e à pré-visualização. A linha de rota continua ilustrativa; o adaptador rodoviário não está ligado ao fluxo. |
| Alta | Nome vazio, telefone inválido e NIF inválido passavam ao resumo. | **Corrigido no formulário e contrato partilhado.** Erros por campo, telefone normalizado e checksum do NIF; API real ainda não está ligada. |
| Alta | Relógio fixo de setembro e viagens antigas apareciam como próximas. | **Corrigido na demo.** Relógio comum Europe/Lisbon, cenários dinâmicos e filtro/ordenação de viagens futuras. |
| Alta | Recursos em reservas eram listas fixas, independentes do catálogo. | **Corrigido na demo.** Agenda, reserva manual e cliente leem o catálogo local partilhado e filtram recursos inativos; sincronização de servidor permanece pendente. |
| Alta | Pacote de dois dias era validado como duração curta da rota. | **Corrigido na demo.** A disponibilidade considera a duração integral e a antecedência configurada; teste de conflito e preço passou. |
| Média | Atalhos do proprietário não tinham ação. | **Corrigido.** Perfil abre configurações; atalhos e navegação ligam a páginas funcionais. |
| Média | Texto da tarifa contradizia o cálculo. | **Corrigido.** O texto usa a tarifa de demonstração guardada. |
| Média | “Faturação hoje” apresentava estimativas como receita recebida. | **Corrigido.** O indicador chama-se “valor estimado”; não afirma recebimento. |
| Média | Agenda não mostrava a janela completa de 24 horas. | **Corrigido.** Grelhas do proprietário e horários do cliente cobrem 00:00–24:00. |
| Média | Campos móveis de configuração podiam ficar abaixo de 16 px. | **Corrigido no CSS e coberto na varredura mobile.** Safari e zoom de texto em dispositivo real continuam por verificar. |
| Média | Atualização Leaflet usava temporizadores e animações com ciclo de vida frágil. | **Mitigado.** Atualização agendada em `requestAnimationFrame`, cancelamento no unmount e animações desligadas. Teste automatizado não substitui reprodução em iPhone. |
| Média | Pesquisa como “Leiria praia” não mostrava praias próximas. | **Corrigido na demo.** Sugestões locais encontram Praia do Pedrógão e Praia da Vieira; teste browser aprovado. |
| Média | O resumo indicava número fictício e envio por WhatsApp como se fosse ação real. | **Corrigido.** Número/link removidos; confirmação diz que o pedido fica só nesta sessão, sem pagamento nem envio. |

`?demo=1` continua a ser uma entrada pública de demonstração sem autenticação; manter apenas dados fictícios. Pagamento, envio de mensagens e sincronização multiutilizador não existem. Não usar esta URL como área operacional privada.

Referências principais: [planeador](../src/web/pages/CustomerDiscoverSandbox.tsx), [pedido](../src/web/pages/CustomerSandbox.tsx), [início do proprietário](../src/web/pages/OwnerHomeSandbox.tsx), [agenda](../src/web/pages/CalendarSandbox.tsx), [mapa](../src/web/components/RouteMap.tsx), [controlo de acesso](../src/web/auth/AuthGate.tsx).

## Estrutura e desempenho

Há boa separação em domínio, casos de uso, contratos e infraestrutura, com testes financeiros e de concorrência úteis. A distância entre essa base e as páginas `Sandbox` continua: tarifas, recursos e pedidos da interface são apenas locais. Priorizar integração da API e autorização antes de acrescentar páginas.

O planeador concentra lógica e JSX extenso num único ficheiro. CSS global acumula regras móveis contraditórias e correções com `!important`. Extrair formulário, pesquisa, orçamento e calendário em componentes pequenos, centralizar relógio/configuração e remover regras substituídas reduz regressões.

Os 26 PNG de origem somam cerca de 22,6 MB; os 26 WebP correspondentes, 430 KB: redução aproximada de 98%. A entrada JavaScript caiu de 663 KB (199 KB gzip) para 504 KB (156 KB gzip); páginas, mapa e calendário são carregados sob demanda. O build ainda avisa que a entrada passa o limite de 500 KB. Não foi medido carregamento numa rede móvel nem num telemóvel físico.

## Linguagem e identidade

O cliente agora usa a ação “Planeie a sua viagem”, há menos categorias repetidas e o painel do proprietário evita saudação pessoal inventada e confusão entre estimativas e dinheiro recebido. Para diferenciar mais a marca, ainda faltam fotografias próprias, copy final aprovada e revisão visual com o proprietário. Não foram inventados testemunhos ou benefícios.

## Pendências antes de operação real

1. Ligar as páginas à API/Supabase com autorização, persistência e disponibilidade transacional; validar concorrência em dois dispositivos.
2. Ligar rotas rodoviárias e geocodificação de produção; manter claras as estimativas enquanto forem demonstrativas.
3. Configurar pagamentos e notificações reais só depois das decisões comerciais e credenciais aprovadas.
4. Repetir o percurso em iPhone/Safari, com teclado, zoom de texto, orientação, barra inferior e mapa.
5. Para uma apresentação visual final, usar fotografias e texto aprovados da marca. O teste atual cobre comportamento demo, não uma operação real.

## Reprodução e alterações desta revisão

Com o servidor local ativo em `127.0.0.1:5173`, executar `node scripts/presentation-audit.mjs` para as 280 combinações visuais (20 rotas × 7 larguras × 2 idiomas). A evidência é gerada em `artifacts/checkup` e não é versionada. `scripts/presentation-probes.mjs` é a reprodução histórica das falhas da linha base; não é uma suite de aceitação atual.

Esta revisão alterou os fluxos demo e adicionou testes para preço, NIF/contactos, permissões de localização, moradas de Leiria, disponibilidade por duração do tour e navegação móvel com formulário aberto. Os testes não transformam a demo numa operação ligada ao backend.
