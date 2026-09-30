/**
 * 7meters - Handball Tactics & Lineup Board Component (Estilo Elifoot)
 * Prancheta tática geométrica com:
 * - Quadro posicional do 7 Inicial (1 GR, 2 Pontas, 2 Laterais, 1 Central, 1 Pivô)
 * - Sistemas defensivos oficiais (6:0, 5:1, 3:3, 4:2, 3:2:1) com vantagens e desvantagens reais
 * - Estilo ofensivo: Contra-Ataque Alucinante vs Ataque Organizado Paciente
 * - Foco de finalização: Remates Exteriores (9m), Entradas do Pivô (6m), Infiltrações das Pontas
 * - Botão "Auto-Escalar Melhor 7 Inicial" e gestão do banco de suplentes
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

export const TacticsView: React.FC<TacticsViewProps> = ({ onSaveTactics }) => {
  const { userSquad, userClub } = useGameStore();

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
    // Escalação inicial automática por posição
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

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const startingIds = Object.values(lineup).filter(Boolean) as string[];
  const benchedPlayers = userSquad.filter((p) => !startingIds.includes(p.id));

  const getPlayerById = (id: string | null): Player | undefined => {
    if (!id) return undefined;
    return userSquad.find((p) => p.id === id);
  };

  const handleAutoLineup = () => {
    // Escolhe os melhores por posição
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

    setStatusMessage('⚡ Sete Inicial escalado automaticamente com os atletas de maior Overall por posição!');
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
    setStatusMessage('💾 Prancheta tática e 7 Inicial guardados com sucesso!');
  };

  const currentSysInfo = DEFENSIVE_SYSTEMS_INFO[defenseSystem];

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Cabeçalho */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wider">
              📋 Prancheta Tática & Geometria do 7 Inicial
            </h2>
            <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Configura o sistema defensivo, o ritmo de ataque e o foco nas jogadas para o próximo jogo.
            </p>
          </div>

          <button
            onClick={handleAutoLineup}
            className="border-2 border-black bg-yellow-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ⚡ Auto-Escalar Melhor 7
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="border-4 border-black bg-yellow-300 p-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {statusMessage}
        </div>
      )}

      {/* QUADRO TÁTICO VISUAL: O CAMPO DE ANDEBOL COM OS 7 SLOTS */}
      <div className="border-4 border-black bg-emerald-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden">
        <div className="text-center font-black uppercase text-sm tracking-widest text-emerald-300 mb-4">
          Campo Oficial de Andebol 40x20m • Disposição do Sete Inicial
        </div>

        {/* Desenho do Meio Campo de Andebol */}
        <div className="relative max-w-2xl mx-auto h-96 border-4 border-white/60 bg-emerald-700/80 p-4 flex flex-col justify-between">
          {/* Baliza e Guarda-Redes (GR) */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-4 border-2 border-red-500 bg-white text-[9px] font-black text-red-600 flex items-center justify-center uppercase">
              Baliza 3x2m
            </div>
            {/* Slot GR */}
            <div className="mt-2 border-2 border-yellow-400 bg-black/90 p-2 text-center rounded-none shadow-[2px_2px_0px_0px_rgba(250,204,21,1)] min-w-[140px]">
              <span className="bg-yellow-400 text-black text-[9px] font-black px-1">GR</span>
              <div className="text-xs font-black truncate">{getPlayerById(lineup.gk)?.name || 'Vago'}</div>
              <div className="text-[10px] text-zinc-300">
                OVR {getPlayerById(lineup.gk)?.overallRating || '--'}
              </div>
            </div>
          </div>

          {/* Linha dos 6 Metros (Pivô P) */}
          <div className="flex justify-center border-b-2 border-dashed border-white/50 pb-2">
            <div className="border-2 border-white bg-black/90 p-2 text-center shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] min-w-[140px]">
              <span className="bg-purple-500 text-white text-[9px] font-black px-1">PIVÔ (P)</span>
              <div className="text-xs font-black truncate">{getPlayerById(lineup.p)?.name || 'Vago'}</div>
              <div className="text-[10px] text-zinc-300">
                OVR {getPlayerById(lineup.p)?.overallRating || '--'}
              </div>
            </div>
          </div>

          {/* Linha dos 9 Metros (Centrais e Laterais) & Linhas Laterais (Pontas) */}
          <div className="grid grid-cols-5 gap-2 items-center text-center">
            {/* Ponta Esquerdo (PE) */}
            <div className="border-2 border-white bg-black/90 p-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="bg-blue-500 text-white text-[9px] font-black px-1">PE</span>
              <div className="text-[11px] font-black truncate">{getPlayerById(lineup.pe)?.name || 'Vago'}</div>
              <div className="text-[9px] text-zinc-300">OVR {getPlayerById(lineup.pe)?.overallRating || '--'}</div>
            </div>

            {/* Lateral Esquerdo (LE) */}
            <div className="border-2 border-white bg-black/90 p-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="bg-red-500 text-white text-[9px] font-black px-1">LE</span>
              <div className="text-[11px] font-black truncate">{getPlayerById(lineup.le)?.name || 'Vago'}</div>
              <div className="text-[9px] text-zinc-300">OVR {getPlayerById(lineup.le)?.overallRating || '--'}</div>
            </div>

            {/* Central (C) */}
            <div className="border-2 border-yellow-400 bg-black/90 p-1.5 shadow-[2px_2px_0px_0px_rgba(250,204,21,1)]">
              <span className="bg-yellow-400 text-black text-[9px] font-black px-1">CENTRAL (C)</span>
              <div className="text-[11px] font-black truncate">{getPlayerById(lineup.c)?.name || 'Vago'}</div>
              <div className="text-[9px] text-zinc-300">OVR {getPlayerById(lineup.c)?.overallRating || '--'}</div>
            </div>

            {/* Lateral Direito (LD) */}
            <div className="border-2 border-white bg-black/90 p-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="bg-red-500 text-white text-[9px] font-black px-1">LD</span>
              <div className="text-[11px] font-black truncate">{getPlayerById(lineup.ld)?.name || 'Vago'}</div>
              <div className="text-[9px] text-zinc-300">OVR {getPlayerById(lineup.ld)?.overallRating || '--'}</div>
            </div>

            {/* Ponta Direito (PD) */}
            <div className="border-2 border-white bg-black/90 p-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <span className="bg-blue-500 text-white text-[9px] font-black px-1">PD</span>
              <div className="text-[11px] font-black truncate">{getPlayerById(lineup.pd)?.name || 'Vago'}</div>
              <div className="text-[9px] text-zinc-300">OVR {getPlayerById(lineup.pd)?.overallRating || '--'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SISTEMAS DEFENSIVOS OFICIAIS COM PRÓS E CONTRAS */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-4">
        <h3 className="text-xl font-black uppercase">
          🛡️ Escolha do Sistema Defensivo Base
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['6:0', '5:1', '3:3', '4:2', '3:2:1'] as DefensiveSystem[]).map((sys) => {
            const info = DEFENSIVE_SYSTEMS_INFO[sys];
            const isSelected = defenseSystem === sys;
            return (
              <div
                key={sys}
                onClick={() => setDefenseSystem(sys)}
                className={`border-4 border-black p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-base">{info.name}</span>
                  {isSelected && <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black">ATIVO</span>}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-bold mb-2">
                  {info.tagline}
                </p>
                <div className="space-y-1 text-[10px]">
                  <div className="text-green-700 dark:text-green-300 font-bold">
                    ✅ Vantagem: {info.advantage}
                  </div>
                  <div className="text-red-700 dark:text-red-300 font-bold">
                    ❌ Desvantagem: {info.disadvantage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ESTILO OFENSIVO, RITMO E AGRESSIVIDADE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ritmo de Ataque */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
          <label className="block text-xs font-black uppercase mb-2">
            ⚡ Ritmo Ofensivo
          </label>
          <select
            value={offensivePace}
            onChange={(e) => setOffensivePace(e.target.value as OffensivePace)}
            className="w-full border-2 border-black p-2.5 font-bold text-xs dark:bg-zinc-800"
          >
            <option value="Contra-Ataque Alucinante">⚡ Contra-Ataque Alucinante (Transição 1ª Vaga)</option>
            <option value="Ataque Organizado Paciente">🛡️ Ataque Organizado Paciente (Posse Controlada)</option>
            <option value="Normal">⚖️ Normal (Equilibrado)</option>
          </select>
        </div>

        {/* Foco de Jogadas */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
          <label className="block text-xs font-black uppercase mb-2">
            🎯 Foco de Finalização
          </label>
          <select
            value={offensiveFocus}
            onChange={(e) => setOffensiveFocus(e.target.value as OffensiveFocus)}
            className="w-full border-2 border-black p-2.5 font-bold text-xs dark:bg-zinc-800"
          >
            <option value="Remates Exteriores (9m)">🚀 Remates Exteriores (Laterais 9m)</option>
            <option value="Entradas do Pivô (6m)">🛡️ Entradas do Pivô (Linha 6m)</option>
            <option value="Infiltrações das Pontas (Alas)">⚡ Infiltrações das Pontas (Alas)</option>
            <option value="Equilibrado">⚖️ Equilibrado</option>
          </select>
        </div>

        {/* Agressividade */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
          <label className="block text-xs font-black uppercase mb-2">
            🥊 Agressividade Defensiva
          </label>
          <select
            value={aggressiveness}
            onChange={(e) => setAggressiveness(e.target.value as typeof aggressiveness)}
            className="w-full border-2 border-black p-2.5 font-bold text-xs dark:bg-zinc-800"
          >
            <option value="moderada">Moderada (Evita 2 minutos)</option>
            <option value="intensa">Intensa (Forte contacto físico)</option>
            <option value="limite">Ao Limite (Desarme duro / Risco)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full border-4 border-black bg-green-500 p-4 font-black uppercase text-xl text-white hover:bg-green-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        💾 Guardar Tática & Alinhamento
      </button>
    </div>
  );
};
