/**
 * 7meters - Player Types
 * Tipagem estrita para todos os atletas do universo do jogo.
 * Suporta escala 1-10, idades de 15 a 38 anos, histórico e métricas em campo.
 */

export type FullPlayerPosition =
  | 'Guarda-Redes'
  | 'Ponta Esquerdo'
  | 'Ponta Direito'
  | 'Lateral Esquerdo'
  | 'Lateral Direito'
  | 'Central'
  | 'Pivô';

export type ShortPosition = 'GR' | 'PE' | 'PD' | 'LE' | 'LD' | 'C' | 'PV' | 'P';

export type PlayerPosition = FullPlayerPosition | ShortPosition;
export type Position = PlayerPosition;

export type MoralLevel = 'Em baixo' | 'Normal' | 'Motivado' | 'Excelente' | 'Estrelado';

export interface PlayerMolecularAttributes {
  shotExterior: number;        // Remate Exterior 9m (1-100)
  penetration1v1: number;      // Penetração / 1v1 drible (1-100)
  visionDistribution: number;  // Visão de Jogo / Distribuição central (1-100)
  sevenMeterShot: number;      // Eficácia em 7 Metros (1-100)
  defensiveBlock: number;      // Desarme / Bloqueio Defensivo 6m (1-100)

  // Atributos Exclusivos de Guarda-Redes (1-100)
  gkReflexes: number;          // Reflexos à queima-roupa
  gkPositioning: number;        // Colocação face a remates exteriores
  gkSevenMeterSave: number;    // Defesa de 7 metros
  gkFastBreakRelease: number;  // Reposição rápida para contra-ataque

  // Atributos Físicos e Psicológicos (1-100)
  stamina: number;             // Resistência física e desgaste
  recoveryRate: number;        // Rapidez de recuperação de energia
}

export interface PlayerAttributes {
  stamina: number;           // Resistência física geral (1-10)
  shooting: number;          // Potência e precisão de remate (1-10)
  defense: number;           // Capacidade defensiva e bloco (1-10)
  speed: number;             // Velocidade e contra-ataque (1-10)
  intelligence: number;      // Leitura tática e passe (1-10)
  goalkeeping: number;       // Eficácia sob a baliza (1-10, exclusivo GR)
  pressureResistance: number;// Resistência à pressão em momentos decisivos (1-10)
  shoulderEndurance: number; // Resistência do ombro a remates repetidos (1-10)
}

export interface PlayerInjury {
  isInjured: boolean;
  description: string;       // Ex: "Tendinite no Ombro", "Rotura Fibras Coxa"
  daysRemaining: number;     // Dias de recuperação no tempo interno do jogo
  weeksRemaining?: number;   // Semanas de paragem para o relatório médico
  severity: 'ligeira' | 'moderada' | 'grave';
}

export interface PlayerStats {
  matchesPlayed: number;
  minutesPlayed: number;
  goalsScored: number;
  sevenMeterGoals: number;
  yellowCards: number;
  twoMinSuspensions: number;
  redCards: number;
  blueCards: number;
  saves: number;
  shotAttempts: number;
}

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  country: string;           // Nacionalidade (forte incidência em Portugal)
  age: number;               // 15 a 38 anos
  position: PlayerPosition;
  secondaryPosition?: PlayerPosition | 'Nenhuma';

  // Ficha Molecular Completa (Escala 1 a 100 - Estilo Elifoot)
  molecular?: PlayerMolecularAttributes;

  // Atributos de desempenho (compatibilidade 1-10 e 1-100)
  attributes: PlayerAttributes;

  overallRating: number;      // 1 a 100
  qualityRating: number;      // 1 a 10
  shooting: number;
  defense: number;
  goalkeeping: number;
  stamina: number;
  speed: number;
  intelligence: number;

  // Estado físico e psicológico
  moral: number;              // 1 a 10
  moralLevel?: MoralLevel;    // Em baixo, Normal, Motivado, Excelente, Estrelado
  energyLevel: number;        // 0% a 100%
  injury: PlayerInjury;
  benchedMatchesStreak?: number; // Contagem de jogos seguidos no banco

  // Situação Contratual e Financeira
  marketValue: number;        // Valor de mercado em Euros
  salary: number;             // Salário mensal em Euros
  wage: number;               // Salário semanal em Euros (salary / 4)
  contractYearsRemaining: number;
  isContractExpiringSoon?: boolean; // Último ano de contrato (pode sair a custo zero)
  transferListed?: boolean;   // Colocado na lista de transferências
  askingPrice?: number;       // Preço pedido em transferências
  releaseClause?: number;     // Cláusula de rescisão contratual

  currentClubId: string | null;
  clubId?: string | null;
  isHired: boolean;

  // Estatísticas da Época
  stats: PlayerStats;
}

export interface PlayerEvolutionsFactors {
  teamQualityImpact: number;
  staffImpact: number;
  minutesPlayedImpact: number;
  randomnessFactor: number;
}
