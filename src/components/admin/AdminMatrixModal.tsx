/**
 * 7meters - Admin Matrix & Dynamic Rules Modal
 * Painel Exclusivo de Administrador: rochap.filipe@gmail.com
 * Permite calibrar coeficientes do motor de jogo, injetar fundos,
 * ativar eventos dinâmicos estocásticos e inspecionar o ecossistema.
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { DynamicGameEvent } from '../../types/admin.types';

interface AdminMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMatrixModal: React.FC<AdminMatrixModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    adminRules,
    updateAdminRule,
    injectAdminFunds,
    triggerDynamicEvent,
    resetGameUniverse,
    userClub,
  } = useGameStore();

  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!currentUser?.isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <div className="max-w-md rounded-3xl border border-red-500/40 bg-zinc-900 p-6 text-center space-y-3 shadow-2xl">
          <div className="text-3xl">⛔</div>
          <h2 className="text-xl font-bold uppercase text-red-500 tracking-tight">Acesso Restrito</h2>
          <p className="text-xs text-zinc-400">
            Apenas o administrador do sistema (rochap.filipe@gmail.com) tem permissão para aceder à Matriz Central de Regras.
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const sampleEvents: DynamicGameEvent[] = [
    {
      id: 'evt_sponsor_bonus',
      type: 'off_match',
      title: 'Injeção de Capital de Patrocinador Local',
      descriptionText: 'Um grupo empresarial da região ofereceu 100.000 € à equipa de andebol.',
      probabilityChance: 10,
      targetType: 'club',
      impacts: {
        financialCostEuro: 100000,
        moralChange: 2,
      },
    },
    {
      id: 'evt_flu_outbreak',
      type: 'off_match',
      title: 'Surto de Gripe no Balneário',
      descriptionText: 'Vários atletas afetados por cansaço e quebra de energia.',
      probabilityChance: 15,
      targetType: 'player',
      impacts: {
        moralChange: -1,
      },
    },
    {
      id: 'evt_arena_sponsor',
      type: 'off_match',
      title: 'Contrato de Naming do Pavilhão',
      descriptionText: 'Acordo comercial que rende 250.000 € aos cofres do clube.',
      probabilityChance: 5,
      targetType: 'club',
      impacts: {
        financialCostEuro: 250000,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
                👑 Painel Mestre Admin
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
              Matriz Central de Regras & Variáveis de Simulação
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Administrador: {currentUser.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700"
          >
            ✕
          </button>
        </div>

        {feedback && (
          <div className="my-4 border-2 border-green-400 bg-green-950 p-3 font-mono text-xs font-bold text-green-300">
            ⚡ {feedback}
          </div>
        )}

        {/* Secção 1: Injeção de Liquidez de Teste */}
        <div className="my-6 border-2 border-zinc-700 bg-black p-4">
          <h3 className="text-lg font-black uppercase text-yellow-400 mb-2">
            💰 Injeção de Tesouraria no Clube Ativo ({userClub?.name || 'Nenhum'})
          </h3>
          <p className="text-xs text-zinc-400 font-mono mb-4">
            Saldo atual: €{(userClub?.budget || 0).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                injectAdminFunds(100000);
                setFeedback('Injetados +100.000 € no saldo do clube!');
              }}
              className="border-2 border-yellow-400 bg-yellow-400 px-4 py-2 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300"
            >
              + €100.000
            </button>
            <button
              onClick={() => {
                injectAdminFunds(500000);
                setFeedback('Injetados +500.000 € no saldo do clube!');
              }}
              className="border-2 border-yellow-400 bg-yellow-400 px-4 py-2 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300"
            >
              + €500.000
            </button>
            <button
              onClick={() => {
                injectAdminFunds(1000000);
                setFeedback('Injetados +1.000.000 € no saldo do clube!');
              }}
              className="border-2 border-yellow-400 bg-yellow-400 px-4 py-2 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300"
            >
              + €1.000.000
            </button>
          </div>
        </div>

        {/* Secção 2: Matriz de Coeficientes do Motor */}
        <div className="my-6 space-y-4">
          <h3 className="text-lg font-black uppercase text-yellow-400 border-b-2 border-zinc-700 pb-2">
            ⚙️ Coeficientes da Matriz Dinâmica de Andebol
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminRules.map((rule) => (
              <div key={rule.id} className="border-2 border-zinc-700 bg-zinc-800 p-4 font-mono">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-black text-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase">
                    {rule.category}
                  </span>
                  <span className="text-sm font-black text-white">
                    Coef: {rule.coefficientValue}
                  </span>
                </div>

                <h4 className="font-black text-sm uppercase mb-1">{rule.title}</h4>
                <p className="text-xs text-zinc-400 mb-3">{rule.description}</p>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={rule.minLimit}
                    max={rule.maxLimit}
                    step="0.01"
                    value={rule.coefficientValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateAdminRule(rule.id, val);
                      setFeedback(`Regra '${rule.title}' atualizada para ${val}!`);
                    }}
                    className="w-full accent-yellow-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secção 3: Ativação Manual de Eventos Estocásticos */}
        <div className="my-6 border-2 border-zinc-700 bg-black p-4">
          <h3 className="text-lg font-black uppercase text-yellow-400 mb-2">
            🎲 Disparo de Eventos Dinâmicos Forçados
          </h3>
          <p className="text-xs text-zinc-400 font-mono mb-4">
            Testa a resposta do ecossistema a acontecimentos dentro e fora de campo:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => {
                  triggerDynamicEvent(evt);
                  setFeedback(`Evento acionado: "${evt.title}"`);
                }}
                className="border-2 border-zinc-600 bg-zinc-800 p-3 text-left hover:border-yellow-400 transition-all font-mono"
              >
                <div className="text-xs font-black uppercase text-yellow-400">{evt.title}</div>
                <div className="text-[11px] text-zinc-300 mt-1">{evt.descriptionText}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Secção 4: Reinicialização */}
        <div className="mt-8 border-t-2 border-red-700 pt-4 flex justify-between items-center">
          <div>
            <span className="font-mono text-xs text-red-400 font-black uppercase">
              Zona de Perigo
            </span>
            <p className="text-xs text-zinc-400">
              Reiniciar o clube e construir novo clube de raiz.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Tens a certeza de que queres reiniciar o teu clube?')) {
                resetGameUniverse();
                onClose();
              }
            }}
            className="border-2 border-red-600 bg-red-600 px-4 py-2 font-mono text-xs font-black uppercase text-white hover:bg-red-700"
          >
            Reiniciar Clube de Raiz
          </button>
        </div>
      </div>
    </div>
  );
};
