/**
 * 7meters - Squad & Player Molecular Management View (Modern Redesign)
 * Gestão moderna e intuitiva do plantel com atributos moleculares (1 a 100),
 * posições, energia, moral, contratos e renovações.
 */

import React, { useState } from 'react';
import { Player, MoralLevel } from '../../types/player.types';
import { useGameStore } from '../../store/useGameStore';

export const SquadManagementView: React.FC = () => {
  const { userClub, userSquad, setUserSquad, setUserClub } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [renewalPlayer, setRenewalPlayer] = useState<Player | null>(null);
  const [filterPos, setFilterPos] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!userClub) return null;

  const totalWeeklyWages = userSquad.reduce((acc, p) => acc + (p.wage || Math.round(p.salary / 4)), 0);
  const avgAge = (userSquad.reduce((acc, p) => acc + p.age, 0) / (userSquad.length || 1)).toFixed(1);
  const avgOvr = Math.round(userSquad.reduce((acc, p) => acc + (p.overallRating || 60), 0) / (userSquad.length || 1));

  // Filtragem
  const filteredSquad = userSquad.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterPos === 'all') return true;
    if (filterPos === 'GR') return p.position === 'Guarda-Redes' || p.position === 'GR';
    if (filterPos === 'pontas') return p.position.includes('Ponta') || p.position === 'PE' || p.position === 'PD';
    if (filterPos === 'laterais') return p.position.includes('Lateral') || p.position === 'LE' || p.position === 'LD';
    if (filterPos === 'centrais') return p.position.includes('Central') || p.position === 'C';
    if (filterPos === 'pivos') return p.position.includes('Pivô') || p.position === 'PV' || p.position === 'P';
    return true;
  });

  // Toggle lista de transferências
  const handleToggleTransferList = (player: Player) => {
    const updatedStatus = !player.transferListed;
    const updatedSquad = userSquad.map((p) =>
      p.id === player.id ? { ...p, transferListed: updatedStatus } : p
    );
    setUserSquad(updatedSquad);
    setNotification(
      updatedStatus
        ? `${player.name} foi colocado no mercado por €${(player.askingPrice || player.marketValue).toLocaleString()}!`
        : `${player.name} foi retirado do mercado.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  // Processo de Renovação de Contrato
  const handleRenewContract = (player: Player) => {
    const signingBonus = Math.round(player.marketValue * 0.08);
    const wageIncrease = Math.round((player.wage || 300) * 1.25);

    if (userClub.budget < signingBonus) {
      alert(`Fundos insuficientes para o prémio de assinatura (€${signingBonus.toLocaleString()}).`);
      return;
    }

    const updatedClub = {
      ...userClub,
      budget: userClub.budget - signingBonus,
    };

    const updatedSquad = userSquad.map((p) => {
      if (p.id === player.id) {
        return {
          ...p,
          contractYearsRemaining: p.contractYearsRemaining + 2,
          isContractExpiringSoon: false,
          wage: wageIncrease,
          salary: wageIncrease * 4,
          moral: 10,
          moralLevel: 'Estrelado' as MoralLevel,
        };
      }
      return p;
    });

    setUserClub(updatedClub);
    setUserSquad(updatedSquad);
    setRenewalPlayer(null);
    setNotification(
      `🎉 Contrato renovado com ${player.name} por mais 2 épocas! Prémio de assinatura de €${signingBonus.toLocaleString()} pago.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  const getMoralBadge = (level?: MoralLevel) => {
    switch (level) {
      case 'Estrelado':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">⭐ Estrelado</span>;
      case 'Excelente':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">🔥 Excelente</span>;
      case 'Motivado':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">💪 Motivado</span>;
      case 'Normal':
        return <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">Normal</span>;
      case 'Em baixo':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20 animate-pulse">⚠️ Em baixo</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">Motivado</span>;
    }
  };

  const getPosBadgeColor = (pos: string) => {
    if (pos.includes('Guarda') || pos === 'GR') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (pos.includes('Lateral') || pos === 'LE' || pos === 'LD') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (pos.includes('Central') || pos === 'C') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (pos.includes('Pivô') || pos === 'P' || pos === 'PV') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'; // Pontas
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plantel com Métricas */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              👥 Gestão do Plantel & Atributos Moleculares
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Analisa o rendimento técnico (escala 1 a 100), condição física, moral e contratos de cada atleta.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Atletas</span>
              <span className="text-sm font-bold text-white">{userSquad.length}</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Média OVR</span>
              <span className="text-sm font-bold text-amber-400">{avgOvr}</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Média Idade</span>
              <span className="text-sm font-bold text-zinc-300">{avgAge} anos</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block">Folha Semanal</span>
              <span className="text-sm font-bold text-emerald-400">€{totalWeeklyWages.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300">
          ⚡ {notification}
        </div>
      )}

      {/* Controlos de Filtragem e Pesquisa */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chips de Posição */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'GR', label: '🧤 Guarda-Redes' },
            { id: 'laterais', label: '🚀 Laterais (LE/LD)' },
            { id: 'centrais', label: '🧠 Centrais (C)' },
            { id: 'pontas', label: '⚡ Pontas (PE/PD)' },
            { id: 'pivos', label: '🛡️ Pivôs (P)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterPos(f.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                filterPos === f.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Input de Pesquisa Rápida */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* LISTAGEM DE ATLETAS: Versão Mobile Card + Versão Desktop Tabela */}
      {/* 1. Mobile Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredSquad.map((player) => {
          const isTired = player.energyLevel < 50;
          const isExpiring = player.contractYearsRemaining <= 1;

          return (
            <div
              key={player.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 shadow-md backdrop-blur space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${getPosBadgeColor(player.position)}`}>
                    {player.position}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{player.name}</h4>
                    <p className="text-[11px] text-zinc-400">
                      {player.age} anos · {player.country}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono font-black text-base text-blue-400">
                    OVR {player.overallRating}
                  </span>
                  <div className="mt-0.5">{getMoralBadge(player.moralLevel)}</div>
                </div>
              </div>

              {/* Barra de Energia e Info de Contrato */}
              <div className="space-y-1 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Energia:</span>
                  <span className={`font-bold ${isTired ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    ⚡ {player.energyLevel}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isTired ? 'bg-red-500' : player.energyLevel > 75 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${player.energyLevel}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-300">
                  <span>€{(player.wage || 300).toLocaleString()}/sem</span>
                  <span>
                    {player.contractYearsRemaining} ano(s){' '}
                    {isExpiring && <span className="text-red-400 font-bold">(Último ano!)</span>}
                  </span>
                </div>
              </div>

              {/* Botões de Ação Mobile */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => setSelectedPlayer(player)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 active:scale-95 text-center"
                >
                  🔬 Ficha
                </button>
                <button
                  onClick={() => setRenewalPlayer(player)}
                  className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-600/30 active:scale-95 text-center"
                >
                  📝 Renovar
                </button>
                <button
                  onClick={() => handleToggleTransferList(player)}
                  className={`rounded-xl py-2 text-xs font-semibold transition-colors active:scale-95 text-center ${
                    player.transferListed
                      ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                      : 'border border-zinc-800 text-zinc-400 bg-zinc-950/60'
                  }`}
                >
                  {player.transferListed ? 'Mercado' : 'Vender'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Table (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Posição</th>
                <th className="py-3 px-4">Atleta</th>
                <th className="py-3 px-4 text-center">OVR</th>
                <th className="py-3 px-4">Energia</th>
                <th className="py-3 px-4">Moral</th>
                <th className="py-3 px-4">Contrato</th>
                <th className="py-3 px-4">Valor de Mercado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredSquad.map((player) => {
                const isTired = player.energyLevel < 50;
                const isExpiring = player.contractYearsRemaining <= 1;

                return (
                  <tr key={player.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Posição */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${getPosBadgeColor(player.position)}`}>
                        {player.position}
                      </span>
                      {player.secondaryPosition && player.secondaryPosition !== 'Nenhuma' && (
                        <span className="block text-[10px] text-zinc-500 mt-1">
                          Sec: {player.secondaryPosition}
                        </span>
                      )}
                    </td>

                    {/* Nome e Idade */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-white">{player.name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {player.age} anos · {player.country}
                      </div>
                    </td>

                    {/* OVR */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-blue-400 tabular-nums">
                      {player.overallRating}
                    </td>

                    {/* Energia */}
                    <td className="py-3.5 px-4 min-w-[120px]">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className={isTired ? 'text-red-400 font-bold animate-pulse' : 'text-emerald-400'}>
                          ⚡ {player.energyLevel}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isTired ? 'bg-red-500' : player.energyLevel > 75 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${player.energyLevel}%` }}
                        />
                      </div>
                    </td>

                    {/* Moral */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getMoralBadge(player.moralLevel)}
                    </td>

                    {/* Contrato */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <div className="text-zinc-200">€{(player.wage || 300).toLocaleString()}/sem</div>
                      <div className="text-[10px] text-zinc-400">
                        {player.contractYearsRemaining} ano(s){' '}
                        {isExpiring && (
                          <span className="text-red-400 font-bold">(Último ano!)</span>
                        )}
                      </div>
                    </td>

                    {/* Valor de Mercado */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-zinc-300">
                      €{player.marketValue.toLocaleString()}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        🔬 Ficha
                      </button>

                      <button
                        onClick={() => setRenewalPlayer(player)}
                        className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                      >
                        📝 Renovar
                      </button>

                      <button
                        onClick={() => handleToggleTransferList(player)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          player.transferListed
                            ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
                            : 'border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {player.transferListed ? 'No Mercado' : 'Vender'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MODERNO: FICHA MOLECULAR DO ATLETA (ESCALA 1 A 100) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Jogador */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border ${getPosBadgeColor(selectedPlayer.position)}`}>
                    {selectedPlayer.position}
                  </span>
                  {selectedPlayer.secondaryPosition && selectedPlayer.secondaryPosition !== 'Nenhuma' && (
                    <span className="rounded-lg bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      Secundária: {selectedPlayer.secondaryPosition}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white mt-2">
                  {selectedPlayer.name}
                </h3>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  {selectedPlayer.age} anos · {selectedPlayer.country} · Salário: €{(selectedPlayer.wage || 300).toLocaleString()}/sem
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-center">
                  <span className="text-[10px] text-blue-400 uppercase font-bold block">Overall</span>
                  <span className="text-2xl font-black text-blue-400 font-mono tabular-nums">
                    {selectedPlayer.overallRating}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="rounded-xl bg-zinc-800 p-2 text-zinc-400 hover:text-white hover:bg-zinc-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Atributos Moleculares 1 a 100 com Barras Elegantes */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Atributos Especializados de Andebol (Escala 1 a 100)
              </h4>

              {selectedPlayer.position === 'Guarda-Redes' || selectedPlayer.position === 'GR' ? (
                /* Atributos de Guarda-Redes */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Reflexos à Queima-Roupa', val: selectedPlayer.molecular?.gkReflexes || 75, color: 'bg-blue-500' },
                    { label: 'Colocação Remates Exteriores', val: selectedPlayer.molecular?.gkPositioning || 72, color: 'bg-indigo-500' },
                    { label: 'Defesa de 7 Metros', val: selectedPlayer.molecular?.gkSevenMeterSave || 70, color: 'bg-amber-500' },
                    { label: 'Reposição para Contra-Ataque', val: selectedPlayer.molecular?.gkFastBreakRelease || 74, color: 'bg-emerald-500' },
                  ].map((attr) => (
                    <div key={attr.label} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-zinc-300">{attr.label}</span>
                        <span className="font-mono font-bold text-white tabular-nums">{attr.val}/100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div className={`h-full rounded-full ${attr.color}`} style={{ width: `${attr.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Atributos de Jogadores de Campo */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Remate Exterior (9 Metros)', val: selectedPlayer.molecular?.shotExterior || 70, color: 'bg-rose-500' },
                    { label: 'Penetração / Drible 1v1', val: selectedPlayer.molecular?.penetration1v1 || 72, color: 'bg-amber-500' },
                    { label: 'Visão de Jogo / Passe', val: selectedPlayer.molecular?.visionDistribution || 75, color: 'bg-blue-500' },
                    { label: 'Eficácia em 7 Metros', val: selectedPlayer.molecular?.sevenMeterShot || 68, color: 'bg-emerald-500' },
                    { label: 'Desarme & Bloqueio (6 Metros)', val: selectedPlayer.molecular?.defensiveBlock || 73, color: 'bg-purple-500' },
                    { label: 'Resistência & Estamina', val: selectedPlayer.molecular?.stamina || 75, color: 'bg-cyan-500' },
                  ].map((attr) => (
                    <div key={attr.label} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-zinc-300">{attr.label}</span>
                        <span className="font-mono font-bold text-white tabular-nums">{attr.val}/100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div className={`h-full rounded-full ${attr.color}`} style={{ width: `${attr.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Físico & Disciplinar */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Energia Atual</span>
                  <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                    ⚡ {selectedPlayer.energyLevel}%
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Moral</span>
                  <span className="text-xs font-bold text-white block mt-1">
                    {selectedPlayer.moralLevel || 'Motivado'}
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Disciplina</span>
                  <span className="text-xs font-bold text-zinc-300 font-mono block mt-1">
                    🟨 {selectedPlayer.stats?.yellowCards || 0} · 🛑 {selectedPlayer.stats?.twoMinSuspensions || 0}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full rounded-xl bg-zinc-800 py-3 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
            >
              Fechar Ficha do Atleta
            </button>
          </div>
        </div>
      )}

      {/* MODAL MODERNO: RENOVAÇÃO DE CONTRATO */}
      {renewalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                📝 Renovação: {renewalPlayer.name}
              </h3>
              <button
                onClick={() => setRenewalPlayer(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              O atleta aceita prolongar a sua ligação ao clube por mais <strong>2 épocas desportivas</strong>:
            </p>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Prémio de Assinatura:</span>
                <strong className="text-amber-400">€{Math.round(renewalPlayer.marketValue * 0.08).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Novo Salário Semanal:</span>
                <strong className="text-white">€{Math.round((renewalPlayer.wage || 300) * 1.25).toLocaleString()}/sem</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duração Contratual:</span>
                <strong className="text-emerald-400">+2 Épocas</strong>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">Saldo Disponível:</span>
                <span className="text-zinc-300">€{userClub.budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleRenewContract(renewalPlayer)}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Aceitar & Assinar Contrato
              </button>
              <button
                onClick={() => setRenewalPlayer(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
