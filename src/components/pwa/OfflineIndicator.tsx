import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 border-2 border-black bg-amber-400 px-3 py-1.5 font-mono text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
      Modo Offline — A utilizar dados locais do 7meters
    </div>
  );
};
