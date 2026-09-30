# 7METERS - AUDITORIA INTEGRAL BOTÃO A BOTÃO E FUNÇÃO A FUNÇÃO
## Manual Operacional de Utilizador, Permissões, Restrições e Engenharia de Menus

Este documento disseca a totalidade da aplicação **7meters (Andebol Manager Estilo Elifoot)** ao nível mais granular e microscópico possível: cada botão, cada menu, cada comutador (*toggle*), cada modal, cada cálculo determinístico, o que o utilizador consegue ou não fazer, e onde o código intervém em cada clique.

---

# ÍNDICE GERAL DA AUDITORIA

1. **PERFIS DE UTILIZADOR E NÍVEIS DE ACESSO (PERMISSÕES)**
   - 1.1 Utilizador Treinador / Humano (Jogador Padrão)
   - 1.2 Utilizador Visitante / Modo Convidado (Offline / LocalStorage)
   - 1.3 Administrador Master (`rochap.filipe@gmail.com`)
2. **BARRA DE NAVEGAÇÃO SUPERIOR (TOP BAR & CONTROLOS GLOBAIS)**
   - Botão a Botão, Ação a Ação, Requisitos e Efeitos no Sistema
3. **ECRÃ 1: VISÃO GERAL (DASHBOARD & OPERAÇÕES DO CLUBE)**
   - Componente a Componente e Botão a Botão
4. **ECRÃ 2: PARTIDA AO VIVO (MATCH CENTER & SIMULAÇÃO 60 MINUTOS)**
   - Placard, Controlos de Velocidade, Time-Out, Substituições em Direto e Súmula
5. **ECRÃ 3: GESTÃO DO PLANTEL E CONTRATOS (SQUAD & MOLECULAR VIEW)**
   - Filtros, Ficha de Jogador, Radares, Renovação, Venda e Rescisão
6. **ECRÃ 4: PRANCHETA TÁTICA (CAMPO TARAFLEX 40X20M & 7 INICIAL)**
   - Nós de Posição, Gaveta Lateral, Defesas 6:0/5:1/3:3/4:2, Ritmo e 7vs6
7. **ECRÃ 5: MERCADO DE TRANSFERÊNCIAS (CLUBES, LIVRES E VENDAS)**
   - Propostas de Compra, Contratação a Custo Zero e Venda de Atletas
8. **ECRÃ 6: PAVILHÃO, TREINOS, ACADEMIA E SAÚDE (FACILITIES & CLUB)**
   - Expansão de Bancadas, Preço de Bilheteira, 4 Treinos Semanais, Juniores e Médico
9. **ECRÃ 7: CLASSIFICAÇÃO DA LIGA (PONTUAÇÃO OFICIAL DE ANDEBOL)**
   - Tabela, Critérios de Desempate, Zonas Europeias e Descida
10. **MODAIS SECUNDÁRIOS E DIÁLOGOS DE SISTEMA**
    - 10.1 Modal de Empréstimos Bancários (Crédito BCP)
    - 10.2 Modal de Patrocinadores Comerciais & Misteriosos
    - 10.3 Modal de Agendamento Multijogador
    - 10.4 Wizard de Fundação do Clube (Criação Inicial)
    - 10.5 Painel de Administração Central (Admin Matrix)
    - 10.6 Ecrã de Despedimento Imediato (Game Over)
11. **MATRIZ COMPORTAMENTAL: O QUE O UTILIZADOR CONSEGUE vs NÃO CONSEGUE FAZER**
12. **CATÁLOGO DE DECISÃO: O QUE EDITAR, RETIRAR OU ACRESCENTAR**

---

# 1. PERFIS DE UTILIZADOR E NÍVEIS DE ACESSO

### 1.1 Utilizador Treinador (Jogador Padrão)
* **O que Consegue Fazer:**
  * Fundar o clube, escolher cores do equipamento (entre 1.000 padrões), designar o nome do pavilhão e definir o nome do treinador.
  * Escalar livremente o 7 inicial e os suplentes no campo Taraflex.
  * Definir e alternar táticas defensivas (6:0, 5:1, 3:3, 4:2), ritmos ofensivos e o sistema 7vs6.
  * Jogar jornadas da liga com transmissão minuto a minuto ou simulação rápida.
  * Pedir Time-Outs (2 por jogo) e dar instruções de balneário.
  * Efetuar substituições em tempo real durante a partida ao vivo.
  * Treinar a equipa semanalmente com 4 focos distintos.
  * Fazer propostas por jogadores de outros clubes, contratar atletas livres ou vender os seus jogadores.
  * Renovar contratos pagando prémios de assinatura ou rescindir contratos pagando indemnizações.
  * Realizar obras de ampliação no pavilhão (+500 lugares) e alterar o preço dos bilhetes.
  * Investir na Academia de Juniores e promover jovens à equipa principal.
  * Pedir empréstimos bancários (Crédito BCP) e assinar patrocínios comerciais.
  * Acelerar a recuperação de jogadores lesionados no Departamento Médico.
