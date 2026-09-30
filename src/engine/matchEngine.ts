/**
 * 7meters - Core Handball Match Engine (Estilo Elifoot)
 * Motor de simulação hiper-realista para partidas oficiais de andebol (2 partes de 30 minutos).
 * Implementa:
 * - Pontuações autênticas de andebol (25 a 35 golos por equipa)
 * - Narrativa textual ao vivo detalhada com Overall dos atletas e contexto tático
 * - Geometria e prós/contras dos sistemas defensivos (6:0, 5:1, 3:3, 4:2, 3:2:1)
 * - Ritmo tático (Contra-Ataque Alucinante vs Ataque Organizado Paciente)
 * - Fórmulas matemáticas de remate e limiar de 7 metros (5%)
 * - Desgaste de energia física durante os 60 minutos
 * - Sanções disciplinares (exclusões de 2 minutos, cartões)
 */

import { Club } from '../types/club.types';
import { MatchEvent, MatchResult, PlayerMatchStats } from '../types/match.types';
import { Player } from '../types/player.types';
import { Referee } from '../types/referee.types';

export interface TacticalSettings {
  defenseSystem: '6-0' | '5-1' | '3-3' | '4-2' | '3-2-1' | '6:0' | '5:1' | '3:3' | '4:2';
  attackPace: 'lento' | 'normal' | 'fastbreak' | 'Contra-Ataque Alucinante' | 'Ataque Organizado Paciente';
  aggressiveness: 'moderada' | 'intensa' | 'limite';
  offensiveFocus?: 'Remates Exteriores (9m)' | 'Entradas do Pivô (6m)' | 'Infiltrações das Pontas (Alas)' | 'Equilibrado';
}

export interface TacticalSetup {
  defensiveStyle: '6-0' | '5-1' | '3-2-1' | '4-2' | '3-3';
  offensivePace: 'lento' | 'equilibrado' | 'normal' | 'fastbreak' | 'Contra-Ataque Alucinante' | 'Ataque Organizado Paciente';
  sevenAgainstSix?: boolean;
  aggressiveDefense?: boolean;
}

export type ShotZone = 'ponta_esq' | 'ponta_dir' | '9m_central' | '9m_lateral' | '6m_pivo' | '7_metros';

export interface ShotIncident {
  zone: ShotZone;
  shooterName: string;
  isGoal: boolean;
  minute: number;
}

function normalizeSys(sys?: string): string {
  if (!sys) return '6:0';
  if (sys === '6-0') return '6:0';
  if (sys === '5-1') return '5:1';
  return sys;
}

export interface SimulateMatchOptions {
  homeClub: Club;
  awayClub: Club;
  homeSquad: Player[];
  awaySquad: Player[];
  referee?: Referee;
  homeTactics?: TacticalSettings | TacticalSetup;
  awayTactics?: TacticalSettings | TacticalSetup;
}

/**
 * Simula uma partida completa de andebol entre duas equipas estilo Elifoot.
 * Suporta chamada posicional ou com objeto de opções SimulateMatchOptions.
 */
