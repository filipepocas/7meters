# 7METERS: ANDEBOL MANAGER (ARQUITETURA FUNCIONAL EXAUSTIVA AO PORMENOR ABSURDO)

Este documento constitui a **especificação técnica, matemática e funcional integral** do jogo **7meters**. Detalha, componente a componente, botão a botão, fórmula a fórmula e atributo a atributo, tudo o que está programado, as ações que cada elemento desencadeia no estado global (`useGameStore`), o comportamento dos atletas e do motor determinístico, e as possibilidades de edição, remoção ou expansão futura.

---

# ÍNDICE GERAL DETALHADO

1. [ESTRUTURA DE DADOS E ATRIBUTOS MOLECULARES DOS ATLETAS](#1-estrutura-de-dados-e-atributos-moleculares-dos-atletas)
   - 1.1 Tabela Completa dos 21 Atributos por Atleta
   - 1.2 O OVR (Overall Rating): Definição e Fórmulas Ponderadas por Posição
   - 1.3 Matriz do que os Atletas CONSEGUEM e NÃO CONSEGUEM Fazer
2. [O MOTOR DE JOGO (MATCH ENGINE) E CÁLCULOS DETERMINÍSTICOS](#2-o-motor-de-jogo-match-engine-e-cálculos-determinísticos)
   - 2.1 Ciclo Temporal dos 60 Minutos e Estrutura de Posses de Bola
   - 2.2 Fórmulas Matemáticas do Duelo Rematador vs Guarda-Redes / Defesa
   - 2.3 Matriz Tática de Sistemas Defensivos (6:0, 5:1, 3:3, 4:2)
   - 2.4 Disciplina, Faltas e Regra dos 2 Minutos (Superioridade Numérica)
   - 2.5 A Regra dos 5% de Livres de 7 Metros
   - 2.6 Desgaste de Energia e Penalizações de Fadiga Física
3. [ECRÃ A ECRÃ, BOTÃO A BOTÃO E FUNÇÃO A FUNÇÃO](#3-ecrã-a-ecrã-botão-a-botão-e-função-a-função)
   - 3.1 Cabeçalho Global e Barra Superior de Navegação
   - 3.2 Separador 1: Visão Geral (Dashboard / Overview)
   - 3.3 Separador 2: Partida ao Vivo (Match Live Viewer / Match Center)
   - 3.4 Separador 3: Gestão do Plantel & Ficha Molecular do Atleta
   - 3.5 Separador 4: Prancheta Tática & Alinhamento do 7 Inicial
   - 3.6 Separador 5: Mercado de Transferências (Clubes, Livres e Vendas)
   - 3.7 Separador 6: Pavilhão, Centro de Treinos, Academia e Departamento Médico
   - 3.8 Separador 7: Classificação da Liga (Pontuação Oficial de Andebol)
4. [MODAIS E FERRAMENTAS COMPLEMENTARES](#4-modais-e-ferramentas-complementares)
   - 4.1 Modal de Empréstimos Bancários (Crédito BCP)
   - 4.2 Modal de Patrocinadores Misteriosos e Comerciais
   - 4.3 Modal de Agendamento Multijogador
   - 4.4 Assistente de Criação de Clube (Wizard de Fundação)
   - 4.5 Matriz Central de Regras (Admin Matrix)
5. [CICLO SEMANAL, FINANÇAS E TRANSIÇÃO DE ÉPOCA](#5-ciclo-semanal-finanças-e-transição-de-época)
   - 5.1 Fórmulas Financeiras de Bilheteira e Salários
   - 5.2 O Termómetro da Direção e Regra de Despedimento Imediato
   - 5.3 Algoritmos dos 4 Regimes de Treino Semanal
   - 5.4 Fim de Época: Envelhecimento, Retiradas e Academia de Juniores
6. [GUIA PARA O TREINADOR / UTILIZADOR: O QUE EDITAR, RETIRAR OU ACRESCENTAR](#6-guia-para-o-treinador--utilizador-o-que-editar-retirar-ou-acrescentar)

---

# 1. ESTRUTURA DE DADOS E ATRIBUTOS MOLECULARES DOS ATLETAS

Cada jogador no universo do jogo é instanciado através da interface `Player` com dados salvaguardados em memória e `localStorage`.

### 1.1 Tabela Completa dos 21 Atributos por Atleta

| Atributo | Campo Interno | Tipo & Escala | Papel no Motor de Jogo & Fórmulas |
|---|---|---|---|
| **Nome Completo** | `name` | String | Nome de exibição nos relatos e súmulas. |
| **Idade** | `age` | 15 a 38 anos | Define a probabilidade de evolução (jovens <= 22 anos têm 40% de chance de subir OVR; veteranos >= 35 anos regridem 1-3 pontos por época; aos 39 reformam-se). |
| **Nacionalidade** | `country` | String + Bandeira | Portugal (80%), Espanha, França, Suécia, Dinamarca, etc. |
| **Posição Primária** | `position` | `GR`, `PE`, `PD`, `LE`, `LD`, `C`, `P` | Posição onde o atleta atua sem qualquer penalização nos lances. |
| **Posição Secundária** | `secondaryPosition` | Enum ou `'Nenhuma'` | Permite desenrascar outra posição com penalização reduzida. |
| **Remate Exterior (9m)** | `molecular.shotExterior` / `shooting` | 1 a 100 / (1 a 10) | Potência e pontaria em remates de meia-distância por cima da barreira. Essencial para Laterais (LE/LD). |
| **Penetração / 1v1** | `molecular.penetration1v1` | 1 a 100 | Drible, finta de corpo e explosão para romper a linha dos 6 metros. Crítico para Pontas e Centrais. |
| **Visão / Distribuição** | `molecular.visionDistribution` / `intelligence` | 1 a 100 / (1 a 10) | Qualidade do passe, criação de jogadas e assistência ao pivô. Crítico para o Central. |
| **Eficácia 7 Metros** | `molecular.sevenMeterShot` | 1 a 100 | Taxa de conversão de livres de 7 metros (penáltis). |
| **Desarme / Bloqueio** | `molecular.defensiveBlock` / `defense` | 1 a 100 / (1 a 10) | Eficácia da muralha defensiva na linha dos 6 metros sem cometer falta para 2 minutos. Crítico para Pivôs e Laterais. |
| **Reflexos (GR)** | `molecular.gkReflexes` | 1 a 100 | Velocidade de reação com mãos e pés a remates de 6 metros à queima-roupa. |
| **Colocação (GR)** | `molecular.gkPositioning` | 1 a 100 | Posicionamento estático perante remates exteriores de 9 metros. |
| **Defesa 7m (GR)** | `molecular.gkSevenMeterSave` | 1 a 100 | Capacidade de encurtar ângulo e defender livres de 7 metros. |
| **Reposição Rápida (GR)**| `molecular.gkFastBreakRelease` / `speed` | 1 a 100 | Eficácia no passe longo imediato para os pontas em contra-ataque. |
| **Resistência / Estamina** | `molecular.stamina` / `stamina` | 1 a 100 / (1 a 10) | Determina a resistência à queda de energia durante os 60 minutos. |
| **Energia Atual** | `energyLevel` | 0% a 100% | Desgasta-se minuto a minuto. Se < 50%, perde 20% no poder de duelo e duplica o risco de lesão. |
| **Moral / Confiança** | `moralLevel` | 5 níveis (`Em baixo`, `Normal`, `Motivado`, `Excelente`, `Estrelado`) | Multiplicador de ânimo nos remates decisivos. Desce se passar 5 jogos consecutivos no banco. |
| **Estado Físico** | `injury` | `PlayerInjury` | Indica se está lesionado (`isInjured`), a descrição médica, os dias e semanas de paragem restantes e gravidade (`ligeira`, `moderada`, `grave`). |
| **Salário Semanal** | `wage` | Moeda (€) | Débito semanal automático da conta do clube (`wage = salary / 4`). |
| **Anos de Contrato** | `contractYearsRemaining` | 1 a 4 Épocas | Se for igual a 1, ativa `isContractExpiringSoon = true`. O atleta exige renovação ou sai a custo zero no fim do ano. |
| **Lista de Mercado** | `transferListed` | Booleano | Se ativo, outros clubes podem emitir propostas de compra instantâneas. |

---

### 1.2 O OVR (Overall Rating): Definição e Fórmulas Ponderadas

O **OVR** (de 1 a 100) é a classificação agregada da força do atleta, calculada com pesos diferenciados de acordo com a posição primária:

* **Guarda-Redes (`GR`):**
  $$\text{OVR} = 0.40 \times \text{Reflexos} + 0.30 \times \text{Colocação} + 0.20 \times \text{Defesa 7m} + 0.10 \times \text{Reposição Rápida}$$
* **Central (`C`):**
  $$\text{OVR} = 0.35 \times \text{Visão/Passe} + 0.25 \times \text{Penetração 1v1} + 0.20 \times \text{Remate 9m} + 0.10 \times \text{Desarme} + 0.10 \times \text{Eficácia 7m}$$
* **Laterais (`LE` / `LD`):**
  $$\text{OVR} = 0.40 \times \text{Remate Exterior 9m} + 0.25 \times \text{Penetração 1v1} + 0.15 \times \text{Desarme} + 0.10 \times \text{Visão} + 0.10 \times \text{Estamina}$$
* **Pontas (`PE` / `PD`):**
  $$\text{OVR} = 0.35 \times \text{Penetração 1v1} + 0.25 \times \text{Velocidade/Saída} + 0.20 \times \text{Eficácia de Ângulo} + 0.20 \times \text{Eficácia 7m}$$
* **Pivô (`P` ou `PV`):**
  $$\text{OVR} = 0.35 \times \text{Desarme/Bloqueio} + 0.30 \times \text{Penetração/Apoio 6m} + 0.20 \times \text{Força/Estamina} + 0.15 \times \text{Visão}$$

---

### 1.3 Matriz do que os Atletas CONSEGUEM e NÃO CONSEGUEM Fazer

#### O que CONSEGUEM Fazer:
1. **Atuar em Qualquer Posição:** Podem ser escalados como GR, Lateral, Central, Ponta ou Pivô. Se jogarem fora da sua área natural, sofrem penalização de $15$ a $25$ pontos nos duelos de lance.
2. **Disparar de Várias Zonas:** Executam remates exteriores aos 9 metros, infiltrações pelas pontas, remates em apoio de 6 metros no pivô e cobranças de 7 metros.
3. **Cometer e Sofrer Faltas Disciplinares:** Podem levar advertência com Cartão Amarelo, sofrer Exclusão de 2 minutos (deixando a sua equipa com 6 ou 5 jogadores) ou levar Cartão Vermelho direto.
4. **Desgaste Físico Minuto a Minuto:** Perdem energia a cada lance disputado. O desgaste é atenuado pela sua Estamina individual.
5. **Ser Substituídos em Tempo Real:** Podem sair do campo e ir para o banco durante o jogo ao vivo para recuperar fôlego, dando lugar a um suplente fresco.
6. **Exigir Contratos e Prémios:** Quando entram na última época contratual, recusam treinar com moral alta caso o treinador não pague o prémio de assinatura e aumento salarial.
7. **Pedir Transferência:** Atletas insatisfeitos com mais de 5 jogos seguidos sem calçar entram em depressão tática (`Moral = Em baixo`) e ativam pedido de venda.
8. **Evoluir ou Envelhecer:** Jovens com menos de 23 anos aumentam atributos em semanas de treino; atletas com mais de 35 anos sofrem declínio físico anual e reformam-se aos 39.

#### O que NÃO CONSEGUEM Fazer (Limitações Intencionais do Motor):
1. **Não jogam simultaneamente no campo e no banco.**
2. **Não participam em jogos se estiverem no Departamento Médico** (`isInjured = true`).
3. **Não trocam de clube a meio de uma partida ao vivo** (apenas na janela semanal de mercado).
4. **Não ignoram a autoridade do árbitro:** Se receberem cartão vermelho, são expulsos e não voltam a entrar nessa partida.

---

# 2. O MOTOR DE JOGO (MATCH ENGINE) E CÁLCULOS DETERMINÍSTICOS

O ficheiro `/src/engine/matchEngine.ts` executa a simulação oficial de andebol. Ao contrário de jogos de futebol (com 2 ou 3 golos por jogo), o andebol opera com **50 a 70 ataques por partida**, resultando em pontuações realistas de **25 a 35 golos por equipa**.

### 2.1 Ciclo Temporal dos 60 Minutos e Posses de Bola
* O motor itera minuto a minuto: `for (let minute = 1; minute <= 60; minute++)`.
* Aos **30 minutos**, é injetado o evento obrigatório de `INTERVALO` e descanso das equipas.
* Aos **60 minutos**, é emitido o evento de `APITO FINAL`.
* Em cada minuto, o número de ataques é gerado por:
  $$\text{Posses por Minuto} = \begin{cases} 2, & \text{com probabilidade } 85\% \\ 1, & \text{com probabilidade } 15\% \end{cases}$$
* Isto garante entre 100 e 115 ataques totais por partida, calibrando os marcadores para valores autênticos (ex: 29-27, 31-30, 24-28).

---

### 2.2 Fórmulas Matemáticas do Duelo Rematador vs Guarda-Redes

Para cada ataque, é selecionado um atacante de campo e o guarda-redes adversário.

1. **Cálculo do Poder do Rematador ($P_{\text{rem}}$):**
   $$P_{\text{rem}} = (\text{Shooting} \times 8) + (\text{OVR} \times 0.35)$$
2. **Cálculo do Poder do Guarda-Redes ($P_{\text{gr}}$):**
   $$P_{\text{gr}} = (\text{Goalkeeping} \times 8) + (\text{OVR}_{\text{gr}} \times 0.35)$$
3. **Vantagem Numérica em Campo ($V_{\text{num}}$):**
   $$V_{\text{num}} = (N_{\text{casa}} - N_{\text{fora}}) \times (\text{se Casa Ataca: } +5, \text{ se Fora Ataca: } -5)$$
   *(Onde $N$ representa o número de atletas não excluídos, variando entre 5 e 7).*
4. **Probabilidade Base de Golo ($P_{\text{golo}}$):**
   $$P_{\text{golo}} = 0.52 + \frac{P_{\text{rem}} + V_{\text{num}} + \text{Mod}_{\text{defesa}} - P_{\text{gr}}}{200}$$
5. **Ajuste de Contra-Ataque Rápido (*Fastbreak*):**
   Se a tática for "Contra-Ataque Alucinante", soma-se $+0.06$ à probabilidade ($+6\%$).
6. **Limitadores Finais (*Clamping*):**
   A probabilidade final é limitada obrigatoriamente entre **22% e 86%** para evitar goleadas irrealistas ou jogos a zero:
   $$P_{\text{golo final}} = \max(0.22, \min(0.86, P_{\text{golo}}))$$

---

### 2.3 Matriz Tática de Sistemas Defensivos

| Sistema Defensivo | Zona do Lance | Modificador de Probabilidade ($\text{Mod}_{\text{defesa}}$) | Efeito Tático e Narrativa Gerada |
|---|---|---|---|
| **6:0 (A Muralha)** | Pivô (6 metros) | **-18%** | Fecha por completo as entradas do pivô. "A muralha defensiva 6:0 fecha o espaço ao pivô." |
| **6:0 (A Muralha)** | Laterais (9 metros) | **+12%** | Linha recuada deixa espaço para o remate exterior. "Defesa 6:0 recuada abre linha de tiro aos 9 metros!" |
| **5:1 (Pressão ao Central)** | Central (9 metros) | **-15%** | Homem adiantado anula o organizador de jogo adversário. "O homem avançado na defesa 5:1 sufoca o central adversário." |
| **5:1 (Pressão ao Central)** | Pontas (Alas) | **+14%** | Concentração interior abre brechas nas pontas. "A defesa 5:1 cede espaço de penetração na ala." |
| **3:3 / 4:2 (Agressiva)** | Transições | **+10% eficácia** se saída rápida | Defesa subida. Tem **12% de chance por posse** de roubar a bola imediatamente por interceção limpa. |

---

### 2.4 Disciplina, Faltas e Regra dos 2 Minutos

* A cada posse defensiva, é calculado o limiar de falta grave:
  $$\text{Limiar de Exclusão} = 0.94 - (\text{Agressividade} \times 0.03) - (\text{Tendência do Árbitro} \times 0.02)$$
  * *Agressividade "Moderada":* Coeficiente $0.90$
  * *Agressividade "Intensa":* Coeficiente $1.15$
  * *Agressividade "Ao Limite":* Coeficiente $1.40$
* Se um jogador cometer falta grave:
  * Se ainda não tiver cartão amarelo e num dado aleatório $< 40\%$, recebe **Cartão Amarelo**.
  * Caso contrário, recebe **Exclusão de 2 Minutos**. A sua equipa passa a jogar com menos um homem durante os próximos 2 minutos de tempo de jogo real.
  * O motor adiciona `minute + 2` à lista de exclusões ativas (`homeExclusionsEnd` ou `awayExclusionsEnd`).

---

### 2.5 A Regra dos 5% de Livres de 7 Metros

* Em cada lance de ataque, há exatamente **5% de probabilidade** de o defensor travar o atacante em falta na área de baliza, assinalando-se um **Livre de 7 Metros**.
* A fórmula de conversão do penálti tem uma taxa base superior:
  $$P_{\text{7m}} = 0.74 + \frac{P_{\text{rem}} - P_{\text{gr}}}{250}$$
* Se for golo, a narrativa regista: *"🎯 Inicia-se a cobrança do livre de 7 metros... O batedor [Nome] finta o guarda-redes... GOLO!"*.
* Se o guarda-redes defender: *"🧤 Livre de 7 metros! [Nome] atira colocado, mas o Guarda-Redes estica o braço e defende espetacularmente!"*.

---

# 3. ECRÃ A ECRÃ, BOTÃO A BOTÃO E FUNÇÃO A FUNÇÃO

---

## 3.1 CABEÇALHO GLOBAL E BARRA SUPERIOR DE NAVEGAÇÃO

Presente em todos os ecrãs do jogo (`src/pages/Dashboard.tsx`).

### Elementos Visuais e Botões:
1. **Logótipo "7METERS":**
   * *Ação:* Redefine o separador ativo para `overview` (Visão Geral).
2. **Card de Identidade do Clube:**
   * Apresenta o nome do clube do utilizador (ex.: *ABC Braga*, *FC Porto*), as cores do equipamento e a liga atual.
3. **Indicador de Tesouraria:**
   * Exibe o saldo da conta bancária com símbolo `💰` formatado em Euros (ex.: `€1.425.000`).
4. **Indicador do Termómetro da Presidência:**
   * Mostra o valor de **0 a 100%** com ícone `🏛️`.
   * Cor dinâmica: Verde (>60%), Âmbar (31-60%), Vermelho (<=30%).
5. **Botão "Avançar Semana" (`advanceToNextWeek`):**
   * *Localização:* Canto superior direito (botão escuro com moldura de zinco).
   * *O que faz ao clicar:*
     1. Executa `processWeeklyFinancesAndLoans()`: debita salários semanais e prestações bancárias do Crédito BCP.
     2. Credita as receitas fixas de patrocinadores semanais (`+€25.000`).
     3. Aplica o treino escolhido: se for *Descanso*, recupera $+30\%$ de energia; se for *Finalização* ou *Foco Tático*, dá chance de $+1$ em atributo específico; se for *Carga Física*, desconta $-18\%$ de energia e sobe a estamina.
     4. Recupera 7 dias a todos os jogadores lesionados no Departamento Médico.
     5. Incrementa `currentWeek` em $+1$. Se ultrapassar a semana 22, despoleta a **Transição de Época**.
6. **Botão "Jogar Jornada":**
   * *Localização:* Canto superior direito (botão com destaque em âmbar dourado).
   * *O que faz ao clicar:* Altera a variável `activeTab` para `'match'`, abrindo diretamente a simulação do jogo em direto da jornada.
7. **Botão "Entrar / Perfil de Utilizador":**
   * *O que faz:* Abre o `AuthModal` para sincronização na Cloud com Firebase ou login local. Se o utilizador logado for `rochap.filipe@gmail.com`, exibe a badge vermelha de **Admin Master**.
8. **Botão "Instalar App (PWA)":**
   * Permite instalar a aplicação na *homescreen* do telemóvel ou no ambiente de trabalho do computador através do Service Worker registado.

### Separadores da Barra de Navegação (7 Abas):
* Cada botão de separador possui ícone emoji, rótulo textual e uma linha de realce dourada quando selecionado:
  * `Visão Geral` (`id: 'overview'`, ícone `📊`)
  * `Partida ao Vivo` (`id: 'match'`, ícone `🤾`, com badge *Matchday*)
  * `Plantel & Atletas` (`id: 'squad'`, ícone `👥`)
  * `Tática & 7 Inicial` (`id: 'tactics'`, ícone `📋`)
  * `Transferências` (`id: 'market'`, ícone `🏪`)
  * `Pavilhão & Clube` (`id: 'facilities'`, ícone `🏟️`)
  * `Classificação` (`id: 'league'`, ícone `🏆`)

---

## 3.2 SEPARADOR 1: VISÃO GERAL (DASHBOARD / OVERVIEW)

### Componentes e Botões:
1. **Hero Card de Matchday (Topo do Ecrã):**
   * Imagem de alta definição gerada por IA do interior do pavilhão com bancadas repletas e piso Taraflex.
   * Badge da jornada: `Jornada X · Andebol 1`.
   * Confronto central: Nome da Equipa da Casa vs Equipa Visitante, com respetivos OVRs médios.
   * **Botão "Ajustar Tática":** Redireciona de imediato para a prancheta tática (`activeTab = 'tactics'`).
   * **Botão "🎮 Jogar Partida ao Vivo":** Dá início à emissão em direto do confronto da semana.
2. **Grelha de KPIs Chave (4 Cartões Modernos):**
   * **Card 1: Orçamento do Clube:** Valor em caixa e montante da folha salarial semanal.
   * **Card 2: Confiança da Direção:** Percentagem com barra de enchimento visual.
   * **Card 3: Força Média (OVR):** Média ponderada do 7 Inicial e energia média dos titulares.
   * **Card 4: Foco de Treino da Semana:** Menu seletor *dropdown* que permite comutar entre:
     * `💤 Descanso Total (100% Energia)`
     * `🎯 Finalização & GR (+Remate)`
     * `🛡️ Foco Tático (+Defesa)`
     * `⚡ Carga Física (+Estamina)`
3. **Card do Sete Inicial Recomendado:**
   * Lista os 7 titulares escalados com número, nome, posição, idade, salário semanal, barra de energia e OVR individual.
   * **Botão "Ver Todo o Plantel (N) →":** Redireciona para o separador do plantel.
4. **Card do Pavilhão Oficial:**
   * Foto em miniatura da arena, lotação máxima, preço atual do bilhete e despesa mensal de manutenção.
   * **Botão "Obras & Expansão de Bancadas →":** Leva ao separador de obras de infraestruturas.
5. **Card de Finanças & Parcerias Rápidas:**
   * **Botão "🏦 Crédito BCP":** Abre o modal de concessão de empréstimos bancários.
   * **Botão "🤝 Patrocínios":** Abre o modal de acordos com patrocinadores comerciais.

---

## 3.3 SEPARADOR 2: PARTIDA AO VIVO (MATCH LIVE VIEWER)

O centro de transmissão em direto (`src/components/match/MatchLiveViewer.tsx`).

### Elementos e Ações:
1. **Placard Central de Transmissão:**
   * **Relógio Digital LED:** Conta de **00' a 60'**. Mostra `1ª Parte` (0-29'), `⏱️ Intervalo` (30'), `2ª Parte` (31-59') e `🏁 Apito Final` (60').
   * **Marcador de Golos:** Dígitos gigantes com os golos da Casa e Fora, atualizados segundo a segundo conforme a narrativa avança.
2. **Barra de Controlo do Tempo:**
   * **Botão Play / Pausa (▶ / ⏸):** Inicia a rolagem do tempo ou congela o cronómetro para análise tática.
   * **Botões de Velocidade (1x, 2x, 5x):** Ajusta o intervalo do temporizador entre 1200ms, 600ms e 200ms por minuto de jogo.
   * **Botão "⚡ Simulação Instantânea":** Salta imediatamente para o minuto 60', calcula todos os golos e fecha o jogo de imediato.
   * **Botão "Time-Out Técnico" (Restam X/2):**
     * Desativa-se quando os 2 descontos de tempo se esgotam ou após o minuto 60'.
     * Ao clicar, pausa imediatamente o relógio e abre o **Modal de Time-Out**.
3. **Modal de Time-Out Técnico (Decisões do Treinador):**
   * **Ação 1: "🗣️ Dar uma Bronca no Balneário":**
     * Executa: `setActiveHomeTactics({ ...t, aggressiveness: 'limite' })`.
     * Feedback: Exige agressividade defensiva máxima. Melhora interceções e sobe o risco de faltas.
   * **Ação 2: "🤝 Incentivo e Calma Tática":**
     * Executa: `setActiveHomeTactics({ ...t, attackPace: 'Ataque Organizado Paciente' })`.
     * Feedback: Diminui perdas de bola por passos e foca nas jogadas de combinação com o pivô.
   * **Ação 3: "📐 Mudar Defesa de Urgência":**
     * 4 botões de clique rápido: `6:0`, `5:1`, `3:3`, `4:2`. Altera a postura tática da equipa sem reiniciar o jogo.
   * **Botão "Retomar o Jogo":** Fecha o modal e retoma a contagem do tempo.
4. **Substituições em Direto (Live Substitutions):**
   * Lista os 7 atletas que estão no ringue com indicação em tempo real da sua **Energia Atual (0-100%)**.
   * Ao clicar num jogador de campo com energia baixa (<50%), abre a lista dos suplentes no banco de reservas.
   * Ao selecionar um suplente, executa a troca no segundo seguinte sem penalização de paragem.
5. **Feed Narrativo de Lances (Live Feed):**
   * Rola os acontecimentos do motor com crachás coloridos:
     * `⚽ GOLO` (Verde esmeralda)
     * `🎯 GOLO 7M` (Âmbar)
     * `🧤 DEFESA DO GR` (Azul)
     * `🛑 EXCLUSÃO 2 MIN` (Vermelho vivo)
     * `⚠️ CARTÃO AMARELO` (Amarelo)
     * `Perda de Bola / Passos` (Cinzento)
6. **Aba de Estatísticas em Direto:**
   * Apresenta barras comparativas de Remates Totais, Eficácia de Remate (%), Defesas do Guarda-Redes (%), Livres de 7m Marcados e Faltas Cometidas.
7. **Botão Final "Terminar Jornada & Registar":**
   * Surge apenas aos 60 minutos de jogo.
   * Executa `applyWeeklyMatchResult()`: credita os pontos na tabela de classificação (3 por vitória, 2 por empate, 1 por derrota), calcula as receitas de bilheteira do pavilhão e atualiza o termómetro da direção.

---

## 3.4 SEPARADOR 3: GESTÃO DO PLANTEL & FICHA MOLECULAR DO ATLETA

Localizado em `src/components/squad/SquadManagementView.tsx`.

### Elementos e Botões:
1. **Filtros de Posição:**
   * Botões de comutação rápida: `Todos`, `Guarda-Redes (GR)`, `Pontas (PE/PD)`, `Laterais (LE/LD)`, `Centrais (C)`, `Pivôs (P)`.
2. **Caixa de Pesquisa Textual:** Permite filtrar jogadores por nome em tempo real.
3. **Cartões de Jogador na Grelha:**
   * Mostra Nome, Idade, Posição primária com cor identificativa, OVR em caixa azul, Energia com percentagem colorida e badge de Moral (`⭐ Estrelado`, `🔥 Excelente`, `💪 Motivado`, `Normal`, `⚠️ Em baixo`).
   * **Botão "Ver Ficha Completa":** Abre o modal molecular do atleta.
   * **Botão "Colocar no Mercado / Retirar":**
     * Executa `handleToggleTransferList(player)`.
     * Alterna o estado `transferListed` entre `true` e `false`. Se ativo, permite receber propostas de outros clubes.
4. **Modal "Ficha Molecular do Atleta":**
   * **Radar Visual de Atributos:** Gráfico comparativo de Remate Exterior, 1v1, Visão, 7 Metros e Desarme/Bloqueio.
   * **Métricas Físicas:** Barra de Resistência à Fadiga e barra de Energia Atual.
   * **Ficha Contratual:** Vencimento semanal (`€/sem`), anos restantes de contrato e valor de mercado estimado.
   * **Botão "Renovar Contrato":**
     * Abre a proposta oficial: o jogador exige um prémio de assinatura ($8\%$ do seu valor de mercado) e um aumento de $25\%$ no salário semanal.
     * Se o utilizador aceitar, deduz o prémio da tesouraria do clube, estende o contrato por $+2$ épocas, remove a ameaça de saída a custo zero e sobe o moral do jogador para `Estrelado`.
   * **Botão "Dispensar Atleta (Rescindir)":**
     * Calcula a indemnização compensatória proporcional aos anos restantes de contrato e liberta o jogador para a lista de jogadores livres.

---

## 3.5 SEPARADOR 4: PRANCHETA TÁTICA & ALINHAMENTO DO 7 INICIAL

Localizado em `src/components/tactics/TacticsView.tsx`.

### Elementos e Ações:
1. **O Campo Taraflex de Andebol 40x20m:**
   * Desenho geométrico vetorial rigoroso com piso azul, área de baliza de 6 metros a cor de laranja, linha tracejada de 9 metros, marcação central do livre de 7 metros e balizas com riscas oficiais a vermelho e branco.
2. **Os 7 Nós Interativos do Sete Inicial:**
   * Posições: `GR` (na baliza), `PE` (na quina esquerda), `LE` (aos 9m na meia-esquerda), `C` (no eixo central dos 9m), `LD` (aos 9m na meia-direita), `PD` (na quina direita) e `P` (no centro dos 6m adversários).
   * Cada nó apresenta a camisola oficial nas cores do clube, o número, a abreviatura do nome e a medalha dourada com o seu OVR.
3. **Gaveta de Seleção e Troca de Atletas:**
   * **Como funciona:** O utilizador clica em qualquer posição do campo (ex.: clica no nó do `Central`).
   * Abre-se imediatamente a gaveta lateral direita listando todos os atletas do plantel aptos a jogar nessa vaga.
   * Cada candidato mostra o seu OVR, energia atual e compatibilidade tática.
   * **Botão "Escalar [Nome do Jogador]":** Aloca o jogador escolhido na posição selecionada e coloca o titular anterior no banco de reservas.
4. **Botão "⚡ Auto-Escalar (Melhor 7 Disponível)":**
   * Algoritmo inteligente que analisa todo o plantel e escolhe o 7 titular perfeito, combinando os maiores atributos moleculares com os atletas de maior frescura física (>70% de energia).
5. **Seletor dos 4 Sistemas Defensivos:**
   * Quatro cartões modernos para alternar entre:
     * `Defesa 6:0 (A Muralha)`
     * `Defesa 5:1 (Pressão ao Central)`
     * `Defesa 3:3 (Pressão Aberta / Agressiva)`
     * `Defesa 4:2 (Pressão em Linha Dupla)`
   * Cada cartão detalha as vantagens e desvantagens diretas no motor de cálculo.
6. **Seletores de Estilo Ofensivo e Ritmo:**
   * **Ritmo:** Botões de comutação entre `Contra-Ataque Alucinante` (+saídas rápidas de 1ª vaga) e `Ataque Organizado Paciente` (circulação de bola segura).
   * **Foco de Finalização:** Comutador entre `Remates Exteriores (9m)`, `Entradas do Pivô (6m)`, `Infiltrações das Pontas (Alas)` e `Equilibrado`.
7. **Interruptor Tático Especial (7 vs 6 - Guarda-Redes Avançado):**
   * *Toggle* que ativa a saída do guarda-redes para a entrada de um 2º pivô de campo no ataque. Concede bónus ofensivo mas deixa a baliza deserta perante perdas de bola.

---

## 3.6 SEPARADOR 5: MERCADO DE TRANSFERÊNCIAS

Localizado em `src/components/market/TransferMarket.tsx`.

### 3 Abas Internas:
1. **Aba 1: Mercado de Clubes (Transferências com Passe):**
   * Lista jogadores sob contrato noutros clubes da liga portuguesa.
   * Mostra OVR, idade, posição, clube atual e valor de mercado em Euros.
   * **Botão "Fazer Proposta":** Abre a janela de negociação de transferência. O utilizador define o valor oferecido. Se o montante for superior a $90\%$ do valor de mercado, o clube vendedor aceita e avança-se para o salário semanal.
2. **Aba 2: Jogadores Livres (Custo Zero de Passe):**
   * Lista atletas sem clube (desempregados).
   * **Botão "Contratar Imediatamente":** Permite integrar o atleta no plantel pagando apenas o vencimento semanal acordado e um pequeno prémio de assinatura.
3. **Aba 3: Venda de Jogadores do Clube:**
   * Lista todos os jogadores do clube do utilizador com status `transferListed = true`.
   * Permite aceitar ofertas emitidas pela IA de outros clubes e encaixar o dinheiro a pronto na conta do clube.

---

## 3.7 SEPARADOR 6: PAVILHÃO, CENTRO DE TREINOS, ACADEMIA E DEPARTAMENTO MÉDICO

Localizado em `src/components/facilities/FacilitiesView.tsx`.

### 4 Módulos de Gestão:
1. **Obras e Expansão do Pavilhão:**
   * Imagem de alta definição gerada por IA da arena vista das bancadas.
   * Apresenta a capacidade atual (ex.: 2.500 lugares) e a receita gerada por jornada em casa.
   * **Botão "Obras de Expansão (+500 Lugares)":**
     * Custo: €75.000.
     * Executa `upgradeArenaCapacity(500, 75000)`. Aumenta a lotação máxima, sobe a massa de adeptos associados e incrementa as receitas futuras de bilheteira.
   * **Seletor de Preço do Bilhete:** Permite definir o valor do bilhete entre €5 e €35.
2. **Ciclo Semanal de Treinos (Seleção de Foco):**
   * 4 opções de trabalho coletivo com impacto nas segundas-feiras:
     * `Carga Física`: Sobe estamina a longo prazo, mas consome $-18\%$ de energia imediata.
     * `Foco Tático`: Aumenta desarme coletivo e entrosamento.
     * `Finalização & Guarda-Redes`: Melhora potência de remate exterior e reflexos dos guardiões.
     * `Descanso Total`: Regenera $+30\%$ de energia a todo o plantel.
3. **Escola de Formação (Academia de Juniores):**
   * Lista os 3 jovens talentos da formação gerados pelo clube.
   * **Botão "Promover ao Plantel Principal":**
     * Executa `promoteYouthPlayer(playerId)`. Transfere o jovem júnior diretamente para a equipa sénior com contrato de 3 épocas.
   * **Botão "Investir na Escola de Formação (€50.000)":** Aumenta o nível das instalações para gerar juniores com OVR superior (65-75).
4. **Departamento Médico (Relatório Clínico de Lesões):**
   * Lista os atletas lesionados com tipo de lesão (ex.: *Rotura de ligamentos no joelho*, *Entorse no tornozelo*) e semanas de paragem.
   * **Botão "Tratamento Acelerado com Especialista":** Paga uma taxa médica para reduzir o tempo de paragem a metade.

---

## 3.8 SEPARADOR 7: CLASSIFICAÇÃO DA LIGA

Localizado em `src/components/league/LeagueStandings.tsx`.

### Tabela Oficial de Andebol:
* Sistema oficial de pontuação de andebol:
  * **Vitória:** 3 Pontos
  * **Empate:** 2 Pontos
  * **Derrota:** 1 Ponto
  * **Falta de Comparência:** 0 Pontos
* Colunas exibidas com números tabulares alinhados:
  * Posição (`#`), Clube, Jogos (`J`), Vitórias (`V`), Empates (`E`), Derrotas (`D`), Golos Marcados (`GM`), Golos Sofridos (`GS`), Diferença de Golos (`DG`) e Pontos (`Pts`).
* **Zonas de Destaque por Cores:**
  * Linha verde / dourada: Linha do clube do utilizador destacada.
  * Posições 1 a 4: Zona de Apuramento para as Competições Europeias (EHF European League).
  * Últimas 2 posições: Zona de Despromoção à 2ª Divisão Nacional.

---

# 4. MODAIS E FERRAMENTAS COMPLEMENTARES

---

### 4.1 Modal de Empréstimos Bancários (Crédito BCP)
* Localizado em `src/components/finance/BankLoanModal.tsx`.
* **Como funciona:** O treinador pode solicitar crédito bancário de emergência entre €50.000 e €500.000.
* A taxa de juro base é de $8\%$ calculada pelo motor financeiro.
* O valor é creditado na hora no orçamento do clube.
* A prestação é debitada automaticamente todas as semanas até liquidação total.
* **Botão "Amortizar Empréstimo a Pronto":** Se o clube tiver liquidez, pode saldar a dívida num clique para poupar encargos com juros futuros.

---

### 4.2 Modal de Patrocinadores Misteriosos e Comerciais
* Localizado em `src/components/finance/MysterySponsorModal.tsx`.
* Apresenta 3 propostas de patrocínio com marcas comerciais.
* Cada proposta oferece um bónus de assinatura imediato e um pagamento fixo semanal garantido até ao final da temporada desportiva.

---

### 4.3 Modal de Agendamento Multijogador
* Localizado em `src/components/multiplayer/MatchScheduleModal.tsx`.
* Permite enviar propostas de partidas amigáveis ou oficiais contra outros utilizadores humanos registados no sistema, agendando o dia e hora da jornada.

---

### 4.4 Assistente de Criação de Clube (Wizard de Fundação)
* Localizado em `src/components/club/ClubCreationWizard.tsx`.
* Disparado no primeiro acesso ou ao reiniciar a carreira:
  * **Passo 1:** Nome do Clube, Cidade e Alcunha dos Adeptos.
  * **Passo 2:** Escolha da Camisola Oficial (catálogo com 1.000 combinações possíveis de cores, riscas e golas).
  * **Passo 3:** Escolha do Pavilhão Municipal ou Arena Privada (com imagem IA e lotação inicial).
  * **Passo 4:** Nomeação do Treinador e Estilo Tático de Referência.
  * **Passo 5:** Escolha da Divisão e Série Geográfica (`Série Norte`, `Série Centro`, `Série Sul`).
  * **Passo 6:** Confirmação do Orçamento Base Inicial (€1.500.000) e geração do plantel inicial.

---

### 4.5 Matriz Central de Regras (Admin Matrix)
* Localizado em `src/components/admin/AdminMatrixModal.tsx`.
* **Acesso Restrito:** Apenas o e-mail `rochap.filipe@gmail.com` tem permissão de entrada.
* **Controlos de Calibração do Universo de Jogo:**
  * Multiplicador de eficácia de contra-ataque rápido.
  * Taxa de juro base do Crédito BCP.
  * Probabilidade de remates aos postes.
  * Botão de injeção de fundos de emergência para testes de tesouraria.

---

# 5. CICLO SEMANAL, FINANÇAS E TRANSIÇÃO DE ÉPOCA

---

### 5.1 Fórmulas Financeiras de Bilheteira e Salários

Em cada jogo disputado em casa, a receita de bilheteira é calculada por:
$$\text{Assistência} = \min\left(\text{Lotação do Pavilhão}, \text{Massa Associativa} \times \left(1.1 - \frac{\text{Preço do Bilhete}}{40}\right) \times \frac{\text{OVR Médio}}{80}\right)$$
$$\text{Receita de Bilheteira} = \text{Assistência} \times \text{Preço do Bilhete}$$

Nas segundas-feiras, a folha salarial é deduzida da conta:
$$\text{Despesa Salarial Semanal} = \sum_{p \in \text{Plantel}} p.\text{wage}$$

---

### 5.2 O Termómetro da Direção e Regra de Despedimento Imediato

O valor varia entre **0% e 100%**:
* Vitória na Liga: $+5\%$
* Empate: $+1\%$
* Derrota em Casa: $-6\%$
* Derrota Fora: $-4\%$

**Regra de Game Over:**
Se o indicador atingir **0%**, despoleta-se de imediato o ecrã de rescisão de contrato com aviso: *"Foste Despedido! A direção perdeu a confiança no teu projeto desportivo após os maus resultados."* com botão para recomeçar noutro clube.

---

### 5.3 Algoritmos dos 4 Regimes de Treino Semanal

1. **💤 Descanso Total (`recuperacao_fisica`):**
   * $\text{Energia} = \min(100, \text{Energia} + 30)$
   * Reduz em 2x o risco de lesão.
2. **🎯 Finalização & Guarda-Redes (`remate_exterior`):**
   * $\text{Energia} = \max(20, \text{Energia} - 8)$
   * Probabilidade de subida de atributo ($40\%$ se jovem $\le 22$ anos; $20\%$ se sénior): $\text{Shooting} + 1$, $\text{OVR} + 1$.
3. **🛡️ Foco Tático (`defesa_coletiva`):**
   * $\text{Energia} = \max(20, \text{Energia} - 5)$
   * Probabilidade de subida ($40\%$ jovem, $20\%$ sénior): $\text{Defense} + 1$, $\text{OVR} + 1$.
4. **⚡ Carga Física (`aceleracao_tatica`):**
   * $\text{Energia} = \max(15, \text{Energia} - 18)$
   * Probabilidade de subida na Estamina e OVR.

---

### 5.4 Fim de Época: Envelhecimento, Retiradas e Academia

Ao completar a **Semana 22**:
* Todos os jogadores somam $+1$ ano à idade (`age = age + 1`).
* Jogadores com **35 ou mais anos** sofrem regressão de $-1$ a $-3$ pontos de OVR por perda de velocidade e flexibilidade.
* Jogadores que atinjam os **39 anos** anunciam a retirada oficial do andebol ativo e são removidos do plantel.
* Os contratos abatem $-1$ ano. Quem fica com 0 anos e não renovou torna-se jogador livre.
* A Academia de Formação gera 3 novos atletas juniores com idades entre os 16 e 18 anos.

---

# 6. GUIA PARA O TREINADOR / UTILIZADOR: O QUE EDITAR, RETIRAR OU ACRESCENTAR

Com esta radiografia exaustiva, tens o mapa completo do sistema. Podes agora orientar com precisão o que pretendes que seja ajustado:

### 1. Queres Editar Alguma Regra ou Cálculo?
* *Exemplo:* Alterar a média de golos por jogo de 25-35 para outro intervalo.
* *Exemplo:* Mudar a velocidade de desgaste da energia física para ser mais branda ou mais dura.
* *Exemplo:* Alterar as penalizações de falta ou o peso do livre de 7 metros.

### 2. Queres Retirar Algum Botão ou Funcionalidade?
* *Exemplo:* Remover os empréstimos bancários para uma experiência puramente desportiva.
* *Exemplo:* Eliminar a tática de 7 contra 6 caso prefiras apenas o andebol tradicional.
* *Exemplo:* Simplificar os atributos moleculares para uma versão mais casual.

### 3. Queres Acrescentar Novas Funcionalidades?
* *Exemplo:* Um animador 2D com a bola a deslocar-se no campo Taraflex durante o relato em direto.
* *Exemplo:* Sorteio e quadro eliminatório da Taça de Portugal.
* *Exemplo:* Histórico de títulos e troféus conquistados no currículo do treinador.
* *Exemplo:* Cláusulas de rescisão obrigatórias nas renovações de contrato.
