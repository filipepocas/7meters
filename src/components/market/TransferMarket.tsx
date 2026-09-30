/**
 * 7meters - Transfer Market (Estilo Elifoot)
 * Mercado completo com as duas vias de aquisição e venda:
 * 1. Jogadores Livres (Sem Clube): contratação a custo zero pagando apenas salário
 * 2. Mercado de Clubes: propostas financeiras com resposta instantânea da IA (Aceite, Contraproposta, Recusa) ou cláusula de rescisão
 * 3. Venda de Jogadores do Plantel com propostas automáticas de outros clubes
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Player, Position } from '../../types/player.types';
import { generateRandomPlayer } from '../../utils/generators/playerGen';

interface ClubOfferResponse {
  type: 'accepted' | 'counter_offer' | 'rejected';
  counterAmount?: number;
  message: string;
}

export const TransferMarket: React.FC = () => {
  const { userClub, userSquad, setUserClub, setUserSquad } = useGameStore();

  const [activeTab, setActiveTab] = useState<'free_agents' | 'club_market' | 'sell'>('free_agents');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'TODAS'>('TODAS');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Jogadores Livres (Sem Clube)
  const [freeAgents, setFreeAgents] = useState<Player[]>(() => [
    generateRandomPlayer(undefined, 5, null),
    generateRandomPlayer(undefined, 6, null),
    generateRandomPlayer(undefined, 4, null),
    generateRandomPlayer(undefined, 7, null),
    generateRandomPlayer(undefined, 5, null),
    generateRandomPlayer(undefined, 6, null),
  ]);

  // Mercado de Clubes (Sob contrato noutros clubes)
  const [clubMarketPlayers, setClubMarketPlayers] = useState<Player[]>(() => [
    generateRandomPlayer('Central', 7, 'clb_porto'),
    generateRandomPlayer('Lateral Esquerdo', 8, 'clb_sporting'),
    generateRandomPlayer('Guarda-Redes', 8, 'clb_benfica'),
    generateRandomPlayer('Pivô', 7, 'clb_braga'),
    generateRandomPlayer('Ponta Esquerdo', 6, 'clb_aguas_santas'),
    generateRandomPlayer('Lateral Direito', 7, 'clb_belenenses'),
    generateRandomPlayer('Ponta Direito', 6, 'clb_madeira'),
  ]);

  // Modal de Proposta
  const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
  const [bidInput, setBidInput] = useState<string>('');
  const [offerResult, setOfferResult] = useState<ClubOfferResponse | null>(null);

  if (!userClub) return null;

  // Filtragem
  const filterList = (players: Player[]) =>
    players.filter((p) => {
      if (selectedPosition === 'TODAS') return true;
      const pos = p.position as string;
      if (selectedPosition === 'GR') return pos.includes('Guarda') || pos === 'GR';
      if (selectedPosition === 'PE') return pos.includes('Ponta Esquerdo') || pos === 'PE';
      if (selectedPosition === 'PD') return pos.includes('Ponta Direito') || pos === 'PD';
      if (selectedPosition === 'C') return pos.includes('Central') || pos === 'C';
      if (selectedPosition === 'LE') return pos.includes('Lateral Esquerdo') || pos === 'LE';
      if (selectedPosition === 'LD') return pos.includes('Lateral Direito') || pos === 'LD';
      if (selectedPosition === 'PV') return pos.includes('Pivô') || pos === 'PV' || pos === 'P';
      return true;
    });

  // 1. Contratar Jogador Livre (Apenas salário/prémio inicial)
  const handleSignFreeAgent = (player: Player) => {
    const signingCost = Math.round((player.wage || 300) * 4); // 1 mês de caução
    if (userClub.budget < signingCost) {
      setFeedbackMessage(`Saldo insuficiente para prémio de entrada de €${signingCost.toLocaleString()}.`);
      return;
    }

    const updatedClub = {
      ...userClub,
      budget: userClub.budget - signingCost,
    };

    const newHiredPlayer: Player = {
      ...player,
      currentClubId: userClub.id,
      clubId: userClub.id,
      isHired: true,
      contractYearsRemaining: 2,
    };

    setUserClub(updatedClub);
    setUserSquad([...userSquad, newHiredPlayer]);
    setFreeAgents(freeAgents.filter((p) => p.id !== player.id));
    setFeedbackMessage(`🎉 Contratação a custo zero! ${player.name} assinou por 2 épocas pelo ${userClub.name}.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // 2. Submeter Proposta a Clube Proprietário
  const handleSubmitBid = () => {
    if (!negotiatingPlayer) return;
    const bidAmount = parseInt(bidInput, 10);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert('Introduz um valor válido em Euros.');
      return;
    }

    if (userClub.budget < bidAmount) {
      alert(`Saldo insuficiente! O teu clube tem apenas €${userClub.budget.toLocaleString()}.`);
      return;
    }

    const fairValue = negotiatingPlayer.marketValue;
    const ratio = bidAmount / fairValue;

    if (ratio >= 1.05) {
      // Aceite!
      setOfferResult({
        type: 'accepted',
        message: `🤝 PROPOSTA ACEITE! O clube aceitou a tua verba de €${bidAmount.toLocaleString()}. O atleta já viajou para o pavilhão e junta-se ao plantel!`,
      });
      const updatedClub = {
        ...userClub,
        budget: userClub.budget - bidAmount,
      };
      const hiredPlayer: Player = {
        ...negotiatingPlayer,
        currentClubId: userClub.id,
        clubId: userClub.id,
        isHired: true,
        contractYearsRemaining: 2,
      };
      setUserClub(updatedClub);
      setUserSquad([...userSquad, hiredPlayer]);
      setClubMarketPlayers(clubMarketPlayers.filter((p) => p.id !== negotiatingPlayer.id));
    } else if (ratio >= 0.85) {
      // Contraproposta!
      const counterVal = Math.round(fairValue * 1.15);
      setOfferResult({
        type: 'counter_offer',
        counterAmount: counterVal,
        message: `⚖️ CONTRAPROPOSTA: O clube recusou os €${bidAmount.toLocaleString()}, mas exige €${counterVal.toLocaleString()} para libertar o jogador de imediato.`,
      });
    } else {
      // Recusada!
      setOfferResult({
        type: 'rejected',
        message: `❌ PROPOSTA RECUSADA: O clube considerou a oferta de €${bidAmount.toLocaleString()} muito abaixo do valor de mercado (€${fairValue.toLocaleString()}).`,
      });
    }
  };

  // Pagar Cláusula de Rescisão
  const handlePayReleaseClause = (player: Player) => {
    const clause = player.releaseClause || Math.round(player.marketValue * 1.5);
    if (userClub.budget < clause) {
      setFeedbackMessage(`Saldo insuficiente para bater a cláusula de rescisão (€${clause.toLocaleString()}).`);
      return;
    }

    const updatedClub = {
      ...userClub,
      budget: userClub.budget - clause,
    };

    const hiredPlayer: Player = {
      ...player,
      currentClubId: userClub.id,
      clubId: userClub.id,
      isHired: true,
      contractYearsRemaining: 3,
    };

    setUserClub(updatedClub);
    setUserSquad([...userSquad, hiredPlayer]);
    setClubMarketPlayers(clubMarketPlayers.filter((p) => p.id !== player.id));
    setFeedbackMessage(`💥 CLÁUSULA ACIONADA! Bateste a cláusula de €${clause.toLocaleString()} e ${player.name} é jogador do ${userClub.name}!`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // 3. Vender Jogador do Próprio Plantel
  const handleAcceptSaleOffer = (player: Player) => {
    if (userSquad.length <= 7) {
      setFeedbackMessage('Atenção: Não podes ter menos de 7 atletas no plantel.');
      return;
    }

    const salePrice = player.askingPrice || Math.round(player.marketValue * 0.95);
    const updatedClub = {
      ...userClub,
      budget: userClub.budget + salePrice,
    };

    setUserClub(updatedClub);
    setUserSquad(userSquad.filter((p) => p.id !== player.id));
    setFeedbackMessage(`💰 Venda oficializada! ${player.name} transferiu-se por €${salePrice.toLocaleString()}.`);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho Moderno */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              🏪 Mercado de Transferências & Negociações
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Contrata jogadores livres sem custos de passe, apresenta propostas a clubes rivais ou rentabiliza atletas do teu plantel.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 font-mono text-xs font-bold text-emerald-300 backdrop-blur">
            <span>Tesouraria:</span>
            <span className="text-sm font-black text-white tabular-nums">€{userClub.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300 backdrop-blur">
          ⚡ {feedbackMessage}
        </div>
      )}

      {/* Navegação por Segmentos Modernos */}
      <div className="flex space-x-2 overflow-x-auto scrollbar-none border-b border-zinc-800 pb-3 touch-pan-x">
        {[
          { id: 'free_agents', label: 'Jogadores Livres', count: freeAgents.length, icon: '🆓' },
          { id: 'club_market', label: 'Mercado de Clubes', count: clubMarketPlayers.length, icon: '🏢' },
          { id: 'sell', label: 'Vender Atletas', count: userSquad.filter((p) => p.transferListed).length, icon: '💰' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`shrink-0 flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/80'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`rounded-full px-2 py-0.2 text-[10px] font-mono font-bold ${
                isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros de Posição com Chips Limpos */}
      <div className="flex space-x-1.5 overflow-x-auto scrollbar-none pb-1 touch-pan-x text-xs">
        {[
          { id: 'TODAS', label: 'Todas as Posições' },
          { id: 'GR', label: 'Guarda-Redes' },
          { id: 'LE', label: 'Lateral Esquerdo' },
          { id: 'LD', label: 'Lateral Direito' },
          { id: 'C', label: 'Central' },
          { id: 'PE', label: 'Ponta Esquerdo' },
          { id: 'PD', label: 'Ponta Direito' },
          { id: 'PV', label: 'Pivô' },
        ].map((pos) => {
          const isSelected = selectedPosition === pos.id;
          return (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id as typeof selectedPosition)}
              className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 font-medium whitespace-nowrap transition-all text-xs ${
                isSelected
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60'
              }`}
            >
              {pos.label}
            </button>
          );
        })}
      </div>

      {/* SEPARADOR 1: JOGADORES LIVRES (SEM CLUBE) */}
      {activeTab === 'free_agents' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur shadow-xl space-y-4">
          <div className="border-l-2 border-emerald-500 pl-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Jogadores Livres (Custo Zero de Passe)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atletas sem clube desportivo. Podes contratá-los a qualquer momento pagando apenas o vencimento semanal acordado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterList(freeAgents).map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4 hover:border-zinc-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                        {player.position}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1.5">{player.name}</h4>
                      <span className="text-xs text-zinc-400">
                        {player.age} anos · {player.country}
                      </span>
                    </div>
                    <span className="rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 font-mono font-bold text-sm tabular-nums">
                      OVR {player.overallRating}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Exigência Salarial:</span>
                      <strong className="text-white">€{(player.wage || 350).toLocaleString()}/sem</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor de Mercado:</span>
                      <span className="text-zinc-300">€{player.marketValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSignFreeAgent(player)}
                  className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-xs text-white hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
                >
                  ✍️ Contratar a Custo Zero
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEPARADOR 2: MERCADO DE CLUBES */}
      {activeTab === 'club_market' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur shadow-xl space-y-4">
          <div className="border-l-2 border-blue-500 pl-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Mercado de Clubes (Transferências com Propostas)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Insere uma proposta financeira. O clube proprietário avalia instantaneamente (Aceite, Contraproposta ou Recusa).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterList(clubMarketPlayers).map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4 hover:border-zinc-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                        {player.position}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1.5">{player.name}</h4>
                      <span className="text-xs text-zinc-400">
                        {player.age} anos · {player.country}
                      </span>
                    </div>
                    <span className="rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 font-mono font-bold text-sm tabular-nums">
                      OVR {player.overallRating}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Preço Mercado:</span>
                      <strong className="text-white">€{player.marketValue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cláusula de Rescisão:</span>
                      <strong className="text-rose-400">
                        €{(player.releaseClause || Math.round(player.marketValue * 1.5)).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Salário Estimado:</span>
                      <span className="text-zinc-300">€{(player.wage || 400).toLocaleString()}/sem</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setNegotiatingPlayer(player);
                      setBidInput(player.marketValue.toString());
                      setOfferResult(null);
                    }}
                    className="flex-1 rounded-xl bg-amber-500 py-2.5 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
                  >
                    💬 Fazer Proposta
                  </button>

                  <button
                    onClick={() => handlePayReleaseClause(player)}
                    className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2.5 font-bold text-xs text-rose-300 hover:bg-rose-900/60 transition-all"
                    title="Pagar Cláusula a Pronto"
                  >
                    💥 Cláusula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEPARADOR 3: VENDER ATLETAS DO PLANTEL */}
      {activeTab === 'sell' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur shadow-xl space-y-4">
          <div className="border-l-2 border-amber-500 pl-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Venda de Atletas do {userClub.name}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Coloca os teus atletas no mercado para receberes verbas imediatas e aliviares a folha salarial semanal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSquad.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                      {player.position}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">{player.name}</h4>
                    <span className="text-[11px] text-zinc-400">
                      {player.age} anos · OVR {player.overallRating}
                    </span>
                  </div>
                  {player.transferListed && (
                    <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold">
                      No Mercado
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1 font-mono pt-2 border-t border-zinc-800 text-zinc-400">
                  <div className="flex justify-between">
                    <span>Valor de Mercado:</span>
                    <strong className="text-white">€{player.marketValue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Oferta de Clube Rival:</span>
                    <strong className="text-emerald-400">
                      €{Math.round(player.marketValue * 0.95).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptSaleOffer(player)}
                  className="mt-3 w-full rounded-xl bg-zinc-800 py-2 font-bold text-xs text-zinc-200 hover:bg-zinc-700 hover:text-white active:scale-[0.98] transition-all"
                >
                  🤝 Vender por €{Math.round(player.marketValue * 0.95).toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE PROPOSTA DE TRANSFERÊNCIA MODERNO */}
      {negotiatingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white tracking-tight">
                💼 Proposta por {negotiatingPlayer.name}
              </h3>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-300">
                {negotiatingPlayer.position}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Valor de Mercado:</span>
                <strong className="text-white">€{negotiatingPlayer.marketValue.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Cláusula de Rescisão:</span>
                <strong className="text-rose-400">€{(negotiatingPlayer.releaseClause || Math.round(negotiatingPlayer.marketValue * 1.5)).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">O teu saldo em tesouraria:</span>
                <span className="text-emerald-400 font-bold">€{userClub.budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Valor da tua Proposta (€):
              </label>
              <input
                type="number"
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono font-bold text-base text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {offerResult && (
              <div
                className={`rounded-2xl border p-4 text-xs font-semibold ${
                  offerResult.type === 'accepted'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                    : offerResult.type === 'counter_offer'
                    ? 'border-amber-500/40 bg-amber-950/40 text-amber-200'
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
                }`}
              >
                {offerResult.message}
                {offerResult.type === 'counter_offer' && offerResult.counterAmount && (
                  <button
                    onClick={() => {
                      setBidInput(offerResult.counterAmount!.toString());
                    }}
                    className="block mt-2 font-bold underline hover:text-white"
                  >
                    Aceitar Contraproposta de €{offerResult.counterAmount.toLocaleString()}
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmitBid}
                className="flex-1 rounded-xl bg-amber-500 py-3 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
              >
                Submeter Proposta ao Clube
              </button>
              <button
                onClick={() => setNegotiatingPlayer(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-semibold text-xs text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