* **O que NÃO Consegue Fazer:**
  * Não consegue alterar as probabilidades matemáticas do motor nem forçar vitórias automáticas.
  * Não consegue injetar dinheiro artificialmente sem contrair empréstimo bancário regular.
  * Não consegue aceder à Matriz Central de Regras (Admin Matrix).
  * Não consegue evitar o despedimento se o termómetro da direção chegar a 0%.

### 1.2 Utilizador Visitante / Modo Convidado (Offline / LocalStorage)
* **O que Consegue Fazer:** Todas as funções desportivas e financeiras acima descritas, guardadas no armazenamento local (`localStorage`) do navegador.
* **O que NÃO Consegue Fazer:** Não sincroniza o progresso entre diferentes dispositivos se limpar os cookies/cache sem ter conta na cloud.

### 1.3 Administrador Master (`rochap.filipe@gmail.com`)
* Identificado automaticamente pelo sistema via e-mail configurado em `GAME_CONFIG.ADMIN_EMAIL`.
* **Capacidades Exclusivas:**
  * Exibe uma badge especial vermelha no topo: `"ADMIN MASTER"`.
  * Acesso ao modal **Admin Matrix** para calibração de coeficientes globais (taxa do BCP, eficácia de contra-ataque, probabilidades de ferros/postes).
  * Acesso ao botão de **Injeção de Fundos de Emergência** (`injectAdminFunds`) para fins de teste de liquidez.

---

# 2. BARRA DE NAVEGAÇÃO SUPERIOR (TOP BAR & CONTROLOS GLOBAIS)

Localizada no cabeçalho fixo da aplicação (`src/pages/Dashboard.tsx`).

### [Botão 1] Logótipo Interativo "7METERS"
* **Local:** Canto superior esquerdo.
* **Ação Técnica:** `setActiveTab('overview')`.
* **O que faz:** Retorna instantaneamente o utilizador ao ecrã inicial (Visão Geral), mantendo todos os dados do clube intactos.
* **Quando está ativo:** Sempre clicável.

### [Elemento 2] Identificador do Clube & Cores
* **Local:** Ao lado do logótipo.
* **Exibe:** Emblema em miniatura com as cores oficiais do clube, nome do clube (ex.: *ABC Braga*) e série competitiva (*Série Norte*).
* **Interatividade:** Puramente informativo.

### [Elemento 3] Indicador de Saldo Bancário
* **Local:** Barra central-direita.
* **Exibe:** O saldo da tesouraria do clube formatado (ex.: `€1.425.000`).
* **Comportamento Dinâmico:** Se o saldo for positivo, surge a verde/branco; se estiver em risco ou negativo, alerta a vermelho.

### [Elemento 4] Termómetro da Presidência
* **Local:** Ao lado do saldo bancário.
* **Exibe:** A percentagem de confiança da direção (de 0% a 100%).
* **Cores de Alerta:**
  * `Verde (>60%)`: Direção muito satisfeita com o projeto.
  * `Amarelo (31-60%)`: Sob aviso de resultados.
  * `Vermelho (<=30%)`: Risco iminente de despedimento. Se bater nos 0%, abre imediatamente o ecrã de rescisão por justa causa (Game Over).

### [Botão 5] Botão "Avançar Semana"
* **Local:** Canto superior direito (botão escuro com moldura de zinco).
* **Ação Técnica:** Desencadeia a função global `advanceToNextWeek()` no store `useGameStore`.
* **Efeitos no Sistema em Cadeia:**
  1. *Finanças:* Deduz a totalidade da folha salarial semanal (`userSquad.wage`) e debita a prestação dos empréstimos ativos do Crédito BCP.
  2. *Receitas:* Credita $+€25.000$ em receitas comerciais de patrocinadores.
  3. *Treinos:* Aplica o efeito do treino semanal selecionado:
     - Se `recuperacao_fisica`: recupera $+30\%$ de energia a todos os jogadores.
     - Se `remate_exterior`: consome $-8\%$ de energia e dá $40\%$ de probabilidade a jovens ($\le 22$ anos) e $20\%$ a seniores de subir $+1$ em Remate e $+1$ em OVR.
     - Se `defesa_coletiva`: consome $-5\%$ de energia e dá a mesma probabilidade de subida em Desarme e OVR.
     - Se `aceleracao_tatica`: consome $-18\%$ de energia e dá subida na Estamina e OVR.
  4. *Departamento Médico:* Abate 7 dias a todas as lesões ativas. Se os dias restantes chegarem a zero, o atleta fica clinicamente apto.
  5. *Calendário:* Incrementa `currentWeek` em $+1$.
  6. *Transição de Época:* Se a semana ultrapassar a 22ª jornada, ativa o ciclo de envelhecimento (+1 ano a todos os jogadores), regride os atletas com mais de 35 anos, reformar atletas com 39 anos e gera 3 novos juniores na Academia.
* **Feedback ao Utilizador:** Notificação de confirmação e atualização instantânea de todas as variáveis no ecrã.

### [Botão 6] Botão "Jogar Jornada"
* **Local:** Canto superior direito, destacado a cor âmbar dourada com ícone de apito.
* **Ação Técnica:** `setActiveTab('match')`.
* **O que faz:** Abre imediatamente o separador da **Partida ao Vivo** contra o adversário da jornada atual da liga.
* **Quando está ativo:** Sempre que o utilizador pretender simular ou acompanhar a partida.

