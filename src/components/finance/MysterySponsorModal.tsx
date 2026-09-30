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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-lg">
              🎁
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Patrocínios Mistério · Blind Deals
              </h2>
              <p className="text-xs text-zinc-400">
                Propostas comerciais com prémio de assinatura surpresa e pagamento semanal fixo.
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

        {/* Lista de Patrocinadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableSponsors.map((sponsor) => {
            const isSelected = selectedSponsor?.id === sponsor.id;
            return (
              <div
                key={sponsor.id}
                onClick={() => handleSelectSponsor(sponsor)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50 shadow-lg'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase">
                      {sponsor.tier}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {sponsor.contractWeeks} Semanas
                    </span>
                  </div>

                  <div className="text-sm font-bold text-white mb-1">{sponsor.companyName}</div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3">
                    "{sponsor.activityDescription}"
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-2.5 font-mono text-xs space-y-1">
                  <div className="flex justify-between text-zinc-300">
                    <span>Semanal:</span>
                    <strong className="text-white">€{(sponsor.weeklyPayout || sponsor.weeklyAmount || 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-purple-400 font-bold">
                    <span>Injeção Imediata:</span>
                    <span>??? €</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel de Assinatura */}
        {selectedSponsor && !revealedBonus && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Confirmar Acordo: {selectedSponsor.companyName}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ao assinar, o prémio de injeção secreta é imediatamente revelado e creditado na tesouraria do clube.
              </p>
            </div>

            <button
              onClick={handleSignContract}
              className="w-full rounded-xl bg-amber-500 py-3 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
            >
              ✍️ Assinar Contrato e Revelar Bónus Mistério
            </button>
          </div>
        )}

        {/* Bónus Revelado */}
        {statusMessage && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 font-bold text-emerald-200 text-xs text-center">
            🎉 {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
