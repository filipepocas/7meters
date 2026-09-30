/**
 * 7meters - Mystery Sponsor Modal Component
 * Interface para seleção, revelação de valores mistério e assinatura
 * de patrocínios para o clube.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Sponsor } from '../../types/sponsor.types';
import { generateMysterySponsorCard } from '../../utils/generators/sponsorGen';
import confetti from 'canvas-confetti';

interface MysterySponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MysterySponsorModal: React.FC<MysterySponsorModalProps> = ({ isOpen, onClose }) => {
  const { userClub, signMysterySponsor } = useGameStore();
  const [availableSponsors] = useState<Sponsor[]>(() => [
    generateMysterySponsorCard('Nacional'),
    generateMysterySponsorCard('Internacional'),
    generateMysterySponsorCard('Cripto / Tech'),
  ]);

  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [revealedBonus, setRevealedBonus] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen || !userClub) return null;

  const handleSelectSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setRevealedBonus(null);
    setStatusMessage(null);
  };

  const handleSignContract = () => {
    if (!selectedSponsor) return;

    const { injectedAmount } = signMysterySponsor(selectedSponsor);
    setRevealedBonus(injectedAmount);
    setStatusMessage(`Contrato assinado! A marca injetou imediatamente €${injectedAmount.toLocaleString()} na tesouraria do ${userClub.name}.`);

    try {
      confetti({ particleCount: 100, spread: 70 });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600 text-white px-2 py-0.5 font-mono text-xs font-black uppercase">
              Blind Deals
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wider">
              🎁 Caixas de Patrocínio Mistério
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
          Propostas cegas de patrocínio com revelação diferida. O pagamento semanal é garantido, mas o prémio imediato de assinatura é mantido em segredo até à assinatura oficial.
        </p>

        {/* Lista de Patrocinadores */}
        <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableSponsors.map((sponsor) => {
            const isSelected = selectedSponsor?.id === sponsor.id;
            return (
              <div
                key={sponsor.id}
                onClick={() => handleSelectSponsor(sponsor)}
                className={`cursor-pointer border-4 p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-yellow-950 dark:text-white'
                    : 'border-black bg-zinc-50 hover:bg-zinc-100 dark:border-white dark:bg-zinc-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 dark:bg-white dark:text-black">
                      {sponsor.tier}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {sponsor.contractWeeks} Semanas
                    </span>
                  </div>

                  <div className="text-base font-black uppercase mb-1">{sponsor.companyName}</div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 italic mb-3">
                    "{sponsor.activityDescription.slice(0, 100)}..."
                  </p>
                </div>

                <div className="border-t-2 border-dashed border-zinc-300 pt-2 font-mono text-xs font-bold space-y-1">
                  <div>Semanal: €{(sponsor.weeklyPayout || sponsor.weeklyAmount || 0).toLocaleString()}</div>
                  <div className="text-purple-600 dark:text-purple-400 font-black">
                    Injeção Imediata: ??? €
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel de Assinatura */}
        {selectedSponsor && !revealedBonus && (
          <div className="mt-6 border-4 border-black bg-zinc-100 p-4 dark:border-white dark:bg-zinc-800">
            <h3 className="text-lg font-black uppercase mb-1">
              Confirmar Proposta: {selectedSponsor.companyName}
            </h3>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-4 font-mono">
              Ao assinar, o valor de injeção secreta é imediatamente desbloqueado e creditado na conta do teu clube.
            </p>

            <button
              onClick={handleSignContract}
              className="w-full border-2 border-black bg-green-500 p-3 font-black uppercase text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              ✍️ Assinar Contrato e Revelar Bónus Mistério
            </button>
          </div>
        )}

        {/* Bónus Revelado */}
        {statusMessage && (
          <div className="mt-6 border-4 border-black bg-green-200 p-4 font-black text-green-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-green-950 dark:text-green-100 dark:border-white font-mono">
            🎉 {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
