/**
 * 7meters - Live Match Simulator Viewer Component (Estilo Elifoot)
 * Visualizador em tempo real para simulação de partidas de andebol:
 * - Pavilhão da equipa da casa em alta definição no topo
 * - Relógio digital de 00' a 60' (2 partes de 30 min com intervalo regulamentar)
 * - Marcador ao vivo atualizado segundo a segundo (25 a 35 golos por equipa)
 * - Live Feed textual determinístico com ratings dos jogadores
 * - 2 Time-Outs técnicos com painel interativo (Bronca, Incentivo, Mudança Tática)
 * - Substituições em Direto: gestão do desgaste físico (energia < 50%) e troca imediata
 * - Velocidades de simulação: 1x, 3x (Rápido Elifoot), 10x e Simular Instantâneo
 * - Conferência de Imprensa pós-jogo
 */

import React, { useState, useEffect } from 'react';
import { Club } from '../../types/club.types';
import { Player } from '../../types/player.types';
import { MatchResult, MatchEvent } from '../../types/match.types';
import { simulateHandballMatch, TacticalSettings } from '../../engine/matchEngine';
import { useGameStore } from '../../store/useGameStore';
import confetti from 'canvas-confetti';

interface MatchLiveViewerProps {
  homeClub: Club;
  homeSquad: Player[];
  awayClub: Club;
  awaySquad: Player[];
  homeTactics?: TacticalSettings;
  awayTactics?: TacticalSettings;
  onMatchComplete?: (result: MatchResult) => void;
}

