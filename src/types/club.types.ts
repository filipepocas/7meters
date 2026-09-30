/**
 * 7meters - Club Types
 * Tipagem estrita para a gestão integral do clube.
 * Cobre personalização de camisolas, pavilhões, orçamento, tesouraria e presença na liga.
 */

import { Sponsor } from './sponsor.types';

export interface JerseyConfig {
  id: number;
  primaryColor: string;
  secondaryColor: string;
  patternType: 'solid' | 'stripes_vertical' | 'stripes_horizontal' | 'diagonal' | 'modern_abstract';
  chestSponsorName?: string;
}

export interface ArenaInfo {
  name: string;
  capacity: number;
  ticketPrice: number;
  condition: number; // 0 a 100%
  imagePath?: string;
  rentalOrMaintenanceCost?: number;
  energyEfficiencyRating?: number;
  prestigeBonus?: number;
}

export interface FinancialTransaction {
  id: string;
  timestamp: string;
  amountEuro: number;
  category: 'ticket_sales' | 'salaries' | 'arena_costs' | 'transfers' | 'sponsorship' | 'injection';
  description: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city?: string;
  foundationYear?: number;
  level?: string; // 'Nacional', 'Regional', etc.
  budget: number;
  fanbase: number;
  reputation: number;
  stadiumCapacity: number;
  colors?: { primary: string; secondary: string };
  arena: ArenaInfo;
  sponsors: {
    main: Sponsor | null;
    secondary: Sponsor[];
  };
  squadIds: string[];
  staffIds: string[];
  financialHistory?: FinancialTransaction[];
}

export interface ClubState extends Club {
  userId?: string;
  divisionId?: number;
  currentLeaguePosition?: number;
  jersey?: JerseyConfig;
}
