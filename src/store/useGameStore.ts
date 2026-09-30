/**
 * 7meters - Global Game Store (Zustand)
 * Armazém central de estado para gestão do clube, finanças, plantel,
 * empréstimos bancários BCP, patrocinadores mistério, agendamento online e painel de admin.
 */

import { create } from 'zustand';
import { Club } from '../types/club.types';
import { ActiveBankLoan, BankLoanOffer } from '../types/finance.types';
import { MatchResult } from '../types/match.types';
import { MatchScheduleProposal } from '../types/onlineMatch.types';
import { Player } from '../types/player.types';
import { Sponsor } from '../types/sponsor.types';
import { StaffMember } from '../types/staff.types';
import { AdminRule, DynamicGameEvent } from '../types/admin.types';
import { acceptBankLoan, generateBankLoanProposal, processWeeklyLoanPayment } from '../engine/bankEngine';
import { RoundFixtures } from '../engine/calendarEngine';
import { respondToMatchProposal } from '../engine/onlineEngine';
import { confirmSponsorContract } from '../utils/generators/sponsorGen';
import { GAME_CONFIG, STORAGE_KEYS } from '../core/constants';
import { generateRandomPlayer } from '../utils/generators/playerGen';

export interface UserAccount {
  email: string;
  name: string;
  isAdmin: boolean;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export type TrainingFocus = 'remate_exterior' | 'defesa_coletiva' | 'recuperacao_fisica' | 'aceleracao_tatica';

interface GameState {
  // Autenticação
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  logout: () => void;

  // Calendário e Temporadas
  currentWeek: number;
  currentSeason: number;
  currentDivision: string;
  currentGroup: string;
  boardConfidence: number; // 0 a 100%
  fanSatisfaction: number; // 0 a 100%
  trainingFocus: TrainingFocus;
  setTrainingFocus: (focus: TrainingFocus) => void;

  // Entidades do Utilizador
  userClub: Club | null;
  userSquad: Player[];
  userStaff: StaffMember[];
  youthAcademy: Player[]; // Talentos sub-18
  allClubs: Club[];
  leagueCalendar: RoundFixtures[];
  activeLoans: ActiveBankLoan[];
  activeSponsors: Sponsor[];
  onlineProposals: MatchScheduleProposal[];
  completedMatchesHistory: MatchResult[];
  unpaidSalariesWeeks: number;

  // Regras de Administrador (Matriz Dinâmica)
  adminRules: AdminRule[];
  dynamicEventsPool: DynamicGameEvent[];
  updateAdminRule: (id: string, newCoefficient: number) => void;
  triggerDynamicEvent: (event: DynamicGameEvent) => void;

  // Ações de Estado do Clube
  setUserClub: (club: Club) => void;
  setUserSquad: (squad: Player[]) => void;
  setUserStaff: (staff: StaffMember[]) => void;
  setLeagueCalendar: (calendar: RoundFixtures[]) => void;
  upgradeArenaCapacity: (additionalSeats: number, cost: number) => boolean;
  promoteYouthPlayer: (playerId: string) => void;

  // Ações Bancárias & Financeiras
  requestLoanQuote: (amount: number) => BankLoanOffer;
  takeBankLoan: (offer: BankLoanOffer, amount: number) => boolean;
  injectAdminFunds: (amount: number) => void;
  processWeeklyFinancesAndLoans: () => void;

  // Ações de Patrocinadores
  signMysterySponsor: (sponsor: Sponsor) => { injectedAmount: number };

  // Ações de Agendamento Online
  handleProposalResponse: (proposalId: string, accept: boolean, newTime?: number) => void;

