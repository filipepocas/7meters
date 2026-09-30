/**
 * 7meters - Match Schedule Modal Component
 * Interface para gestão de propostas de horários de jogos multiplayer online,
 * permitindo aceitar, recusar e enviar contrapropostas de hora/dia com consentimento mútuo.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { MatchScheduleProposal } from '../../types/onlineMatch.types';

interface MatchScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatchScheduleModal: React.FC<MatchScheduleModalProps> = ({ isOpen, onClose }) => {
  const { userClub, onlineProposals, handleProposalResponse } = useGameStore();
  const [selectedProposal, setSelectedProposal] = useState<MatchScheduleProposal | null>(null);
  const [counterTime, setCounterTime] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen || !userClub) return null;

  // Se não houver propostas pendentes na store, gerar demonstração amigável
  const proposalsList = onlineProposals.length > 0 ? onlineProposals : [
    {
      proposalId: 'prop_demo_1',
      matchId: 'mth_online_1',
      homeClubId: userClub.id,
      awayClubId: 'clb_opponent_online',
      opponentClubName: 'Sporting CP (Treinador: Rui Silva)',
      fixtureRound: 3,
      season: 1,
      proposedByClubId: 'clb_opponent_online',
      proposedTimestamp: Date.now() + 86400000 * 2, // Em 2 dias
      deadlineTimestamp: Date.now() + 86400000 * 4,
      status: 'pendente' as const,
      rescheduleHistory: [],
    },
    {
      proposalId: 'prop_demo_2',
      matchId: 'mth_online_2',
      homeClubId: 'clb_porto_online',
      awayClubId: userClub.id,
      opponentClubName: 'FC Porto (Treinador: Pedro Alvarez)',
      fixtureRound: 4,
      season: 1,
      proposedByClubId: 'clb_porto_online',
      proposedTimestamp: Date.now() + 86400000 * 5,
      deadlineTimestamp: Date.now() + 86400000 * 7,
      status: 'pendente' as const,
      rescheduleHistory: [],
    },
  ];

  const handleResponse = (proposalId: string, accept: boolean, customTimestamp?: number) => {
    handleProposalResponse(proposalId, accept, customTimestamp);
    setActionFeedback(
      accept
        ? 'Proposta aceite! O jogo multiplayer foi confirmado na data combinada.'
        : customTimestamp
        ? 'Contraproposta com novo horário enviada ao treinador adversário.'
        : 'Proposta recusada.'
    );
    setSelectedProposal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 font-mono text-xs font-black uppercase dark:bg-white dark:text-black">
              Multiplayer P2P
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wider">
              🌐 Horários de Jogos Online
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-red-500 px-3 py-1 font-mono text-sm font-black text-white hover:bg-red-600 dark:border-white"
          >
            X
          </button>
        </div>

        <p className="my-3 text-sm font-bold text-zinc-600 dark:text-zinc-300">
          Combina os horários das partidas com outros treinadores humanos. Em caso de ausência injustificada no dia do jogo, o motor do 7meters ativa o modo <strong>Auto-Piloto</strong> para simular o resultado sem atrasar a liga.
        </p>

        {actionFeedback && (
          <div className="my-3 border-2 border-black bg-blue-100 p-3 text-center font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:border-white font-mono text-xs">
            📢 {actionFeedback}
          </div>
        )}

        <div className="my-4 space-y-3 max-h-80 overflow-y-auto pr-1">
          {proposalsList.map((proposal) => {
            const isSelected = selectedProposal?.proposalId === proposal.proposalId;
            const scheduledDate = new Date(proposal.proposedTimestamp);

            return (
              <div
                key={proposal.proposalId}
                className={`border-4 p-4 transition-all font-mono ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40'
                    : 'border-black bg-zinc-50 dark:border-white dark:bg-zinc-800'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
                      Jornada {proposal.fixtureRound || 1} • Época {proposal.season || 1}
                    </div>
                    <div className="text-base font-black uppercase">
                      {proposal.opponentClubName || 'Treinador Concorrente'}
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                      📅 Data Proposta: {scheduledDate.toLocaleDateString('pt-PT')} às {scheduledDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(proposal.proposalId, true)}
                      className="border-2 border-black bg-green-500 px-3 py-1.5 font-black uppercase text-xs text-white hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleResponse(proposal.proposalId, false)}
                      className="border-2 border-black bg-red-500 px-3 py-1.5 font-black uppercase text-xs text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => setSelectedProposal(isSelected ? null : proposal)}
                      className="border-2 border-black bg-yellow-400 px-3 py-1.5 font-black uppercase text-xs text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Reagendar
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 border-t-2 border-black pt-4 dark:border-white">
                    <label className="block text-xs font-black uppercase mb-1">
                      Propor Nova Data/Hora de Partida:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={counterTime}
                        onChange={(e) => setCounterTime(e.target.value)}
                        className="flex-1 border-2 border-black p-2 font-mono font-bold text-xs dark:border-white dark:bg-zinc-900 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          if (!counterTime) return;
                          const ts = new Date(counterTime).getTime();
                          handleResponse(proposal.proposalId, false, ts);
                        }}
                        className="border-2 border-black bg-blue-600 px-4 py-2 font-black uppercase text-xs text-white hover:bg-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
