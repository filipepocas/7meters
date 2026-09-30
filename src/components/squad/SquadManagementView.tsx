/**
 * 7meters - Squad & Player Molecular Management View (Estilo Elifoot)
 * Ecrã de gestão integral do plantel:
 * - Ficha molecular de cada atleta (escala 1 a 100)
 * - Posições primárias e secundárias
 * - Atributos de guarda-redes e jogadores de campo
 * - Energia física e 5 níveis de moral (Em baixo, Normal, Motivado, Excelente, Estrelado)
 * - Gestão de contratos, vencimento semanal e renovações com prémio de assinatura
 * - Colocação na lista de transferências
 */

import React, { useState } from 'react';
import { Player, MoralLevel } from '../../types/player.types';
import { useGameStore } from '../../store/useGameStore';

export const SquadManagementView: React.FC = () => {
  const { userClub, userSquad, setUserSquad, setUserClub } = useGameStore();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [renewalPlayer, setRenewalPlayer] = useState<Player | null>(null);
  const [filterPos, setFilterPos] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  if (!userClub) return null;

  const totalWeeklyWages = userSquad.reduce((acc, p) => acc + (p.wage || Math.round(p.salary / 4)), 0);
  const avgAge = (userSquad.reduce((acc, p) => acc + p.age, 0) / (userSquad.length || 1)).toFixed(1);
  const avgOvr = Math.round(userSquad.reduce((acc, p) => acc + (p.overallRating || 60), 0) / (userSquad.length || 1));

  // Filtragem
  const filteredSquad = userSquad.filter((p) => {
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
        ? `${player.name} foi colocado na lista de transferências por €${(player.askingPrice || player.marketValue).toLocaleString()}!`
        : `${player.name} foi retirado da lista de transferências.`
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
        return <span className="bg-amber-400 text-black px-2 py-0.5 font-black text-[10px] border border-black">⭐ ESTRELADO</span>;
      case 'Excelente':
        return <span className="bg-green-500 text-white px-2 py-0.5 font-black text-[10px]">🔥 EXCELENTE</span>;
      case 'Motivado':
        return <span className="bg-blue-600 text-white px-2 py-0.5 font-black text-[10px]">💪 MOTIVADO</span>;
      case 'Normal':
        return <span className="bg-zinc-200 text-zinc-800 px-2 py-0.5 font-bold text-[10px]">😐 NORMAL</span>;
      case 'Em baixo':
        return <span className="bg-red-600 text-white px-2 py-0.5 font-black text-[10px] animate-pulse">⚠️ EM BAIXO</span>;
      default:
        return <span className="bg-zinc-200 text-zinc-800 px-2 py-0.5 font-bold text-[10px]">MOTIVADO</span>;
    }
  };

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Cabeçalho */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wider">
              🤾 Plantel & Atributos Moleculares (Elifoot)
            </h2>
            <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Gere o equilíbrio entre qualidade técnica (1-100), folha salarial semanal, contratos e moral do balneário.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-black">
            <div className="border-2 border-black bg-yellow-400 p-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ATLETAS: {userSquad.length}
            </div>
            <div className="border-2 border-black bg-green-400 p-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              MÉDIA OVR: {avgOvr}
            </div>
            <div className="border-2 border-black bg-blue-400 p-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              MÉDIA IDADE: {avgAge} anos
            </div>
            <div className="border-2 border-black bg-zinc-900 p-2 text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              FOLHA: €{totalWeeklyWages.toLocaleString()}/sem
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="border-4 border-black bg-yellow-300 p-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {notification}
        </div>
      )}

      {/* Filtros de Posição */}
      <div className="flex flex-wrap gap-2">
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
            className={`px-4 py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              filterPos === f.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Atletas em Tabela Brutalista */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-4 border-black bg-zinc-100 dark:border-white dark:bg-zinc-800 uppercase font-black">
              <th className="p-3">Posição</th>
              <th className="p-3">Nome / Idade</th>
              <th className="p-3">OVR</th>
              <th className="p-3">Energia</th>
              <th className="p-3">Moral</th>
              <th className="p-3">Salário / Contrato</th>
              <th className="p-3">Valor Mercado</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800">
            {filteredSquad.map((player) => {
              const isGK = player.position === 'Guarda-Redes' || player.position === 'GR';
              const isTired = player.energyLevel < 50;
              const isExpiring = player.contractYearsRemaining <= 1;

              return (
                <tr key={player.id} className="hover:bg-yellow-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <span className="bg-black text-white px-2 py-0.5 text-xs font-black dark:bg-white dark:text-black">
                      {player.position}
                    </span>
                    {player.secondaryPosition && player.secondaryPosition !== 'Nenhuma' && (
                      <span className="block text-[10px] text-zinc-500 font-bold mt-1">
                        Sec: {player.secondaryPosition}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="font-black text-sm">{player.name}</div>
                    <div className="text-[10px] text-zinc-500">
                      {player.age} anos • {player.country}
                    </div>
                  </td>

                  <td className="p-3 font-black text-sm text-blue-600 dark:text-blue-400">
                    {player.overallRating}
                  </td>

                  <td className="p-3 font-bold">
                    <span className={isTired ? 'text-red-600 font-black animate-pulse' : 'text-green-600'}>
                      ⚡ {player.energyLevel}%
                    </span>
                  </td>

                  <td className="p-3">
                    {getMoralBadge(player.moralLevel)}
                  </td>

                  <td className="p-3">
                    <div className="font-bold">€{(player.wage || 300).toLocaleString()}/sem</div>
                    <div className="text-[10px]">
                      {player.contractYearsRemaining} ano(s){' '}
                      {isExpiring && (
                        <span className="text-red-600 font-black uppercase">(Último ano!)</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 font-bold">
                    €{player.marketValue.toLocaleString()}
                  </td>

                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="border-2 border-black bg-yellow-400 px-2.5 py-1 text-[11px] font-black uppercase hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black"
                    >
                      🔬 Ficha
                    </button>

                    <button
                      onClick={() => setRenewalPlayer(player)}
                      className="border-2 border-black bg-green-500 px-2.5 py-1 text-[11px] font-black uppercase text-white hover:bg-green-600 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      📝 Renovar
                    </button>

                    <button
                      onClick={() => handleToggleTransferList(player)}
                      className={`border-2 border-black px-2 py-1 text-[11px] font-black uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                        player.transferListed
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-zinc-200 text-black hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white'
                      }`}
                    >
                      {player.transferListed ? 'Venda (ON)' : 'Vender'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: FICHA MOLECULAR DETALHADA DO ATLETA (ESCALA 1 A 100) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono">
          <div className="w-full max-w-2xl border-4 border-black bg-white p-6 text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start border-b-4 border-black pb-3">
              <div>
                <span className="bg-black text-white px-2 py-0.5 text-xs font-black">
                  {selectedPlayer.position}
                </span>
                {selectedPlayer.secondaryPosition && selectedPlayer.secondaryPosition !== 'Nenhuma' && (
                  <span className="bg-zinc-200 text-black px-2 py-0.5 text-xs font-bold ml-2">
                    Secundária: {selectedPlayer.secondaryPosition}
                  </span>
                )}
                <h3 className="text-2xl font-black uppercase mt-1">
                  {selectedPlayer.name}
                </h3>
                <span className="text-xs text-zinc-600">
                  {selectedPlayer.age} anos • {selectedPlayer.country} • Overall {selectedPlayer.overallRating}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="border-2 border-black bg-red-500 px-3 py-1 font-black text-white hover:bg-red-600"
              >
                ✕
              </button>
            </div>

            {/* Atributos Moleculares 1 a 100 */}
            <div className="space-y-3">
              <h4 className="font-black text-sm uppercase text-zinc-800 border-b-2 border-black pb-1">
                📊 Atributos Técnicos Especializados (Escala 1 a 100)
              </h4>

              {selectedPlayer.position === 'Guarda-Redes' || selectedPlayer.position === 'GR' ? (
                /* Atributos de Guarda-Redes */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Reflexos à Queima-Roupa:</span>
                      <span className="font-black">{selectedPlayer.molecular?.gkReflexes || 75}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-blue-600" style={{ width: `${selectedPlayer.molecular?.gkReflexes || 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Colocação Remates Exteriores:</span>
                      <span className="font-black">{selectedPlayer.molecular?.gkPositioning || 72}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-blue-600" style={{ width: `${selectedPlayer.molecular?.gkPositioning || 72}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Defesa de 7 Metros:</span>
                      <span className="font-black">{selectedPlayer.molecular?.gkSevenMeterSave || 70}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-blue-600" style={{ width: `${selectedPlayer.molecular?.gkSevenMeterSave || 70}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Reposição Contra-Ataque:</span>
                      <span className="font-black">{selectedPlayer.molecular?.gkFastBreakRelease || 74}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-blue-600" style={{ width: `${selectedPlayer.molecular?.gkFastBreakRelease || 74}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                /* Atributos de Jogadores de Campo */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Remate Exterior (9 Metros):</span>
                      <span className="font-black">{selectedPlayer.molecular?.shotExterior || 70}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-red-600" style={{ width: `${selectedPlayer.molecular?.shotExterior || 70}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Penetração / Drible 1v1:</span>
                      <span className="font-black">{selectedPlayer.molecular?.penetration1v1 || 72}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-amber-500" style={{ width: `${selectedPlayer.molecular?.penetration1v1 || 72}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Visão de Jogo / Passe:</span>
                      <span className="font-black">{selectedPlayer.molecular?.visionDistribution || 75}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-blue-600" style={{ width: `${selectedPlayer.molecular?.visionDistribution || 75}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Eficácia em 7 Metros:</span>
                      <span className="font-black">{selectedPlayer.molecular?.sevenMeterShot || 68}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-green-600" style={{ width: `${selectedPlayer.molecular?.sevenMeterShot || 68}%` }} />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Desarme & Bloqueio Defensivo (6 Metros):</span>
                      <span className="font-black">{selectedPlayer.molecular?.defensiveBlock || 73}/100</span>
                    </div>
                    <div className="h-2.5 bg-zinc-200 border border-black">
                      <div className="h-full bg-purple-600" style={{ width: `${selectedPlayer.molecular?.defensiveBlock || 73}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Físico e Disciplinar */}
              <div className="border-t-2 border-black pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center font-bold">
                <div className="border border-black p-2 bg-zinc-100">
                  <div className="text-[10px] uppercase text-zinc-500">Energia Atual</div>
                  <div className="text-base text-green-600 font-black">{selectedPlayer.energyLevel}%</div>
                </div>
                <div className="border border-black p-2 bg-zinc-100">
                  <div className="text-[10px] uppercase text-zinc-500">Resistência / Estamina</div>
                  <div className="text-base font-black">{selectedPlayer.molecular?.stamina || 75}/100</div>
                </div>
                <div className="border border-black p-2 bg-zinc-100">
                  <div className="text-[10px] uppercase text-zinc-500">Amarelos / 2m</div>
                  <div className="text-base font-black">
                    🟨 {selectedPlayer.stats?.yellowCards || 0} | 🛑 {selectedPlayer.stats?.twoMinSuspensions || 0}
                  </div>
                </div>
                <div className="border border-black p-2 bg-zinc-100">
                  <div className="text-[10px] uppercase text-zinc-500">Golos Época</div>
                  <div className="text-base font-black text-blue-600">
                    ⚽ {selectedPlayer.stats?.goalsScored || 0}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full border-2 border-black bg-black p-2.5 font-black uppercase text-white hover:bg-zinc-800"
            >
              Fechar Ficha Molecular
            </button>
          </div>
        </div>
      )}

      {/* MODAL: RENOVAÇÃO DE CONTRATO */}
      {renewalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono">
          <div className="w-full max-w-md border-4 border-black bg-yellow-400 p-6 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xl font-black uppercase border-b-2 border-black pb-2">
              📝 Negociação de Contrato: {renewalPlayer.name}
            </h3>

            <p className="text-xs font-bold">
              O atleta aceita estender a sua ligação ao clube por mais <strong>2 épocas</strong> com as seguintes condições:
            </p>

            <div className="border-2 border-black bg-white p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Prémio de Assinatura (Imediato):</span>
                <strong>€{Math.round(renewalPlayer.marketValue * 0.08).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Salário Semanal Proposto:</span>
                <strong>€{Math.round((renewalPlayer.wage || 300) * 1.25).toLocaleString()}/sem</strong>
              </div>
              <div className="flex justify-between">
                <span>Duração Adicional:</span>
                <strong>+2 Épocas</strong>
              </div>
              <div className="flex justify-between">
                <span>Orçamento Disponível:</span>
                <span className="text-green-600 font-bold">€{userClub.budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleRenewContract(renewalPlayer)}
                className="flex-1 border-2 border-black bg-green-600 p-2.5 font-black uppercase text-white hover:bg-green-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Aceitar & Assinar
              </button>
              <button
                onClick={() => setRenewalPlayer(null)}
                className="border-2 border-black bg-zinc-200 px-4 py-2.5 font-black uppercase text-black hover:bg-zinc-300"
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
