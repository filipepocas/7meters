/**
 * 7meters - Online Match & Scheduling Types
 * Definições para agendamento de jogos multiplayer, consentimento mútuo,
 * reagendamento de partidas e gestão automatizada de equipas ausentes ou inativas.
 */

export type OnlineMatchStatus =
  | 'pendente'
  | 'proposto'
  | 'pendente_aceitacao'
  | 'agendado'
  | 'recusado'
  | 'em_reagendamento'
  | 'concluido'
  | 'simulado_auto_ausencia';

export interface MatchScheduleProposal {
  proposalId: string;
  matchId: string;
  homeClubId: string;
  awayClubId: string;
  opponentClubName?: string;
  fixtureRound?: number;
  season?: number;
  proposedByClubId: string;
  proposedTimestamp: number;
  deadlineTimestamp: number;
  status: OnlineMatchStatus;
  rejectionReason?: string;
  rescheduleHistory: {
    proposedByClubId: string;
    proposedTimestamp: number;
    responseDate: number;
    status: 'aceite' | 'recusado';
  }[];
}

export interface PlayerActivityStatus {
  clubId: string;
  userId: string;
  lastActiveTimestamp: number;
  isOnline: boolean;
  isAutoPilotEnabled: boolean;
  missedMatchesCount: number;
}

export interface AutoSimTriggerConfig {
  matchId: string;
  isHomePlayerAbsent: boolean;
  isAwayPlayerAbsent: boolean;
  scheduledTimePassed: boolean;
  reason: 'falta_de_resposta' | 'prazo_limite_expirado' | 'jogador_offline';
}
