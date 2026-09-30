/**
 * 7meters - Arena & Stadium Generator (1000 Pavilhões)
 * Catálogo e gerador de 1000 pavilhões desportivos de andebol.
 * Cada pavilhão possui foto interior de alta definição, capacidade,
 * custo de manutenção/aluguer, eficiência energética e prestígio.
 */

import { ArenaInfo } from '../../types/club.types';

// AI-Generated 3D Stylized Modern Indoor Handball Arenas (view from spectator stands)
const ARENA_IMAGES_POOL = [
  '/src/assets/images/arena_elite_grand_1790774574409.jpg',     // Arena de Elite com bancadas elevadas e campo vibrante
  '/src/assets/images/arena_urban_modern_1790774588799.jpg',    // Pavilhão contemporâneo com piso azul/turquesa e balizas oficiais
  '/src/assets/images/arena_champions_cup_1790774601559.jpg',   // Arena Europeia de Campeões com ecrã cubo 360° e bancadas lotadas
  '/src/assets/images/arena_municipal_pro_1790774613164.jpg',   // Pavilhão Municipal Pro com iluminação de jogo e bancadas de madeira
];

const ARENA_PREFIXES = [
  'Pavilhão Municipal', 'Arena Multiusos', 'Complexo Desportivo', 'Palácio dos Desportos',
  'Pavilhão dos Campeões', 'Pavilhão Gimnodesportivo', 'Arena Central', 'Coliseu Desportivo',
  'Pavilhão Universitário', 'Arena Olímpica', 'Pavilhão da Cidade', 'Pavilhão Atlântico'
];

const ARENA_HONORS = [
  'do Dragão', 'de Alvalade', 'da Luz', 'Flávio Sá Leite', 'João Rocha',
  'de Lousada', 'do Minho', 'do Douro', 'de Guimarães', 'de Viseu', 'de Aveiro',
  'de Coimbra', 'de Setúbal', 'de Leiria', 'do Funchal', 'de Ponta Delgada',
  'de Braga', 'de Faro', 'do Alentejo', 'das Antas', 'da Boavista', 'de Cascais'
];

export interface DetailedArena extends ArenaInfo {
  idNumber: number;
  purchasePrice: number;
  tier: 'Comunitário' | 'Municipal' | 'Regional' | 'Nacional' | 'Elite Europeia';
  features: string[];
}

/**
 * Procedurally generates a deterministic arena for any id between 1 and 1000.
 */
export function getArenaById(id: number): DetailedArena {
  const safeId = Math.max(1, Math.min(1000, Math.floor(id)));

  // Deterministic seed based on id
  const imgIdx = (safeId * 7) % ARENA_IMAGES_POOL.length;
  const prefixIdx = (safeId * 13) % ARENA_PREFIXES.length;
  const honorIdx = (safeId * 17) % ARENA_HONORS.length;

  const prefix = ARENA_PREFIXES[prefixIdx];
  const honor = ARENA_HONORS[honorIdx];
  const name = `${prefix} ${honor} #${safeId}`;

  // Capacity scales from 600 up to 16,500 based on id and tier
  const tierProgress = safeId / 1000;
  let capacity: number;
  let tier: DetailedArena['tier'];
  let prestigeBonus: number;
  let purchasePrice: number;
  let maintenanceCost: number;
  let ticketPrice: number;

  if (tierProgress < 0.25) {
    tier = 'Comunitário';
    capacity = Math.round(600 + tierProgress * 4 * 1400); // 600 - 2,000
    prestigeBonus = 2 + Math.floor(tierProgress * 8);
    purchasePrice = Math.round(50000 + tierProgress * 200000);
    maintenanceCost = Math.round(800 + tierProgress * 1200);
    ticketPrice = 8;
  } else if (tierProgress < 0.60) {
    tier = 'Municipal';
    capacity = Math.round(2000 + (tierProgress - 0.25) * 2.85 * 3000); // 2,000 - 5,000
    prestigeBonus = 4 + Math.floor(tierProgress * 6);
    purchasePrice = Math.round(250000 + (tierProgress - 0.25) * 500000);
    maintenanceCost = Math.round(2000 + (tierProgress - 0.25) * 3000);
    ticketPrice = 12;
  } else if (tierProgress < 0.85) {
    tier = 'Regional';
    capacity = Math.round(5000 + (tierProgress - 0.60) * 4 * 4000); // 5,000 - 9,000
    prestigeBonus = 6 + Math.floor(tierProgress * 4);
    purchasePrice = Math.round(750000 + (tierProgress - 0.60) * 1000000);
    maintenanceCost = Math.round(5000 + (tierProgress - 0.60) * 5000);
    ticketPrice = 16;
  } else if (tierProgress < 0.96) {
    tier = 'Nacional';
    capacity = Math.round(9000 + (tierProgress - 0.85) * 9 * 5000); // 9,000 - 14,000
    prestigeBonus = 8 + (safeId % 2);
    purchasePrice = Math.round(1750000 + (tierProgress - 0.85) * 2000000);
    maintenanceCost = Math.round(10000 + (tierProgress - 0.85) * 8000);
    ticketPrice = 20;
  } else {
    tier = 'Elite Europeia';
    capacity = Math.round(14000 + (tierProgress - 0.96) * 25 * 4500); // 14,000 - 18,500
    prestigeBonus = 10;
    purchasePrice = Math.round(3750000 + (tierProgress - 0.96) * 3500000);
    maintenanceCost = Math.round(18000 + (tierProgress - 0.96) * 15000);
    ticketPrice = 25;
  }

  const featuresList = [
    'Piso flutuante certificado pela IHF',
    'Marcador eletrónico multimédia 360°',
    'Balneários climatizados de alta competição',
    'Iluminação LED broadcast TV 4K',
    'Camarotes executivos e sala VIP',
    'Sala de imprensa e conferências',
    'Ginásio e clínica de recuperação integrada',
    'Bancadas retráteis e túnel de jogadores',
  ];

  const featureCount = Math.min(featuresList.length, Math.floor(prestigeBonus * 0.8) + 1);
  const selectedFeatures = featuresList.slice(0, featureCount);

  return {
    idNumber: safeId,
    name,
    capacity,
    ticketPrice,
    condition: 100,
    imagePath: ARENA_IMAGES_POOL[imgIdx],
    rentalOrMaintenanceCost: maintenanceCost,
    energyEfficiencyRating: Math.min(10, Math.max(3, Math.round(prestigeBonus * 0.9))),
    prestigeBonus,
    purchasePrice,
    tier,
    features: selectedFeatures,
  };
}

/**
 * Returns a subset or search result of arenas from the 1000 catalog.
 */
export function searchArenasCatalog(query = '', tier?: string, limit = 24): DetailedArena[] {
  const results: DetailedArena[] = [];
  const lowerQuery = query.toLowerCase();

  for (let i = 1; i <= 1000; i++) {
    const arena = getArenaById(i);
    const matchesQuery = !query || arena.name.toLowerCase().includes(lowerQuery) || arena.tier.toLowerCase().includes(lowerQuery);
    const matchesTier = !tier || tier === 'TODOS' || arena.tier === tier;

    if (matchesQuery && matchesTier) {
      results.push(arena);
      if (results.length >= limit) break;
    }
  }

  return results;
}