### [Botão 7] Botão "Autenticação / Perfil"
* **Local:** Canto superior direito (ícone de utilizador).
* **Ação Técnica:** `setIsAuthModalOpen(true)`.
* **O que faz:** Abre o modal de autenticação com campos de e-mail e palavra-passe, permitindo:
  - Guardar o progresso na base de dados Cloud (Firebase).
  - Terminar sessão (`logout()`).
  - Reconhecer privilégios de Admin se o login for `rochap.filipe@gmail.com`.

### [Botão 8] Botão "Instalar App (PWA)"
* **Local:** Canto superior direito (visível em browsers compatíveis com Progressive Web Apps).
* **Ação Técnica:** Dispara o evento de instalação nativa do sistema operativo (`beforeinstallprompt`).
* **O que faz:** Instala o 7meters como uma aplicação autónoma no ecrã principal do telemóvel (Android/iOS) ou no computador (Chrome/Edge/macOS) sem barra de navegação de browser e com suporte a funcionamento offline.

### [Barra 9] Separadores de Navegação (7 Abas)
* Conjunto de 7 botões horizontais com ícone e texto:
  1. `Visão Geral` (`id: 'overview'`, ícone `📊`)
  2. `Partida ao Vivo` (`id: 'match'`, ícone `🤾`, com crachá *Matchday*)
  3. `Plantel & Atletas` (`id: 'squad'`, ícone `👥`)
  4. `Tática & 7 Inicial` (`id: 'tactics'`, ícone `📋`)
  5. `Transferências` (`id: 'market'`, ícone `🏪`)
  6. `Pavilhão & Clube` (`id: 'facilities'`, ícone `🏟️`)
  7. `Classificação` (`id: 'league'`, ícone `🏆`)
* **Ação:** Comutam a variável `activeTab`, alterando o ecrã renderizado sem recarregar a página.

---

# 3. ECRÃ 1: VISÃO GERAL (DASHBOARD & OPERAÇÕES DO CLUBE)

Renderizado através de `src/pages/Dashboard.tsx`.

### [Componente 1.1] Hero Card de Matchday (Topo)
* **Imagem de Fundo:** Render 3D de alta definição gerado por IA com vista imersiva do interior do pavilhão desportivo com piso Taraflex e bancadas cheias.
* **Identificação da Jornada:** Indica a jornada atual (ex.: `Jornada 4 de 22 · Andebol 1`).
* **Duelo Central:** Logótipo e nome da equipa da Casa vs Fora com os respetivos OVRs médios comparativos.
* **[Botão 1.1.1] "Ajustar Tática":**
  * *Ação:* Executa `setActiveTab('tactics')`.
  * *O que faz:* Leva o treinador à prancheta tática para alinhar o 7 inicial antes de apitar para o início da partida.
* **[Botão 1.1.2] "🎮 Jogar Partida ao Vivo":**
  * *Ação:* Executa `setActiveTab('match')`.
  * *O que faz:* Inicia imediatamente o ambiente de transmissão da partida em direto.

### [Componente 1.2] Grelha de KPIs Principais (4 Cartões Modernos)
* **Card 1: Orçamento:**
  * Exibe saldo em tesouraria e o valor da folha salarial semanal.
* **Card 2: Confiança da Direção:**
  * Exibe percentagem exata e uma barra de progresso colorida.
* **Card 3: Força Média da Equipa:**
  * Apresenta o OVR ponderado dos titulares e a energia média física do grupo.
* **Card 4: Regime de Treino Semanal:**
  * **[Seletor Dropdown]:** Permite escolher entre 4 opções com gravação imediata no store (`setTrainingFocus`):
    - `💤 Descanso Total (100% Energia)`
    - `🎯 Finalização & GR (+Remate)`
    - `🛡️ Foco Tático (+Defesa)`
    - `⚡ Carga Física (+Estamina)`

### [Componente 1.3] Painel de Titulares (Sete Inicial Recomendado)
* Exibe a lista dos 7 atletas que vão entrar em campo com número de camisola, nome, idade, salário semanal, barra de energia e crachá dourado de OVR.
* **[Botão 1.3.1] "Ver Todo o Plantel (N) →":**
  * *Ação:* `setActiveTab('squad')`.
  * *O que faz:* Abre a lista exaustiva de todos os atletas do clube.

### [Componente 1.4] Painel do Pavilhão Oficial
* Apresenta uma foto miniatura da arena, lotação máxima em lugares sentados, preço atual do bilhete e receita estimada por jogo caseiro.
* **[Botão 1.4.1] "Obras & Expansão de Bancadas →":**
  * *Ação:* `setActiveTab('facilities')`.
  * *O que faz:* Leva diretamente ao ecrã de contratação de obras de ampliação do pavilhão.

### [Componente 1.5] Painel de Serviços Financeiros Rápidos
* **[Botão 1.5.1] "🏦 Crédito BCP":**
  * *Ação:* Abre o modal `BankLoanModal`.
  * *O que faz:* Permite negociar e contrair empréstimos com o banco parceiro oficial.
