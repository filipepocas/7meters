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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-lg">
              🌐
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Horários de Jogos Online · P2P
              </h2>
              <p className="text-xs text-zinc-400">
                Combina os horários dos confrontos com outros treinadores humanos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {actionFeedback && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/40 p-3 text-center text-xs font-semibold text-blue-300">
            📢 {actionFeedback}
          </div>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {proposalsList.map((proposal) => {
            const isSelected = selectedProposal?.proposalId === proposal.proposalId;
            const scheduledDate = new Date(proposal.proposedTimestamp);

            return (
              <div
                key={proposal.proposalId}
                className={`rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Jornada {proposal.fixtureRound || 1} · Época {proposal.season || 1}
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {proposal.opponentClubName || 'Treinador Concorrente'}
                    </div>
                    <div className="text-xs text-blue-400 font-mono mt-1">
                      📅 {scheduledDate.toLocaleDateString('pt-PT')} às {scheduledDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(proposal.proposalId, true)}
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-xs text-white hover:bg-emerald-500 transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => handleResponse(proposal.proposalId, false)}
                      className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-1.5 font-bold text-xs text-rose-300 hover:bg-rose-900/60 transition-colors"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => setSelectedProposal(isSelected ? null : proposal)}
                      className="rounded-xl bg-amber-500 px-3.5 py-1.5 font-bold text-xs text-zinc-950 hover:bg-amber-400 transition-colors"
                    >
                      Reagendar
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 border-t border-zinc-800 pt-3">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Propor Nova Data/Hora de Partida:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={counterTime}
                        onChange={(e) => setCounterTime(e.target.value)}
                        className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!counterTime) return;
                          const ts = new Date(counterTime).getTime();
                          handleResponse(proposal.proposalId, false, ts);
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-xs text-white hover:bg-blue-500 transition-colors"
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
