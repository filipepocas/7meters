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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
          <h2 className="text-2xl font-black uppercase tracking-wider">
            🏛️ BCP - Banco do Clube Português
          </h2>
          <button
            onClick={onClose}
            className="border-2 border-black bg-red-500 px-3 py-1 font-mono text-sm font-black text-white hover:bg-red-600 dark:border-white"
          >
            X
          </button>
        </div>

        {/* Resumo Financeiro */}
        <div className="my-4 grid grid-cols-2 gap-4 border-2 border-black bg-zinc-100 p-4 dark:border-white dark:bg-zinc-800 font-mono">
          <div>
            <span className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
              Saldo do Clube
            </span>
            <span className={`text-xl font-extrabold ${userClub.budget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              €{userClub.budget.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
              Score de Crédito
            </span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {creditScore} / 100
            </span>
          </div>
        </div>

        {/* Formulário de Simulação */}
        <form onSubmit={handleSimulate} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Montante Solicitado (€):
            </label>
            <input
              type="number"
              min="5000"
              step="5000"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full border-2 border-black p-3 font-mono font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full border-2 border-black bg-yellow-400 p-3 font-black uppercase tracking-wide text-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Analisar Risco & Pedir Cotação ao Gestor
          </button>
        </form>

        {/* Cotação Aprovada ou Recusada */}
        {currentQuote && (
          <div className="mt-6 border-4 border-black p-4 dark:border-white font-mono">
            {currentQuote.approvalStatus === 'aprovado' ? (
              <div className="space-y-3">
                <div className="bg-green-100 p-3 text-green-900 border-2 border-green-800 font-bold dark:bg-green-950 dark:text-green-200">
                  ✅ EMPRÉSTIMO PRÉ-APROVADO PELO BANCO
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                  <div>Taxa de Juro:</div>
                  <div>{(currentQuote.interestRate * 100).toFixed(1)}%</div>

                  <div>Prazo de Pagamento:</div>
                  <div>{currentQuote.durationWeeks} Semanas</div>

                  <div>Amortização Semanal:</div>
                  <div className="text-red-600 dark:text-red-400">
                    €{currentQuote.weeklyPayment.toLocaleString()} /semana
                  </div>
                </div>

                <button
                  onClick={handleAcceptLoan}
                  className="w-full border-2 border-black bg-green-500 p-3 font-black uppercase text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Confirmar Contrato & Injetar €{requestedAmount.toLocaleString()} no Clube
                </button>
              </div>
            ) : (
              <div className="bg-red-100 p-4 border-2 border-red-800 text-red-900 font-bold dark:bg-red-950 dark:text-red-200 text-xs">
                ❌ EMPRÉSTIMO RECUSADO: {currentQuote.rejectionReason}
              </div>
            )}
          </div>
        )}

        {feedbackMessage && (
          <div className="mt-4 border-2 border-black bg-blue-100 p-3 text-center font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:border-white font-mono text-xs">
            📢 {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
};
