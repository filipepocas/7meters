/**
 * 7meters - Club Generator
 * Gerador de clubes de andebol com pavilhão, camisolas, reputação e dados financeiros.
 */

import { Club } from '../../types/club.types';
import { getArenaById } from './arenaGen';
import { getJerseyById } from './jerseyGen';

export function generateClubProfile(name: string, level = 'Nacional', budget = 150000, arenaId = 1): Club {
  const arena = getArenaById(arenaId);
  const jersey = getJerseyById((name.length * 37) % 1000 + 1);

  const shortName = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  const id = `clb_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  return {
    id,
    name,
    shortName,
    city: 'Portugal',
    foundationYear: 1980 + (name.length % 40),
    level,
    budget,
    fanbase: Math.round(arena.capacity * 0.75),
    reputation: level === 'Nacional' ? 65 : 45,
    stadiumCapacity: arena.capacity,
    colors: {
      primary: jersey.primaryColor,
      secondary: jersey.secondaryColor,
    },
    arena: {
      name: arena.name,
      capacity: arena.capacity,
      ticketPrice: arena.ticketPrice,
      condition: 100,
      imagePath: arena.imagePath,
      rentalOrMaintenanceCost: arena.rentalOrMaintenanceCost,
      energyEfficiencyRating: arena.energyEfficiencyRating,
      prestigeBonus: arena.prestigeBonus,
    },
    sponsors: {
      main: null,
      secondary: [],
    },
    squadIds: [],
    staffIds: [],
  };
}
