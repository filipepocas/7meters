/**
 * 7meters - Time & Calendar Engine
 * Gestor do avanço de tempo, processamento de semanas de trabalho,
 * pagamentos financeiros (salários e patrocínios), evolução de lesões e treinos.
 */

import { Club } from '../types/club.types';
import { Player } from '../types/player.types';
import { StaffMember } from '../types/staff.types';

export interface WeeklyFinancialReport {
  clubId: string;
  totalSalariesPaid: number;
  totalSponsorIncome: number;
  netFinancialBalance: number;
}

export interface WeekAdvanceResult {
  currentWeek: number;
  financialReports: WeeklyFinancialReport[];
  recoveredPlayerIds: string[];
  updatedPlayers: Player[];
}

/**
 * Processa a evolução de lesões dos jogadores ao longo de uma semana.
 */
export function processPlayerInjuries(players: Player[]): { updatedPlayers: Player[]; recoveredPlayerIds: string[] } {
  const recoveredPlayerIds: string[] = [];

  const updatedPlayers = players.map((player) => {
    if (!player.injury || !player.injury.isInjured) {
      return player;
    }

    const remainingDays = Math.max(0, player.injury.daysRemaining - 7);
    const isNowHealthy = remainingDays === 0;

    if (isNowHealthy) {
      recoveredPlayerIds.push(player.id);
    }

    return {
      ...player,
      injury: {
        ...player.injury,
        daysRemaining: remainingDays,
        isInjured: !isNowHealthy,
      },
      energyLevel: Math.min(100, player.energyLevel + 15),
    };
  });

  return { updatedPlayers, recoveredPlayerIds };
}

/**
 * Executa o cálculo financeiro semanal para todos os clubes ativos.
 */
export function processWeeklyFinances(
  clubs: Club[],
  players: Player[],
  staff: StaffMember[]
): { updatedClubs: Club[]; financialReports: WeeklyFinancialReport[] } {
  const financialReports: WeeklyFinancialReport[] = [];

  const updatedClubs = clubs.map((club) => {
    const clubPlayers = players.filter((p) => (p.currentClubId === club.id || p.clubId === club.id));
    const playerSalaries = clubPlayers.reduce((acc, p) => acc + (p.salary ? p.salary / 4 : p.wage || 500), 0);

    const clubStaff = staff.filter((s) => s.currentClubId === club.id);
    const staffSalaries = clubStaff.reduce((acc, s) => acc + (s.salary / 4), 0);

    const arenaMaintenance = club.arena?.rentalOrMaintenanceCost ? Math.round(club.arena.rentalOrMaintenanceCost / 4) : 1000;

    const totalSalaries = Math.round(playerSalaries + staffSalaries + arenaMaintenance);

    let sponsorIncome = 0;
    if (club.sponsors.main) {
      sponsorIncome += club.sponsors.main.weeklyPayout || club.sponsors.main.weeklyAmount || 0;
    }
    club.sponsors.secondary.forEach((sp) => {
      sponsorIncome += sp.weeklyPayout || sp.weeklyAmount || 0;
    });

    const netBalance = sponsorIncome - totalSalaries;
    const newBudget = club.budget + netBalance;

    financialReports.push({
      clubId: club.id,
      totalSalariesPaid: totalSalaries,
      totalSponsorIncome: sponsorIncome,
      netFinancialBalance: netBalance,
    });

    return {
      ...club,
      budget: newBudget,
    };
  });

  return { updatedClubs, financialReports };
}

/**
 * Avança o estado global do jogo em 1 semana (Ronda de calendário).
 */
export function advanceGameWeek(
  currentWeek: number,
  clubs: Club[],
  players: Player[],
  staff: StaffMember[]
): {
  nextWeek: number;
  updatedClubs: Club[];
  updatedPlayers: Player[];
  financialReports: WeeklyFinancialReport[];
  recoveredPlayerIds: string[];
} {
  const { updatedPlayers, recoveredPlayerIds } = processPlayerInjuries(players);
  const { updatedClubs, financialReports } = processWeeklyFinances(clubs, updatedPlayers, staff);

  return {
    nextWeek: currentWeek + 1,
    updatedClubs,
    updatedPlayers,
    financialReports,
    recoveredPlayerIds,
  };
}
