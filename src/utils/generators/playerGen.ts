/**
 * 7meters - Player Generator
 * Gerador procedural de atletas com perfilamento técnico e físico hiper-realista.
 * Garante calibração de atributos (1 a 10) especializada por posição de jogo,
 * cálculo dinâmico de valor de mercado e salários baseados no potencial e idade.
 */

import { GAME_CONFIG, PLAYER_POSITIONS } from '../../core/constants';
import { Player, PlayerAttributes, PlayerPosition } from '../../types/player.types';
import { generateRandomIdentity } from './nameGen';

function clampStat(val: number): number {
  return Math.max(GAME_CONFIG.STATS_MIN, Math.min(GAME_CONFIG.STATS_MAX, Math.round(val)));
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mapeia posições curtas para posições completas e vice-versa.
 */
export function normalizePosition(pos: string): PlayerPosition {
  switch (pos) {
    case 'GR': return 'Guarda-Redes';
    case 'PE': return 'Ponta Esquerdo';
    case 'PD': return 'Ponta Direito';
    case 'LE': return 'Lateral Esquerdo';
    case 'LD': return 'Lateral Direito';
    case 'C': return 'Central';
    case 'PV': return 'Pivô';
    default: return pos as PlayerPosition;
  }
}

/**
 * Converte posição completa em sigla curta.
 */
export function toShortPosition(pos: string): string {
  switch (pos) {
    case 'Guarda-Redes': return 'GR';
    case 'Ponta Esquerdo': return 'PE';
    case 'Ponta Direito': return 'PD';
    case 'Lateral Esquerdo': return 'LE';
    case 'Lateral Direito': return 'LD';
    case 'Central': return 'C';
    case 'Pivô': return 'PV';
    default: return pos;
  }
}

/**
 * Gera atributos (1 a 10) ajustados à posição específica do atleta.
 */
function generateAttributesByPosition(position: PlayerPosition, overallTier: number): PlayerAttributes {
  const v = () => getRandomInt(-1, 1);

  let stamina = overallTier + v();
  let shooting = overallTier + v();
  let defense = overallTier + v();
  let speed = overallTier + v();
  let intelligence = overallTier + v();
  let goalkeeping = 1;
  let pressureResistance = overallTier + v();
  let shoulderEndurance = overallTier + v();

  const normPos = normalizePosition(position);

  switch (normPos) {
    case 'Guarda-Redes':
      goalkeeping = overallTier + getRandomInt(0, 2);
      shooting = getRandomInt(1, 3);
      defense = getRandomInt(1, 3);
      speed = overallTier - 1 + v();
      shoulderEndurance = getRandomInt(2, 5);
      break;

    case 'Ponta Esquerdo':
    case 'Ponta Direito':
      speed = overallTier + getRandomInt(1, 2);
      shooting = overallTier + v();
      stamina = overallTier + v();
      defense = overallTier - 1 + v();
      shoulderEndurance = overallTier + v();
      break;

    case 'Lateral Esquerdo':
    case 'Lateral Direito':
      shooting = overallTier + getRandomInt(1, 2);
      shoulderEndurance = overallTier + getRandomInt(1, 2);
      stamina = overallTier + v();
      intelligence = overallTier + v();
      break;

    case 'Central':
      intelligence = overallTier + getRandomInt(1, 2);
      stamina = overallTier + v();
      shooting = overallTier + v();
      pressureResistance = overallTier + getRandomInt(0, 2);
      break;

    case 'Pivô':
      defense = overallTier + getRandomInt(1, 2);
      stamina = overallTier + getRandomInt(1, 2);
      shoulderEndurance = overallTier + v();
      speed = overallTier - 1 + v();
      break;
  }

  return {
    stamina: clampStat(stamina),
    shooting: clampStat(shooting),
    defense: clampStat(defense),
    speed: clampStat(speed),
    intelligence: clampStat(intelligence),
    goalkeeping: clampStat(goalkeeping),
    pressureResistance: clampStat(pressureResistance),
    shoulderEndurance: clampStat(shoulderEndurance),
  };
}

/**
 * Calcula o valor de mercado estimado em Euros (€) com base nos atributos e idade.
 */
function calculateMarketValue(attributes: PlayerAttributes, age: number, position: PlayerPosition): number {
  const isGK = normalizePosition(position) === 'Guarda-Redes';
  const relevantSum = isGK
    ? attributes.goalkeeping * 3 + attributes.stamina + attributes.intelligence + attributes.pressureResistance
    : attributes.shooting * 2 + attributes.defense * 2 + attributes.stamina + attributes.speed + attributes.intelligence + attributes.shoulderEndurance;

  const baseVal = relevantSum * 12500;

  let ageMultiplier = 1.0;
  if (age >= 18 && age <= 23) ageMultiplier = 1.45;
  else if (age >= 24 && age <= 29) ageMultiplier = 1.25;
  else if (age >= 30 && age <= 34) ageMultiplier = 0.85;
  else if (age >= 35) ageMultiplier = 0.50;

  return Math.round(baseVal * ageMultiplier);
}

/**
 * Gera um jogador completo para o universo do 7meters.
 */
export function generateRandomPlayer(
  forcedPosition?: PlayerPosition,
  forcedTier?: number,
  clubId: string | null = null
): Player {
  const identity = generateRandomIdentity();
  const position = forcedPosition || PLAYER_POSITIONS[Math.floor(Math.random() * PLAYER_POSITIONS.length)];
  const age = getRandomInt(GAME_CONFIG.INITIAL_PLAYER_AGE_MIN, GAME_CONFIG.INITIAL_PLAYER_AGE_MAX);

  const tier = forcedTier || getRandomInt(3, 8);
  const attributes = generateAttributesByPosition(position, tier);
  const marketValue = calculateMarketValue(attributes, age, position);

  const salary = Math.max(800, Math.round((marketValue * 0.02) / 12));
  const wage = Math.round(salary / 4);

  // Overall rating formatado 1-99 ou tier correspondente
  const overallRating = Math.min(99, Math.max(40, tier * 10 + getRandomInt(2, 8)));

  const fullName = `${identity.firstName} ${identity.lastName}`;

  // Atribuição de Posição Secundária realista de Andebol
  const normPos = normalizePosition(position);
  let secondaryPosition: PlayerPosition | 'Nenhuma' = 'Nenhuma';
  if (normPos === 'Lateral Esquerdo') secondaryPosition = Math.random() < 0.6 ? 'Central' : 'Ponta Esquerdo';
  else if (normPos === 'Lateral Direito') secondaryPosition = Math.random() < 0.6 ? 'Central' : 'Ponta Direito';
  else if (normPos === 'Central') secondaryPosition = Math.random() < 0.5 ? 'Lateral Esquerdo' : 'Lateral Direito';
  else if (normPos === 'Ponta Esquerdo') secondaryPosition = Math.random() < 0.4 ? 'Ponta Direito' : 'Nenhuma';
  else if (normPos === 'Ponta Direito') secondaryPosition = Math.random() < 0.4 ? 'Ponta Esquerdo' : 'Nenhuma';
  else if (normPos === 'Pivô') secondaryPosition = Math.random() < 0.3 ? 'Central' : 'Nenhuma';

  // Ficha Molecular 1 a 100 adaptada ao estilo Elifoot
  const isGK = normPos === 'Guarda-Redes';
  const clamp100 = (val: number) => Math.max(25, Math.min(99, Math.round(val)));

  const molecular = {
    shotExterior: isGK ? getRandomInt(10, 30) : clamp100(overallRating + (normPos.includes('Lateral') ? getRandomInt(4, 9) : getRandomInt(-8, 3))),
    penetration1v1: isGK ? getRandomInt(10, 30) : clamp100(overallRating + (normPos === 'Central' || normPos.includes('Ponta') ? getRandomInt(3, 8) : getRandomInt(-6, 2))),
    visionDistribution: isGK ? getRandomInt(20, 50) : clamp100(overallRating + (normPos === 'Central' ? getRandomInt(5, 12) : getRandomInt(-8, 2))),
    sevenMeterShot: isGK ? getRandomInt(10, 30) : clamp100(overallRating + getRandomInt(-5, 8)),
    defensiveBlock: isGK ? getRandomInt(20, 40) : clamp100(overallRating + (normPos === 'Pivô' || normPos.includes('Lateral') ? getRandomInt(4, 10) : getRandomInt(-10, 2))),
    gkReflexes: isGK ? clamp100(overallRating + getRandomInt(3, 9)) : getRandomInt(10, 35),
    gkPositioning: isGK ? clamp100(overallRating + getRandomInt(2, 7)) : getRandomInt(10, 35),
    gkSevenMeterSave: isGK ? clamp100(overallRating + getRandomInt(-2, 8)) : getRandomInt(10, 30),
    gkFastBreakRelease: isGK ? clamp100(overallRating + getRandomInt(1, 8)) : getRandomInt(20, 50),
    stamina: clamp100(overallRating + getRandomInt(-4, 6)),
    recoveryRate: clamp100(getRandomInt(60, 95)),
  };

  const moralVal = getRandomInt(6, 9);
  const moralLevel = moralVal >= 9 ? 'Estrelado' : moralVal === 8 ? 'Excelente' : moralVal === 7 ? 'Motivado' : moralVal === 6 ? 'Normal' : 'Em baixo';
  const contractYears = getRandomInt(1, 3);

  return {
    id: `plr_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
    name: fullName,
    firstName: identity.firstName,
    lastName: identity.lastName,
    country: identity.country,
    age,
    position,
    secondaryPosition,
    molecular,
    attributes,
    overallRating,
    qualityRating: tier,
    shooting: attributes.shooting,
    defense: attributes.defense,
    goalkeeping: attributes.goalkeeping,
    stamina: attributes.stamina,
    speed: attributes.speed,
    intelligence: attributes.intelligence,
    moral: moralVal,
    moralLevel,
    energyLevel: 100,
    benchedMatchesStreak: 0,
    injury: {
      isInjured: false,
      description: '',
      daysRemaining: 0,
      weeksRemaining: 0,
      severity: 'ligeira',
    },
    marketValue,
    salary,
    wage,
    contractYearsRemaining: contractYears,
    isContractExpiringSoon: contractYears === 1,
    releaseClause: Math.round(marketValue * 1.5),
    askingPrice: marketValue,
    transferListed: false,
    currentClubId: clubId,
    clubId,
    isHired: clubId !== null,
    stats: {
      matchesPlayed: 0,
      minutesPlayed: 0,
      goalsScored: 0,
      sevenMeterGoals: 0,
      yellowCards: 0,
      twoMinSuspensions: 0,
      redCards: 0,
      blueCards: 0,
      saves: 0,
      shotAttempts: 0,
    },
  };
}

/**
 * Gera um plantel completo e equilibrado para um clube (mínimo 14 a 16 jogadores).
 */
export function generateClubSquad(clubId: string, squadQualityTier = 5): Player[] {
  const squad: Player[] = [];

  const positionQuota: { pos: PlayerPosition; count: number }[] = [
    { pos: 'Guarda-Redes', count: 2 },
    { pos: 'Ponta Esquerdo', count: 2 },
    { pos: 'Ponta Direito', count: 2 },
    { pos: 'Lateral Esquerdo', count: 3 },
    { pos: 'Lateral Direito', count: 2 },
    { pos: 'Central', count: 2 },
    { pos: 'Pivô', count: 2 },
  ];

  for (const item of positionQuota) {
    for (let i = 0; i < item.count; i++) {
      const playerTier = Math.max(1, Math.min(10, squadQualityTier + getRandomInt(-1, 1)));
      squad.push(generateRandomPlayer(item.pos, playerTier, clubId));
    }
  }

  return squad;
}
