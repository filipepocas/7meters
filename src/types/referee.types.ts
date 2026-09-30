/**
 * 7meters - Referee Types
 * Tipagem de equipas de arbitragem e tendência disciplinar no jogo de andebol.
 */

export interface Referee {
  id: string;
  mainRefereeName: string;
  assistantRefereeName: string;
  strictness: number;         // 1 a 10 (Rigor na assinalação de faltas)
  experience: number;         // 1 a 10
  cardTendency: number;       // 1 a 10 (Facilidade em mostrar amarelos e exclusões de 2m)
  reputation: number;         // 1 a 100
  matchesOfficiated: number;
}
