/**
 * 7meters - Calendar Engine
 * Gerador de calendário de liga, rodadas (jornadas) e emparelhamento de jogos (Home/Away).
 * Aplica o algoritmo Berger (Round-Robin) para gerar épocas completas de andebol com duas voltas.
 */

import { Club } from '../types/club.types';

export interface FixtureMatch {
  id: string;
  leagueId: string;
  season: number;
  round: number;
  homeClubId: string;
  awayClubId: string;
  status: 'agendado' | 'concluido' | 'adiado';
  homeScore?: number;
  awayScore?: number;
  proposalId?: string;
}

export interface RoundFixtures {
  roundNumber: number;
  matches: FixtureMatch[];
}

/**
 * Aplica o algoritmo de Round-Robin para gerar os jogos de ida e volta (voltas e retornos) para uma liga.
 */
export function generateLeagueCalendar(
  leagueId: string,
  clubs: Club[],
  season = 1,
  startWeek = 1
): RoundFixtures[] {
  const clubIds = clubs.map((c) => c.id);
  const totalClubs = clubIds.length;

  if (totalClubs < 2) {
    return [];
  }

  const isOdd = totalClubs % 2 !== 0;
  const list = [...clubIds];
  if (isOdd) {
    list.push('BYE');
  }

  const numTeams = list.length;
  const numRoundsSingle = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  const rounds: RoundFixtures[] = [];

  // 1. PRIMEIRA VOLTA (Jogos de Ida)
  for (let roundIdx = 0; roundIdx < numRoundsSingle; roundIdx++) {
    const roundNumber = startWeek + roundIdx;
    const matches: FixtureMatch[] = [];

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const home = list[matchIdx];
      const away = list[numTeams - 1 - matchIdx];

      if (home !== 'BYE' && away !== 'BYE') {
        const isAlternate = (roundIdx + matchIdx) % 2 === 0;
        const homeClubId = isAlternate ? home : away;
        const awayClubId = isAlternate ? away : home;

        matches.push({
          id: `mth_lg_${leagueId}_s${season}_r${roundNumber}_${homeClubId}_vs_${awayClubId}`,
          leagueId,
          season,
          round: roundNumber,
          homeClubId,
          awayClubId,
          status: 'agendado',
        });
      }
    }

    rounds.push({
      roundNumber,
      matches,
    });

    list.splice(1, 0, list.pop()!);
  }

  // 2. SEGUNDA VOLTA (Jogos de Volta - Inversão do mando de campo)
  const firstLegRoundsCount = rounds.length;
  for (let roundIdx = 0; roundIdx < firstLegRoundsCount; roundIdx++) {
    const firstLegRound = rounds[roundIdx];
    const secondLegRoundNumber = startWeek + numRoundsSingle + roundIdx;

    const secondLegMatches: FixtureMatch[] = firstLegRound.matches.map((firstLegMatch) => ({
      id: `mth_lg_${leagueId}_s${season}_r${secondLegRoundNumber}_${firstLegMatch.awayClubId}_vs_${firstLegMatch.homeClubId}`,
      leagueId,
      season,
      round: secondLegRoundNumber,
      homeClubId: firstLegMatch.awayClubId,
      awayClubId: firstLegMatch.homeClubId,
      status: 'agendado',
    }));

    rounds.push({
      roundNumber: secondLegRoundNumber,
      matches: secondLegMatches,
    });
  }

  return rounds;
}

/**
 * Obtém os jogos agendados para uma determinada jornada.
 */
export function getFixturesForRound(calendar: RoundFixtures[], roundNumber: number): FixtureMatch[] {
  const roundData = calendar.find((r) => r.roundNumber === roundNumber);
  return roundData ? roundData.matches : [];
}