* **[Botão 1.5.2] "🤝 Patrocínios":**
  * *Ação:* Abre o modal `MysterySponsorModal`.
  * *O que faz:* Permite analisar e assinar propostas de patrocinadores com injeção de capital semanal.

---

# 4. ECRÃ 2: PARTIDA AO VIVO (MATCH CENTER & SIMULAÇÃO 60 MINUTOS)

Implementado no componente `src/components/match/MatchLiveViewer.tsx`.

### [Componente 2.1] Placard LED Central
* **Dígitos de Golos:** Marcador gigante para Casa e Fora atualizado em tempo real a cada golo assinalado.
* **Relógio Oficial:** Conta de **00' a 60'** minuto a minuto.
  * `0'-29'`: 1ª Parte do jogo.
  * `30'`: Pausa obrigatória de **INTERVALO** com narrativa especial de recolha aos balneários.
  * `31'-59'`: 2ª Parte do jogo.
  * `60'`: **APITO FINAL** com narrativa de consagração e festa dos adeptos.

### [Componente 2.2] Barra de Controlo Temporal da Transmissão
* **[Botão 2.2.1] Play / Pausa (▶ / ⏸):**
  * *Ação:* Alterna a variável de estado `isPlaying` entre `true` e `false`.
  * *O que faz:* Pára o relógio a qualquer segundo para permitir ao treinador analisar estatísticas, fazer substituições ou pedir desconto de tempo.
* **[Botões 2.2.2] Velocidade (1x / 2x / 5x):**
  * *Ação:* Altera a cadência do relógio entre 1200ms (1x - narrativa detalhada), 600ms (2x - ritmo intermédio) e 200ms (5x - simulação rápida).
* **[Botão 2.2.3] "⚡ Simulação Instantânea":**
  * *Ação:* Executa `handleInstantSimulate()`.
  * *O que faz:* Avança imediatamente o motor até ao minuto 60', calcula todos os lances pendentes e apresenta o resultado final sem esperas.
* **[Botão 2.2.4] "Time-Out Técnico" (Restam X/2):**
  * *Condição:* Desativa-se se os 2 descontos de tempo se esgotarem ou após o minuto 60'.
  * *Ação:* Pausa o jogo imediatamente (`isPlaying = false`) e abre o **Modal de Time-Out Técnico**.

### [Componente 2.3] Modal de Time-Out Técnico (Decisões de Urgência)
Quando o treinador pede Time-Out, tem à escolha 3 ações imediatas:
* **[Ação 2.3.1] "🗣️ Dar uma Bronca no Balneário":**
  * *Ação:* Modifica a agressividade da equipa para `'limite'`.
  * *Efeito:* Sobe a probabilidade de desarme e roubo de bola em $+15\%$, aumentando ligeiramente o risco de sofrer exclusão de 2 minutos.
* **[Ação 2.3.2] "🤝 Incentivo e Calma Tática":**
  * *Ação:* Modifica o ritmo para `'Ataque Organizado Paciente'`.
  * *Efeito:* Reduz as perdas de bola por falta técnica/passos para metade e procura jogadas trabalhadas com o pivô.
* **[Ação 2.3.3] "📐 Mudar Defesa de Urgência":**
  * 4 botões de clique rápido: `6:0`, `5:1`, `3:3` ou `4:2`. Altera a estrutura defensiva da equipa em campo sem necessidade de sair do jogo.
* **[Botão 2.3.4] "Retomar o Jogo":**
  * Fecha o modal e retoma o relógio com as novas ordens em vigor.

### [Componente 2.4] Substituições em Tempo Real (In-Game Substitutions)
* **Lista de Campo:** Apresenta os 7 jogadores atualmente a disputar o lance e a sua percentagem de **Energia Atual** em tempo real.
* **Como Trocar:**
  1. Clica no titular cansado (ex.: energia a 42%).
  2. Abre-se a lista dos suplentes no banco de reservas.
  3. Clica no suplente fresco (100% de energia).
  4. A troca é efetuada no segundo seguinte sem penalizações.

### [Componente 2.5] Live Feed Narrativo (Crónica do Jogo Lance a Lance)
Apresenta um histórico cronológico com badges coloridos:
* `⚽ GOLO`: Remate bem-sucedido de 9 metros, contra-ataque ou infiltração.
* `🎯 GOLO 7M`: Conversão de livre de 7 metros.
* `🧤 DEFESA DO GR`: Parada do guarda-redes com os pés ou mãos.
* `🛑 EXCLUSÃO 2 MIN`: Falta grave aos 9m. O atleta sai e a equipa fica com menos um homem durante 2 minutos de jogo.
* `⚠️ CARTÃO AMARELO`: Sanção disciplinar de advertência.
* `Perda de Bola / Passos`: Falta técnica atacante com recuperação do adversário.

### [Componente 2.6] Aba de Estatísticas em Direto
* Barras comparativas de Remates Totais, Percentagem de Eficácia no Remate, Defesas dos Guarda-Redes (com % de eficácia entre os postes), Livres de 7 Metros marcados/sofridos e Total de Faltas cometidas.

