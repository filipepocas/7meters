/**
 * 7meters - Jersey & Kit Generator (1000 Combinações)
 * Gerador de padrões de camisolas, paletas cromáticas e detalhes visuais para clubes de andebol.
 */

import { JerseyConfig } from '../../types/club.types';

export const PATTERNS = [
  'solid',
  'stripes_vertical',
  'stripes_horizontal',
  'diagonal',
  'modern_abstract',
] as const;

export const COLOR_PALETTE = [
  { name: 'Azul Real', hex: '#003399' },
  { name: 'Branco Neve', hex: '#FFFFFF' },
  { name: 'Vermelho Fogo', hex: '#E30613' },
  { name: 'Verde Floresta', hex: '#006633' },
  { name: 'Amarelo Ouro', hex: '#FFCC00' },
  { name: 'Preto Noite', hex: '#111111' },
  { name: 'Laranja Elétrico', hex: '#FF6600' },
  { name: 'Roxo Imperial', hex: '#660099' },
  { name: 'Bordô Clássico', hex: '#800020' },
  { name: 'Cinzento Aço', hex: '#4A5568' },
  { name: 'Azul Celeste', hex: '#38BDF8' },
  { name: 'Verde Lima', hex: '#84CC16' },
  { name: 'Rosa Vibrante', hex: '#EC4899' },
  { name: 'Dourado Mate', hex: '#D97706' },
];

export const SPONSOR_NAMES = [
  '7METERS', 'VANGUARD', 'AURA TECH', 'SOLARIA', 'HYPERION',
  'KRYPTON', 'NEBULA', 'PORTUGAL', 'HUMMEL', 'ENERGY+',
  'SUPER BOCK', 'MEO', 'GALP', 'FIDELIDADE', 'MILLENNIUM'
];

/**
 * Returns deterministic JerseyConfig for any integer between 1 and 1000.
 */
export function getJerseyById(id: number): JerseyConfig {
  const safeId = Math.max(1, Math.min(1000, Math.floor(id)));

  const patternIdx = safeId % PATTERNS.length;
  const primaryIdx = (safeId * 3) % COLOR_PALETTE.length;
  let secondaryIdx = (safeId * 7) % COLOR_PALETTE.length;

  if (primaryIdx === secondaryIdx) {
    secondaryIdx = (secondaryIdx + 1) % COLOR_PALETTE.length;
  }

  const sponsorIdx = (safeId * 5) % SPONSOR_NAMES.length;

  return {
    id: safeId,
    primaryColor: COLOR_PALETTE[primaryIdx].hex,
    secondaryColor: COLOR_PALETTE[secondaryIdx].hex,
    patternType: PATTERNS[patternIdx],
    chestSponsorName: SPONSOR_NAMES[sponsorIdx],
  };
}
