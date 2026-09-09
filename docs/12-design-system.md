# 12 — Sistema visual da plataforma

Versão visual 1, projeto 0.1.2. Direção aprovada pelo utilizador: cinco imagens de referência fornecidas em 09/09/2026. Este documento e os tokens CSS são a fonte de verdade para a implementação das telas. Não representam telas já implementadas.

## 1. O que estamos a reproduzir

Interface clara, monocromática, com fundo cinzento muito suave, cartões brancos arredondados, resumo principal preto, números em destaque, listas compactas e navegação inferior flutuante. A hierarquia depende de tamanho, peso, alinhamento e espaço; a cor serve estados específicos.

Referências, guardadas em design/references:

| Imagem | Padrão observado | Aplicação |
|---|---|---|
| 01-configuracoes.jpeg | Secções com rótulo superior, linhas agrupadas em superfície branca, valores à direita, switch preto | Configurações e edição de perfis |
| 02-analise.jpeg | Cartão preto de resumo, comparação secundária e lista de indicadores | Financeiro/acertos, apenas métricas existentes |
| 03-contas.jpeg | Resumo preto com progresso, cartões de lista com avatar, valor e estado | Reservas, serviços e acertos |
| 04-transacoes.jpeg | Voltar, título, pesquisa, filtros e lista agrupada por data | Histórico de reservas e movimentos |
| 05-inicio.jpeg | Cabeçalho pessoal, resumo preto, secção de atividade e barra inferior | Início do proprietário/motorista |

As molduras dos telemóveis, ilha da câmara, horas/bateria do sistema, barra do simulador, fundo cinzento externo e comandos do Instagram pertencem à apresentação da referência, não ao app. Não reproduzir saldos em reais, categorias de despesas pessoais, nome Caio ou contas fictícias como dados da plataforma. A captura serve como referência visual, não como requisito de funcionalidades adicionais.

## 2. Fidelidade e limites de medição

São capturas comprimidas de um telefone mostrado dentro de outra imagem, não ficheiros de design. Não é possível confirmar fonte, tamanhos CSS, cores exatas ou sombras originais. Todos os números abaixo são especificações de implementação escolhidas para reproduzir a aparência de forma consistente. Não medir o espaço preto do Instagram como margem da aplicação.

A fidelidade visual será validada depois com telas reais, na mesma largura CSS e conteúdo comparável. Imagens de referência são imutáveis; não usar capturas inteiras como background de uma tela.

## 3. Tipografia

Usar a fonte de interface do sistema: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. A aparência da referência é compatível com uma fonte de sistema iOS, mas não está identificada com certeza. Não distribuir ficheiros de fontes Apple nem prometer a mesma família em Windows/Android. Fonte de sistema evita downloads e custo. Se for exigida identidade tipográfica exata entre plataformas, selecionar posteriormente uma família licenciada e repetir a revisão de larguras.

| Uso | Tamanho / altura de linha | Peso | Regra |
|---|---|---|---|
| Valor principal | 40 / 44 px | 700 | Até 48px em áreas largas; pode reduzir para 32px em 320px; nunca cortar valor |
| Título da página | 30 / 36 px | 700 | Espaçamento de letras -0,025em; uma linha quando possível |
| Título de detalhe | 24 / 30 px | 700 | Usado com botão voltar |
| Título de secção | 18 / 24 px | 600 | Alinhado à esquerda; ação secundária à direita |
| Texto e campos | 16 / 24 px | 400 | Labels visíveis; não depender de placeholder |
| Nome na lista / botão | 16 / 22 px | 600 | Nome, destino curto ou ação |
| Metadados e navegação | 14 / 20 px | 400/500 | Datas, estados e informação secundária continuam legíveis |
| Rótulo de grupo | 12 / 16 px | 500 | Maiúsculas, tracking 0,08em; só informação redundante/de organização |

Implementar em rem com raiz padrão 16px; não fixar fonte da raiz de forma a anular preferências do utilizador. Valores financeiros usam `font-variant-numeric: tabular-nums lining-nums`. Formatar com Intl e locale PT/EN, moeda EUR; não inventar separadores. Não colocar todos os textos em semibold: peso 700 destaca apenas o essencial.

## 4. Cores e contraste

| Token | Valor | Uso |
|---|---|---|
| canvas | #F5F5F7 | Fundo geral |
| surface | #FFFFFF | Cartões, listas e formulários |
| surface-muted | #EEEEF0 | Controlos segmentados e áreas secundárias |
| ink | #18181A | Títulos, texto principal, botão primário |
| ink-secondary | #62626A | Datas e descrições sobre fundo claro |
| line | #E5E5EA | Separadores decorativos |
| control-border | #85858F | Delimitação de inputs quando necessária |
| inverse | #FFFFFF | Texto principal no cartão preto |
| inverse-muted | #C2C2C8 | Texto secundário no cartão preto |
| success / background | #176B3A / #EAF5EE | Confirmado, pago, concluído quando aplicável |
| warning / background | #805200 / #FFF3D6 | A aguardar, pendente, prazo próximo |
| danger / background | #B42332 / #FDECEF | Falha, cancelamento, devolução falhada |
| focus | #2459C4 | Anel de foco de teclado; visível apenas quando necessário |