### [Botão 2.7] "Terminar Jornada & Registar Resultados"
* Surge exclusivamente quando o relógio atinge o minuto 60'.
* **Ação Técnica:** Executa `applyWeeklyMatchResult(result)`.
* **Efeitos:**
  1. Soma os pontos oficiais na classificação (3 por vitória, 2 por empate, 1 por derrota).
  2. Calcula a receita da bilheteira com base na lotação do pavilhão e credita na tesouraria do clube.
  3. Atualiza o termómetro da direção ($+5\%$ por vitória, $+1\%$ por empate, $-4\%$ a $-6\%$ por derrota).
  4. Redireciona o utilizador de volta à Visão Geral com a súmula final gravada.

---

# 5. ECRÃ 3: GESTÃO DO PLANTEL E CONTRATOS (SQUAD & MOLECULAR VIEW)

Implementado no componente `src/components/squad/SquadManagementView.tsx`.

### [Componente 3.1] Filtros de Posição & Pesquisa
* **Botões de Filtro:** `Todos`, `Guarda-Redes (GR)`, `Pontas (PE/PD)`, `Laterais (LE/LD)`, `Centrais (C)`, `Pivôs (P)`.
* **Caixa de Pesquisa de Texto:** Permite encontrar jogadores pelo nome instantaneamente.

### [Componente 3.2] Grelha de Atletas do Plantel
Cada cartão de jogador apresenta:
* Nome, Posição primária colorida, Idade, Salário Semanal (`€/sem`), Anos restantes de contrato, Barra de Energia com percentagem e Crachá de Moral:
  * `⭐ Estrelado` | `🔥 Excelente` | `💪 Motivado` | `Normal` | `⚠️ Em baixo`
* **[Botão 3.2.1] "Ver Ficha Completa":** Abre o modal molecular do atleta com o radar de competências.
* **[Botão 3.2.2] "Colocar no Mercado" / "Retirar do Mercado":**
  * *Ação:* Executa `handleToggleTransferList(player)`.
  * *O que faz:* Alterna a variável `transferListed`. Se estiver no mercado, outros clubes da liga geridos pela IA podem fazer propostas de compra espontâneas.

### [Componente 3.3] Modal da Ficha Molecular do Atleta
* **Gráfico de Radar Pentagonal:** Visualiza a distribuição equilibrada dos 5 atributos essenciais de campo:
  1. Remate Exterior (9m)
  2. Penetração / 1v1
  3. Visão de Jogo / Distribuição
  4. Eficácia de 7 Metros
  5. Desarme / Bloqueio Defensivo
* **Estatísticas Exclusivas de Guarda-Redes:**
  - Reflexos à queima-roupa, Colocação face a remates de 9m, Defesa de 7 metros e Reposição Rápida em contra-ataque.
* **Indicadores Físicos:** Barra de Resistência à Fadiga (Estamina) e Energia Física Atual.
* **[Botão 3.3.1] "Renovar Contrato":**
  * Abre a caixa de negociação: o jogador exige um prémio de assinatura ($8\%$ do seu valor de mercado) e um aumento salarial de $+25\%$.
  * Se o utilizador aceitar:
    - Deduz o prémio da tesouraria do clube.
    - Estende o contrato por mais $+2$ épocas.
    - Remove o risco de saída a custo zero (`isContractExpiringSoon = false`).
    - Eleva a moral do atleta diretamente para `Estrelado`.
* **[Botão 3.3.2] "Dispensar Atleta (Rescisão de Contrato)":**
  * Calcula a indemnização rescisória compensatória pelos meses restantes de contrato, deduz da conta bancária e desvincula o atleta para a lista de jogadores livres.

---

# 6. ECRÃ 4: PRANCHETA TÁTICA (CAMPO TARAFLEX 40X20M & 7 INICIAL)

Implementado no componente `src/components/tactics/TacticsView.tsx`.

### [Componente 4.1] O Campo Taraflex 40x20m Interativo
* Campo geométrico vetorial com todas as marcações oficiais do andebol: área de 6m, linha tracejada de 9m, linha de 7m e balizas listadas a vermelho e branco.
* **Os 7 Marcadores do 7 Inicial:**
  * `GR` (Guarda-Redes na baliza)
  * `PE` (Ponta Esquerda na ala)
  * `LE` (Lateral Esquerdo aos 9m)
  * `C` (Central no centro do ataque)
  * `LD` (Lateral Direito aos 9m)
  * `PD` (Ponta Direita na ala)
  * `P` (Pivô nos 6 metros adversários)
* Cada nó exibe o círculo da camisola com as cores oficiais do clube, o número, o nome abreviado e a medalha com o OVR individual.

### [Componente 4.2] Gaveta Lateral de Troca de Posição
* **Como Funciona:** O utilizador clica em qualquer nó do campo (ex.: clica no nó do `Pivô`).
* Abre-se uma gaveta lateral à direita listando todos os atletas do plantel aptos a desempenhar a função, ordenados por compatibilidade e OVR.
* **[Botão 4.2.1] "Escalar Atleta":**
  * Substitui o titular anterior pelo jogador selecionado, enviando o antigo titular para o banco de reservas.

