/**
 * 7meters - League Types
 * Definição de ligas, jornadas, classificações e pontuações do campeonato de andebol.
 */

export interface StandingRow {
  clubId: string;
  clubName?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number; // Andebol: Vitória = 3, Empate = 2, Derrota = 1
}

export interface League {
  id: string;
  name: string;
  country: string;
  season: number;
  currentRound: number;
  totalRounds: number;
  clubIds: string[];
  standings: StandingRow[];
}