Referências têm textos muito claros e cartões pagos quase apagados. Na plataforma manteremos a linguagem visual com texto secundário legível e estados concluídos ainda consultáveis. Não reduzir opacidade do cartão inteiro para indicar “pago”. Estado tem texto e, quando útil, ícone; nunca apenas vermelho/verde. A conformidade final depende dos pares reais e testes da interface, não apenas desta tabela.

## 5. Espaçamento e geometria

Escala base: 4, 8, 12, 16, 20, 24, 32, 40 e 48px. Exceções precisam de justificação; não criar valores diferentes para cada aba.

- Margem horizontal: 20px no telemóvel; 16px até 359px; 24px em tablet; 32px desktop.
- Cabeçalho → conteúdo principal: 24px. Entre secções: 24–32px.
- Entre cartões da mesma lista: 8px. Entre campos: 16px. Entre label e controlo: 8px.
- Cartão comum: padding 16px, raio 20px. Cartão de destaque: padding 24px, raio 24px.
- Cartão de lista: mínimo 80px, mas altura automática para texto longo. Linhas agrupadas de configuração: mínimo 56px.
- Botão principal: mínimo 48px de altura, padding horizontal 20px, raio 16px.
- Botão circular: alvo 44×44px, ícone 20px. Avatar: 44×44px e raio 14px; foto de pessoa pode ser circular.
- Campo: mínimo 48px, raio 14px. Chips: mínimo 44px de alvo quando interativos; badges informativos podem ser menores.
- Sombras de cartão: `0 6px 18px rgb(20 24 40 / 6%)`. Navegação: `0 10px 28px rgb(20 24 40 / 12%)`.

Evitar bordas pesadas em todos os cartões. Sombra suave separa superfícies sem efeito plástico. Não usar gradientes coloridos, dourado decorativo, vidro exagerado ou sombras diferentes por página. Separadores dentro de grupos começam alinhados com o texto quando houver ícone/avatar à esquerda.

## 6. Composição da tela

Estrutura comum: pequeno contexto opcional → título + ação → resumo ou controlo principal → secções/lista → navegação. Contexto opcional só aparece se acrescentar informação, como data ou saudação.

O cartão preto é um destaque semântico, não obrigatório em todas as telas. Início pode destacar próximo serviço; Financeiro, montante recebido; Acertos, dívida pendente. Configurações, CRM e formulários não precisam de um cartão preto artificial. Preferir um destaque preto por tela para conservar hierarquia.

Cartão preto: rótulo pequeno, valor/título principal, apoio breve e no máximo dois valores secundários. Reservas não são “saldo disponível”. No painel do proprietário, indicar “Recebido pelos motoristas” e “A receber em acertos”, evitando sugerir que dinheiro está na conta do proprietário.

## 7. Navegação por papel

Telemóvel proprietário: **Início, Agenda, Reservas, Mais**. Mais abre Clientes, Motoristas, Veículos, Pacotes, Financeiro, Acertos e Configurações. Todas as abas continuam acessíveis; não comprimir onze ícones na barra.

Telemóvel parceiro: **Início, Serviços, Disponibilidade, Ganhos**; Perfil acessível no cabeçalho/área secundária. Cliente usa fluxo com voltar, etapa e resumo; consulta de reserva tem ações próprias, sem menu administrativo.

Barra inferior: pílula clara translúcida, margem lateral 16px, padding 6px, raio 32px e conteúdo mínimo 56px. Item ativo recebe pílula branca, texto escuro e peso 600; inativos em cinzento legível. Ícone outline 20px e rótulo; a geometria da referência é preservada, mas em larguras pequenas ícone pode ficar acima do texto. Nenhum rótulo escondido por abreviação ambígua.

Usar `aria-current="page"` em links ativos. Reservar espaço no conteúdo para barra + safe area. Footer de pagamento e barra de navegação não competem: no checkout usar apenas ação/resumo inferior. Formulário com teclado aberto adapta barra/CTA e mantém campo focado visível. Safe area vem do browser/SO; não desenhar status bar falsa.

Desktop >=1024px: menu lateral de 240px com acesso direto a todas as abas autorizadas, conteúdo máximo 1200px e painéis lado a lado onde útil. Preservar cores, raios e escala tipográfica. Não ampliar uma tela de iPhone para preencher monitor.

## 8. Componentes reutilizáveis