### [Botão 4.3] "⚡ Auto-Escalar (Melhor 7 Disponível)"
* **Ação Técnica:** Algoritmo de inteligência tática que avalia todo o plantel, descarta lesionados e jogadores com fadiga extrema (<50%), e preenche automaticamente o campo com os atletas de maior OVR em cada uma das 7 posições.

### [Componente 4.4] Seletores de Sistema Defensivo (4 Estruturas)
O utilizador pode alternar livremente com um clique entre:
* **[Opção 4.4.1] Defesa 6:0 (A Muralha):**
  * Bónus: $-18\%$ de probabilidade de golo para entradas de pivô aos 6m.
  * Penalização: $+12\%$ de vulnerabilidade a remates de meia-distância dos laterais aos 9m.
* **[Opção 4.4.2] Defesa 5:1 (Pressão ao Central):**
  * Bónus: $-15\%$ de eficácia para o organizador central adversário.
  * Penalização: $+14\%$ de espaço concedido às pontas adversárias.
* **[Opção 4.4.3] Defesa 3:3 (Pressão Aberta / Agressiva):**
  * Bónus: $+10\%$ no contra-ataque rápido e $12\%$ de chance por posse de roubar a bola na linha dos 9 metros.
  * Penalização: Deixa crateras nas costas se a equipa estiver cansada.
* **[Opção 4.4.4] Defesa 4:2 (Pressão em Linha Dupla):**
  * Indicada para anular dois laterais com remate exterior forte.

### [Componente 4.5] Configuração do Ataque e Ritmo
* **Ritmo:** Comutação entre `Contra-Ataque Alucinante` (+6% na eficácia de finalização na primeira vaga) e `Ataque Organizado Paciente` (menos perdas de bola por falta técnica).
* **Foco Ofensivo:** Comutação entre `Remates Exteriores (9m)`, `Entradas do Pivô (6m)`, `Infiltrações das Pontas (Alas)` ou `Equilibrado`.

### [Componente 4.6] Interruptor Tático Especial (7 vs 6 - Guarda-Redes Avançado)
* **Caixa de Seleção (*Toggle*):**
  * Retira o guarda-redes e introduz um 2º pivô de campo durante as posses ofensivas.
  * *Vantagem:* Cria superioridade numérica 7 contra 6 na área adversária (+15% no remate).
  * *Risco:* Se a equipa perder a bola por passos ou interceção, o adversário pode atirar de baliza a baliza para golo deserto.

---

# 7. ECRÃ 5: MERCADO DE TRANSFERÊNCIAS

Implementado no componente `src/components/market/TransferMarket.tsx`.

### [Separador 5.1] Mercado de Clubes (Jogadores com Contrato)
* Lista jogadores sob contrato nos outros clubes da liga com OVR, Idade, Clube de Origem e Valor de Mercado estimado.
* **[Botão 5.1.1] "Fazer Proposta de Transferência":**
  * Abre o diálogo de oferta financeira. O utilizador propõe um valor em Euros.
  * Se a proposta for $\ge 90\%$ do valor de mercado, o clube detentor aceita a venda de imediato e o utilizador acorda o salário semanal do jogador.

### [Separador 5.2] Jogadores Livres (Custo Zero de Passe)
* Lista atletas sem vínculo contratual (desempregados).
* **[Botão 5.2.1] "Contratar Imediatamente":**
  * Integra o atleta diretamente no plantel, sem custos de transferência para outros clubes, pagando apenas o salário semanal e o prémio de assinatura.

### [Separador 5.3] Venda de Atletas do Clube
* Lista os jogadores do plantel que foram assinalados com `transferListed = true`.
* Exibe as propostas recebidas de outros clubes da liga geridos pelo computador, com os botões:
  * **[Botão 5.3.1] "Aceitar Oferta":** Credita o valor na hora na tesouraria do clube e remove o atleta do plantel.
  * **[Botão 5.3.2] "Recusar":** Rejeita a proposta e mantém o atleta.

---

# 8. ECRÃ 6: PAVILHÃO, TREINOS, ACADEMIA E SAÚDE

Implementado no componente `src/components/facilities/FacilitiesView.tsx`.

### [Módulo 8.1] Obras de Expansão do Pavilhão
* Foto de alta fidelidade gerada por IA com a perspetiva das bancadas.
* Mostra a lotação atual (ex.: 2.500 lugares) e os lugares ocupados em média por jogo.
* **[Botão 8.1.1] "Obras de Expansão (+500 Lugares)":**
  * *Custo:* €75.000 deduzidos na hora.
  * *Ação:* Executa `upgradeArenaCapacity(500, 75000)`. Aumenta permanentemente a capacidade máxima e a massa associativa, gerando receitas superiores em todos os jogos caseiros da temporada.
* **[Controlo 8.1.2] Seletor do Preço do Bilhete:**
  * Permite ajustar o valor entre €5 e €35. Preços altos em pavilhões pequenos dão boa receita mas podem afastar adeptos se o OVR for modesto.

