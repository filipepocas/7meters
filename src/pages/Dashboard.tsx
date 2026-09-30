/**
 * 7meters - Central Game Dashboard & Hub
 * Painel principal do treinador de andebol com suporte integral para:
 * - Visão Geral do Clube, Foto Interior do Pavilhão, Camisola Oficial
 * - Prancheta Tática & 7 Inicial (1 GR + 6 Jogadores)
 * - Simulação de Partida ao Vivo com Foto da Arena, Time-out e Shot Chart
 * - Instalações, Expansão do Pavilhão, Academia Sub-18 e Treino
 * - Mercado de Transferências & Leilões
 * - Classificação Oficial da Liga e Séries
 * - Crédito BCP e Patrocínios Mistério
 * - Painel de Administrador e Instalação PWA
 */

import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
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
    currentUser,
    currentWeek,
    currentSeason,
    currentDivision,
    currentGroup,
    boardConfidence,
    fanSatisfaction,
    advanceToNextWeek,
    logout,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [completedMatches, setCompletedMatches] = useState<MatchResult[]>([]);
  const [weekNotice, setWeekNotice] = useState<string | null>(null);

  // Adversário da ronda atual
  const opponentClub = generateClubProfile('ABC de Braga', 'Andebol 1 (Divisão de Honra)', 180000, 44);
  const opponentSquad = generateSquad(opponentClub.id, 16, 6);

  const handleMatchComplete = (result: MatchResult) => {
    setCompletedMatches((prev) => [...prev, result]);
  };

  const handleAdvanceWeek = () => {
    advanceToNextWeek();
    setWeekNotice(`Semana ${currentWeek} concluída! Despesas de salários debitadas, patrocínios recebidos e sessões de treino processadas.`);
    setTimeout(() => setWeekNotice(null), 5000);
  };

  if (!userClub) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 font-mono">
        <div className="max-w-md w-full border-4 border-black bg-yellow-400 p-8 text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
          <div className="text-4xl">🤾</div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            7meters Handball
          </h1>
          <p className="text-xs font-bold">
            Simulador de Andebol Profissional tipo Elifoot. Começa agora a construção da tua equipa de raiz!
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full border-4 border-black bg-black p-3 font-black uppercase text-white hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            ⭐ Criar Equipa de Raiz
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

  return (
    <div className="min-h-screen bg-zinc-100 p-3 text-black dark:bg-zinc-950 dark:text-white md:p-6 font-sans">
      <OfflineIndicator />

      {/* Top Bar Utilitária */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-zinc-300 pb-2 dark:border-zinc-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black bg-yellow-400 text-black px-2 py-0.5">
            Época {currentSeason} • Semana {currentWeek}
          </span>
          <span className="hidden sm:inline font-bold text-zinc-600 dark:text-zinc-400">
            {currentDivision} ({currentGroup})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {currentUser?.isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="border-2 border-black bg-yellow-400 px-3 py-1 font-black uppercase text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Painel Mestre de Administração"
            >
              👑 Admin Matriz
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="font-bold hidden md:inline">
                {currentUser.name} {currentUser.isAdmin && '(Admin)'}
              </span>
              <button
                onClick={logout}
                className="border border-black bg-zinc-200 px-2 py-1 uppercase font-bold text-[10px] hover:bg-zinc-300 dark:bg-zinc-800 dark:border-white"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="border border-black bg-black text-white px-2 py-1 uppercase font-bold text-[10px] hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Entrar
            </button>
          )}

          <button
            onClick={() => setIsWizardOpen(true)}
            className="border border-black bg-white px-2 py-1 uppercase font-bold text-[10px] hover:bg-zinc-100 dark:bg-zinc-800 dark:border-white"
            title="Construir outro clube de raiz"
          >
            Novo Clube
          </button>
        </div>
      </div>

      {weekNotice && (
        <div className="mb-4 border-4 border-black bg-green-300 p-3 font-mono font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          🔔 {weekNotice}
        </div>
      )}

      {/* CABEÇALHO PRINCIPAL DO CLUBE (Estilo Brutalista / Elifoot) */}
      <header className="mb-6 border-4 border-black bg-yellow-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-yellow-500 dark:text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Visual da Camisola do Clube */}
            <JerseyVisual
              jersey={{
                id: 1,
                primaryColor: userClub.colors?.primary || '#003399',
                secondaryColor: userClub.colors?.secondary || '#FFCC00',
                patternType: 'stripes_vertical',
                chestSponsorName: '7METERS',
              }}
              size="lg"
            />

            <div>
              <span className="border-2 border-black bg-black px-2 py-0.5 font-mono text-[11px] font-black uppercase text-white">
                {userClub.shortName} • {userClub.level}
              </span>
              <h1 className="mt-1 text-3xl md:text-5xl font-black uppercase tracking-tight">
                {userClub.name}
              </h1>
              <p className="font-mono text-xs font-bold mt-0.5">
                🏟️ {userClub.arena.name} (Cap. {arenaCap.toLocaleString()} lugares) • Sede: {userClub.city || 'Portugal'}
              </p>
            </div>
          </div>

          {/* Widgets Financeiros e Plantel */}
          <div className="flex flex-wrap gap-2 font-mono">
            <div className="border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[10px] text-zinc-500 uppercase block">Tesouraria</span>
              <span className={`text-xl ${userClub.budget >= 0 ? 'text-black' : 'text-red-600'}`}>
                €{userClub.budget.toLocaleString()}
              </span>
            </div>

            <div className="border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[10px] text-zinc-500 uppercase block">Plantel</span>
              <span className="text-xl">{userSquad.length} Jogadores</span>
            </div>

            <button
              onClick={handleAdvanceWeek}
              className="border-2 border-black bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-center items-center"
            >
              <span>Avançar</span>
              <span className="text-[10px] text-yellow-400">Semana →</span>
            </button>
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-black pt-4">
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-black uppercase hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            🏛️ Crédito BCP
          </button>
          <button
            onClick={() => setIsSponsorModalOpen(true)}
            className="border-2 border-black bg-purple-600 px-3 py-1.5 font-mono text-xs font-black uppercase text-white hover:bg-purple-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            🎁 Patrocínio Mistério
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="border-2 border-black bg-black px-3 py-1.5 font-mono text-xs font-black uppercase text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            🌐 Jogos Online
          </button>
        </div>
      </header>

      {/* Navegação por Separadores */}
      <nav className="mb-6 flex flex-wrap border-b-4 border-black dark:border-white">
        {[
          { id: 'overview', label: '🏠 Visão Geral' },
          { id: 'match', label: '🤾 Partida ao Vivo' },
          { id: 'squad', label: '🤾 Plantel (Molecular)' },
          { id: 'tactics', label: '📋 Tática & 7 Inicial' },
          { id: 'market', label: '🏪 Transferências' },
          { id: 'facilities', label: '🏗️ Pavilhão & Academia' },
          { id: 'league', label: '🏆 Classificação' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`border-t-4 border-l-4 border-r-4 border-black px-4 py-2.5 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white ${
              activeTab === tab.id
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-black hover:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo Conforme o Separador */}
      <main className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Pavilhão com Imagem e Plantel */}
            <div className="md:col-span-2 space-y-6">
              {/* O Pavilhão do Clube com Foto Interior */}
              <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white overflow-hidden">
                <div className="relative h-72 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={arenaImg}
                    alt={userClub.arena.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-105 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-yellow-400 text-yellow-400 px-3 py-1 font-mono text-[11px] font-black uppercase">
                    3D Render • Vista das Bancadas
                  </div>
                  <div className="absolute bottom-4 left-4 text-white font-mono">
                    <span className="bg-yellow-400 text-black px-2 py-0.5 text-xs font-black uppercase">
                      Pavilhão Oficial
                    </span>
                    <h3 className="text-2xl font-black uppercase mt-1">{userClub.arena.name}</h3>
                    <p className="text-xs text-zinc-300">
                      Lotação: {arenaCap.toLocaleString()} Lugares • Bilhete Médio: €{(userClub.arena.ticketPrice || 12).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div className="border-2 border-black p-2 bg-zinc-50 dark:bg-zinc-800 dark:border-white">
                    <div className="text-zinc-500 uppercase text-[10px]">Adeptos Base</div>
                    <div className="font-black text-sm">{userClub.fanbase.toLocaleString()}</div>
                  </div>
                  <div className="border-2 border-black p-2 bg-zinc-50 dark:bg-zinc-800 dark:border-white">
                    <div className="text-zinc-500 uppercase text-[10px]">Manutenção</div>
                    <div className="font-black text-sm">€{userClub.arena.rentalOrMaintenanceCost?.toLocaleString()}/mês</div>
                  </div>
                  <div className="border-2 border-black p-2 bg-zinc-50 dark:bg-zinc-800 dark:border-white">
                    <div className="text-zinc-500 uppercase text-[10px]">Prestígio</div>
                    <div className="font-black text-sm">⭐ {userClub.arena.prestigeBonus || 6}/10</div>
                  </div>
                </div>
              </div>

              {/* Resumo do Plantel */}
              <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
                <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4 dark:border-white">
                  <h3 className="text-xl font-black uppercase">
                    🤾 Plantel Principal ({userSquad.length} Atletas)
                  </h3>
                  <button
                    onClick={() => setActiveTab('tactics')}
                    className="border-2 border-black bg-yellow-400 px-3 py-1 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300"
                  >
                    Definir 7 Inicial →
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto pr-1">
                  {userSquad.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between border-b border-zinc-200 py-1.5 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                          {player.position}
                        </span>
                        <span className="font-bold">{player.name}</span>
                        <span className="text-zinc-400">({player.age} anos)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>Moral: {player.moral}/10</span>
                        <span>Stamina: {player.energyLevel}%</span>
                        <span className="font-black text-blue-600 dark:text-blue-400">
                          OVR {player.overallRating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna 3: Próximo Jogo e Estatísticas da Direção */}
            <div className="space-y-6">
              {/* Próximo Jogo */}
              <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white font-mono">
                <span className="bg-yellow-400 text-black px-2 py-0.5 text-xs font-black uppercase">
                  Próxima Jornada
                </span>
                <h3 className="text-xl font-black uppercase mt-2">{userClub.name} vs {opponentClub.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Estádio: {userClub.arena.name} • Andebol 1
                </p>

                <button
                  onClick={() => setActiveTab('match')}
                  className="mt-4 w-full border-4 border-black bg-green-500 p-3 font-black uppercase text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center transition-all animate-pulse"
                >
                  🤾 Entrar em Campo / Jogar!
                </button>
              </div>

              {/* Confiança da Direção & Pressão dos Adeptos */}
              <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white font-mono text-xs">
                <h3 className="text-base font-black uppercase border-b-2 border-black pb-2 mb-3 dark:border-white">
                  📊 Confiança & Pressão Social
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Confiança da Direção:</span>
                      <span className="font-black">{boardConfidence}%</span>
                    </div>
                    <div className="h-3 border-2 border-black bg-zinc-200">
                      <div className="h-full bg-green-500" style={{ width: `${boardConfidence}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Satisfação dos Adeptos:</span>
                      <span className="font-black">{fanSatisfaction}%</span>
                    </div>
                    <div className="h-3 border-2 border-black bg-zinc-200">
                      <div className="h-full bg-blue-500" style={{ width: `${fanSatisfaction}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informação PWA & Instalação */}
              <div className="border-4 border-black bg-yellow-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono text-xs text-black">
                <div className="font-black uppercase mb-1">📱 PWA Instalável no Dispositivo</div>
                <p className="font-bold">
                  Podes instalar o 7meters no teu telemóvel ou computador para jogar sem navegador, com suporte offline e acesso rápido ao teu clube!
                </p>
              </div>
            </div>
          </div>
        )}

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

        {activeTab === 'facilities' && <FacilitiesView />}

        {activeTab === 'market' && <TransferMarket />}

        {activeTab === 'league' && <LeagueStandings completedMatches={completedMatches} />}
      </main>

      {/* AVISO DE DESPEDIMENTO (GAME OVER) SE CONFIANÇA DA DIREÇÃO CHEGAR A 0% */}
      {boardConfidence <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
          <div className="w-full max-w-md border-4 border-red-600 bg-white p-8 text-black shadow-[10px_10px_0px_0px_rgba(220,38,38,1)] text-center space-y-4">
            <div className="text-5xl">🛑</div>
            <h2 className="text-3xl font-black uppercase text-red-600">
              FOSTE DESPEDIDO!
            </h2>
            <p className="text-xs font-bold text-zinc-700">
              A direção do <strong>{userClub.name}</strong> perdeu toda a confiança no teu projeto desportivo após os maus resultados. A rescisão foi comunicada à imprensa.
            </p>
            <button
              onClick={() => {
                useGameStore.getState().resetGameUniverse();
                setIsWizardOpen(true);
              }}
              className="w-full border-4 border-black bg-red-600 p-3 font-black uppercase text-white hover:bg-red-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              🔄 Começar de Novo com Outro Clube
            </button>
          </div>
        </div>
      )}

      {/* Modais */}
      <BankLoanModal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} />
      <MysterySponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} />
      <MatchScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} />
      <AdminMatrixModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {isWizardOpen && <ClubCreationWizard onComplete={() => setIsWizardOpen(false)} />}
    </div>
  );
};
