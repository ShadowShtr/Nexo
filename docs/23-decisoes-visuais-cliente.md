# Decisões visuais do cliente

Consolidado em 16/09/2026 a partir das revisões do utilizador até v0.2.84. Complementa [sistema visual](12-design-system.md), [mapa das abas](13-mapa-visual-abas.md) e [fluxo do cliente](20-entrada-cliente.md). Mudanças abaixo orientam a área do cliente; não redesenhar áreas internas silenciosamente.

## Composição aprovada

- Descobrir é a entrada principal. Marcar viagem é etapa do percurso e não deve reaparecer como aba inicial ou botão duplicado de navegação.
- “Para onde?” e lupa discretos, cinzentos. Desde v0.2.73: barra de 52 px, lupa de 20 px, calendário de 24 px e opção “Mais tarde” de 36 px; sem sombra na barra. Referência visual Uber, não uma medida oficial.
- Categorias em três colunas no telemóvel, cartões compactos; ícones, títulos e descrições centrados.
- Usar os ícones 3D fornecidos, variar entre categorias; sem quadrado de fundo adicional, com sombra suave. Não substituir todos por símbolos cinzentos genéricos.
- O carro ao lado de “Carro disponível” tem fundo livre e sombra leve. Retirar o pequeno símbolo de pessoa ao lado do nome do motorista; a ilustração própria de motorista é outro elemento.
- Pins nos campos de origem/destino menores e proporcionais ao texto.
- Caixas de origem/destino compactas para telemóvel, com altura, padding e raio reduzidos sem perder a área de toque.
- Usar relógio, calendário, pin e carro da coleção nas áreas correspondentes. “Ver rota e preço” usa a imagem de rotas.
- Promoções Lisboa–Sintra e Porto: texto na parte inferior escura do gradiente, legível sobre a foto.
- Separar cartões e ações no final do pedido; hierarquia de referência, estado, percurso, valores, pagamento e ações. Botões não podem ficar colados.
- Pagamento apresenta sinal, instruções MB WAY e WhatsApp para comprovativo após aceitação. Os contactos atuais são fictícios; não inventar contactos reais.
- Calendário 24h com horas indisponíveis ocultas. A data atual e os horários ficam na grelha principal; “Escolher outra data” abre apenas um pop-up compacto próprio de dia, mês e ano, com aspeto arredondado inspirado no iPhone. A seleção de dia aplica o primeiro horário livre dessa data; os horários não se repetem no pop-up.

Referências Uber/Bolt são direção de composição, não medidas/fontes oficiais verificadas. Usar CSS existente como base e validar em largura móvel, sem aumentar arbitrariamente os cartões.

## Coleção versionada

| Uso | Ficheiro em public |
|---|---|
| Carro e veículo maior | vehicle-sedan.png, vehicle-van.png |
| Motorista | driver-illustration.png |
| Localização | location-pin.png |
| Tempo e data | clock.png, calendar.png |
| Rotas e descoberta | route-landmark.png, compass.png |
| Passageiros e bagagem | passengers.png, luggage.png |
| Crianças | child-seat.png |
| Promoções | lisbon-sintra-tour.png, porto-tour.png |

Não depender dos nomes originais “ChatGPT Image…” na pasta Downloads. Estes assets estão no Git. Em novas imagens, guardar o ficheiro final no repositório e documentar origem/licença; conservar THIRD_PARTY_NOTICES.txt.

Em src/web/styles.css, limitar regras de imagem à classe do componente. Um seletor genérico de img no cartão de promoção já causou relógios gigantes a cobrir a foto. Manter width/height, object-fit:contain e flex-shrink adequados nos ícones; usar object-fit:cover apenas nas fotografias destinadas a preencher cartões.

## Revisão antes de concluir uma mudança visual

Verificar 390px e desktop, PT/EN, nomes longos, texto centrado nas categorias, ausência de scroll horizontal, separação entre cartões e botões, ícones com escala consistente e contraste. No calendário, testar data futura e confirmar a mesma data no passo motorista/carro. A aparência nativa do iPhone exige teste no dispositivo/Safari, não apenas viewport reduzido.