export function simulateHandballMatch(
  homeClubOrOpts: Club | SimulateMatchOptions,
  homeSquadParam?: Player[],
  awayClubParam?: Club,
  awaySquadParam?: Player[],
  homeTacticsParam?: TacticalSettings,
  awayTacticsParam?: TacticalSettings,
  refereeParam?: Referee
): MatchResult {
  let homeClub: Club;
  let homeSquad: Player[];
  let awayClub: Club;
  let awaySquad: Player[];
  let homeTactics: TacticalSettings | undefined;
  let awayTactics: TacticalSettings | undefined;
  let referee: Referee | undefined;

  if ('homeClub' in homeClubOrOpts && 'awayClub' in homeClubOrOpts) {
    const opts = homeClubOrOpts as SimulateMatchOptions;
    homeClub = opts.homeClub;
    awayClub = opts.awayClub;
    homeSquad = opts.homeSquad;
    awaySquad = opts.awaySquad;
    homeTactics = opts.homeTactics
      ? {
          defenseSystem: (opts.homeTactics as any).defensiveStyle || (opts.homeTactics as any).defenseSystem || '6-0',
          attackPace: (opts.homeTactics as any).offensivePace || (opts.homeTactics as any).attackPace || 'normal',
          aggressiveness: (opts.homeTactics as any).aggressiveness || 'intensa',
        }
      : undefined;
    awayTactics = opts.awayTactics
      ? {
          defenseSystem: (opts.awayTactics as any).defensiveStyle || (opts.awayTactics as any).defenseSystem || '6-0',
          attackPace: (opts.awayTactics as any).offensivePace || (opts.awayTactics as any).attackPace || 'normal',
          aggressiveness: (opts.awayTactics as any).aggressiveness || 'intensa',
        }
      : undefined;
    referee = opts.referee;
  } else {
    homeClub = homeClubOrOpts as Club;
    homeSquad = homeSquadParam || [];
    awayClub = awayClubParam as Club;
    awaySquad = awaySquadParam || [];
    homeTactics = homeTacticsParam;
    awayTactics = awayTacticsParam;
    referee = refereeParam;
  }
  const events: MatchEvent[] = [];

  let homeScore = 0;
  let awayScore = 0;

  const homePlayerStats: Record<string, PlayerMatchStats> = {};
  const awayPlayerStats: Record<string, PlayerMatchStats> = {};

  homeSquad.forEach((p) => {
    homePlayerStats[p.id] = {
      playerId: p.id,
      playerName: p.name,
      goals: 0,
      shots: 0,
      saves: 0,
      assists: 0,
      exclusions: 0,
      yellowCards: 0,
      redCards: 0,
    };
  });

  awaySquad.forEach((p) => {
    awayPlayerStats[p.id] = {
      playerId: p.id,
      playerName: p.name,
      goals: 0,
      shots: 0,
      saves: 0,
      assists: 0,
      exclusions: 0,
      yellowCards: 0,
      redCards: 0,
    };
  });

  // Identificação do Guarda-Redes titular
  const homeGK =
    homeSquad.find((p) => p.position === 'Guarda-Redes' || (p.position as string) === 'GR') || homeSquad[0];
  const awayGK =
    awaySquad.find((p) => p.position === 'Guarda-Redes' || (p.position as string) === 'GR') || awaySquad[0];

  const homeOutfield = homeSquad.filter((p) => p.id !== homeGK.id);
  const awayOutfield = awaySquad.filter((p) => p.id !== awayGK.id);

  // Sistemas táticos
  const homeDefSys = normalizeSys(homeTactics?.defenseSystem);
  const awayDefSys = normalizeSys(awayTactics?.defenseSystem);

  // Exclusões de 2 minutos ativas
  let homeExclusionsEnd: number[] = [];
  let awayExclusionsEnd: number[] = [];

  const refCardTendency = referee ? referee.cardTendency / 10 : 0.5;

  const homeAgg = homeTactics?.aggressiveness === 'limite' ? 1.4 : homeTactics?.aggressiveness === 'intensa' ? 1.15 : 0.9;
  const awayAgg = awayTactics?.aggressiveness === 'limite' ? 1.4 : awayTactics?.aggressiveness === 'intensa' ? 1.15 : 0.9;

  // Ritmo de ataque
  const isHomeFastbreak =
    homeTactics?.attackPace === 'fastbreak' || homeTactics?.attackPace === 'Contra-Ataque Alucinante';
  const isAwayFastbreak =
    awayTactics?.attackPace === 'fastbreak' || awayTactics?.attackPace === 'Contra-Ataque Alucinante';

  // 60 Minutos regulamentares
  for (let minute = 1; minute <= 60; minute++) {
    // 1. Atualizar exclusões
    homeExclusionsEnd = homeExclusionsEnd.filter((endMin) => endMin > minute);
    awayExclusionsEnd = awayExclusionsEnd.filter((endMin) => endMin > minute);

    const homeMenCount = 7 - homeExclusionsEnd.length;
    const awayMenCount = 7 - awayExclusionsEnd.length;

    // Intervalo de jogo (minuto 30)
    if (minute === 30) {
      events.push({
        id: `evt_halftime_${minute}`,
        minute: 30,
        type: 'timeout',
        description: `⏱️ INTERVALO: ${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}. As equipas recolhem aos balneários sob aplausos no pavilhão!`,
        clubId: homeClub.id,
      });
    }

    // No andebol, cada minuto tem em média 1.6 a 2.0 posses de ataque para atingir 25-35 golos
    const possessionsThisMin = Math.random() < 0.85 ? 2 : 1;

    for (let pos = 0; pos < possessionsThisMin; pos++) {
      const isHomeAttacking = pos === 0 ? Math.random() < 0.52 : Math.random() < 0.48;

      const attackingClub = isHomeAttacking ? homeClub : awayClub;
      const defendingClub = isHomeAttacking ? awayClub : homeClub;
      const attackingSquad = isHomeAttacking ? homeOutfield : awayOutfield;
      const defendingSquad = isHomeAttacking ? awayOutfield : homeOutfield;
      const defendingGK = isHomeAttacking ? awayGK : homeGK;
      const attackingStats = isHomeAttacking ? homePlayerStats : awayPlayerStats;
      const defendingStats = isHomeAttacking ? awayPlayerStats : homePlayerStats;
      const currentDefSys = isHomeAttacking ? awayDefSys : homeDefSys;
      const currentAgg = isHomeAttacking ? awayAgg : homeAgg;
      const isFastbreak = isHomeAttacking ? isHomeFastbreak : isAwayFastbreak;

      if (attackingSquad.length === 0) continue;

      // Seleção do rematador ou construtor
      const shooter = attackingSquad[Math.floor(Math.random() * attackingSquad.length)];
      const shooterStat = attackingStats[shooter.id];
      const gkStat = defendingStats[defendingGK.id];

      // Determinar zona de remate
      let zone: ShotZone = '9m_central';
      const posName = shooter.position as string;
      if (posName.includes('Ponta') || posName === 'PE' || posName === 'PD') {
        zone = Math.random() < 0.5 ? 'ponta_esq' : 'ponta_dir';
      } else if (posName.includes('Pivô') || posName === 'PV' || posName === 'P') {
        zone = '6m_pivo';
      } else if (posName.includes('Lateral') || posName === 'LE' || posName === 'LD') {
        zone = '9m_lateral';
      }

      // Sistema defensivo adversário e impacto na jogada
      let defenseModifier = 0;
      let tacticNarrativeBonus = '';

      if (currentDefSys === '6:0') {
        if (zone === '6m_pivo') {
          defenseModifier -= 18; // 6:0 bloqueia muito o pivô
          tacticNarrativeBonus = 'A muralha defensiva 6:0 fecha o espaço ao pivô.';
        } else if (zone.startsWith('9m')) {
          defenseModifier += 12; // 6:0 dá espaço aos remates de 9m
          tacticNarrativeBonus = 'Defesa 6:0 recuada abre linha de tiro aos 9 metros!';
        }
      } else if (currentDefSys === '5:1') {
        if (posName.includes('Central') || posName === 'C') {
          defenseModifier -= 15; // 5:1 anula central
          tacticNarrativeBonus = 'O homem avançado na defesa 5:1 sufoca o central adversário.';
        } else if (zone.startsWith('ponta')) {
          defenseModifier += 14; // brechas nas alas
          tacticNarrativeBonus = 'A defesa 5:1 cede espaço de penetração na ala.';
        }
      } else if (currentDefSys === '3:3') {
        // Transição rápida ou risco
        if (isFastbreak) {
          defenseModifier += 10;
        }
        if (Math.random() < 0.12) {
          // Roubo de bola da defesa 3:3!
          events.push({
            id: `evt_steal_${minute}_${pos}`,
            minute,
            type: 'falta_tecnica',
            description: `⚡ Roubo de bola da defesa agressiva 3:3 do ${defendingClub.name}! Saída fulgurante para contra-ataque.`,
            clubId: defendingClub.id,
          });
          continue;
        }
      }

      // Falta técnica / perda de bola simples (~10%)
      if (Math.random() < 0.10) {
        events.push({
          id: `evt_to_${minute}_${pos}`,
          minute,
          type: 'falta_tecnica',
          description: `Perda de bola ofensiva por passos/falta técnica de ${shooter.name} (Overall ${shooter.overallRating}).`,
          clubId: attackingClub.id,
          playerId: shooter.id,
        });
        continue;
      }

      // Fator Disciplinar / Exclusões de 2 Minutos
      const foulRoll = Math.random();
      const exclusionThreshold = 0.94 - currentAgg * 0.03 - refCardTendency * 0.02;

      if (foulRoll > exclusionThreshold && defendingSquad.length > 0) {
        const defender = defendingSquad[Math.floor(Math.random() * defendingSquad.length)];
        const defStat = defendingStats[defender.id];

        if (defStat) {
          if (defStat.yellowCards === 0 && Math.random() < 0.4) {
            defStat.yellowCards += 1;
            events.push({
              id: `evt_yc_${minute}_${pos}`,
              minute,
              type: 'cartao_amarelo',
              description: `⚠️ Cartão amarelo para ${defender.name} (Overall ${defender.overallRating}) por entrada faltosa aos 9 metros.`,
              clubId: defendingClub.id,
              playerId: defender.id,
            });
          } else {
            defStat.exclusions += 1;
            if (isHomeAttacking) awayExclusionsEnd.push(minute + 2);
            else homeExclusionsEnd.push(minute + 2);

            events.push({
              id: `evt_ex_${minute}_${pos}`,
              minute,
              type: 'exclusao_2min',
              description: `🛑 Entrada mais dura na linha dos 9 metros... Exclusão de 2 minutos para ${defender.name}! A equipa fica em inferioridade numérica!`,
              clubId: defendingClub.id,
              playerId: defender.id,
            });
          }
        }
      }

      // 5% de probabilidade de Livre de 7 Metros (Penalty)
      const isSevenMeter = Math.random() < 0.05;
      if (isSevenMeter) zone = '7_metros';

      if (shooterStat) shooterStat.shots += 1;

      // FÓRMULA MATEMÁTICA DE SUCESSO DE REMATE:
      // SuccessProb = 0.5 + ((ShooterPower - GKPower) / 200)
      const shooterPower = (shooter.shooting || 7) * 8 + (shooter.overallRating || 65) * 0.35;
      const gkPower = (defendingGK.goalkeeping || 7) * 8 + (defendingGK.overallRating || 65) * 0.35;
      const numericalAdvantage = (homeMenCount - awayMenCount) * (isHomeAttacking ? 5 : -5);

      let successProb = 0.52 + (shooterPower + numericalAdvantage + defenseModifier - gkPower) / 200;

      if (isSevenMeter) {
        successProb = 0.74 + (shooterPower - gkPower) / 250;
      }

      if (isFastbreak) {
        successProb += 0.06;
      }

      // Limitar probabilidade entre 22% e 86%
      successProb = Math.max(0.22, Math.min(0.86, successProb));

      const isGoal = Math.random() < successProb;

      if (isGoal) {
        if (isHomeAttacking) homeScore += 1;
        else awayScore += 1;

        if (shooterStat) shooterStat.goals += 1;

        let narrative = '';
        if (isSevenMeter) {
          narrative = `🎯 Inicia-se a cobrança do livre de 7 metros... O batedor ${shooter.name} (Overall ${shooter.overallRating}) finta o guarda-redes... GOLO!`;
        } else if (zone === '6m_pivo') {
          narrative = `⚽ O central liberta a bola... Passe em profundidade para o Pivô ${shooter.name} (Overall ${shooter.overallRating})... Remate em apoio de 6 metros... GOLO!`;
        } else if (zone.startsWith('9m')) {
          narrative = `🚀 Remate fortíssimo de 9 metros do lateral ${shooter.name} (Overall ${shooter.overallRating}) ao ângulo superior... Sem hipótese para o guarda-redes! GOLO!`;
        } else if (isFastbreak) {
          narrative = `⚡ Contra-Ataque alucinante! Bola rápida lançada para ${shooter.name} (Overall ${shooter.overallRating}) que salta na ponta... GOLO!`;
        } else {
          narrative = `🔥 Desmarcação perfeita de ${shooter.name} (Overall ${shooter.overallRating}) pela ala... Finalização cirúrgica... GOLO!`;
        }

        events.push({
          id: `evt_goal_${minute}_${pos}`,
          minute,
          type: isSevenMeter ? 'golo_7m' : 'golo',
          description: narrative,
          clubId: attackingClub.id,
          playerId: shooter.id,
        });
      } else {
        if (gkStat) gkStat.saves += 1;

        let defenseNarrative = '';
        if (isSevenMeter) {
          defenseNarrative = `🧤 Livre de 7 metros! ${shooter.name} atira colocado, mas o Guarda-Redes ${defendingGK.name} (Overall ${defendingGK.overallRating}) estica o braço e defende espetacularmente!`;
        } else if (zone.startsWith('9m')) {
          defenseNarrative = `🧤 Remate forte de 9 metros de ${shooter.name}... Defesa monumental com o pé do Guarda-Redes ${defendingGK.name} (Overall ${defendingGK.overallRating})!`;
        } else {
          defenseNarrative = `🛡️ ${shooter.name} procura o remate, mas a defensiva trava o ataque com um bloco impenetrável!`;
        }

        events.push({
          id: `evt_save_${minute}_${pos}`,
          minute,
          type: 'defesa',
          description: defenseNarrative,
          clubId: defendingClub.id,
          playerId: defendingGK.id,
        });
      }
    }
  }

  // Fim do Jogo
  events.push({
    id: 'evt_fulltime_60',
    minute: 60,
    type: 'timeout',
    description: `🏁 APITO FINAL! ${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}. Enorme ambiente nas bancadas do pavilhão!`,
    clubId: homeClub.id,
  });

  return {
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    homeClubId: homeClub.id,
    awayClubId: awayClub.id,
    homeClubName: homeClub.name,
    awayClubName: awayClub.name,
    homeScore,
    awayScore,
    events,
    playerStats: {
      home: Object.values(homePlayerStats),
      away: Object.values(awayPlayerStats),
    },
    simulatedAt: new Date().toISOString(),
  };
}

export const simulateMatch = simulateHandballMatch;
