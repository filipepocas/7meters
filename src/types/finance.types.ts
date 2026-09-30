/**
 * 7meters - Finance & Bank Loan Types
 * Modelagem de empréstimos bancários, pontuação de crédito do clube,
 * incumprimento financeiro, salários em atraso e penhora de jogadores por dívida.
 */

export interface BankLoanOffer {
  loanId: string;
  maxAmountAllowed: number;
  interestRate: number; // Ex: 0.08 para 8% de juros
  durationWeeks: number;
  weeklyPayment: number;
  approvalStatus: 'aprovado' | 'recusado' | 'pendente_analise';
  rejectionReason?: string;
}

export interface ActiveBankLoan {
  id: string;
  originalAmount: number;
  remainingAmount: number;
  weeklyInstallment: number;
  interestRate: number;
  weeksRemaining: number;
  issuedAtWeek: number;
}

export interface FinancialHealthStatus {
  clubId: string;
  creditScore: number; // 0 a 100 (Avaliado com base no valor do plantel, histórico e receita)
  maxBorrowingCapacity: number; // Teto de empréstimo permitido (€)
  isInDefault: boolean; // Indica se o clube está com saldo negativo / falha de pagamento
  weeksInDefault: number;
  unpaidSalariesWeeks: number; // Semanas com salários de jogadores e staff em atraso
  foreclosureRiskLevel: 'Nenhum' | 'Baixo' | 'Elevado' | 'Crítico' | 'Em Penhora';
}

export interface PlayerForeclosureRecord {
  playerId: string;
  playerName: string;
  marketValueAtForeclosure: number;
  debtAmountCleared: number;
  foreclosedAtWeek: number;
}
