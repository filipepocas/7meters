/**
 * 7meters - Entity Generator
 * Orquestrador e gerador procedural do ecossistema e universo inicial do jogo.
 * Cria ligas, clubes, plantéis, equipas técnicas, árbitros, patrocinadores e jogadores livres.
 */

import { INITIAL_CLUBS_DATA, SPONSORS_POOL } from '../../core/constants';
import { Club } from '../../types/club.types';
import { League } from '../../types/league.types';
import { Player } from '../../types/player.types';
import { Referee } from '../../types/referee.types';
import { Sponsor } from '../../types/sponsor.types';
import { StaffMember } from '../../types/staff.types';
import { generateRandomIdentity } from './nameGen';
import { generateClubSquad, generateRandomPlayer } from './playerGen';
import { generateClubStaff, generateRandomStaffMember } from './staffGen';
import { getArenaById } from './arenaGen';

export interface UniverseInitialData {
  leagues: League[];
  clubs: Club[];
  players: Player[];
  staff: StaffMember[];
  freeAgentPlayers: Player[];
  freeAgentStaff: StaffMember[];
  referees: Referee[];
  sponsors: Sponsor[];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera uma lista de árbitros para o campeonato.
 */
export function generateReferees(count = 12): Referee[] {
  const referees: Referee[] = [];
  for (let i = 0; i < count; i++) {
    const mainIdentity = generateRandomIdentity();
    const assistantIdentity = generateRandomIdentity();
    referees.push({
      id: `ref_${Math.random().toString(36).substring(2, 11)}_${Date.now()}_${i}`,
      mainRefereeName: `${mainIdentity.firstName} ${mainIdentity.lastName}`,
      assistantRefereeName: `${assistantIdentity.firstName} ${assistantIdentity.lastName}`,
      strictness: getRandomInt(1, 10),
      experience: getRandomInt(1, 10),
      cardTendency: getRandomInt(1, 10),
      reputation: getRandomInt(40, 95),
      matchesOfficiated: 0,
    });
  }
  return referees;
}

/**
 * Gera a pool de patrocinadores disponíveis para contratação pelos clubes.
 */
export function generateSponsorsPool(): Sponsor[] {
  return SPONSORS_POOL.map((sp, idx) => ({
    id: `spn_${idx + 1}_${Math.random().toString(36).substring(2, 8)}`,
    name: sp.name,
    companyName: sp.name,
    type: sp.type,
    tier: 'Nacional',
    activityDescription: 'Empresa com grande ligação e tradição no andebol português.',
    isRevealed: true,
    weeklyPayout: sp.weeklyPayout,
    weeklyAmount: sp.weeklyPayout,
    seasonBonus: sp.seasonBonus,
    contractYears: sp.contractYears,
    contractWeeks: sp.contractYears * 24,
    minimumReputation: sp.minimumReputation,
    logoUrl: sp.logoUrl || '',
  }));
}

/**
 * Inicializa todo o universo do 7meters com os clubes predefinidos e procedurais.
 */
export function generateFullGameUniverse(): UniverseInitialData {
  const clubs: Club[] = [];
  const allPlayers: Player[] = [];
  const allStaff: StaffMember[] = [];

  INITIAL_CLUBS_DATA.forEach((clubData, idx) => {
    const clubId = `clb_${idx + 1}_${clubData.shortName.toLowerCase()}`;
    const squad = generateClubSquad(clubId, clubData.reputationTier || 5);
    const staff = generateClubStaff(clubId, clubData.reputationTier || 5);

    allPlayers.push(...squad);
    allStaff.push(...staff);

    const arenaData = getArenaById((idx + 1) * 110);

    const club: Club = {
      id: clubId,
      name: clubData.name,
      shortName: clubData.shortName,
      city: clubData.city,
      foundationYear: clubData.foundationYear,
      level: 'Nacional',
      colors: clubData.colors,
      budget: clubData.initialBudget,
      reputation: clubData.reputationTier ? clubData.reputationTier * 10 : 50,
      fanbase: Math.round(clubData.arenaCapacity * 0.8),
      stadiumCapacity: clubData.arenaCapacity,
      arena: {
        name: clubData.arenaName,
        capacity: clubData.arenaCapacity,
        ticketPrice: clubData.ticketPrice,
        condition: 100,
        imagePath: arenaData.imagePath,
        rentalOrMaintenanceCost: arenaData.rentalOrMaintenanceCost,
        energyEfficiencyRating: arenaData.energyEfficiencyRating,
        prestigeBonus: arenaData.prestigeBonus,
      },
      sponsors: {
        main: null,
        secondary: [],
      },
      squadIds: squad.map((p) => p.id),
      staffIds: staff.map((s) => s.id),
    };

    clubs.push(club);
  });

  const freeAgentPlayers: Player[] = [];
  for (let i = 0; i < 25; i++) {
    const freePlayer = generateRandomPlayer(undefined, getRandomInt(2, 7), null);
    freeAgentPlayers.push(freePlayer);
  }

  const freeAgentStaff: StaffMember[] = [];
  for (let i = 0; i < 10; i++) {
    const freeStaff = generateRandomStaffMember(undefined, getRandomInt(2, 7), null);
    freeAgentStaff.push(freeStaff);
  }

  const mainLeague: League = {
    id: 'league_andebol_1',
    name: 'Liga de Andebol 1 (Divisão de Honra)',
    country: 'Portugal',
    season: 1,
    currentRound: 1,
    totalRounds: (clubs.length - 1) * 2,
    clubIds: clubs.map((c) => c.id),
    standings: clubs.map((c) => ({
      clubId: c.id,
      clubName: c.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })),
  };

  return {
    leagues: [mainLeague],
    clubs,
    players: [...allPlayers, ...freeAgentPlayers],
    staff: [...allStaff, ...freeAgentStaff],
    freeAgentPlayers,
    freeAgentStaff,
    referees: generateReferees(10),
    sponsors: generateSponsorsPool(),
  };
}