| Componente planeado | Contrato visual e comportamento |
|---|---|
| PageHeader | contexto opcional, título, voltar opcional, ações curtas; foco/ordem consistentes |
| SummaryCard | tema escuro, conteúdo variável, valor sem corte, texto auxiliar legível |
| SectionHeader | título + ação textual; nenhuma ação sem rótulo acessível |
| RecordCard | avatar/ícone, título, metadados, valor/estado; layout de duas colunas que empilha quando necessário |
| SettingsGroup/Row | legenda externa, superfície branca única, separadores internos, valor alinhado à direita |
| StatusBadge | texto + cores semânticas; mapa separado para reserva/pagamento/acerto |
| SearchField/FilterChip | pesquisa branca discreta, filtros compactos; estado selecionado e botão limpar |
| MoneyValue | formatação Intl, números tabulares, sinal e moeda; sem truncamento |
| BottomNav/SideNav | mesmo modelo de destinos por papel, apresentação responsiva |
| ActionButton | primary preto, secondary branco, danger explícito; pending impede duplo envio |
| FormField | label persistente, controlo, ajuda e erro associado; unidade fora do valor editável |
| ConfirmationDialog | ação, consequência e valores claros; botão cancelar e ação explícita |
| DetailSheet | detalhe em painel lateral no desktop, modal/folha no mobile; foco devolvido ao gatilho |
| EmptyState/LoadingState | explicação curta/ação real; skeleton mantém estrutura, sem valores fictícios |

São contratos, não componentes React já implementados. Quando BAS-04 iniciar, implementar em src/ui/components e consumir tokens de src/ui/styles/tokens.css. Evitar CSS global de input/button que quebre componentes externos; classes com prefixo pm-. Reutilizar biblioteca acessível adotada no scaffold para dialog/select/switch.

## 9. Estados e interações

Hover desktop: leve mudança de superfície; não mover o cartão. Pressionado: tom um pouco mais escuro, sem animação que atrase ação. Foco: anel externo 2px com offset 3px. Desabilitado: motivo próximo quando relevante, contraste suficiente da explicação, atributo disabled/aria-disabled coerente. Loading não apaga o texto da ação nem confirma operação.

Movimento: 160ms para cor/opacidade; até 220ms para abrir painel. Respeitar prefers-reduced-motion. Toast é confirmação auxiliar; erro persistente ou alteração financeira fica também na própria tela. Não copiar notificação de sistema que aparece sobre a captura de Configurações: usar feedback interno da aplicação.

## 10. Calendário no mesmo estilo

Cabeçalho com data, voltar/avançar e seletor Dia/Semana/Mês em pílula. Controlos sobre fundo claro; grade dentro de superfície branca. Hora selecionada preta; eventos brancos/cinza com título, hora e badge. Cor não identifica sozinha estado/motorista.

Linhas visuais a cada 60 min; precisão interna em minutos. Base proposta: 80px por hora; posição = minutos desde início visível × 80/60. Altura de evento = duração real × 80/60. Compromissos curtos mantêm alvo interativo acessível através de botão de detalhe/lista, sem aumentar artificialmente o intervalo bloqueado.

Margem de 60 min ou maior aparece em faixa cinzenta com texto “Deslocação e margem”; não parecer horário livre. A margem vem do motor `max(60, deslocação+15)`, não de CSS. Mobile privilegia lista do dia com seletor de data e horários; semana com várias colunas pode rolar dentro da região do calendário, sem causar scroll horizontal na página toda.

## 11. Português/inglês e responsividade

Suportar 320, 375, 390, 430, 768, 1024 e 1440px como larguras de validação. São critérios de teste, não promessa de QA já feita. À escala de texto 200%, caixas crescem, valores empilham e labels quebram; não esconder elementos essenciais. Testar “Disponibilidade”, “Configurações”, “Disponibilidade do veículo” e traduções longas.

Valores, moradas e nomes não têm altura fixa. Moradas completas disponíveis no detalhe; resumo pode usar uma linha curta com localidade, sem cortar o conteúdo usado para navegar. Texto inglês mantém mesma hierarquia e não herda strings portuguesas por falta de tradução.

## 12. Regras para futuras implementações

1. Ler este guia, mapa de abas e tarefa funcional.
2. Escolher componentes partilhados antes de criar estilo local.
3. Importar tokens; nunca espalhar valores de cor/raio/sombra pelas páginas.
4. Implementar dados vazios, loading, erro, sucesso e restrições de papel.
5. Rever a mesma tela em PT/EN, mobile/desktop, teclado e zoom.
6. Comparar proporções com a referência, separando diferenças deliberadas de desvios.
7. Registar alterações visuais em changelog; mudança geral altera token, não onze cópias de CSS.

Critério final: páginas diferentes devem parecer da mesma aplicação, mas usar a organização necessária à tarefa. A UI não altera cálculo, pagamento, política ou permissão para caber num cartão.
