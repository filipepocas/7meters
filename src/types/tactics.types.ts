/**
 * 7meters - Tactics Types
 * Tipagem estrita para esquemas táticos de defesa e ataque de andebol estilo Elifoot,
 * geometria posicional do 7 Inicial e vantagens/desvantagens estocásticas.
 */

export type DefensiveSystem = '6:0' | '5:1' | '3:3' | '4:2' | '3:2:1';
export type OffensivePace = 'Contra-Ataque Alucinante' | 'Ataque Organizado Paciente' | 'Normal';
export type OffensiveFocus =
  | 'Remates Exteriores (9m)'
  | 'Entradas do Pivô (6m)'
  | 'Infiltrações das Pontas (Alas)'
  | 'Equilibrado';

export interface HandballLineupSlots {
  gk: string | null;   // Guarda-Redes
  pe: string | null;   // Ponta Esquerdo
  le: string | null;   // Lateral Esquerdo
  c: string | null;    // Central
  p: string | null;    // Pivô
  ld: string | null;   // Lateral Direito
  pd: string | null;   // Ponta Direito
  bench: string[];     // Suplentes
}

export interface DefensiveSystemDescription {
  id: DefensiveSystem;
  name: string;
  tagline: string;
  advantage: string;
  disadvantage: string;
  staminaDrainMultiplier: number;
}

export const DEFENSIVE_SYSTEMS_INFO: Record<DefensiveSystem, DefensiveSystemDescription> = {
  '6:0': {
    id: '6:0',
    name: 'Defesa 6:0 (A Muralha)',
    tagline: 'Todos os 6 jogadores alinhados na linha dos 6 metros.',
    advantage: 'Fecha quase por completo os remates em apoio e as entradas do pivô.',
    disadvantage: 'Deixa espaço livre para os laterais adversários dispararem com potência de 9 metros.',
    staminaDrainMultiplier: 0.9,
  },
  '5:1': {
    id: '5:1',
    name: 'Defesa 5:1 (A Pressão ao Central)',
    tagline: '5 jogadores na linha e 1 avançado colado ao central adversário.',
    advantage: 'Corta a linha de construção de jogo do adversário e bloqueia o remate exterior.',
    disadvantage: 'Deixa brechas nas alas e exige enorme desgaste físico ao jogador avançado.',
    staminaDrainMultiplier: 1.15,
  },
  '3:3': {
    id: '3:3',
    name: 'Defesa 3:3 (Pressão Total / Agressiva)',
    tagline: 'Defesa muito aberta e subida no terreno.',
    advantage: 'Excelente para recuperar bolas em transição rápida e roubos para contra-ataque alucinante.',
    disadvantage: 'Cria enormes espaços nas costas da defesa se a equipa estiver cansada.',
    staminaDrainMultiplier: 1.35,
  },
  '4:2': {
    id: '4:2',
    name: 'Defesa 4:2 (Dupla Vigilância)',
    tagline: '4 defensores nos 6m e 2 avançados a vigiar os dois laterais/central.',
    advantage: 'Anula por completo atiradores exteriores de 9 metros.',
    disadvantage: 'Linha de 6m muito vulnerável ao pivô e infiltrações das pontas.',
    staminaDrainMultiplier: 1.2,
  },
  '3:2:1': {
    id: '3:2:1',
    name: 'Defesa 3:2:1 (Escalonada Moderna)',
    tagline: 'Triângulo defensivo escalonado em profundidade.',
    advantage: 'Elevada flexibilidade e coberturas sucessivas.',
    disadvantage: 'Requer inteligência tática máxima e sincronismo perfeito.',
    staminaDrainMultiplier: 1.1,
  },
};

export interface HandballTacticsSetup {
  defenseSystem: DefensiveSystem;
  offensivePace: OffensivePace;
  offensiveFocus: OffensiveFocus;
  aggressiveness: 'moderada' | 'intensa' | 'limite';
  timeoutStrategy: 'auto' | 'manual';
}
