/**
 * 7meters - Modern Handball Manager Dashboard
 * Interface ultra-moderna, limpa e intuitiva inspirada nas melhores aplicações de desporto e gestão.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Cloud, CloudOff, CircleAlert, LoaderCircle } from 'lucide-react';
import { useGameStore, TrainingFocus } from '../store/useGameStore';
import { BankLoanModal } from '../components/finance/BankLoanModal';
import { MysterySponsorModal } from '../components/finance/MysterySponsorModal';
import { MatchScheduleModal } from '../components/multiplayer/MatchScheduleModal';
import { AdminMatrixModal } from '../components/admin/AdminMatrixModal';
import { AuthModal } from '../components/auth/AuthModal';
import { ClubCreationWizard } from '../components/club/ClubCreationWizard';
import { TacticsView } from '../components/tactics/TacticsView';
import { SquadManagementView } from '../components/squad/SquadManagementView';
import { MatchLiveViewer } from '../components/match/MatchLiveViewer';
import { TransferMarket } from '../components/market/TransferMarket';
import { LeagueStandings } from '../components/league/LeagueStandings';
import { FacilitiesView } from '../components/facilities/FacilitiesView';
import { JerseyVisual } from '../components/common/JerseyVisual';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import { OfflineIndicator } from '../components/pwa/OfflineIndicator';
import { generateClubProfile } from '../utils/generators/clubGen';
import { generateSquad } from '../utils/generators/squadGen';
import { MatchResult } from '../types/match.types';

type ActiveTab = 'overview' | 'match' | 'squad' | 'tactics' | 'market' | 'facilities' | 'league';

export const Dashboard: React.FC = () => {
  const {
    userClub,
    userSquad,
    allClubs,
    leagueCalendar,
    currentUser,
    currentWeek,
    currentSeason,
    currentDivision,
    currentGroup,
    boardConfidence,
    fanSatisfaction,
    trainingFocus,
    setTrainingFocus,
    advanceToNextWeek,
    logout,
    cloudSaveStatus,
    completedMatchesHistory,
    recordCompletedMatch,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [weekNotice, setWeekNotice] = useState<string | null>(null);
  const handleRecoveryRequested = useCallback(() => setIsAuthModalOpen(true), []);

  const opponentClub = useMemo(() => {
    const round = leagueCalendar.find((item) => item.roundNumber === currentWeek);
    const fixture = round?.matches.find(
      (item) =>
        item.status === 'agendado' &&
        (item.homeClubId === userClub?.id || item.awayClubId === userClub?.id)
    );
    const opponentId = fixture
      ? fixture.homeClubId === userClub?.id
        ? fixture.awayClubId
        : fixture.homeClubId
      : null;

    return (
      allClubs.find((club) => club.id === opponentId) ??
      generateClubProfile('ABC de Braga', 'Andebol 1 (Divisão de Honra)', 180000, 44)
    );
  }, [allClubs, currentWeek, leagueCalendar, userClub?.id]);
  const opponentSquad = useMemo(() => generateSquad(opponentClub.id, 16, 6), [opponentClub.id]);

  const handleMatchComplete = (result: MatchResult) => {
    recordCompletedMatch(result);
  };

  const handleAdvanceWeek = () => {
    advanceToNextWeek();
    setWeekNotice(`Semana ${currentWeek} concluída com sucesso! Despesas salariais debitadas e treinos aplicados.`);
    setTimeout(() => setWeekNotice(null), 5000);
  };

  if (!userClub) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-white">
        <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl">
            🤾
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              7meters Handball
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Gestor de Andebol Profissional. Cria o teu clube de raiz, contrata craques e lidera rumo à glória europeia!
            </p>
          </div>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full rounded-xl bg-amber-500 py-3.5 px-4 font-semibold text-black hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
          >
            ⭐ Construir Equipa de Raiz
          </button>
        </div>

        {isWizardOpen && <ClubCreationWizard onComplete={() => setIsWizardOpen(false)} />}
      </div>
    );
  }

  const arenaCap = userClub.arena?.capacity || userClub.stadiumCapacity || 2500;
  const arenaImg =
    userClub.arena?.imagePath && !userClub.arena.imagePath.includes('unsplash')
      ? userClub.arena.imagePath
      : '/src/assets/images/arena_champions_cup_1790774601559.jpg';

  // Médias do plantel
  const avgOvr = Math.round(
    userSquad.reduce((acc, p) => acc + (p.overallRating || 60), 0) / (userSquad.length || 1)
  );
  const avgEnergy = Math.round(
    userSquad.reduce((acc, p) => acc + (p.energyLevel || 100), 0) / (userSquad.length || 1)
  );
  const weeklyWages = userSquad.reduce(
    (acc, p) => acc + (p.wage || Math.round(p.salary / 4)),
    0
  );
  const cloudStatusLabel = {
    local: 'Local',
    syncing: 'A sincronizar',
    saved: 'Cloud OK',
    error: 'Cloud erro',
  }[cloudSaveStatus];
  const cloudStatusTitle = {
    local: 'Save guardado neste dispositivo. Inicia sessão para o sincronizar entre dispositivos.',
    syncing: 'A sincronizar a carreira com a cloud.',
    saved: 'Carreira sincronizada com o Supabase.',
    error: 'Falhou a sincronização. O save local continua intacto.',
  }[cloudSaveStatus];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-amber-500 selection:text-black">
      <OfflineIndicator />

      {/* TOP NAVIGATION BAR MODERNA (Glassmorphism Sticky) */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Linha Superior: Logo, Identidade do Clube, Saldo e Ações Rápidas */}
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Esquerda: Identidade do Clube */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md">
                <span className="font-mono text-xs sm:text-sm font-black tracking-tighter">7M</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                    {userClub.name}
                  </h1>
                  <span className="shrink-0 rounded-md bg-zinc-800/90 px-1.5 sm:px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
                    {userClub.shortName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400">
                  <span className="text-amber-400 font-medium">Época {currentSeason} · Jornada {currentWeek}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden md:inline text-zinc-400 truncate">{currentDivision}</span>
                </div>
              </div>
            </div>

            {/* Centro: Indicadores Rápidos de Estado (Desktop / Grandes Ecrãs) */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Tesouraria */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                  €
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Tesouraria</div>
                  <div className="font-mono text-xs font-bold text-white tabular-nums">
                    €{userClub.budget.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Confiança da Direção */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 shadow-sm">
                <div className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                  boardConfidence > 60 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  🏛️
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Presidência</div>
                  <div className="font-mono text-xs font-bold text-white tabular-nums">
                    {boardConfidence}%
                  </div>
                </div>
              </div>

              {/* Energia Média do Plantel */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold">
                  ⚡
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Energia Plantel</div>
                  <div className="font-mono text-xs font-bold text-white tabular-nums">
                    {avgEnergy}%
                  </div>
                </div>
              </div>
            </div>

            {/* Direita: Ações Principais */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <PWAInstallButton />
              <span
                role="status"
                aria-live="polite"
                aria-label={cloudStatusTitle}
                title={cloudStatusTitle}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold ${
                  cloudSaveStatus === 'error'
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : cloudSaveStatus === 'saved'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                }`}
              >
                {cloudSaveStatus === 'local' && <CloudOff size={14} aria-hidden="true" />}
                {cloudSaveStatus === 'syncing' && <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />}
                {cloudSaveStatus === 'saved' && <Cloud size={14} aria-hidden="true" />}
                {cloudSaveStatus === 'error' && <CircleAlert size={14} aria-hidden="true" />}
                <span className="hidden sm:inline">{cloudStatusLabel}</span>
              </span>

              {/* Botão Avançar Semana */}
              <button
                onClick={handleAdvanceWeek}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98]"
              >
                <span>⏩ Avançar</span>
              </button>

              {/* Botão Jogar Partida */}
              <button
                onClick={() => setActiveTab('match')}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl bg-amber-500 px-2.5 sm:px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
              >
                <span>🤾 <span className="hidden xs:inline">Jogar</span></span>
              </button>

              {currentUser?.isAdmin && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-1.5 sm:p-2 text-amber-400 hover:bg-amber-500/20"
                  title="Painel Mestre Admin"
                >
                  👑
                </button>
              )}

              {/* Perfil / Sair */}
              <div className="flex items-center pl-1 border-l border-zinc-800">
                {currentUser ? (
                  <button
                    onClick={logout}
                    className="rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-amber-400 hover:text-amber-300"
                  >
                    Entrar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Barra Compacta Exclusiva para Mobile e Tablets (< lg) */}
          <div className="flex lg:hidden items-center justify-between border-t border-zinc-800/60 py-2 px-1 text-[11px] font-mono text-zinc-300 gap-2">
            <div className="flex items-center gap-1 text-emerald-400 font-bold truncate">
              <span>💰</span>
              <span>€{userClub.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-300">
              <span>🏛️</span>
              <span className={boardConfidence > 60 ? 'text-emerald-400' : 'text-amber-400'}>
                {boardConfidence}%
              </span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <span>⚡</span>
              <span>{avgEnergy}%</span>
            </div>
            <button
              onClick={handleAdvanceWeek}
              className="sm:hidden rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-200 active:scale-95"
            >
              ⏩ Avançar
            </button>
          </div>

          {/* Linha Inferior: Barra de Navegação por Separadores Modernos */}
          <nav className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none border-t border-zinc-800/40 touch-pan-x">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'match', label: 'Partida ao Vivo', icon: '🤾', badge: 'Matchday' },
              { id: 'squad', label: 'Plantel & Atletas', icon: '👥' },
              { id: 'tactics', label: 'Tática & 7 Inicial', icon: '📋' },
              { id: 'market', label: 'Transferências', icon: '🏪' },
              { id: 'facilities', label: 'Pavilhão & Clube', icon: '🏟️' },
              { id: 'league', label: 'Classificação', icon: '🏆' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`group relative flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-zinc-700'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span className="hidden xs:inline ml-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* AVISOS E NOTIFICAÇÕES */}
      {weekNotice && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-200 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <span className="font-medium">{weekNotice}</span>
            </div>
            <button
              onClick={() => setWeekNotice(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 1. MATCHDAY HERO CARD (Moderno com Backdrop 3D do Pavilhão de Andebol) */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl">
              <div className="relative min-h-[380px] sm:min-h-[320px] md:h-80 w-full overflow-hidden flex flex-col justify-between">
                <img
                  src={arenaImg}
                  alt={userClub.arena.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] contrast-[1.1] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/90" />

                {/* Badge Superior */}
                <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold text-amber-300">
                    Jornada {currentWeek} de 22 · Andebol 1
                  </span>
                  <span className="rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] text-zinc-300 truncate max-w-[180px] sm:max-w-none">
                    🏟️ {userClub.arena.name}
                  </span>
                </div>

                {/* Confronto Central e Ações */}
                <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-6 text-center w-full md:w-auto">
                    {/* Casa */}
                    <div className="flex-1 sm:flex-initial text-center sm:text-left min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                        Casa
                      </span>
                      <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate max-w-[125px] sm:max-w-[200px] md:max-w-none">
                        {userClub.name}
                      </h2>
                      <div className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                        OVR: {avgOvr} · ⚡ {avgEnergy}%
                      </div>
                    </div>

                    {/* Divisor VS */}
                    <div className="flex flex-col items-center px-1 sm:px-3 shrink-0">
                      <span className="rounded-full bg-zinc-800/90 border border-zinc-700 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold text-amber-400 uppercase tracking-wider shadow">
                        VS
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5 hidden xs:inline">60 Min</span>
                    </div>

                    {/* Visitante */}
                    <div className="flex-1 sm:flex-initial text-center sm:text-right min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-blue-400 block">
                        Fora
                      </span>
                      <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate max-w-[125px] sm:max-w-[200px] md:max-w-none">
                        {opponentClub.name}
                      </h2>
                      <div className="text-[10px] sm:text-xs text-zinc-400 font-mono mt-0.5">
                        OVR: 72 · Div. Honra
                      </div>
                    </div>
                  </div>

                  {/* Ação Primária: Entrar na Partida */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                    <button
                      onClick={() => setActiveTab('tactics')}
                      className="flex-1 sm:flex-initial rounded-xl border border-zinc-700 bg-zinc-900/80 backdrop-blur px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-all text-center"
                    >
                      Ajustar Tática
                    </button>
                    <button
                      onClick={() => setActiveTab('match')}
                      className="flex-1 sm:flex-initial rounded-xl bg-amber-500 px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 text-center"
                    >
                      🎮 Jogar Partida
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KPIS ESTATÍSTICOS EM GRELHA ELEGANTE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tesouraria */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Orçamento do Clube</span>
                  <span className="text-base text-emerald-400">💰</span>
                </div>
                <div className="mt-2 text-xl font-bold text-white font-mono tabular-nums">
                  €{userClub.budget.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Folha salarial:</span>
                  <span className="text-zinc-300 font-mono">€{weeklyWages.toLocaleString()}/sem</span>
                </div>
              </div>

              {/* Confiança da Presidência */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Confiança da Direção</span>
                  <span className="text-base">🏛️</span>
                </div>
                <div className="mt-2 text-xl font-bold text-white font-mono tabular-nums">
                  {boardConfidence}%
                </div>
                <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      boardConfidence > 60 ? 'bg-emerald-500' : boardConfidence > 30 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${boardConfidence}%` }}
                  />
                </div>
              </div>

              {/* Condição do Sete Inicial */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Força Média (OVR)</span>
                  <span className="text-base text-blue-400">⚡</span>
                </div>
                <div className="mt-2 text-xl font-bold text-blue-400 font-mono tabular-nums">
                  {avgOvr} / 100
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Energia média:</span>
                  <span className="text-emerald-400 font-bold font-mono">{avgEnergy}%</span>
                </div>
              </div>

              {/* Foco de Treino Semanal */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">Treino da Semana</span>
                  <span className="text-base">🏋️</span>
                </div>
                <div className="mt-2 text-sm font-bold text-amber-300 truncate">
                  {trainingFocus === 'remate_exterior'
                    ? '🎯 Finalização & GR'
                    : trainingFocus === 'defesa_coletiva'
                    ? '🛡️ Foco Tático'
                    : trainingFocus === 'recuperacao_fisica'
                    ? '💤 Descanso Total'
                    : '⚡ Carga Física'}
                </div>
                <div className="mt-1">
                  <select
                    value={trainingFocus}
                    onChange={(e) => setTrainingFocus(e.target.value as TrainingFocus)}
                    className="w-full bg-zinc-800 text-[11px] font-medium text-zinc-300 border border-zinc-700 rounded-lg p-1"
                  >
                    <option value="recuperacao_fisica">💤 Descanso Total (100% Energia)</option>
                    <option value="remate_exterior">🎯 Finalização & GR (+Remate)</option>
                    <option value="defesa_coletiva">🛡️ Foco Tático (+Defesa)</option>
                    <option value="aceleracao_tatica">⚡ Carga Física (+Estamina)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. DUAS COLUNAS PRINCIPAIS: PLANTEL TITULAR & CENTRO DE OPERAÇÕES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1 & 2: O Sete Inicial Escalado e Prontidão */}
              <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      🤾 Sete Inicial Recomendado
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Os atletas titulares escalados para o próximo embate de andebol.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('squad')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Ver Todo o Plantel ({userSquad.length}) →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {userSquad.slice(0, 7).map((player, index) => {
                    const isTired = player.energyLevel < 50;
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">{player.name}</span>
                              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300">
                                {player.position}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {player.age} anos · Salário: €{(player.wage || 300).toLocaleString()}/sem
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">Energia</span>
                            <span className={`font-bold tabular-nums ${isTired ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                              ⚡ {player.energyLevel}%
                            </span>
                          </div>

                          <div className="text-right pl-3 border-l border-zinc-800">
                            <span className="text-[10px] text-zinc-500 uppercase block">OVR</span>
                            <span className="font-bold text-blue-400 text-sm tabular-nums">
                              {player.overallRating}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 3: Ações Rápidas de Gestão & Pavilhão */}
              <div className="space-y-6">
                {/* O Pavilhão da Casa */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
                  <h3 className="text-base font-bold text-white tracking-tight mb-2">
                    🏟️ Pavilhão Oficial
                  </h3>
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-zinc-800 mb-3">
                    <img
                      src={arenaImg}
                      alt={userClub.arena.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-white font-mono">
                      {userClub.arena.name}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 border-t border-zinc-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Lotação:</span>
                      <strong className="font-mono">{arenaCap.toLocaleString()} Lugares</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Preço do Bilhete:</span>
                      <strong className="font-mono">€{(userClub.arena.ticketPrice || 12).toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Manutenção:</span>
                      <strong className="font-mono">€{(userClub.arena.rentalOrMaintenanceCost || 1200).toLocaleString()}/mês</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('facilities')}
                    className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    Obras & Expansão de Bancadas →
                  </button>
                </div>

                {/* Serviços Financeiros */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur space-y-3">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    💼 Finanças & Parcerias
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsLoanModalOpen(true)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3 text-left hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-lg block">🏦</span>
                      <span className="text-xs font-bold text-white block mt-1">Crédito BCP</span>
                      <span className="text-[10px] text-zinc-400">Linha de liquidez</span>
                    </button>

                    <button
                      onClick={() => setIsSponsorModalOpen(true)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3 text-left hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-lg block">🤝</span>
                      <span className="text-xs font-bold text-white block mt-1">Patrocínios</span>
                      <span className="text-[10px] text-zinc-400">Injeção de capital</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Separadores Internos */}
        {activeTab === 'squad' && <SquadManagementView />}

        {activeTab === 'tactics' && <TacticsView />}

        {activeTab === 'match' && (
          <MatchLiveViewer
            homeClub={userClub}
            homeSquad={userSquad}
            awayClub={opponentClub}
            awaySquad={opponentSquad}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {activeTab === 'market' && <TransferMarket />}

        {activeTab === 'facilities' && <FacilitiesView />}

        {activeTab === 'league' && <LeagueStandings completedMatches={completedMatchesHistory} />}
      </main>

      {/* AVISO DE DESPEDIMENTO (GAME OVER) SE CONFIANÇA DA DIREÇÃO CHEGAR A 0% */}
      {boardConfidence <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-zinc-900 p-8 text-center space-y-4 shadow-2xl">
            <div className="text-5xl">🛑</div>
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight">
              Foste Despedido!
            </h2>
            <p className="text-xs text-zinc-400">
              A direção do <strong>{userClub.name}</strong> perdeu a confiança no teu projeto desportivo após os maus resultados.
            </p>
            <button
              onClick={() => {
                useGameStore.getState().resetGameUniverse();
                setIsWizardOpen(true);
              }}
              className="w-full rounded-xl bg-red-600 p-3 text-sm font-bold text-white hover:bg-red-500 transition-colors"
            >
              🔄 Recomeçar com Outro Clube
            </button>
          </div>
        </div>
      )}

      {/* Modais Utilitários */}
      <BankLoanModal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} />
      <MysterySponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} />
      <MatchScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} />
      {isAdminModalOpen && <AdminMatrixModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRecoveryRequested={handleRecoveryRequested}
      />
    </div>
  );
};