  // Avanço do Calendário
  advanceToNextWeek: () => void;
  resetGameUniverse: () => void;
}

const DEFAULT_ADMIN_RULES: AdminRule[] = [
  {
    id: 'rule_1',
    category: 'stamina',
    conditionCode: 'shoulder_fatigue_penalty',
    title: 'Penalização por Fadiga de Ombro',
    description: 'Redução na precisão de remate para atiradores com mais de 8 remates por jogo.',
    coefficientValue: 1.2,
    minLimit: 0.5,
    maxLimit: 2.5,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_2',
    category: 'referee',
    conditionCode: 'seven_meter_frequency',
    title: 'Probabilidade Base de 7 Metros',
    description: 'Percentagem de faltas ofensivas que resultam em livre de 7 metros.',
    coefficientValue: 0.05,
    minLimit: 0.02,
    maxLimit: 0.15,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_3',
    category: 'tactics',
    conditionCode: 'fastbreak_efficiency_boost',
    title: 'Bónus de Contra-Ataque Rápido',
    description: 'Multiplicador de eficácia de finalização nas saídas de 1ª vaga.',
    coefficientValue: 1.15,
    minLimit: 0.8,
    maxLimit: 1.5,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule_4',
    category: 'financial',
    conditionCode: 'bcp_credit_interest_base',
    title: 'Taxa Base de Juro BCP',
    description: 'Taxa mínima de referência para concessão de crédito a clubes.',
    coefficientValue: 0.08,
    minLimit: 0.03,
    maxLimit: 0.20,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  currentUser: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Padrão: Admin logado se coincidir com o email rochap.filipe@gmail.com
    return {
      email: GAME_CONFIG.ADMIN_EMAIL,
      name: 'Filipe Rocha',
      isAdmin: true,
      isLoggedIn: true,
    };
  })(),

  currentWeek: 1,
  currentSeason: 1,
  currentDivision: 'Andebol 1 (Divisão de Honra)',
  currentGroup: 'Série Norte',
  boardConfidence: 85,
  fanSatisfaction: 80,
  trainingFocus: 'remate_exterior',

  userClub: null,
  userSquad: [],
  userStaff: [],
  youthAcademy: [
    generateRandomPlayer(undefined, 4, null),
    generateRandomPlayer(undefined, 5, null),
    generateRandomPlayer(undefined, 6, null),
  ],
  allClubs: [],
  leagueCalendar: [],
  activeLoans: [],
  activeSponsors: [],
  onlineProposals: [],
  completedMatchesHistory: [],
  unpaidSalariesWeeks: 0,

