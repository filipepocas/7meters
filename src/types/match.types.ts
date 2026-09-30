/**
 * 7meters - Match Types
 * Tipagem estrita para o motor de simulação por frames e minuto a minuto.
 * Cobre incidências em tempo real, livres de 7 metros, exclusões de 2 minutos e dados do marcador.
 */

export type MatchEventType =
  | 'golo'
  | 'golo_7m'
  | 'goal'
  | '7m_goal'
  | '7m_miss'
  | 'defesa'
  | 'defesa_gr'
  | 'shot_saved'
  | 'remate_fora'
  | 'shot_missed'
  | 'falta_tecnica'
  | 'turnover'
  | 'foul'
  | 'cartao_amarelo'
  | 'yellow_card'
  | 'exclusao_2min'
  | 'two_min_suspension'
  | 'cartao_vermelho'
  | 'red_card'
  | 'blue_card'
  | 'injury'
  | 'timeout'
  | 'tactical_change'
  | 'momentum_shift'
  | 'dynamic_event';

export interface MatchEvent {
  id?: string;
  minute: number;
  second?: number;
  frameIndex?: number;
  type: MatchEventType;
  teamId?: string;
  clubId?: string;
  playerId?: string;
  assistantPlayerId?: string;
  description: string;
  isSevenMeter?: boolean;
  scoreHomeAfter?: number;
  scoreAwayAfter?: number;
}

export interface PlayerMatchStats {
  playerId: string;
  playerName: string;
  goals: number;
  shots: number;
  saves: number;
  assists: number;
  exclusions: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchResult {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeClubName: string;
  awayClubName: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  playerStats: {
    home: PlayerMatchStats[];
    away: PlayerMatchStats[];
  };
  simulatedAt: string;
}

export interface ActiveSuspension {
  playerId: string;
  teamId: string;
  frameStarted?: number;
  minuteStarted: number;
  minutesRemaining: number;
}

export interface TeamLiveStats {
  shotsTotal: number;
  shotsOnTarget: number;
  goals: number;
  sevenMetersAttempted: number;
  sevenMetersScored: number;
  saves: number;
  turnovers: number;
  steals: number;
  yellowCards: number;
  twoMinSuspensions: number;
  redCards: number;
  blueCards: number;
  timeoutsUsed: number;
}
