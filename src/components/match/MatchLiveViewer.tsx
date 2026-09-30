/**
 * 7meters - Modern Handball Match Live Viewer (Broadcast Studio Style)
 * Centro de operações ao vivo com transmissão gráfica, placard digital,
 * live feed de jogadas, 2 time-outs interativos e substituições em direto.
 */

import React, { useState, useEffect } from 'react';
import { Club } from '../../types/club.types';
import { Player } from '../../types/player.types';
import { MatchResult, MatchEvent } from '../../types/match.types';
import { simulateHandballMatch, TacticalSettings } from '../../engine/matchEngine';
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
  const [activeHomeTactics, setActiveHomeTactics] = useState<TacticalSettings>(
    homeTactics || {
      defenseSystem: '6:0',
      attackPace: 'normal',
      aggressiveness: 'intensa',
    }
  );

  const [currentMinute, setCurrentMinute] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(200); // 200ms = rápido Elifoot
  const [activeTab, setActiveTab] = useState<'feed' | 'substitutions' | 'stats' | 'press'>('feed');

  // Gestão de Time-Outs
  const [timeoutsRemaining, setTimeoutsRemaining] = useState<number>(2);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState<boolean>(false);
  const [timeoutFeedback, setTimeoutFeedback] = useState<string | null>(null);

  // Jogadores em campo (7 titulares)
  const [courtPlayerIds, setCourtPlayerIds] = useState<string[]>(() =>
    homeSquad.slice(0, 7).map((p) => p.id)
  );

  // Energia dos jogadores durante a partida
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

  // Cronómetro
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentMinute < 60) {
      timer = setTimeout(() => {
        setCurrentMinute((prev) => {
          const next = prev + 1;

          // Desgaste físico
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

          if (next === 30) {
            setIsPlaying(false);
          }

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
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center text-zinc-400">
        A inicializar o pavilhão e o motor da partida...
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

  const handleOpenTimeout = () => {
    if (timeoutsRemaining <= 0 || currentMinute >= 60 || currentMinute === 0) return;
    setIsPlaying(false);
    setIsTimeoutModalOpen(true);
  };

  const handleExecuteTimeout = (action: 'scold' | 'motivate' | 'tactic_change', newSystem?: TacticalSettings['defenseSystem']) => {
    setTimeoutsRemaining((prev) => Math.max(0, prev - 1));
    setIsTimeoutModalOpen(false);

    if (action === 'scold') {
      setTimeoutFeedback('🗣️ "BRONCA NO BALNEÁRIO!" Exigiste agressividade defensiva máxima ao grupo (+Agressividade ao Limite).');
      setActiveHomeTactics((t) => ({ ...t, aggressiveness: 'limite' }));
    } else if (action === 'motivate') {
      setTimeoutFeedback('🤝 "INCENTIVO TÁTICO!" Pediste calma na circulação e foco em ataques organizados com o pivô.');
      setActiveHomeTactics((t) => ({ ...t, attackPace: 'Ataque Organizado Paciente' }));
    } else if (action === 'tactic_change' && newSystem) {
      setTimeoutFeedback(`📐 "MUDANÇA DE URGÊNCIA!" Mudaste a defesa para ${newSystem}.`);
      setActiveHomeTactics((t) => ({ ...t, defenseSystem: newSystem }));
    }
  };

  const handleLiveSubstitution = (outCourtPlayerId: string, inBenchPlayerId: string) => {
    setCourtPlayerIds((prev) =>
      prev.map((id) => (id === outCourtPlayerId ? inBenchPlayerId : id))
    );
    const outPlayer = homeSquad.find((p) => p.id === outCourtPlayerId);
    const inPlayer = homeSquad.find((p) => p.id === inBenchPlayerId);
    setTimeoutFeedback(
      `🔄 SUBSTITUIÇÃO (Minuto ${currentMinute}'): Saiu ${outPlayer?.name || 'atleta'} (fadigado) e entrou ${inPlayer?.name || 'suplente'} fresco para a quadra!`
    );
  };

  const handlePressAnswer = (type: 'praise' | 'calm' | 'critique') => {
    setPressConferenceDone(true);
    if (type === 'praise') {
      setPressFeedback('Discurso entusiasta! Os adeptos e a direção aplaudiram a tua atitude positiva.');
    } else if (type === 'calm') {
      setPressFeedback('Declarações serenas. A imprensa desportiva elogiou o teu pragmatismo profissional.');
    } else {
      setPressFeedback('Críticas duras. Os atletas sentiram o alerta e prometeram resposta nos treinos.');
    }
  };

  const homeArenaImage =
    homeClub.arena?.imagePath && !homeClub.arena.imagePath.includes('unsplash')
      ? homeClub.arena.imagePath
      : '/src/assets/images/arena_elite_grand_1790774574409.jpg';
  const homeArenaName = homeClub.arena?.name || 'Arena Olímpica de Andebol';

  const courtPlayers = homeSquad.filter((p) => courtPlayerIds.includes(p.id));
  const benchPlayers = homeSquad.filter((p) => !courtPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* 1. BROADCAST ARENA & PLACARD SUSPENSO */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          <img
            src={homeArenaImage}
            alt={homeArenaName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.7] contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />

          {/* Badge Pavilhão Topo */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 px-3.5 py-1 text-xs font-semibold text-zinc-200">
              🏟️ {homeArenaName}
            </span>
          </div>

          {/* PLACARD CENTRAL DE ANDEBOL */}
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center px-4">
            <div className="flex items-center justify-between w-full max-w-3xl">
              {/* Equipa da Casa */}
              <div className="text-center md:text-left flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  Casa
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                  {homeClub.name}
                </h2>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  Tática: {activeHomeTactics.defenseSystem}
                </div>
              </div>

              {/* Cubo do Marcador Digital */}
              <div className="mx-4 flex flex-col items-center rounded-2xl border border-zinc-700/80 bg-zinc-900/90 px-6 py-3.5 shadow-2xl backdrop-blur-xl">
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-zinc-700">
                  {currentMinute === 0 && 'A Iniciar...'}
                  {currentMinute > 0 && currentMinute < 30 && `1ª Parte · ${currentMinute}'`}
                  {currentMinute === 30 && '⏱️ Intervalo'}
                  {currentMinute > 30 && currentMinute < 60 && `2ª Parte · ${currentMinute}'`}
                  {currentMinute >= 60 && '🏁 Apito Final'}
                </span>

                <div className="my-1 flex items-center gap-3 font-mono text-5xl md:text-6xl font-black text-white tracking-tight tabular-nums">
                  <span>{partialHomeGoals}</span>
                  <span className="text-zinc-600 text-3xl font-light">-</span>
                  <span>{partialAwayGoals}</span>
                </div>

                <span className="text-[10px] font-mono text-zinc-400">
                  Andebol Oficial (60 Min)
                </span>
              </div>

              {/* Visitante */}
              <div className="text-center md:text-right flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  Fora
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                  {awayClub.name}
                </h2>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  Nível: Divisão de Honra
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de Progresso do Cronómetro */}
        <div className="h-1.5 w-full bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
            style={{ width: `${(currentMinute / 60) * 100}%` }}
          />
        </div>

        {/* Painel de Controlo do Jogo */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setTimeoutFeedback(null);
                setIsPlaying(!isPlaying);
              }}
              disabled={currentMinute >= 60}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md active:scale-[0.98] ${
                isPlaying
                  ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              } disabled:opacity-40`}
            >
              {isPlaying ? '⏸️ Pausar' : currentMinute === 30 ? '▶️ 2ª Parte' : '▶️ Iniciar / Continuar'}
            </button>

            <button
              onClick={handleInstantSimulate}
              disabled={currentMinute >= 60}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-40"
            >
              ⚡ Resolver Rápido
            </button>

            <button
              onClick={handleOpenTimeout}
              disabled={timeoutsRemaining <= 0 || currentMinute >= 60 || currentMinute === 0}
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all disabled:opacity-40"
            >
              ⏱️ Time-Out ({timeoutsRemaining}/2)
            </button>
          </div>

          {/* Velocidades */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 text-[11px] mr-1">Velocidade:</span>
            {[
              { label: 'Normal (1x)', ms: 500 },
              { label: 'Elifoot (3x)', ms: 200 },
              { label: 'Frenético (10x)', ms: 80 },
            ].map((v) => (
              <button
                key={v.label}
                onClick={() => setSpeedMs(v.ms)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  speedMs === v.ms
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {timeoutFeedback && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4 text-xs font-semibold text-blue-200 backdrop-blur">
          📢 {timeoutFeedback}
        </div>
      )}

      {/* MODAL DE TIME-OUT */}
      {isTimeoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                ⏱️ Desconto de Tempo Técnico (Minuto {currentMinute}')
              </h3>
              <button
                onClick={() => setIsTimeoutModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              O relógio parou. Como treinador, instrui os teus atletas no banco:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleExecuteTimeout('scold')}
                className="rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-left hover:bg-red-900/40 transition-colors"
              >
                <div className="font-bold text-xs text-red-400">🗣️ Dar uma "Bronca"!</div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Exige entrega física imediata e agressividade máxima na defesa.
                </div>
              </button>

              <button
                onClick={() => handleExecuteTimeout('motivate')}
                className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-left hover:bg-emerald-900/40 transition-colors"
              >
                <div className="font-bold text-xs text-emerald-400">🤝 Incentivo & Calma</div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Pede circulação paciente e ataques organizados focados no pivô.
                </div>
              </button>
            </div>

            {/* Mudança de Tática de Urgência */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Mudar Defesa de Urgência:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['6:0', '5:1', '3:3', '4:2'] as const).map((sys) => (
                  <button
                    key={sys}
                    onClick={() => handleExecuteTimeout('tactic_change', sys)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsTimeoutModalOpen(false)}
              className="w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              Retomar o Jogo
            </button>
          </div>
        </div>
      )}

      {/* SEPARADORES DO JOGO */}
      <div className="flex space-x-1 border-b border-zinc-800 pb-2">
        {[
          { id: 'feed', label: `🎙️ Relato ao Vivo (${visibleEvents.length})` },
          { id: 'substitutions', label: '🔄 Substituições em Direto' },
          { id: 'stats', label: '📊 Estatísticas' },
          { id: 'press', label: '📰 Sala de Imprensa' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SEPARADOR 1: Feed ao Vivo */}
      {activeTab === 'feed' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur max-h-96 overflow-y-auto space-y-2.5">
          {visibleEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Clica em "Iniciar / Continuar" para arrancar a partida no pavilhão!
            </div>
          ) : (
            [...visibleEvents].reverse().map((event, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3 text-xs font-medium transition-colors ${
                  event.type === 'golo_7m'
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                    : event.type === 'golo'
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                    : event.type === 'exclusao_2min'
                    ? 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                    : event.type === 'timeout'
                    ? 'border-blue-500/30 bg-blue-950/20 text-blue-200'
                    : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300">
                    {event.minute}'
                  </span>
                  <span>{event.description}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SEPARADOR 2: Substituições em Direto */}
      {activeTab === 'substitutions' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">
              🔄 Gestão de Fadiga & Substituições
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atletas com energia abaixo de 50% perdem eficácia de remate. Lança suplentes frescos do banco com 1 clique!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titulares em Campo */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                🟢 Em Campo (7 Titulares)
              </h4>
              <div className="space-y-2">
                {courtPlayers.map((p) => {
                  const energy = Math.round(matchEnergy[p.id] || 100);
                  const isTired = energy < 50;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-mono ${
                        isTired ? 'border-rose-500/40 bg-rose-950/20' : 'border-zinc-800 bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-bold text-zinc-300">
                          {p.position}
                        </span>
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-zinc-500 text-[10px]">(OVR {p.overallRating})</span>
                      </div>
                      <span className={`font-bold tabular-nums ${isTired ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        ⚡ {energy}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suplentes no Banco */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                🟡 Banco de Suplentes ({benchPlayers.length})
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {benchPlayers.map((benchP) => {
                  const benchEnergy = Math.round(matchEnergy[benchP.id] || 100);
                  return (
                    <div
                      key={benchP.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-bold text-zinc-300">
                          {benchP.position}
                        </span>
                        <span className="font-semibold text-white">{benchP.name}</span>
                        <span className="text-zinc-500 text-[10px]">(OVR {benchP.overallRating})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold tabular-nums">⚡ {benchEnergy}%</span>
                        <button
                          onClick={() => {
                            const tiredCandidate = [...courtPlayers].sort(
                              (a, b) => (matchEnergy[a.id] || 100) - (matchEnergy[b.id] || 100)
                            )[0];
                            if (tiredCandidate) {
                              handleLiveSubstitution(tiredCandidate.id, benchP.id);
                            }
                          }}
                          className="rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
                        >
                          Lançar
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
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur">
            <h3 className="font-bold text-sm text-white border-b border-zinc-800 pb-2 mb-3">
              {homeClub.name}
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {matchResult.playerStats.home.map((st) => (
                <div key={st.playerId} className="flex justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-300">{st.playerName}</span>
                  <span className="text-zinc-400 tabular-nums">
                    ⚽ {st.goals}/{st.shots} · 🧤 {st.saves} · 🛑 {st.exclusions}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur">
            <h3 className="font-bold text-sm text-white border-b border-zinc-800 pb-2 mb-3">
              {awayClub.name}
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {matchResult.playerStats.away.map((st) => (
                <div key={st.playerId} className="flex justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-300">{st.playerName}</span>
                  <span className="text-zinc-400 tabular-nums">
                    ⚽ {st.goals}/{st.shots} · 🧤 {st.saves} · 🛑 {st.exclusions}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 4: Sala de Imprensa */}
      {activeTab === 'press' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-4">
          <h3 className="text-base font-bold text-white">
            📰 Conferência de Imprensa Pós-Jogo
          </h3>
          <p className="text-xs text-zinc-400">
            Os jornalistas desportivos aguardam o teu balanço sobre a partida:
          </p>

          {!pressConferenceDone ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handlePressAnswer('praise')}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-left hover:border-amber-500/40 transition-colors"
              >
                <div className="text-xs font-bold text-amber-400">"Orgulho total na entrega dos atletas!"</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Aumenta o moral do balneário e o apoio dos adeptos.
                </div>
              </button>

              <button
                onClick={() => handlePressAnswer('calm')}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-left hover:border-zinc-700 transition-colors"
              >
                <div className="text-xs font-bold text-white">"Pensar já no próximo embate."</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Discurso pragmático com foco no campeonato.
                </div>
              </button>

              <button
                onClick={() => handlePressAnswer('critique')}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 text-left hover:border-rose-500/40 transition-colors"
              >
                <div className="text-xs font-bold text-rose-400">"Cometemos erros que não tolero."</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Exige disciplina e rigor tático nos treinos.
                </div>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
              ✅ {pressFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
