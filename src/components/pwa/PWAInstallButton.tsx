/**
 * 7meters - In-App PWA Install Button
 * Botão brutalista para instalar a aplicação diretamente no dispositivo.
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 border-2 border-black bg-yellow-400 px-3 py-1.5 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        title="Instalar 7meters como App no telemóvel/PC"
      >
        <span className="text-sm">📲</span>
        Instalar PWA
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98]"
        >
          <span>🍎</span>
          <span>Instalar no iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Instalar no iPhone / iPad</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                1. Toca no botão de <strong>Partilhar</strong> (ícone de quadrado com seta) na barra do Safari.<br />
                2. Desce e seleciona <strong>"Adicionar ao Ecrã Principal"</strong>.<br />
                3. Abre o <strong>7meters</strong> como app a partir do teu ecrã!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-amber-500 py-2.5 font-bold text-xs text-zinc-950 hover:bg-amber-400"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => alert('O 7meters está pronto para instalação PWA. No teu browser (Chrome, Edge ou Safari), clica no ícone de instalar na barra de endereço ou "Adicionar ao Ecrã Principal".')}
      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all active:scale-[0.98]"
    >
      <span>📱</span>
      <span>Instalar App</span>
    </button>
  );
};
