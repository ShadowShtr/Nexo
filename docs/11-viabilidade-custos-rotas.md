# 11 — Viabilidade de custo base zero e cálculo rodoviário

Pesquisa em fontes oficiais em 09/09/2026, revista em 15/09/2026. Versão 0.1.2. Preços/quotas podem mudar; verificar novamente antes de contratar/publicar. Nenhuma conta criada, cartão adicionado, API paga ativada ou projeto remoto alterado. Este estudo não é teste de integração autenticada.

## Decisões do utilizador

Supabase escolhido. Vercel é a preferência para o app. Objetivo: reduzir ao máximo custo fixo, idealmente zero. Não substituir host sem decisão informada; a preferência anterior por Sites foi substituída pela instrução explícita de Vercel. Regras aprovadas foram promovidas de hipótese para confirmado em 01-escopo; “dois dias” dos tours é aplicado como 48 horas decorridas.

## Infraestrutura

| Serviço | Viabilidade inicial | Condições |
|---|---|---|
| Supabase Free | Candidato para fase inicial | 500 MB banco, 1 GB ficheiros, 50.000 utilizadores ativos/mês, 5 GB de egress e 5 GB de cached egress; pausa após uma semana inativo. |
| Vercel Hobby | Não serve este lançamento comercial | Plano gratuito limitado a uso pessoal não comercial. |
| Vercel Pro | Compatível com operação comercial, mas não custo zero | Tarifa de plataforma de USD 20/mês, um lugar de deployment incluído; consumo/impostos podem acrescentar custos. |
| Cloudflare Pages/Workers | Alternativa proposta para orçamento zero, ainda não escolhida | Pages para frontend estático; chamadas privilegiadas em backend. Workers Free tem 100.000 pedidos/dia e limite de 10 ms CPU por invocação. Provar runtime/carga e validar condições aplicáveis antes do lançamento. |

