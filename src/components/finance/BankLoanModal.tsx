/**
 * 7meters - Bank Loan Modal Component (BCP)
 * Interface para simulação de crédito, avaliação de risco,
 * contratação de empréstimos e consulta da capacidade de endividamento do clube.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { BankLoanOffer } from '../../types/finance.types';
import { calculateClubCreditScore } from '../../engine/bankEngine';

interface BankLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankLoanModal: React.FC<BankLoanModalProps> = ({ isOpen, onClose }) => {
  const { userClub, userSquad, requestLoanQuote, takeBankLoan } = useGameStore();
  const [requestedAmount, setRequestedAmount] = useState<number>(100000);
  const [currentQuote, setCurrentQuote] = useState<BankLoanOffer | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !userClub) return null;

  const creditScore = calculateClubCreditScore(userClub, userSquad);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    const quote = requestLoanQuote(requestedAmount);
    setCurrentQuote(quote);
  };

  const handleAcceptLoan = () => {
    if (!currentQuote || currentQuote.approvalStatus !== 'aprovado') return;

    const success = takeBankLoan(currentQuote, requestedAmount);
    if (success) {
      setFeedbackMessage(`Empréstimo de €${requestedAmount.toLocaleString()} concedido com sucesso! Capital creditado na tesouraria do clube.`);
      setCurrentQuote(null);
    } else {
      setFeedbackMessage('Falha ao processar o empréstimo bancário.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-lg">
              🏛️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                BCP · Banco do Clube Português
              </h2>
              <p className="text-xs text-zinc-400">
                Linha de liquidez e antecipação de tesouraria desportiva.
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

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 font-mono">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Saldo do Clube
            </span>
            <span className={`text-xl font-bold tabular-nums ${userClub.budget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              €{userClub.budget.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Score de Crédito
            </span>
            <span className="text-xl font-bold text-blue-400 tabular-nums">
              {creditScore} / 100
            </span>
          </div>
        </div>

        {/* Formulário de Simulação */}
        <form onSubmit={handleSimulate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Montante Solicitado (€):
            </label>
            <input
              type="number"
              min="5000"
              step="5000"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono font-bold text-base text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 py-3 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
          >
            Analisar Risco & Pedir Cotação ao Gestor
          </button>
        </form>

        {/* Cotação Aprovada ou Recusada */}
        {currentQuote && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 font-mono text-xs">
            {currentQuote.approvalStatus === 'aprovado' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-emerald-300 font-bold flex items-center gap-2">
                  <span>✅</span>
                  <span>Empréstimo Pré-Aprovado pelo Banco</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-zinc-400">Taxa de Juro:</div>
                  <div className="text-right text-white font-bold">{(currentQuote.interestRate * 100).toFixed(1)}%</div>

                  <div className="text-zinc-400">Prazo de Pagamento:</div>
                  <div className="text-right text-white font-bold">{currentQuote.durationWeeks} Semanas</div>

                  <div className="text-zinc-400">Amortização Semanal:</div>
                  <div className="text-right text-rose-400 font-bold">
                    €{currentQuote.weeklyPayment.toLocaleString()} /sem
                  </div>
                </div>

                <button
                  onClick={handleAcceptLoan}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-xs text-white hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
                >
                  Confirmar Contrato & Injetar €{requestedAmount.toLocaleString()} no Clube
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-rose-300 font-medium">
                ❌ Empréstimo Recusado: {currentQuote.rejectionReason}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {feedbackMessage && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
            {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};