export const MatchLiveViewer: React.FC<MatchLiveViewerProps> = ({
  homeClub,
  homeSquad,
  awayClub,
  awaySquad,
  homeTactics,
  awayTactics,
  onMatchComplete,
}) => {
  const { advanceToNextWeek } = useGameStore();

  const [activeHomeTactics, setActiveHomeTactics] = useState<TacticalSettings>(
    homeTactics || {
      defenseSystem: '6-0',
      attackPace: 'normal',
      aggressiveness: 'intensa',
    }
  );

  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(200); // 200ms por minuto = estilo rápido Elifoot!
  const [activeTab, setActiveTab] = useState<'feed' | 'substitutions' | 'stats' | 'shotchart' | 'press'>('feed');

  // Gestão de Time-Outs (2 por jogo)
  const [timeoutsRemaining, setTimeoutsRemaining] = useState<number>(2);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState<boolean>(false);
  const [timeoutFeedback, setTimeoutFeedback] = useState<string | null>(null);

  // Jogadores em campo (7 titulares) e banco
  const [courtPlayerIds, setCourtPlayerIds] = useState<string[]>(() =>
    homeSquad.slice(0, 7).map((p) => p.id)
  );

  // Estado de energia dos jogadores durante a partida
  const [matchEnergy, setMatchEnergy] = useState<Record<string, number>>(() => {
    const energyMap: Record<string, number> = {};
    homeSquad.forEach((p) => {
      energyMap[p.id] = p.energyLevel || 100;
    });
    return energyMap;
  });

  // Conferência de Imprensa
  const [pressConferenceDone, setPressConferenceDone] = useState<boolean>(false);
  const [pressFeedback, setPressFeedback] = useState<string | null>(null);

  // Simulação do resultado
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Inicializar simulação
  useEffect(() => {
    const result = simulateHandballMatch(
      homeClub,
      homeSquad,
      awayClub,
      awaySquad,
      activeHomeTactics,
      awayTactics
    );
    setMatchResult(result);
    setCurrentMinute(0);
    setIsPlaying(false);
    setTimeoutsRemaining(2);
    setIsTimeoutModalOpen(false);
    setTimeoutFeedback(null);
    setPressConferenceDone(false);
    setPressFeedback(null);
  }, [homeClub, homeSquad, awayClub, awaySquad, activeHomeTactics, awayTactics]);

  // Cronómetro segundo a segundo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentMinute < 60) {
      timer = setTimeout(() => {
        setCurrentMinute((prev) => {
          const next = prev + 1;

          // Desgaste físico dos atletas em campo
          setMatchEnergy((old) => {
            const updated = { ...old };
            const drainRate = activeHomeTactics.defenseSystem === '3-3' ? 1.2 : 0.8;
            courtPlayerIds.forEach((id) => {
              if (updated[id] !== undefined) {
                updated[id] = Math.max(10, updated[id] - drainRate);
              }
            });
            return updated;
          });

          // Pausa automática no intervalo regulamentar (minuto 30)
          if (next === 30) {
            setIsPlaying(false);
          }

          // Fim do jogo (minuto 60)
          if (next >= 60) {
            setIsPlaying(false);
            if (matchResult && onMatchComplete) {
              onMatchComplete(matchResult);
              try {
                confetti({ particleCount: 80, spread: 70 });
              } catch {}
            }
          }
          return next;
        });
      }, speedMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentMinute, speedMs, matchResult, onMatchComplete, activeHomeTactics, courtPlayerIds]);

  if (!matchResult) {
    return (
      <div className="border-4 border-black bg-white p-8 text-center font-black dark:border-white dark:bg-zinc-900 dark:text-white">
        ⏳ A PREPARAR O PAVILHÃO E O RELATÓRIO DO JOGO...
      </div>
    );
  }

  const visibleEvents = matchResult.events.filter((e) => e.minute <= currentMinute);

  const partialHomeGoals = visibleEvents.filter(
    (e) => e.clubId === homeClub.id && (e.type === 'golo' || e.type === 'golo_7m')
  ).length;

  const partialAwayGoals = visibleEvents.filter(
    (e) => e.clubId === awayClub.id && (e.type === 'golo' || e.type === 'golo_7m')
  ).length;

  const handleInstantSimulate = () => {
    setCurrentMinute(60);
    setIsPlaying(false);
    if (onMatchComplete) {
      onMatchComplete(matchResult);
    }
  };

  // Pedir Time-Out
  const handleOpenTimeout = () => {
    if (timeoutsRemaining <= 0 || currentMinute >= 60 || currentMinute === 0) return;
    setIsPlaying(false);
    setIsTimeoutModalOpen(true);
  };

  const handleExecuteTimeout = (action: 'scold' | 'motivate' | 'tactic_change', newSystem?: TacticalSettings['defenseSystem']) => {
    setTimeoutsRemaining((prev) => Math.max(0, prev - 1));
    setIsTimeoutModalOpen(false);

    if (action === 'scold') {
      setTimeoutFeedback('🗣️ "BRONCA NO BALNEÁRIO!" Exigiste entrega física imediata e agressividade na muralha defensiva (+Moral e +Agressividade).');
      setActiveHomeTactics((t) => ({ ...t, aggressiveness: 'limite' }));
    } else if (action === 'motivate') {
      setTimeoutFeedback('🤝 "INCENTIVO TÁTICO!" Acalmaste o grupo, pedindo circulação de bola paciente e foco no pivô (+Paciência ofensiva).');
      setActiveHomeTactics((t) => ({ ...t, attackPace: 'Ataque Organizado Paciente' }));
    } else if (action === 'tactic_change' && newSystem) {
      setTimeoutFeedback(`📐 "MUDANÇA DE URGÊNCIA!" Alteraste o sistema defensivo para ${newSystem}. A equipa ajustou a marcação.`);
      setActiveHomeTactics((t) => ({ ...t, defenseSystem: newSystem }));
    }
  };

  // Substituição em direto durante o jogo
  const handleLiveSubstitution = (outCourtPlayerId: string, inBenchPlayerId: string) => {
    setCourtPlayerIds((prev) =>
      prev.map((id) => (id === outCourtPlayerId ? inBenchPlayerId : id))
    );
    const outPlayer = homeSquad.find((p) => p.id === outCourtPlayerId);
    const inPlayer = homeSquad.find((p) => p.id === inBenchPlayerId);
    setTimeoutFeedback(
      `🔄 SUBSTITUIÇÃO EM DIRETO (Minuto ${currentMinute}'): Saiu ${outPlayer?.name || 'atleta'} (fadigado) e entrou ${inPlayer?.name || 'suplente'} fresco para a quadra!`
    );
  };

  const handlePressAnswer = (type: 'praise' | 'calm' | 'critique') => {
    setPressConferenceDone(true);
    if (type === 'praise') {
      setPressFeedback('A direção e os adeptos ficaram entusiasmados com a tua liderança positiva! Moral do balneário em alta (+5%).');
    } else if (type === 'calm') {
      setPressFeedback('Discurso ponderado e profissional. A imprensa destacou o teu pragmatismo no campeonato.');
    } else {
      setPressFeedback('Declarações duras. A direção tomou nota do alerta e os atletas prometeram mais entrega no próximo treino.');
    }
  };

  const homeArenaImage = homeClub.arena?.imagePath || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200';
  const homeArenaName = homeClub.arena?.name || 'Pavilhão Central';
  const homeArenaCapacity = homeClub.arena?.capacity || homeClub.stadiumCapacity || 2500;

  const courtPlayers = homeSquad.filter((p) => courtPlayerIds.includes(p.id));
  const benchPlayers = homeSquad.filter((p) => !courtPlayerIds.includes(p.id));

  return (
    <div className="w-full space-y-6">
      {/* 1. PAVILHÃO DA EQUIPA DA CASA & PLACARD CENTRAL */}
      <div className="relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-black text-white">
        <div className="h-64 md:h-84 w-full relative">
          <img
            src={homeArenaImage}
            alt={homeArenaName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Badge Pavilhão */}
          <div className="absolute top-4 left-4 border-2 border-black bg-yellow-400 text-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🏟️ Pavilhão: {homeArenaName} ({homeArenaCapacity.toLocaleString()} Lugares)
          </div>

          {/* Bilheteira */}
          <div className="absolute top-4 right-4 hidden md:block border-2 border-white bg-black/80 text-white px-3 py-1 font-mono text-xs font-bold">
            Bilhete: €{(homeClub.arena?.ticketPrice || 12).toFixed(2)} | Condição: 100%
          </div>

          {/* Placard Central Estilo Elifoot */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center px-4">
            <div className="flex items-center justify-between w-full max-w-4xl">
              {/* Casa */}
              <div className="text-center md:text-left">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
                  EQUIPA DA CASA
                </span>
                <h2 className="text-2xl md:text-4xl font-black uppercase drop-shadow-md text-white">
                  {homeClub.name}
                </h2>
                <span className="text-[11px] font-mono text-zinc-300">
                  Tática: {activeHomeTactics.defenseSystem} • {activeHomeTactics.attackPace}
                </span>
              </div>

              {/* Marcador Digital com Relógio 00' - 60' */}
              <div className="border-4 border-white bg-black px-6 py-3 text-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] min-w-[200px]">
                <div className="text-xs font-mono font-black text-yellow-400 uppercase tracking-widest">
                  {currentMinute === 0 && 'A Iniciar...'}
                  {currentMinute > 0 && currentMinute < 30 && `1ª Parte • Min ${currentMinute}'`}
                  {currentMinute === 30 && '⏱️ INTERVALO (30\')'}
                  {currentMinute > 30 && currentMinute < 60 && `2ª Parte • Min ${currentMinute}'`}
                  {currentMinute >= 60 && '⏱️ FIM DO JOGO (60\')'}
                </div>
                <div className="text-5xl md:text-6xl font-black font-mono tracking-widest my-1 text-white">
                  {partialHomeGoals} - {partialAwayGoals}
                </div>
                <div className="text-[10px] font-mono text-zinc-400">
                  Andebol Profissional (60 Min)
                </div>
              </div>

              {/* Fora */}
              <div className="text-center md:text-right">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  VISITANTE
                </span>
                <h2 className="text-2xl md:text-4xl font-black uppercase drop-shadow-md text-white">
                  {awayClub.name}
                </h2>
                <span className="text-[11px] font-mono text-zinc-300">
                  Nível: {awayClub.level || 'Divisão de Honra'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso do Cronómetro (0-60m) */}
        <div className="border-t-2 border-white bg-zinc-900 p-1">
          <div
            className="h-3 bg-yellow-400 transition-all duration-200"
            style={{ width: `${(currentMinute / 60) * 100}%` }}
          />
        </div>

        {/* Controlos de Jogo Brutalistas */}
        <div className="p-4 bg-zinc-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTimeoutFeedback(null);
                setIsPlaying(!isPlaying);
              }}
              disabled={currentMinute >= 60}
              className={`border-2 border-white px-4 py-2 font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${
                isPlaying ? 'bg-amber-400 hover:bg-amber-300' : 'bg-green-500 hover:bg-green-400'
              } disabled:opacity-40`}
            >
              {isPlaying ? '⏸️ Pausar Jogo' : currentMinute === 30 ? '▶️ Iniciar 2ª Parte' : '▶️ Iniciar / Continuar'}
            </button>

            <button
              onClick={handleInstantSimulate}
              disabled={currentMinute >= 60}
              className="border-2 border-white bg-yellow-400 px-4 py-2 font-black uppercase text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-40"
            >
              ⚡ Resolver Jornada
            </button>

            {/* Pedir Time-Out */}
            <button
              onClick={handleOpenTimeout}
              disabled={timeoutsRemaining <= 0 || currentMinute >= 60 || currentMinute === 0}
              className="border-2 border-white bg-blue-600 px-3 py-2 font-mono text-xs font-black uppercase text-white hover:bg-blue-500 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-40"
            >
              ⏱️ Pedir Time-Out ({timeoutsRemaining}/2)
            </button>
          </div>

          {/* Ajuste de Velocidade Estilo Elifoot */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-zinc-400">Velocidade:</span>
            {[
              { label: 'Normal (1x)', ms: 500 },
              { label: 'Elifoot Rápido (3x)', ms: 200 },
              { label: 'Frenético (10x)', ms: 80 },
            ].map((v) => (
              <button
                key={v.label}
                onClick={() => setSpeedMs(v.ms)}
                className={`px-3 py-1 font-bold border-2 ${
                  speedMs === v.ms
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'border-zinc-700 text-zinc-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerta de Feedback de Time-Out ou Substituição */}
      {timeoutFeedback && (
        <div className="border-4 border-black bg-blue-200 p-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white">
          📢 {timeoutFeedback}
        </div>
      )}

      {/* MODAL RÁPIDO DE TIME-OUT INTERATIVO */}
      {isTimeoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono">
          <div className="w-full max-w-xl border-4 border-black bg-yellow-400 p-6 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex justify-between items-center border-b-4 border-black pb-2">
              <h3 className="text-2xl font-black uppercase">
                ⏱️ TIME-OUT TÉCNICO (1 MINUTO)
              </h3>
              <span className="font-black bg-black text-white px-2 py-0.5 text-xs">
                Minuto {currentMinute}'
              </span>
            </div>

            <p className="text-xs font-bold">
              O relógio parou! Como treinador, podes falar diretamente com os atletas ou fazer ajustes táticos imediatos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleExecuteTimeout('scold')}
                className="border-2 border-black bg-red-500 p-3 font-black uppercase text-white hover:bg-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left"
              >
                <div className="text-sm">🗣️ Dar uma "Bronca"!</div>
                <div className="text-[10px] font-normal mt-1 opacity-90">
                  Aumenta o moral imediato e a agressividade defensiva ao limite.
                </div>
              </button>

              <button
                onClick={() => handleExecuteTimeout('motivate')}
                className="border-2 border-black bg-green-600 p-3 font-black uppercase text-white hover:bg-green-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left"
              >
                <div className="text-sm">🤝 Incentivo & Paciência</div>
                <div className="text-[10px] font-normal mt-1 opacity-90">
                  Acalma o ritmo e privilegia ataques organizados com o pivô.
                </div>
              </button>
            </div>

            {/* Mudança de Tática de Urgência */}
            <div className="border-2 border-black bg-white p-3 space-y-2">
              <span className="text-xs font-black uppercase block">
                📐 Mudar Sistema Defensivo de Urgência:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['6-0', '5-1', '3-3', '4-2'] as const).map((sys) => (
                  <button
                    key={sys}
                    onClick={() => handleExecuteTimeout('tactic_change', sys)}
                    className="border-2 border-black bg-zinc-100 py-1.5 px-2 text-xs font-black uppercase hover:bg-yellow-300"
                  >
                    Passar para {sys}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsTimeoutModalOpen(false)}
              className="w-full border-2 border-black bg-black p-2 font-black uppercase text-white hover:bg-zinc-800"
            >
              Retomar o Jogo
            </button>
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO POR SEPARADORES */}
      <div className="flex flex-wrap border-b-4 border-black dark:border-white">
        {[
          { id: 'feed', label: `🎙️ Live Feed (${visibleEvents.length})` },
          { id: 'substitutions', label: '🔄 Substituições em Direto' },
          { id: 'stats', label: '📊 Estatísticas Individuais' },
          { id: 'shotchart', label: '🎯 Mapa de Remates (40x20m)' },
          { id: 'press', label: '📰 Sala de Imprensa' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-5 py-3 font-black uppercase border-t-4 border-l-4 border-r-4 border-black dark:border-white ${
              activeTab === tab.id
                ? 'bg-yellow-400 text-black'
                : 'bg-white text-black hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEPARADOR 1: Feed de Acontecimentos ao Vivo */}
      {activeTab === 'feed' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white max-h-96 overflow-y-auto space-y-3 font-mono">
          {visibleEvents.length === 0 ? (
            <div className="text-center font-bold text-zinc-500 py-10">
              Clica em "Iniciar / Continuar" para que o árbitro apite o arranque da partida no pavilhão!
            </div>
          ) : (
            [...visibleEvents].reverse().map((event, idx) => (
              <div
                key={idx}
                className={`border-2 border-black p-3 ${
                  event.type === 'golo_7m'
                    ? 'bg-yellow-200 text-black font-black border-yellow-600'
                    : event.type === 'golo'
                    ? 'bg-green-100 text-black dark:bg-green-950 dark:text-white font-bold'
                    : event.type === 'exclusao_2min'
                    ? 'bg-red-100 text-black dark:bg-red-950 dark:text-white font-bold'
                    : event.type === 'timeout'
                    ? 'bg-blue-100 text-black dark:bg-blue-950 dark:text-white font-black'
                    : 'bg-zinc-50 dark:bg-zinc-800'
                } dark:border-white`}
              >
                <div className="flex items-center gap-3">
                  <span className="bg-black text-white px-2 py-0.5 text-xs font-black dark:bg-white dark:text-black">
                    {event.minute}'
                  </span>
                  <span className="text-sm">{event.description}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SEPARADOR 2: Substituições em Direto (Gestão de Fadiga) */}
      {activeTab === 'substitutions' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-6">
          <div>
            <h3 className="text-xl font-black uppercase">
              🔄 Gestão de Substituições em Direto ({homeClub.name})
            </h3>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1">
              Atletas com energia abaixo de 50% perdem eficácia de remate e têm maior risco de lesão. Clica num titular fadigado e num suplente do banco para efetuar a troca imediata durante os 60 minutos!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titulares em Campo */}
            <div className="border-2 border-black p-4 bg-green-50 dark:bg-zinc-800 dark:border-white">
              <h4 className="font-black text-sm uppercase mb-3 text-green-900 dark:text-green-300">
                🟢 Atletas em Campo (7 Titulares)
              </h4>
              <div className="space-y-2">
                {courtPlayers.map((p) => {
                  const energy = Math.round(matchEnergy[p.id] || 100);
                  const isTired = energy < 50;
                  return (
                    <div
                      key={p.id}
                      className={`border-2 border-black p-2.5 flex items-center justify-between font-mono text-xs ${
                        isTired ? 'bg-red-100 border-red-600' : 'bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-black mr-2">
                          {p.position}
                        </span>
                        <span className="font-bold">{p.name}</span>
                        <span className="text-zinc-500 ml-1">(OVR {p.overallRating})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-black ${
                            isTired ? 'text-red-600 animate-pulse' : 'text-green-600'
                          }`}
                        >
                          ⚡ {energy}% {isTired && '(Cansado!)'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suplentes no Banco */}
            <div className="border-2 border-black p-4 bg-yellow-50 dark:bg-zinc-800 dark:border-white">
              <h4 className="font-black text-sm uppercase mb-3 text-yellow-900 dark:text-yellow-300">
                🟡 Banco de Suplentes ({benchPlayers.length} Disponíveis)
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {benchPlayers.map((benchP) => {
                  const benchEnergy = Math.round(matchEnergy[benchP.id] || 100);
                  return (
                    <div
                      key={benchP.id}
                      className="border-2 border-black p-2.5 bg-white dark:bg-zinc-900 flex items-center justify-between font-mono text-xs"
                    >
                      <div>
                        <span className="bg-zinc-700 text-white px-1.5 py-0.5 text-[10px] font-black mr-2">
                          {benchP.position}
                        </span>
                        <span className="font-bold">{benchP.name}</span>
                        <span className="text-zinc-500 ml-1">(OVR {benchP.overallRating})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">⚡ {benchEnergy}%</span>
                        <button
                          onClick={() => {
                            // Encontrar o jogador de campo com menor energia
                            const tiredCandidate = [...courtPlayers].sort(
                              (a, b) => (matchEnergy[a.id] || 100) - (matchEnergy[b.id] || 100)
                            )[0];
                            if (tiredCandidate) {
                              handleLiveSubstitution(tiredCandidate.id, benchP.id);
                            }
                          }}
                          className="border border-black bg-yellow-400 px-2 py-1 font-black uppercase text-[10px] hover:bg-yellow-300"
                        >
                          Lançar em Campo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 3: Estatísticas Individuais */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
            <h3 className="font-black uppercase text-lg border-b-2 border-black pb-2 mb-3 dark:border-white">
              {homeClub.name}
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {matchResult.playerStats.home.map((st) => (
                <div key={st.playerId} className="flex justify-between border-b border-zinc-200 py-1.5 dark:border-zinc-800">
                  <span className="font-bold">{st.playerName}</span>
                  <span>
                    ⚽ {st.goals}/{st.shots} | 🧤 {st.saves} | 🛑 {st.exclusions} (2m)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
            <h3 className="font-black uppercase text-lg border-b-2 border-black pb-2 mb-3 dark:border-white">
              {awayClub.name}
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {matchResult.playerStats.away.map((st) => (
                <div key={st.playerId} className="flex justify-between border-b border-zinc-200 py-1.5 dark:border-zinc-800">
                  <span className="font-bold">{st.playerName}</span>
                  <span>
                    ⚽ {st.goals}/{st.shots} | 🧤 {st.saves} | 🛑 {st.exclusions} (2m)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 4: Mapa de Remates (Shot Chart 40x20m) */}
      {activeTab === 'shotchart' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
          <h3 className="text-xl font-black uppercase mb-4">
            🎯 Mapa Tático de Eficácia de Remate (Zona Ofensiva 40x20m)
          </h3>

          <div className="relative w-full max-w-2xl mx-auto h-72 border-4 border-black bg-amber-100 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between overflow-hidden">
            <div className="w-32 h-6 border-4 border-red-600 bg-white mx-auto text-[9px] font-black font-mono flex items-center justify-center text-red-600 uppercase">
              BALIZA 3x2m
            </div>

            <div className="relative flex-1 flex flex-col items-center justify-center">
              <div className="w-48 h-20 border-b-4 border-dashed border-blue-600 flex items-end justify-center pb-1 text-[10px] font-bold font-mono text-blue-700">
                Linha 6 Metros (Pivô)
              </div>
              <div className="w-8 h-2 bg-red-600 my-2" title="Ponto de 7 Metros" />
              <div className="w-72 h-16 border-b-4 border-zinc-700 flex items-end justify-center pb-1 text-[10px] font-bold font-mono text-zinc-800">
                Linha 9 Metros (Remate Exterior)
              </div>
            </div>

            <div className="flex justify-between text-xs font-mono font-bold text-zinc-700 border-t border-zinc-400 pt-2">
              <span>Ponta Esquerda</span>
              <span>Central / Meia Distância</span>
              <span>Ponta Direita</span>
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 5: Sala de Imprensa Pós-Jogo */}
      {activeTab === 'press' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-4">
          <h3 className="text-xl font-black uppercase">
            📰 Conferência de Imprensa Pós-Jogo
          </h3>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
            Os jornalistas desportivos aguardam o teu resumo sobre a partida terminada no pavilhão:
          </p>

          {!pressConferenceDone ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <button
                onClick={() => handlePressAnswer('praise')}
                className="border-2 border-black bg-yellow-400 p-4 font-black uppercase text-black hover:bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left"
              >
                "Orgulho total na entrega dos atletas!"
                <span className="block text-xs font-normal mt-1 opacity-80">
                  Reforça a moral do balneário e a confiança da presidência.
                </span>
              </button>

              <button
                onClick={() => handlePressAnswer('calm')}
                className="border-2 border-black bg-zinc-100 p-4 font-black uppercase text-black hover:bg-zinc-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left dark:bg-zinc-800 dark:text-white"
              >
                "Pensar já na próxima jornada do campeonato."
                <span className="block text-xs font-normal mt-1 opacity-80">
                  Discurso pragmático e foco na evolução da equipa.
                </span>
              </button>

              <button
                onClick={() => handlePressAnswer('critique')}
                className="border-2 border-black bg-red-100 p-4 font-black uppercase text-black hover:bg-red-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left dark:bg-zinc-800 dark:text-white"
              >
                "Cometemos erros infantis que não se podem repetir."
                <span className="block text-xs font-normal mt-1 opacity-80">
                  Exige disciplina máxima nos treinos da próxima semana.
                </span>
              </button>
            </div>
          ) : (
            <div className="border-2 border-black bg-green-100 p-4 font-bold text-black dark:bg-zinc-800 dark:text-white">
              ✅ {pressFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
