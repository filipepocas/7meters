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
          className="flex items-center gap-2 border-2 border-black bg-yellow-400 px-3 py-1.5 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <span className="text-sm">🍎</span>
          Instalar no iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
              <h3 className="text-lg font-black uppercase">Instalar no iPhone / iPad</h3>
              <p className="mt-3 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                1. Toca no botão de <strong>Partilhar</strong> (ícone de quadrado com seta) na barra do Safari.<br />
                2. Desce e seleciona <strong>"Adicionar ao Ecrã Principal"</strong>.<br />
                3. Abre o <strong>7meters</strong> como app a partir do teu ecrã!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full border-2 border-black bg-black py-2 font-black uppercase text-white hover:bg-zinc-800"
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
      className="flex items-center gap-2 border-2 border-black bg-zinc-100 px-3 py-1.5 font-mono text-xs font-black uppercase text-black hover:bg-zinc-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-800 dark:text-white dark:border-white"
    >
      <span>📱</span>
      PWA App
    </button>
  );
};
