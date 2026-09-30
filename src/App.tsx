/**
 * 7meters - Application Entry Point
 * Ponto de entrada principal com inicialização do clube de demonstração,
 * plantel e calendário de competição.
 */

import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { useGameStore } from './store/useGameStore';
import { generateClubProfile } from './utils/generators/clubGen';
import { generateSquad } from './utils/generators/squadGen';
import { generateClubStaff } from './utils/generators/staffGen';
import { generateLeagueCalendar } from './engine/calendarEngine';

export const App: React.FC = () => {
  const { userClub, setUserClub, setUserSquad, setUserStaff, setLeagueCalendar } = useGameStore();

  useEffect(() => {
    // Se ainda não existir clube em cache no navegador, inicializar clube fundador padrão
    if (!userClub) {
      const demoClub = generateClubProfile('Lousada Andebol Clube', 'Andebol 1 (Divisão de Honra)', 1500000, 12);
      const demoSquad = generateSquad(demoClub.id, 16, 6);
      const demoStaff = generateClubStaff(demoClub.id, 6);

      const opponentClubs = [
        generateClubProfile('FC Porto Andebol', 'Andebol 1 (Divisão de Honra)', 350000, 101),
        generateClubProfile('Sporting CP Andebol', 'Andebol 1 (Divisão de Honra)', 340000, 202),
        generateClubProfile('SL Benfica Andebol', 'Andebol 1 (Divisão de Honra)', 330000, 303),
        generateClubProfile('ABC de Braga', 'Andebol 1 (Divisão de Honra)', 180000, 404),
        generateClubProfile('Águas Santas Milaneza', 'Andebol 1 (Divisão de Honra)', 140000, 505),
        generateClubProfile('Belenenses Andebol', 'Andebol 1 (Divisão de Honra)', 130000, 606),
        generateClubProfile('Marítimo Madeira', 'Andebol 1 (Divisão de Honra)', 120000, 707),
      ];

      const allLeagueClubs = [demoClub, ...opponentClubs];
      const calendar = generateLeagueCalendar('liga_andebol_1', allLeagueClubs, 1, 1);

      setUserClub(demoClub);
      setUserSquad(demoSquad);
      setUserStaff(demoStaff);
      setLeagueCalendar(calendar);
    }
  }, [userClub, setUserClub, setUserSquad, setUserStaff, setLeagueCalendar]);

  return (
    <main className="min-h-screen bg-zinc-100 font-sans text-black dark:bg-zinc-950 dark:text-white">
      <Dashboard />
    </main>
  );
};

export default App;
