/**
 * 7meters - Squad Generator
 * Gerador de plantéis completos para equipas de andebol.
 */

import { Player } from '../../types/player.types';
import { generateClubSquad, generateRandomPlayer } from './playerGen';

export function generateSquad(clubId: string, count = 16, tier = 5): Player[] {
  if (count <= 16) {
    const squad = generateClubSquad(clubId, tier);
    return squad.slice(0, count);
  }

  const squad = generateClubSquad(clubId, tier);
  while (squad.length < count) {
    squad.push(generateRandomPlayer(undefined, tier, clubId));
  }
  return squad;
}