Fontes: [Supabase pricing](https://supabase.com/pricing), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel Pro](https://vercel.com/docs/plans/pro-plan), [Cloudflare Pages](https://www.cloudflare.com/products/pages/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Não afirmar que 0 EUR é garantido em produção. Reservas, imagens e logs consomem recursos; notificações, domínio próprio e processamento de pagamentos são rubricas separadas. Não há volumes reais para calcular a fatura mensal. Não ativar planos pagos/overage automaticamente. Supabase Free não oferece a mesma operação/backup do Pro; plano de backup e restauração continua obrigatório antes de produção.

Supabase pode cobrir banco, autenticação e armazenamento inicial. O SMTP de demonstração só envia a endereços autorizados da equipa e é limitado a 2 mensagens/hora; é necessário configurar SMTP adequado para utilizadores reais. Isso não significa que o plano Free proíba email: significa que precisamos de fornecedor de envio próprio, com quota/condições a avaliar em NTF-01. [Documentação SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Como obter o valor por quilómetro

1. Cliente escreve moradas; geocoding converte-as em coordenadas e apresenta resultado para confirmar.
2. Routing calcula o trajeto rodoviário entre recolha, paragens e destino.
3. A resposta fornece distância e duração estimada; o nosso servidor aplica tarifas e guarda o orçamento.

`valorDistanciaCents = roundHalfUp(metrosRodoviarios * tarifaCentsPorKm / 1000)`

Exemplo fictício: API devolve 18.400 m. Tarifa do proprietário 2 EUR/km. Distância custa 36,80 EUR; total pode incluir base, noite e extras. Não existe necessidade de pagar uma API que calcule o preço comercial: essa parte já está implementada em src/domain/pricing.ts.

Medir por estrada exige um motor/dados rodoviários, ainda que o mapa não seja mostrado. Linha reta entre coordenadas não representa o percurso. Quilómetros também não substituem duração: duas rotas com igual distância podem ocupar tempos diferentes no calendário. Manter distância para preço e duração para disponibilidade.

## Opções para rotas

### A — Geoapify: recomendação para o piloto

Free: 3.000 créditos/dia, até 5 pedidos/segundo, sem cartão; FAQ permite projetos comerciais com atribuição visível. Quotas são partilhadas entre os usos da plataforma; não equivalem a 3.000 reservas. [Preços e condições](https://www.geoapify.com/pricing/).

Geocoding e autocomplete custam 1 crédito por pedido; rota custa 1 por par de waypoints, com acréscimos para percursos acima de 500 km; cada tile de mapa custa 0,25 crédito. [Detalhes de créditos](https://www.geoapify.com/pricing-details/).

Routing aceita paragens e devolve distância/tempo. Modelo de tráfego pode ser free_flow ou approximated; este último reduz velocidades em vias potencialmente congestionadas. Não apresentar como trânsito observado em tempo real. [Routing API](https://apidocs.geoapify.com/docs/routing/).

Proposta: começar com routing e pesquisa de endereço no mesmo fornecedor, attribution nos resultados e um adaptador substituível. Testar rotas locais antes de aprovar a qualidade; ainda não houve chamada autenticada nem confirmação de precisão nas zonas do negócio.

### Pesquisa de moradas aplicada no protótipo

Geoapify Address Autocomplete permanece a recomendação para o piloto. Aceita texto parcial, filtro por país, proximidade, locais de interesse, rua e número, além de devolver níveis de confiança. Requer chave; o plano gratuito divulgado em 15/09/2026 inclui 3.000 créditos/dia, até 5 pedidos/segundo e uso comercial limitado com atribuição. A chave do browser deve ficar restrita aos domínios do app; em produção, chamadas sensíveis e limites pertencem ao servidor.

Photon foi ligado como fallback de desenvolvimento sem chave. O projeto é aberto, suporta pesquisa durante a escrita, tolerância a erros e viés por localização. O servidor público é apenas demonstração: aceita uso razoável, pode limitar pedidos, não garante disponibilidade e atualmente só aceita idioma default, `de`, `en` ou `fr`. Para português, o app omite o parâmetro de idioma e conserva os nomes locais.

O Nominatim público não é usado no autocomplete. A política da OpenStreetMap limita o serviço a um pedido por segundo e proíbe autocomplete no cliente. Pode continuar como referência para consultas pontuais próprias ou através de uma instância/fornecedor compatível, mas não como o campo de pesquisa desta aplicação.

Nenhum geocoder consegue enumerar lotes ou portas ausentes da sua fonte. Na verificação da Rua Pedro de Sintra, os dados OpenStreetMap devolveram o arruamento e o código postal, mas não uma lista de lotes. O protótipo preserva `Lote 86`, corrige o nome da rua e ancora o resultado no arruamento, mostrando “ponto aproximado na rua”. Um ponto de recolha exato exigirá resultado por edifício, confirmação manual do pino ou uma fonte cadastral/endereço autorizada; não serão inventados lotes para preencher a lista.

Fontes: [Geoapify autocomplete](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/), [Geoapify pricing](https://www.geoapify.com/pricing/), [Photon](https://github.com/komoot/photon), [política pública Nominatim](https://operations.osmfoundation.org/policies/nominatim/).

### B — Google Routes: alternativa com franquia

Compute Routes Essentials inclui 10.000 eventos mensais sem custo; escalão seguinte é USD 5/1.000. Outros tipos de pedido têm SKU/franquia próprios. Não tratar mapas, autocomplete e cálculo com funcionalidades avançadas como a mesma franquia. [Tabela oficial](https://developers.google.com/maps/billing-and-pricing/pricing).

É alternativa possível, mas requer estudo de faturação, quotas e termos específicos de armazenamento/exibição antes de ligar. Não ativado nesta fase; não é necessário para validar o primeiro motor de orçamento.

### C — Operação manual como contingência

Owner consulta uma rota e introduz quilómetros e duração revistos, com motivo, fonte e autor. Nosso motor calcula o preço. Sem custo adicional de API na aplicação, mas tem trabalho humano e não permite prometer orçamento/disponibilidade imediatos ao público. Não implementado nem escolhido; só oferecer como modo “aguarda revisão”, nunca como resultado automático real.

### D — Motor rodoviário próprio

OSRM é uma opção de motor; operar uma instalação própria envolve processamento de mapas, memória, disco, atualizações e hospedagem. “Código aberto” não significa infraestrutura sem custo. O endpoint de demonstração tem política de uso específica e não será usado como backend comercial sem validação. [Política oficial do servidor de demonstração](https://github.com/Project-OSRM/osrm-backend/wiki/Api-usage-policy).

Openrouteservice e TomTom foram consultados, mas as quotas/condições completas relevantes não ficaram validadas nesta pesquisa. Não usar valores históricos destes fornecedores para decidir o orçamento. Geoapify e Google oferecem informação suficiente para a comparação inicial acima.

## Modelo de consumo proposto

Sem mapa, sem autocomplete repetido e para rota simples abaixo de 500 km: duas pesquisas de morada (2 créditos) + uma rota (1) + deslocação anterior e seguinte (até 2) = 3–5 créditos por consulta, neste exemplo idealizado. 100 consultas/dia consumiriam 300–500 créditos nessas condições. Essa é uma conta de engenharia, não previsão de consumo: pesquisar alternativas, várias datas/recursos e paragens aumenta chamadas.

Contabilizar consultas abandonadas, não só reservas confirmadas. Não calcular uma matriz de todos os carros por todos os horários: o cliente escolhe motorista, reduzindo combinações. Regra de orçamento deve ser de consumo total por fornecedor/conta, não apenas por cliente.

## Controlo de custos a implementar

- Debounce e comprimento mínimo no autocomplete; botão de confirmar morada quando suficiente.
- Recalcular rota apenas quando mudam pontos, sequência, perfil ou opções rodoviárias; mudar passageiros pode só recalcular o preço/capacidade se não mudar carro/perfil.
- Guardar snapshot no orçamento e reutilizar dentro de prazo e termos de licença; não presumir autorização para cache permanente de todos os fornecedores.
- Não guardar nomes/NIF na chave de cache. Não imprimir coordenadas completas/contactos em logs de diagnóstico.
- Chamar fornecedores do servidor, validar inputs, proteger chave e limitar abuso. Chaves públicas de mapas, se necessárias, são separadas e restringidas conforme fornecedor.
- Limitar consultas por sessão/IP/organização e por fornecedor com contador atómico persistente. Alertar antes de esgotar a franquia.
- Proposta de teto interno: 2.400 créditos/dia para Geoapify, deixando margem para operações em curso; reserva atómica de créditos antes da chamada e conciliação do consumo. Isso não garante custo zero se outras apps partilharem a conta.
- Ao atingir teto ou falhar routing: mostrar indisponibilidade do orçamento automático e permitir pedido para revisão manual pelo proprietário, se esse modo for aprovado. Nunca calcular preço fictício pela distância em linha reta.
- Imagens comprimidas e limitadas; sem tracking de localização constante, sem realtime global indiscriminado, listas paginadas e logs com retenção limitada.

## Critérios da prova de rotas antes da integração pública

Validar pelo menos dez rotas representativas na zona real, incluindo aeroporto, centro urbano, portagens, acesso restrito, estrada longa e múltiplas paragens. Conferir ponto de embarque/desembarque, distância, tempo estimado e sentido inverso. Comparar diferenças com uma referência de navegação; o objetivo é adequação operacional, não igualdade exata entre algoritmos.

Testar quota esgotada, timeout, resposta inválida, endereço ambíguo, dupla consulta e alteração de percurso. Medir créditos reais no painel do fornecedor. Chave e zona real do serviço ainda não foram fornecidas; portanto a recomendação é documental, não prova de precisão.

## Próxima escolha necessária

Vercel preferido entra em conflito com custo fixo zero para este app comercial. Alternativas concretas: manter Vercel com Pro ou validar Cloudflare Free como host. Continuar domínio/Supabase independentemente desta escolha, sem criar serviço pago ou trocar host silenciosamente. Geoapify fica como recomendação, ainda não como integração contratada/ativada.
