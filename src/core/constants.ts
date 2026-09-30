/**
 * 7meters - Core Constants
 * Configurações nucleares globais do jogo, limites do motor,
 * orçamento base e parâmetros do sistema grátis / admin.
 */

export const GAME_CONFIG = {
  NAME: "7meters",
  VERSION: "1.0.0",
  ADMIN_EMAIL: "rochap.filipe@gmail.com",

  // Limites de Atributos e Escalas
  STATS_MIN: 1,
  STATS_MAX: 10,

  // Finanças Iniciais
  INITIAL_BUDGET: 1500000, // Orçamento base inicial em Euros (1.500.000 €)

  // Parâmetros do Motor de Simulação de Jogo
  MATCH_FRAME_DURATION_MINUTES: 5, // Blocos temporais de 5 em 5 minutos (12 frames por jogo)
  TOTAL_MATCH_MINUTES: 60,
  GOALS_PEAK_MIN: 50,
  GOALS_PEAK_MAX: 59,

  // Geração de Raiz e Universo do Jogo
  INITIAL_PLAYER_AGE_MIN: 15,
  INITIAL_PLAYER_AGE_MAX: 38, // Cobre jovens, maduros e veteranos em fim de carreira
  TOTAL_JERSEY_COMBINATIONS: 1000, // 1000 combinações visuais de camisolas
  TOTAL_ARENAS: 1000, // 1000 imagens/pavilhões disponíveis
} as const;

export const STORAGE_KEYS = {
  AUTH_USER: "7meters_auth_user",
  CLUB_STATE: "7meters_club_state",
  CACHE_RULES: "7meters_admin_rules_cache",
} as const;

export const TACTIC_TYPES = {
  DEFENSE: ['6:0', '5:1', '4:2', '3:3', 'Individuais'] as const,
  OFFENSE: ['Normal', 'Contra-Ataque Rápido', '7 contra 6', 'Remate Exterior', 'Jogo com Pivô'] as const,
} as const;

export const PLAYER_POSITIONS = [
  'Guarda-Redes',
  'Ponta Esquerdo',
  'Ponta Direito',
  'Lateral Esquerdo',
  'Lateral Direito',
  'Central',
  'Pivô',
] as const;

export const STAFF_ROLES = [
  'Treinador Principal',
  'Fisioterapeuta',
  'Guarda-Roupa',
  'Administrativo',
  'Diretor Desportivo',
] as const;

export interface InitialClubData {
  name: string;
  shortName: string;
  city: string;
  foundationYear: number;
  initialBudget: number;
  arenaName: string;
  arenaCapacity: number;
  ticketPrice: number;
  reputationTier: number;
  colors: { primary: string; secondary: string };
}

export const INITIAL_CLUBS_DATA: InitialClubData[] = [
  {
    name: 'FC Porto Andebol',
    shortName: 'FCP',
    city: 'Porto',
    foundationYear: 1893,
    initialBudget: 350000,
    arenaName: 'Dragão Arena',
    arenaCapacity: 2179,
    ticketPrice: 15,
    reputationTier: 9,
    colors: { primary: '#002B7F', secondary: '#FFFFFF' },
  },
  {
    name: 'Sporting CP Andebol',
    shortName: 'SCP',
    city: 'Lisboa',
    foundationYear: 1906,
    initialBudget: 340000,
    arenaName: 'Pavilhão João Rocha',
    arenaCapacity: 3000,
    ticketPrice: 15,
    reputationTier: 9,
    colors: { primary: '#006633', secondary: '#FFFFFF' },
  },
  {
    name: 'SL Benfica Andebol',
    shortName: 'SLB',
    city: 'Lisboa',
    foundationYear: 1904,
    initialBudget: 330000,
    arenaName: 'Pavilhão da Luz Nº 2',
    arenaCapacity: 2500,
    ticketPrice: 15,
    reputationTier: 9,
    colors: { primary: '#E30613', secondary: '#FFFFFF' },
  },
  {
    name: 'ABC de Braga',
    shortName: 'ABC',
    city: 'Braga',
    foundationYear: 1933,
    initialBudget: 160000,
    arenaName: 'Pavilhão Flávio Sá Leite',
    arenaCapacity: 2500,
    ticketPrice: 12,
    reputationTier: 7,
    colors: { primary: '#FFCC00', secondary: '#000000' },
  },
  {
    name: 'Águas Santas Milaneza',
    shortName: 'AAS',
    city: 'Maia',
    foundationYear: 1962,
    initialBudget: 120000,
    arenaName: 'Pavilhão da Associação AA Águas Santas',
    arenaCapacity: 1500,
    ticketPrice: 10,
    reputationTier: 6,
    colors: { primary: '#003399', secondary: '#FFCC00' },
  },
  {
    name: 'Belenenses Andebol',
    shortName: 'CFB',
    city: 'Lisboa',
    foundationYear: 1919,
    initialBudget: 130000,
    arenaName: 'Pavilhão Acácio Rosa',
    arenaCapacity: 1683,
    ticketPrice: 10,
    reputationTier: 6,
    colors: { primary: '#002B7F', secondary: '#FFFFFF' },
  },
  {
    name: 'Marítimo Madeira Andebol',
    shortName: 'CSM',
    city: 'Funchal',
    foundationYear: 1910,
    initialBudget: 110000,
    arenaName: 'Pavilhão do Marítimo',
    arenaCapacity: 1200,
    ticketPrice: 10,
    reputationTier: 5,
    colors: { primary: '#008000', secondary: '#CC0000' },
  },
  {
    name: 'Vitória FC Andebol',
    shortName: 'VFC',
    city: 'Setúbal',
    foundationYear: 1910,
    initialBudget: 95000,
    arenaName: 'Pavilhão Antoine Velge',
    arenaCapacity: 1500,
    ticketPrice: 8,
    reputationTier: 5,
    colors: { primary: '#006600', secondary: '#FFFFFF' },
  },
];

export const SPONSORS_POOL = [
  {
    name: 'Super Bock Selecção',
    type: 'Principal' as const,
    weeklyPayout: 4500,
    seasonBonus: 25000,
    contractYears: 2,
    minimumReputation: 40,
    logoUrl: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=150',
  },
  {
    name: 'MEO Telecomunicações',
    type: 'Principal' as const,
    weeklyPayout: 5200,
    seasonBonus: 30000,
    contractYears: 1,
    minimumReputation: 50,
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
  },
  {
    name: 'Galp Energia',
    type: 'Secundário' as const,
    weeklyPayout: 2800,
    seasonBonus: 15000,
    contractYears: 2,
    minimumReputation: 35,
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150',
  },
  {
    name: 'Hummel Desporto',
    type: 'Equipamento' as const,
    weeklyPayout: 3200,
    seasonBonus: 18000,
    contractYears: 3,
    minimumReputation: 30,
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
  },
  {
    name: 'Fidelidade Seguros',
    type: 'Estádio' as const,
    weeklyPayout: 2100,
    seasonBonus: 12000,
    contractYears: 2,
    minimumReputation: 25,
    logoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150',
  },
];