### [Módulo 8.2] Ciclo Semanal de Treinos (4 Focos)
* Permite definir a estratégia de preparação coletiva:
  * **Descanso Total:** Prioridade à recuperação física (100% de energia).
  * **Finalização & GR:** Foco na potência de tiro aos 9m e reflexos sob a trave.
  * **Foco Tático:** Trabalho da muralha defensiva e entrosamento.
  * **Carga Física:** Aumento de resistência muscular (Estamina).

### [Módulo 8.3] Escola de Formação (Academia de Juniores)
* Apresenta 3 jovens promessas geradas pelas escolas do clube com idades entre 15 e 18 anos.
* **[Botão 8.3.1] "Promover ao Plantel Principal":**
  * *Ação:* Executa `promoteYouthPlayer(playerId)`. Transfere o jovem imediatamente para o plantel sénior com um contrato protegido de 3 épocas.
* **[Botão 8.3.2] "Investir na Academia (€50.000)":**
  * Melhora o nível das infraestruturas desportivas de formação, garantindo juniores com maior potencial na época seguinte.

### [Módulo 8.4] Departamento Médico (Boletim Clínico)
* Lista todos os jogadores indisponíveis com diagnóstico médico (ex.: *Tendinite no ombro*, *Entorse no tornozelo*) e semanas de paragem.
* **[Botão 8.4.1] "Tratamento Acelerado com Especialista":**
  * Paga os honorários de uma clínica especializada para reduzir o tempo de convalescença a metade.

---

# 9. ECRÃ 7: CLASSIFICAÇÃO DA LIGA

Implementado no componente `src/components/league/LeagueStandings.tsx`.

### Tabela Oficial de Andebol:
* Sistema oficial da Federação de Andebol de Portugal:
  * **Vitória:** 3 Pontos
  * **Empate:** 2 Pontos
  * **Derrota:** 1 Ponto
  * **Falta de Comparência:** 0 Pontos
* **Colunas Apresentadas:**
  * `#` (Posição), Clube, `J` (Jogos disputados), `V` (Vitórias), `E` (Empates), `D` (Derrotas), `GM` (Golos Marcados), `GS` (Golos Sofridos), `DG` (Diferença de Golos) e `Pts` (Pontos).
* **Zonas de Destaque por Código de Cores:**
  * Linha dourada/verde: O clube do utilizador com realce visual.
  * Linhas 1 a 4: **Zona Europeia** (Apuramento para as competições da EHF).
  * Linhas 13 e 14: **Zona de Despromoção** (Descida à 2ª Divisão Nacional).

---

# 10. MODAIS SECUNDÁRIOS E DIÁLOGOS DE SISTEMA

---

### 10.1 Modal de Empréstimos Bancários (Crédito BCP)
* Componente: `src/components/finance/BankLoanModal.tsx`.
* **Como Operar:** O utilizador escolhe o montante pretendido (€50.000 a €500.000).
* O motor calcula a taxa de juro e a prestação semanal automática.
* **[Botão 10.1.1] "Submeter Pedido de Crédito":** Credita o valor na conta do clube no segundo seguinte.
* **[Botão 10.1.2] "Amortizar Totalidade da Dívida":** Se o clube tiver liquidez, salda o empréstimo a pronto para eliminar as prestações semanais.

---

### 10.2 Modal de Patrocinadores Comerciais & Misteriosos
* Componente: `src/components/finance/MysterySponsorModal.tsx`.
* Apresenta 3 ofertas de marcas desportivas para estampar na camisola oficial e nos painéis do pavilhão.
* **[Botão 10.2.1] "Assinar Contrato de Patrocínio":** Injeta o prémio de assinatura a pronto e assegura uma receita fixa semanal debitada a favor do clube até ao término da época.

---

### 10.3 Modal de Agendamento Multijogador
* Componente: `src/components/multiplayer/MatchScheduleModal.tsx`.
* Permite enviar desafios com dia e hora marcados a outros clubes geridos por humanos na plataforma.

---

### 10.4 Wizard de Fundação do Clube (Criação Inicial)
* Componente: `src/components/club/ClubCreationWizard.tsx`.
* Disparado quando o utilizador cria uma nova carreira:
  * **Passo 1:** Nome do Clube, Cidade e Alcunha dos Adeptos.
  * **Passo 2:** Escolha da Camisola Oficial (catálogo com 1.000 combinações possíveis de cores, riscas e golas).
  * **Passo 3:** Escolha do Pavilhão Municipal ou Arena Privada (com imagem IA e lotação inicial).
  * **Passo 4:** Nomeação do Treinador e Estilo Tático de Referência.
  * **Passo 5:** Escolha da Divisão e Série Geográfica (`Série Norte`, `Série Centro`, `Série Sul`).
  * **Passo 6:** Confirmação do Orçamento Base Inicial (€1.500.000) e geração do plantel inicial.

---

### 10.5 Painel de Administração Central (Admin Matrix)
* Componente: `src/components/admin/AdminMatrixModal.tsx`.
* Restrito ao administrador autenticado com `rochap.filipe@gmail.com`.
* Permite regular a taxa de juros do BCP, a eficácia do contra-ataque rápido e injetar fundos monetários para testes de estresse de tesouraria.