  adminRules: DEFAULT_ADMIN_RULES,
  dynamicEventsPool: [],

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    set({ currentUser: user });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    set({ currentUser: null });
  },

  setTrainingFocus: (focus) => set({ trainingFocus: focus }),

  setUserClub: (club) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLUB_STATE, JSON.stringify(club));
    } catch {}
    set({ userClub: club });
  },

  setUserSquad: (squad) => set({ userSquad: squad }),
  setUserStaff: (staff) => set({ userStaff: staff }),
  setLeagueCalendar: (calendar) => set({ leagueCalendar: calendar }),

  upgradeArenaCapacity: (additionalSeats, cost) => {
    const { userClub } = get();
    if (!userClub || userClub.budget < cost) return false;

    const newCap = (userClub.arena?.capacity || userClub.stadiumCapacity) + additionalSeats;
    const updatedClub: Club = {
      ...userClub,
      budget: userClub.budget - cost,
      stadiumCapacity: newCap,
      fanbase: Math.min(newCap, userClub.fanbase + Math.round(additionalSeats * 0.6)),
      arena: {
        ...userClub.arena,
        capacity: newCap,
        prestigeBonus: Math.min(10, (userClub.arena?.prestigeBonus || 5) + 1),
      },
    };

    set({ userClub: updatedClub });
    return true;
  },

  promoteYouthPlayer: (playerId) => {
    const { youthAcademy, userSquad, userClub } = get();
    const candidate = youthAcademy.find((p) => p.id === playerId);
    if (!candidate || !userClub) return;

    const promoted: Player = {
      ...candidate,
      currentClubId: userClub.id,
      clubId: userClub.id,
      isHired: true,
      contractYearsRemaining: 3,
    };

    set({
      youthAcademy: youthAcademy.filter((p) => p.id !== playerId),
      userSquad: [...userSquad, promoted],
    });
  },

  updateAdminRule: (id, newCoefficient) => {
    const { adminRules } = get();
    set({
      adminRules: adminRules.map((r) =>
        r.id === id ? { ...r, coefficientValue: newCoefficient, updatedAt: new Date().toISOString() } : r
      ),
    });
  },

  triggerDynamicEvent: (event) => {
    const { userClub, userSquad } = get();
    if (!userClub) return;

    if (event.impacts.financialCostEuro) {
      set({
        userClub: {
          ...userClub,
          budget: userClub.budget + event.impacts.financialCostEuro,
        },
      });
    }

    if (event.impacts.moralChange) {
      set({
        userSquad: userSquad.map((p) => ({
          ...p,
          moral: Math.max(1, Math.min(10, p.moral + event.impacts.moralChange!)),
        })),
      });
    }
  },

  requestLoanQuote: (amount: number) => {
    const { userClub, userSquad } = get();
    if (!userClub) {
      return {
        loanId: 'invalid',
        maxAmountAllowed: 0,
        interestRate: 0,
        durationWeeks: 0,
        weeklyPayment: 0,
        approvalStatus: 'recusado',
        rejectionReason: 'Nenhum clube selecionado.',
      };
    }
    return generateBankLoanProposal(userClub, userSquad, amount);
  },

  takeBankLoan: (offer, amount) => {
    const { userClub, activeLoans } = get();
    if (!userClub || offer.approvalStatus !== 'aprovado') return false;

    const { updatedClub, newLoan } = acceptBankLoan(userClub, offer, amount);
    set({
      userClub: updatedClub,
      activeLoans: [...activeLoans, newLoan],
    });
    return true;
  },

  injectAdminFunds: (amount) => {
    const { userClub } = get();
    if (!userClub) return;
    set({
      userClub: {
        ...userClub,
        budget: userClub.budget + amount,
      },
    });
  },

  processWeeklyFinancesAndLoans: () => {
    const { userClub, activeLoans } = get();
    if (!userClub) return;

    let currentBudget = userClub.budget;
    const remainingLoans: ActiveBankLoan[] = [];

    activeLoans.forEach((loan) => {
      const result = processWeeklyLoanPayment({ ...userClub, budget: currentBudget }, loan);
      currentBudget = result.updatedClub.budget;

      if (result.updatedLoan.remainingAmount > 0 && result.updatedLoan.weeksRemaining > 0) {
        remainingLoans.push(result.updatedLoan);
      }
    });

    set({
      userClub: { ...userClub, budget: currentBudget },
      activeLoans: remainingLoans,
    });
  },

  signMysterySponsor: (sponsor) => {
    const { userClub, activeSponsors } = get();
    if (!userClub) return { injectedAmount: 0 };

    const { updatedSponsor, injectedAmount, newBudget } = confirmSponsorContract(sponsor, userClub.budget);
    set({
      userClub: { ...userClub, budget: newBudget },
      activeSponsors: [...activeSponsors, updatedSponsor],
    });

    return { injectedAmount };
  },

  handleProposalResponse: (proposalId, accept, newTime) => {
    const { onlineProposals, userClub } = get();
    if (!userClub) return;

    const updated = onlineProposals.map((prop) => {
      if (prop.proposalId === proposalId) {
        return respondToMatchProposal(prop, userClub.id, accept, newTime);
      }
      return prop;
    });

    set({ onlineProposals: updated });
  },

  advanceToNextWeek: () => {
    const {
      currentWeek,
      currentSeason,
      processWeeklyFinancesAndLoans,
      userSquad,
      userClub,
      trainingFocus,
      youthAcademy,
      boardConfidence,
    } = get();

    processWeeklyFinancesAndLoans();

    // 1. Débito de salários semanais e receitas de patrocínio
    let updatedBudget = userClub ? userClub.budget : 1500000;
    const weeklyWages = userSquad.reduce((acc, p) => acc + (p.wage || Math.round(p.salary / 4)), 0);
    const weeklySponsors = 25000; // Média de contratos
    updatedBudget = updatedBudget - weeklyWages + weeklySponsors;

    // 2. Aplicação do foco de treino semanal e recuperação
    let updatedSquad = userSquad.map((player) => {
      // Recuperação de lesão
      let updatedInjury = { ...player.injury };
      if (updatedInjury.isInjured) {
        const remainingDays = Math.max(0, updatedInjury.daysRemaining - 7);
        const remainingWeeks = Math.ceil(remainingDays / 7);
        if (remainingDays === 0) {
          updatedInjury = {
            isInjured: false,
            description: '',
            daysRemaining: 0,
            weeksRemaining: 0,
            severity: 'ligeira',
          };
        } else {
          updatedInjury.daysRemaining = remainingDays;
          updatedInjury.weeksRemaining = remainingWeeks;
        }
      }

      // Aplicação de treino
      const isYoung = player.age <= 22;
      const boostChance = isYoung ? 0.40 : 0.20;

      let newShooting = player.shooting;
      let newDefense = player.defense;
      let newEnergy = player.energyLevel;
      let newOvr = player.overallRating;

      if (trainingFocus === 'recuperacao_fisica') {
        // Descanso total: recupera a 100%
        newEnergy = Math.min(100, newEnergy + 30);
      } else if (trainingFocus === 'remate_exterior') {
        // GR & Finalização
        if (Math.random() < boostChance) {
          newShooting = Math.min(10, newShooting + 1);
          newOvr = Math.min(99, newOvr + 1);
        }
        newEnergy = Math.max(20, newEnergy - 8);
      } else if (trainingFocus === 'defesa_coletiva') {
        // Foco Tático
        if (Math.random() < boostChance) {
          newDefense = Math.min(10, newDefense + 1);
          newOvr = Math.min(99, newOvr + 1);
        }
        newEnergy = Math.max(20, newEnergy - 5);
      } else if (trainingFocus === 'aceleracao_tatica') {
        // Carga Física
        newEnergy = Math.max(15, newEnergy - 18);
        if (Math.random() < boostChance) {
          newOvr = Math.min(99, newOvr + 1);
        }
      }

      return {
        ...player,
        injury: updatedInjury,
        shooting: newShooting,
        defense: newDefense,
        overallRating: newOvr,
        energyLevel: Math.min(100, newEnergy),
      };
    });

    // 3. Fim de Temporada (após 22 semanas de campeonato)
    let nextWeek = currentWeek + 1;
    let nextSeason = currentSeason;
    let updatedAcademy = [...youthAcademy];

    if (nextWeek > 22) {
      // Transição de Época (Módulo 6.3)
      nextSeason = currentSeason + 1;
      nextWeek = 1;

      // Envelhecimento dos jogadores
      updatedSquad = updatedSquad
        .map((p) => {
          const newAge = p.age + 1;
          const remainingYears = Math.max(0, p.contractYearsRemaining - 1);
          let newOvr = p.overallRating;

          // Se tiver 35+ anos, regressão física ou retirada
          if (newAge >= 35) {
            newOvr = Math.max(40, newOvr - Math.floor(Math.random() * 3 + 1));
          } else if (newAge <= 23) {
            newOvr = Math.min(99, newOvr + Math.floor(Math.random() * 3 + 1));
          }

          return {
            ...p,
            age: newAge,
            overallRating: newOvr,
            contractYearsRemaining: remainingYears,
            isContractExpiringSoon: remainingYears === 1,
            energyLevel: 100,
          };
        })
        .filter((p) => p.age < 39); // Retirada aos 39 anos

      // Novos talentos juniores da academia
      updatedAcademy = [
        generateRandomPlayer(undefined, 5, null),
        generateRandomPlayer(undefined, 6, null),
        generateRandomPlayer(undefined, 6, null),
      ];
    }

    if (userClub) {
      set({
        userClub: { ...userClub, budget: updatedBudget },
        currentWeek: nextWeek,
        currentSeason: nextSeason,
        userSquad: updatedSquad,
        youthAcademy: updatedAcademy,
      });
    } else {
      set({
        currentWeek: nextWeek,
        currentSeason: nextSeason,
        userSquad: updatedSquad,
        youthAcademy: updatedAcademy,
      });
    }
  },

  resetGameUniverse: () => {
    localStorage.removeItem(STORAGE_KEYS.CLUB_STATE);
    set({
      userClub: null,
      userSquad: [],
      userStaff: [],
      activeLoans: [],
      activeSponsors: [],
      currentWeek: 1,
    });
  },
}));
