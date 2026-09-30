/**
 * 7meters - Modern Handball Tactics & Lineup Board
 * Prancheta tática geométrica ultra-moderna com alinhamento interativo do 7 Inicial,
 * campo Taraflex de andebol 40x20m com linhas oficiais, troca direta de atletas,
 * sistemas defensivos e dinâmicas ofensivas.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import {
  DefensiveSystem,
  DEFENSIVE_SYSTEMS_INFO,
  OffensiveFocus,
  OffensivePace,
} from '../../types/tactics.types';
import { Player } from '../../types/player.types';
import { TacticalSettings } from '../../engine/matchEngine';

interface TacticsViewProps {
  onSaveTactics?: (tactics: TacticalSettings, startingSevenIds: string[]) => void;
}

type SlotKey = 'gk' | 'pe' | 'le' | 'c' | 'p' | 'ld' | 'pd';

interface SlotDefinition {
  key: SlotKey;
  label: string;
  shortLabel: string;
  name: string;
  allowedMatches: string[];
  color: string;
}

const COURT_SLOTS: SlotDefinition[] = [
  { key: 'gk', label: 'Guarda-Redes', shortLabel: 'GR', name: 'Baliza', allowedMatches: ['Guarda-Redes', 'GR'], color: 'from-amber-500 to-amber-600' },
  { key: 'pe', label: 'Ponta Esquerdo', shortLabel: 'PE', name: 'Asa Esquerda', allowedMatches: ['Ponta Esquerdo', 'PE'], color: 'from-emerald-500 to-emerald-600' },
  { key: 'le', label: 'Lateral Esquerdo', shortLabel: 'LE', name: 'Meia-Distância 9m', allowedMatches: ['Lateral Esquerdo', 'LE'], color: 'from-rose-500 to-rose-600' },
  { key: 'c', label: 'Central', shortLabel: 'C', name: 'Distribuidor Eixo', allowedMatches: ['Central', 'C'], color: 'from-amber-400 to-amber-500' },
  { key: 'p', label: 'Pivô', shortLabel: 'PV', name: 'Linha dos 6m', allowedMatches: ['Pivô', 'PV', 'P'], color: 'from-purple-500 to-purple-600' },
  { key: 'ld', label: 'Lateral Direito', shortLabel: 'LD', name: 'Meia-Distância 9m', allowedMatches: ['Lateral Direito', 'LD'], color: 'from-rose-500 to-rose-600' },
  { key: 'pd', label: 'Ponta Direito', shortLabel: 'PD', name: 'Asa Direita', allowedMatches: ['Ponta Direito', 'PD'], color: 'from-emerald-500 to-emerald-600' },
];

export const TacticsView: React.FC<TacticsViewProps> = ({ onSaveTactics }) => {
  const { userSquad } = useGameStore();

  const [defenseSystem, setDefenseSystem] = useState<DefensiveSystem>('6:0');
  const [offensivePace, setOffensivePace] = useState<OffensivePace>('Normal');
  const [offensiveFocus, setOffensiveFocus] = useState<OffensiveFocus>('Equilibrado');
  const [aggressiveness, setAggressiveness] = useState<'moderada' | 'intensa' | 'limite'>('intensa');

  // Slots do 7 Inicial
  const [lineup, setLineup] = useState<{
    gk: string | null;
    pe: string | null;
    le: string | null;
    c: string | null;
    p: string | null;
    ld: string | null;
    pd: string | null;
  }>(() => {
    const findPos = (posMatches: string[]) =>
      userSquad.find((p) => posMatches.some((m) => p.position.includes(m) || p.position === m))?.id || null;

    return {
      gk: findPos(['Guarda-Redes', 'GR']),
      pe: findPos(['Ponta Esquerdo', 'PE']),
      le: findPos(['Lateral Esquerdo', 'LE']),
      c: findPos(['Central', 'C']),
      p: findPos(['Pivô', 'PV', 'P']),
      ld: findPos(['Lateral Direito', 'LD']),
      pd: findPos(['Ponta Direito', 'PD']),
    };
  });

  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<SlotKey | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const startingIds = Object.values(lineup).filter(Boolean) as string[];

  const getPlayerById = (id: string | null): Player | undefined => {
    if (!id) return undefined;
    return userSquad.find((p) => p.id === id);
  };

  const handleAutoLineup = () => {
    const byOvr = [...userSquad].sort((a, b) => (b.overallRating || 60) - (a.overallRating || 60));
    const findBest = (patterns: string[], usedIds: string[]) =>
      byOvr.find((p) => !usedIds.includes(p.id) && patterns.some((pat) => p.position.includes(pat) || p.position === pat));

    const used: string[] = [];
    const bestGk = findBest(['Guarda-Redes', 'GR'], used);
    if (bestGk) used.push(bestGk.id);

    const bestPe = findBest(['Ponta Esquerdo', 'PE'], used);
    if (bestPe) used.push(bestPe.id);

    const bestLe = findBest(['Lateral Esquerdo', 'LE'], used);
    if (bestLe) used.push(bestLe.id);

    const bestC = findBest(['Central', 'C'], used);
    if (bestC) used.push(bestC.id);

    const bestP = findBest(['Pivô', 'PV', 'P'], used);
    if (bestP) used.push(bestP.id);

    const bestLd = findBest(['Lateral Direito', 'LD'], used);
    if (bestLd) used.push(bestLd.id);

    const bestPd = findBest(['Ponta Direito', 'PD'], used);
    if (bestPd) used.push(bestPd.id);

    setLineup({
      gk: bestGk?.id || null,
      pe: bestPe?.id || null,
      le: bestLe?.id || null,
      c: bestC?.id || null,
      p: bestP?.id || null,
      ld: bestLd?.id || null,
      pd: bestPd?.id || null,
    });

    setStatusMessage('⚡ Sete Inicial escalado automaticamente com os atletas de maior OVR por posição!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAssignPlayerToSlot = (slotKey: SlotKey, playerId: string) => {
    // Se o jogador já estava noutro slot, remove-o de lá
    const updatedLineup = { ...lineup };
    Object.keys(updatedLineup).forEach((key) => {
      if (updatedLineup[key as SlotKey] === playerId) {
        updatedLineup[key as SlotKey] = null;
      }
    });
    updatedLineup[slotKey] = playerId;

    setLineup(updatedLineup);
    setSelectedSlotForSwap(null);
    const assignedPlayer = userSquad.find((p) => p.id === playerId);
    if (assignedPlayer) {
      setStatusMessage(`✅ ${assignedPlayer.name} escalado para ${slotKey.toUpperCase()}!`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSave = () => {
    if (startingIds.length < 7) {
      setStatusMessage('⚠️ Atenção: Tens de preencher as 7 posições obrigatórias do campo!');
      return;
    }

    const tacticalSettings: TacticalSettings = {
      defenseSystem: defenseSystem as TacticalSettings['defenseSystem'],
      attackPace: offensivePace as TacticalSettings['attackPace'],
      aggressiveness,
      offensiveFocus,
    };

    if (onSaveTactics) {
      onSaveTactics(tacticalSettings, startingIds);
    }
    setStatusMessage('✅ Prancheta tática e 7 Inicial guardados com sucesso!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Jogadores do banco (não titulares)
  const benchPlayers = userSquad.filter((p) => !startingIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Comando */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              📋 Prancheta Tática & Sete Titular
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Clica em qualquer posição no campo para substituir o atleta. Define o sistema de marcação defensiva e o ritmo de ataque.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoLineup}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
            >
              ⚡ Auto-Escalar Melhor 7
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
            >
              💾 Guardar Sete
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300 backdrop-blur">
          {statusMessage}
        </div>
      )}

      {/* CAMPO DE ANDEBOL PROFISSIONAL TARAFLEX (40x20m Half-Court Visual) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-300">
              Piso Oficial Taraflex · 40x20m
            </span>
          </div>
          <span className="rounded-full bg-blue-500/10 px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-xs font-bold text-blue-300 border border-blue-500/20">
            {startingIds.length}/7 Definidos
          </span>
        </div>

        {/* Quadro Gráfico do Campo */}
        <div className="relative max-w-4xl mx-auto min-h-[440px] sm:h-[480px] rounded-2xl border-2 border-white/20 bg-gradient-to-b from-[#0e2a47] via-[#133863] to-[#0a1e33] p-2 sm:p-4 flex flex-col justify-between shadow-2xl overflow-hidden">
          
          {/* Marcações Oficiais do Campo em SVG com Linha de 6m, 7m e 9m */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
            {/* Baliza de Andebol 3x2m com riscas vermelho/branco */}
            <rect x="calc(50% - 60px)" y="0" width="120" height="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2" strokeDasharray="15,15" />
            
            {/* Linha Contínua da Área de Baliza (6 Metros) */}
            <path d="M calc(50% - 150px) 0 C calc(50% - 140px) 130, calc(50% + 140px) 130, calc(50% + 150px) 0" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            
            {/* Linha de 4 Metros (Guarda-Redes) */}
            <line x1="calc(50% - 15px)" y1="55" x2="calc(50% + 15px)" y2="55" stroke="#ffffff" strokeWidth="2" />
            
            {/* Ponto / Traço de 7 Metros */}
            <line x1="calc(50% - 20px)" y1="155" x2="calc(50% + 20px)" y2="155" stroke="#ef4444" strokeWidth="3" />
            
            {/* Linha Tracejada de Livre / 9 Metros */}
            <path d="M calc(50% - 210px) 0 C calc(50% - 200px) 210, calc(50% + 200px) 210, calc(50% + 210px) 0" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="8,8" />
            
            {/* Linha Central do Meio-Campo */}
            <line x1="0" y1="465" x2="100%" y2="465" stroke="#ffffff" strokeWidth="3" />
          </svg>

          {/* 1. Nível Baliza: Guarda-Redes (GR) */}
          <div className="relative z-10 flex flex-col items-center mt-1 sm:mt-2">
            <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-widest text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40 mb-1">
              Baliza 3x2m
            </div>

            {/* Token GR */}
            {(() => {
              const p = getPlayerById(lineup.gk);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('gk')}
                  className="group relative rounded-xl sm:rounded-2xl border border-amber-400/80 bg-zinc-950/90 p-1.5 sm:p-2.5 text-center shadow-xl min-w-[120px] sm:min-w-[150px] backdrop-blur transition-transform hover:scale-105 hover:ring-2 hover:ring-amber-400"
                >
                  <span className="rounded bg-amber-500 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[8px] sm:text-[9px] font-bold text-zinc-950 uppercase">
                    GR · Guarda-Redes
                  </span>
                  <div className="text-[11px] sm:text-xs font-bold text-white truncate mt-0.5 sm:mt-1 max-w-[140px]">
                    {p?.name || 'Clica p/ Escalar'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                    OVR {p?.overallRating || '--'} · ⚡ {p?.energyLevel || '--'}%
                  </div>
                </button>
              );
            })()}
          </div>

          {/* 2. Nível 6 Metros: Pivô (P) */}
          <div className="relative z-10 flex flex-col items-center my-0.5 sm:my-1">
            {(() => {
              const p = getPlayerById(lineup.p);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('p')}
                  className="group relative rounded-xl sm:rounded-2xl border border-purple-500/80 bg-zinc-950/90 p-1.5 sm:p-2 text-center shadow-xl min-w-[110px] sm:min-w-[140px] backdrop-blur transition-transform hover:scale-105 hover:ring-2 hover:ring-purple-400"
                >
                  <span className="rounded bg-purple-500 px-1.5 py-0.2 sm:px-2 sm:py-0.5 text-[8px] sm:text-[9px] font-bold text-white uppercase">
                    P · Pivô
                  </span>
                  <div className="text-[11px] sm:text-xs font-bold text-white truncate mt-0.5 max-w-[130px]">
                    {p?.name || 'Clica p/ Escalar'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                    OVR {p?.overallRating || '--'} · ⚡ {p?.energyLevel || '--'}%
                  </div>
                </button>
              );
            })()}
          </div>

          {/* 3. Nível 9 Metros e Corredores: Pontas, Laterais e Central */}
          <div className="relative z-10 grid grid-cols-5 gap-1 sm:gap-2 items-center text-center pt-1 sm:pt-2 mb-2 sm:mb-3">
            {/* Ponta Esquerdo (PE) */}
            {(() => {
              const p = getPlayerById(lineup.pe);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('pe')}
                  className="group rounded-xl sm:rounded-2xl border border-emerald-500/60 bg-zinc-950/90 p-1 sm:p-2.5 backdrop-blur shadow-lg transition-transform hover:scale-105 hover:ring-2 hover:ring-emerald-400 text-left min-w-0"
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold uppercase">
                      PE
                    </span>
                    <span className="font-mono text-[7px] sm:text-[9px] text-zinc-400 hidden xs:inline">
                      {p?.overallRating ? `OVR ${p.overallRating}` : '--'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate">{p?.name ? p.name.split(' ')[0] : 'Vago'}</div>
                </button>
              );
            })()}

            {/* Lateral Esquerdo (LE) */}
            {(() => {
              const p = getPlayerById(lineup.le);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('le')}
                  className="group rounded-xl sm:rounded-2xl border border-rose-500/60 bg-zinc-950/90 p-1 sm:p-2.5 backdrop-blur shadow-lg transition-transform hover:scale-105 hover:ring-2 hover:ring-rose-400 text-left min-w-0"
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold uppercase">
                      LE
                    </span>
                    <span className="font-mono text-[7px] sm:text-[9px] text-zinc-400 hidden xs:inline">
                      {p?.overallRating ? `OVR ${p.overallRating}` : '--'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate">{p?.name ? p.name.split(' ')[0] : 'Vago'}</div>
                </button>
              );
            })()}

            {/* Central (C) */}
            {(() => {
              const p = getPlayerById(lineup.c);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('c')}
                  className="group rounded-xl sm:rounded-2xl border border-amber-500 bg-zinc-950/95 p-1 sm:p-3 backdrop-blur shadow-xl ring-1 ring-amber-500/40 transition-transform hover:scale-105 hover:ring-2 hover:ring-amber-300 text-left min-w-0"
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className="rounded bg-amber-500 text-zinc-950 px-1 py-0.2 text-[7px] sm:text-[8px] font-black uppercase">
                      C
                    </span>
                    <span className="font-mono text-[7px] sm:text-[9px] text-amber-300 font-bold hidden xs:inline">
                      {p?.overallRating ? `OVR ${p.overallRating}` : '--'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate">{p?.name ? p.name.split(' ')[0] : 'Vago'}</div>
                </button>
              );
            })()}

            {/* Lateral Direito (LD) */}
            {(() => {
              const p = getPlayerById(lineup.ld);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('ld')}
                  className="group rounded-xl sm:rounded-2xl border border-rose-500/60 bg-zinc-950/90 p-1 sm:p-2.5 backdrop-blur shadow-lg transition-transform hover:scale-105 hover:ring-2 hover:ring-rose-400 text-left min-w-0"
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold uppercase">
                      LD
                    </span>
                    <span className="font-mono text-[7px] sm:text-[9px] text-zinc-400 hidden xs:inline">
                      {p?.overallRating ? `OVR ${p.overallRating}` : '--'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate">{p?.name ? p.name.split(' ')[0] : 'Vago'}</div>
                </button>
              );
            })()}

            {/* Ponta Direito (PD) */}
            {(() => {
              const p = getPlayerById(lineup.pd);
              return (
                <button
                  onClick={() => setSelectedSlotForSwap('pd')}
                  className="group rounded-xl sm:rounded-2xl border border-emerald-500/60 bg-zinc-950/90 p-1 sm:p-2.5 backdrop-blur shadow-lg transition-transform hover:scale-105 hover:ring-2 hover:ring-emerald-400 text-left min-w-0"
                >
                  <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                    <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold uppercase">
                      PD
                    </span>
                    <span className="font-mono text-[7px] sm:text-[9px] text-zinc-400 hidden xs:inline">
                      {p?.overallRating ? `OVR ${p.overallRating}` : '--'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate">{p?.name ? p.name.split(' ')[0] : 'Vago'}</div>
                </button>
              );
            })()}
          </div>
        </div>

        {/* Banco de Suplentes Rápido */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Banco de Suplentes ({benchPlayers.length} atletas disponíveis)
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {benchPlayers.map((player) => (
              <div
                key={player.id}
                className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 min-w-[150px] text-xs font-mono"
              >
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-[10px]">{player.position}</span>
                  <span className="text-blue-400 font-bold">OVR {player.overallRating}</span>
                </div>
                <div className="font-bold text-white truncate mt-0.5">{player.name}</div>
                <div className="text-[10px] text-emerald-400 mt-1">⚡ {player.energyLevel}% energia</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE TROCA DIRETA DE ATLETA PARA O SLOT CLICADO */}
      {selectedSlotForSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Escolher Atleta para {COURT_SLOTS.find((s) => s.key === selectedSlotForSwap)?.label}
                </h3>
                <p className="text-xs text-zinc-400">
                  Clica no jogador do teu plantel que desejas titular nesta posição.
                </p>
              </div>
              <button
                onClick={() => setSelectedSlotForSwap(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {userSquad.map((player) => {
                const currentSlot = Object.keys(lineup).find((k) => lineup[k as SlotKey] === player.id);
                const isSelectedInTarget = lineup[selectedSlotForSwap] === player.id;
                const slotDef = COURT_SLOTS.find((s) => s.key === selectedSlotForSwap);
                const isNaturalPosition = slotDef?.allowedMatches.some((m) => player.position.includes(m) || player.position === m);

                return (
                  <div
                    key={player.id}
                    onClick={() => handleAssignPlayerToSlot(selectedSlotForSwap, player.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelectedInTarget
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-zinc-300">
                        {player.position}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{player.name}</span>
                          {isNaturalPosition && (
                            <span className="text-[10px] text-emerald-400 font-normal">★ Posição Natural</span>
                          )}
                          {currentSlot && !isSelectedInTarget && (
                            <span className="text-[10px] text-amber-400">Titular em {currentSlot.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          {player.age} anos · ⚡ {player.energyLevel}% Energia
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-blue-400 tabular-nums">
                        {player.overallRating}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignPlayerToSlot(selectedSlotForSwap, player.id);
                        }}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
                      >
                        {isSelectedInTarget ? 'Titular' : 'Escalar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SISTEMAS DEFENSIVOS OFICIAIS */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          🛡️ Sistema Defensivo Base
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(['6:0', '5:1', '3:3', '4:2', '3:2:1'] as DefensiveSystem[]).map((sys) => {
            const info = DEFENSIVE_SYSTEMS_INFO[sys];
            const isSelected = defenseSystem === sys;
            return (
              <div
                key={sys}
                onClick={() => setDefenseSystem(sys)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/40'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{info.name}</span>
                  {isSelected && (
                    <span className="rounded-full bg-amber-500 text-zinc-950 px-2 py-0.2 text-[9px] font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mb-2">{info.tagline}</p>
                <div className="space-y-1 text-[10px]">
                  <div className="text-emerald-400 font-medium">✅ {info.advantage}</div>
                  <div className="text-rose-400 font-medium">❌ {info.disadvantage}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ESTILO OFENSIVO, RITMO E AGRESSIVIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ritmo de Ataque */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            ⚡ Ritmo de Ataque
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'Contra-Ataque Alucinante', label: '⚡ Contra-Ataque (1ª Vaga)' },
              { id: 'Normal', label: '⚖️ Equilibrado' },
              { id: 'Ataque Organizado Paciente', label: '🛡️ Ataque Posicional (Posse)' },
            ].map((pace) => (
              <button
                key={pace.id}
                onClick={() => setOffensivePace(pace.id as OffensivePace)}
                className={`w-full rounded-xl py-2 px-3 text-xs font-medium text-left transition-all ${
                  offensivePace === pace.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {pace.label}
              </button>
            ))}
          </div>
        </div>

        {/* Foco de Finalização */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            🎯 Foco das Jogadas
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'Remates Exteriores (9m)', label: '🚀 Remates de 9m (Laterais)' },
              { id: 'Entradas do Pivô (6m)', label: '🛡️ Entradas do Pivô (6m)' },
              { id: 'Infiltrações das Pontas (Alas)', label: '⚡ Infiltrações dos Pontas' },
              { id: 'Equilibrado', label: '⚖️ Ataque Variado' },
            ].map((focus) => (
              <button
                key={focus.id}
                onClick={() => setOffensiveFocus(focus.id as OffensiveFocus)}
                className={`w-full rounded-xl py-2 px-3 text-xs font-medium text-left transition-all ${
                  offensiveFocus === focus.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {focus.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agressividade */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            🥊 Agressividade Defensiva
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'moderada', label: '🛡️ Moderada (Evita exclusões de 2 min)' },
              { id: 'intensa', label: '🥊 Intensa (Forte contacto físico)' },
              { id: 'limite', label: '⚠️ Ao Limite (Desarme duro / Risco)' },
            ].map((agg) => (
              <button
                key={agg.id}
                onClick={() => setAggressiveness(agg.id as typeof aggressiveness)}
                className={`w-full rounded-xl py-2 px-3 text-xs font-medium text-left transition-all ${
                  aggressiveness === agg.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {agg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