---

### 10.6 Ecrã de Despedimento Imediato (Game Over)
* Disparado automaticamente quando a **Confiança da Direção** atinge **0%**.
* Bloqueia o acesso aos comandos do clube e exibe a mensagem de rescisão unilateral pela direção com o botão **"Iniciar Nova Carreira noutro Clube"**.

---

# 11. MATRIZ COMPORTAMENTAL: O QUE O UTILIZADOR CONSEGUE vs NÃO CONSEGUE FAZER

| Ação Pretendida | Conseguido? | Onde e Como é Feito no Jogo |
|---|---|---|
| **Mudar de Tática a meio do jogo** | **SIM** | No Time-Out Técnico (2 por jogo) ou na Prancheta Tática. |
| **Substituir jogadores cansados em direto** | **SIM** | No separador "Partida ao Vivo", clicando no atleta exausto e selecionando o suplente. |
| **Jogar com guarda-redes avançado (7vs6)** | **SIM** | No comutador tático da Prancheta. |
| **Comprar jogadores a outros clubes** | **SIM** | No separador "Transferências" fazendo proposta financeira em euros. |
| **Contratar jogadores livres a custo zero** | **SIM** | No separador "Transferências" na aba de jogadores sem clube. |
| **Vender jogadores e encaixar dinheiro** | **SIM** | Colocando o jogador na lista de transferências e aceitando propostas recebidas. |
| **Renovar contratos por mais 2 anos** | **SIM** | Na Ficha do Jogador pagando o prémio de assinatura e aumento salarial. |
| **Rescindir contrato pagando indemnização** | **SIM** | No botão "Dispensar Atleta" na ficha do jogador. |
| **Aumentar o pavilhão e lugares** | **SIM** | No separador "Pavilhão" clicando em "Expandir (+500 Lugares)" por €75.000. |
| **Mudar o preço do bilhete dos jogos** | **SIM** | No seletor de preço da bilheteira no Pavilhão. |
| **Promover juniores da formação** | **SIM** | Na Academia de Juniores com o botão "Promover ao Plantel". |
| **Recuperar lesões mais depressa** | **SIM** | No Departamento Médico pagando tratamento especializado. |
| **Pedir empréstimo bancário** | **SIM** | No botão "Crédito BCP" do Dashboard com prestações semanais. |
| **Assinar patrocínios de camisola** | **SIM** | No botão "Patrocínios" do Dashboard. |
| **Simular o jogo em 1 segundo** | **SIM** | No botão "⚡ Simulação Instantânea" da partida ao vivo. |
| **Jogar offline / Instalar no telemóvel** | **SIM** | No botão "Instalar App (PWA)" no cabeçalho superior. |
| *Escalar jogadores lesionados* | **NÃO** | O motor bloqueia a seleção de atletas com `isInjured = true`. |
| *Comprar jogadores a meio de um jogo ao vivo* | **NÃO** | O mercado só processa transferências entre jornadas. |
| *Evitar despedimento com 0% de confiança* | **NÃO** | Atingindo 0%, o Game Over é acionado obrigatoriamente pela direção. |
| *Alterar resultados do jogo à mão* | **NÃO** | Os resultados são determinados matematicamente pelos atributos moleculares. |

---

# 12. CATÁLOGO DE DECISÃO: O QUE EDITAR, RETIRAR OU ACRESCENTAR

Com esta radiografia exaustiva botão a botão e função a função, podes escolher com precisão cirúrgica o teu próximo passo:

### 1. O que pretendes EDITAR?
* *Exemplo 1:* Queres alterar o intervalo médio de golos de 25-35 para valores mais altos (ex.: 30-40) ou mais baixos?
* *Exemplo 2:* Queres suavizar ou agravar a velocidade a que a energia física cai durante os 60 minutos?
* *Exemplo 3:* Queres mudar as exigências dos jogadores nas renovações de contrato (atualmente exigem 8% do passe e +25% de salário)?
* *Exemplo 4:* Queres alterar o custo das obras do pavilhão ou o impacto do preço do bilhete na assistência de adeptos?

### 2. O que pretendes RETIRAR?
* *Exemplo 1:* Queres remover o sistema de 7 contra 6 para ter apenas o andebol clássico com guarda-redes sempre na baliza?
* *Exemplo 2:* Queres retirar os empréstimos bancários (Crédito BCP) para forçar o clube a viver apenas das suas receitas desportivas?
* *Exemplo 3:* Queres simplificar as opções de Time-Out ou filtros de mercado?

### 3. O que pretendes ACRESCENTAR?
* *Exemplo 1:* **Animador 2D com a bola a deslocar-se no campo Taraflex** durante o relato em direto para veres a bola a voar de posição em posição.
* *Exemplo 2:* **Sorteio e Quadro Eliminatório da Taça de Portugal** com jogos a eliminar e prolongamento oficial.
* *Exemplo 3:* **Histórico de Títulos e Currículo do Treinador** para acompanhar as taças e campeonatos conquistados época a época.
* *Exemplo 4:* **Cláusulas de Rescisão Obrigatórias** no mercado de transferências.
