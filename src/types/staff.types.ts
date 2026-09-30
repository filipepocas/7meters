/**
 * 7meters - Staff Types
 * Tipagem estrita para toda a equipa técnica e administrativa.
 * Define o impacto do staff no rendimento dos atletas, recuperação de lesões e gestão do clube.
 */

import { STAFF_ROLES } from '../core/constants';

export type StaffRole = typeof STAFF_ROLES[number];

export interface StaffAttributes {
  tacticalMastery: number;   // Domínio tático (Treinador Principal: 1-10)
  physioEfficiency: number;  // Tratamento e prevenção de lesões (Fisioterapeuta: 1-10)
  logisticsSupport: number;  // Suporte logístico e equipamento (Guarda-Roupa: 1-10)
  financialAcumen: number;   // Otimização de custos e orçamento (Administrativo: 1-10)
  scoutingVision: number;    // Prospeção e negociação de mercado (Diretor Desportivo: 1-10)
  leadership: number;        // Liderança e gestão de balneário (1-10)
}

export interface StaffMember {
  id: string;
  name: string;
  country: string;
  age: number;
  role: StaffRole;

  // Qualidade e atributos específicos (escala 1 a 10)
  qualityRating: number;      // Classificação geral de qualidade (1-10)
  attributes: StaffAttributes;

  // Situação Contratual e Financeira
  salary: number;             // Salário mensal em Euros
  contractYearsRemaining: number;
  currentClubId: string | null;
  isHired: boolean;
}

export interface StaffImpact {
  tacticalBonus: number;     // Bónus de rendimento em jogo dadas as táticas
  recoverySpeedMultiplier: number; // Velocidade de recuperação de stamina e lesões
  moraleBoost: number;        // Estabilidade emocional do grupo
  expenseReduction: number;   // Poupança financeira em operações do clube
}
