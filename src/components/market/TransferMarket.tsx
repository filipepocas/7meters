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
    <div className="w-full space-y-6 font-mono">
      {/* Cabeçalho */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wider">
              🏪 Mercado de Transferências (Estilo Elifoot)
            </h2>
            <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Contrata jogadores livres sem clube, submete propostas a clubes rivais ou vende atletas do teu plantel.
            </p>
          </div>

          <div className="border-2 border-black bg-yellow-400 px-4 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm">
            💰 Tesouraria Disponível: €{userClub.budget.toLocaleString()}
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="border-4 border-black bg-yellow-300 p-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {feedbackMessage}
        </div>
      )}

      {/* Navegação entre as 3 Vias do Mercado */}
      <div className="flex flex-wrap border-b-4 border-black dark:border-white">
        {[
          { id: 'free_agents', label: `🆓 Jogadores Livres (${freeAgents.length})` },
          { id: 'club_market', label: `🏢 Mercado de Clubes (${clubMarketPlayers.length})` },
          { id: 'sell', label: `💰 Vender Atletas (${userSquad.filter((p) => p.transferListed).length} Listados)` },
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

      {/* Filtros de Posição */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'TODAS', label: 'Todas as Posições' },
          { id: 'GR', label: '🧤 Guarda-Redes' },
          { id: 'LE', label: 'Lateral Esquerdo' },
          { id: 'LD', label: 'Lateral Direito' },
          { id: 'C', label: 'Central' },
          { id: 'PE', label: 'Ponta Esquerdo' },
          { id: 'PD', label: 'Ponta Direito' },
          { id: 'PV', label: 'Pivô' },
        ].map((pos) => (
          <button
            key={pos.id}
            onClick={() => setSelectedPosition(pos.id as typeof selectedPosition)}
            className={`px-3 py-1.5 font-bold uppercase border-2 border-black ${
              selectedPosition === pos.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white hover:bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>

      {/* SEPARADOR 1: JOGADORES LIVRES (SEM CLUBE) */}
      {activeTab === 'free_agents' && (
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white p-6 space-y-4">
          <div className="border-l-4 border-green-500 pl-3">
            <h3 className="text-lg font-black uppercase">
              Jogadores Livres (Apenas Salário / Custo Zero de Passe)
            </h3>
            <p className="text-xs text-zinc-500">
              Atletas sem contrato desportivo. Podes contratá-los a qualquer momento pagando apenas o vencimento semanal acordado. Ideal para colmatar lesões!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterList(freeAgents).map((player) => (
              <div
                key={player.id}
                className="border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-800 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                      {player.position}
                    </span>
                    <h4 className="font-black text-base mt-1">{player.name}</h4>
                    <span className="text-[11px] text-zinc-500">
                      {player.age} anos • {player.country}
                    </span>
                  </div>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-lg">
                    OVR {player.overallRating}
                  </span>
                </div>

                <div className="text-xs border-t border-zinc-300 pt-2 space-y-1 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span>Exigência Salarial:</span>
                    <strong>€{(player.wage || 350).toLocaleString()}/sem</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor de Mercado:</span>
                    <span>€{player.marketValue.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSignFreeAgent(player)}
                  className="w-full border-2 border-black bg-green-500 p-2 font-black uppercase text-xs text-white hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  ✍️ Contratar a Custo Zero
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEPARADOR 2: MERCADO DE CLUBES (TRANSFERÊNCIAS COM PROPOSTAS) */}
      {activeTab === 'club_market' && (
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white p-6 space-y-4">
          <div className="border-l-4 border-blue-600 pl-3">
            <h3 className="text-lg font-black uppercase">
              Mercado de Clubes (Transferências com Custo de Passe)
            </h3>
            <p className="text-xs text-zinc-500">
              Insere uma proposta financeira. O clube proprietário avalia instantaneamente (Aceite, Contraproposta ou Recusa). Ou paga a cláusula a pronto!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterList(clubMarketPlayers).map((player) => (
              <div
                key={player.id}
                className="border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-800 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                      {player.position}
                    </span>
                    <h4 className="font-black text-base mt-1">{player.name}</h4>
                    <span className="text-[11px] text-zinc-500">
                      {player.age} anos • {player.country}
                    </span>
                  </div>
                  <span className="font-black text-purple-600 dark:text-purple-400 text-lg">
                    OVR {player.overallRating}
                  </span>
                </div>

                <div className="text-xs border-t border-zinc-300 pt-2 space-y-1 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span>Preço Mercado:</span>
                    <strong>€{player.marketValue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cláusula de Rescisão:</span>
                    <strong className="text-red-600">
                      €{(player.releaseClause || Math.round(player.marketValue * 1.5)).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Salário Estimado:</span>
                    <span>€{(player.wage || 400).toLocaleString()}/sem</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNegotiatingPlayer(player);
                      setBidInput(player.marketValue.toString());
                      setOfferResult(null);
                    }}
                    className="flex-1 border-2 border-black bg-yellow-400 p-2 font-black uppercase text-xs text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    💬 Fazer Proposta
                  </button>

                  <button
                    onClick={() => handlePayReleaseClause(player)}
                    className="border-2 border-black bg-red-600 px-3 p-2 font-black uppercase text-xs text-white hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
        <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white p-6 space-y-4">
          <div className="border-l-4 border-amber-500 pl-3">
            <h3 className="text-lg font-black uppercase">
              Venda de Atletas do {userClub.name}
            </h3>
            <p className="text-xs text-zinc-500">
              Coloca os teus atletas no mercado para receberes verbas imediatas e aliviares a folha salarial semanal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSquad.map((player) => (
              <div
                key={player.id}
                className="border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-800 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                      {player.position}
                    </span>
                    <h4 className="font-black text-sm mt-1">{player.name}</h4>
                    <span className="text-[10px] text-zinc-500">
                      {player.age} anos • OVR {player.overallRating}
                    </span>
                  </div>
                  {player.transferListed && (
                    <span className="bg-amber-400 text-black px-2 py-0.5 text-[10px] font-black">
                      NO MERCADO
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Valor de Mercado:</span>
                    <strong>€{player.marketValue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Oferta de Clube Rival:</span>
                    <strong className="text-green-600">
                      €{Math.round(player.marketValue * 0.95).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptSaleOffer(player)}
                  className="w-full border-2 border-black bg-black text-white p-2 font-black uppercase text-xs hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-white dark:text-black"
                >
                  🤝 Vender por €{Math.round(player.marketValue * 0.95).toLocaleString()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE PROPOSTA DE TRANSFERÊNCIA */}
      {negotiatingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg border-4 border-black bg-yellow-400 p-6 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-xl font-black uppercase border-b-2 border-black pb-2">
              💼 Proposta por {negotiatingPlayer.name} ({negotiatingPlayer.position})
            </h3>

            <div className="border-2 border-black bg-white p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Valor de Mercado:</span>
                <strong>€{negotiatingPlayer.marketValue.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cláusula de Rescisão:</span>
                <strong>€{(negotiatingPlayer.releaseClause || Math.round(negotiatingPlayer.marketValue * 1.5)).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>O teu saldo:</span>
                <span className="text-green-600 font-bold">€{userClub.budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase block">
                Valor da tua Proposta (€):
              </label>
              <input
                type="number"
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                className="w-full border-2 border-black bg-white p-2.5 font-mono font-bold text-sm"
              />
            </div>

            {offerResult && (
              <div
                className={`border-2 border-black p-3 text-xs font-bold ${
                  offerResult.type === 'accepted'
                    ? 'bg-green-200 text-green-900'
                    : offerResult.type === 'counter_offer'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-red-200 text-red-900'
                }`}
              >
                {offerResult.message}
                {offerResult.type === 'counter_offer' && offerResult.counterAmount && (
                  <button
                    onClick={() => {
                      setBidInput(offerResult.counterAmount!.toString());
                    }}
                    className="block mt-2 underline font-black"
                  >
                    Aceitar Contraproposta de €{offerResult.counterAmount.toLocaleString()}
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmitBid}
                className="flex-1 border-2 border-black bg-black p-2.5 font-black uppercase text-white hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
              >
                Submeter Proposta à Direção
              </button>
              <button
                onClick={() => setNegotiatingPlayer(null)}
                className="border-2 border-black bg-zinc-200 px-4 py-2.5 font-black uppercase text-black hover:bg-zinc-300 text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
