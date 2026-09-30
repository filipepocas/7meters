/**
 * 7meters - Sponsor Types
 * Definições de tipo para o sistema de Patrocinadores Mistério ("Blind Sponsors").
 * Suporta revelação diferida de injeção financeira, descrições de atividade enigmáticas
 * e variação anual imprevisível.
 */

export type SponsorType = 'Principal' | 'Secundário' | 'Equipamento' | 'Estádio';

export interface Sponsor {
  id: string;
  name: string;
  companyName?: string;
  type: SponsorType;
  tier?: string;
  logoUrl: string;
  /** Descrição da atividade comercial que contém pistas (ou distorções) sobre a sua capacidade financeira */
  activityDescription: string;
  /** Indica se o valor real injetado no clube já foi revelado após a assinatura */
  isRevealed: boolean;
  /** Injeção imediata de capital no clube (€) ao assinar (Oculto até confirmação) */
  payoutAmount?: number;
  /** Pagamento semanal de manutenção (€) */
  weeklyPayout: number;
  weeklyAmount?: number;
  /** Bónus de fim de época por objetivos (€) */
  seasonBonus: number;
  /** Duração do contrato em anos ou semanas */
  contractYears: number;
  contractWeeks?: number;
  /** Reputação mínima do clube necessária para desbloquear esta proposta */
  minimumReputation: number;
}

export interface MysterySponsorOffer {
  sponsor: Sponsor;
  /** Indicador visual de risco/potencial baseado na leitura da descrição */
  estimatedPotentialHint: 'Muito Baixo' | 'Baixo' | 'Moderado' | 'Elevado' | 'Gigante' | 'Incerto';
}
