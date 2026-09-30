/**
 * 7meters - League Standings Component
 * Tabela classificativa detalhada da Liga e Séries de Andebol.
 * - Pontuação Oficial: Vitória (3 pts), Empate (2 pts), Derrota (1 pt)
 * - Critérios de Desempate: Pontos > Diferença de Golos > Golos Marcados
 * - Zonas de Subida / Play-offs / Despromoção entre divisões
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Club } from '../../types/club.types';
import { MatchResult } from '../../types/match.types';

export interface StandingRow {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface LeagueStandingsProps {
  completedMatches?: MatchResult[];
  clubs?: Club[];
}

export const LeagueStandings: React.FC<LeagueStandingsProps> = ({ completedMatches = [], clubs = [] }) => {
  const { userClub, currentDivision, currentGroup } = useGameStore();

  const [selectedDivision, setSelectedDivision] = useState<string>(currentDivision || 'Andebol 1 (Divisão de Honra)');
  const [selectedGroup, setSelectedGroup] = useState<string>(currentGroup || 'Série Norte');

  const defaultClubs: Club[] = clubs.length > 0 ? clubs : userClub ? [
    userClub,
    { id: 'fcp', name: 'FC Porto Andebol', shortName: 'FCP', level: 'Andebol 1 (Divisão de Honra)', budget: 350000, fanbase: 25000, stadiumCapacity: 2179, reputation: 90, arena: { name: 'Dragão Arena', capacity: 2179, ticketPrice: 15, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'scp', name: 'Sporting CP Andebol', shortName: 'SCP', level: 'Andebol 1 (Divisão de Honra)', budget: 340000, fanbase: 24000, stadiumCapacity: 3000, reputation: 90, arena: { name: 'Pavilhão João Rocha', capacity: 3000, ticketPrice: 15, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'slb', name: 'SL Benfica Andebol', shortName: 'SLB', level: 'Andebol 1 (Divisão de Honra)', budget: 330000, fanbase: 26000, stadiumCapacity: 2500, reputation: 90, arena: { name: 'Pavilhão da Luz', capacity: 2500, ticketPrice: 15, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'abc', name: 'ABC de Braga', shortName: 'ABC', level: 'Andebol 1 (Divisão de Honra)', budget: 180000, fanbase: 8000, stadiumCapacity: 2500, reputation: 70, arena: { name: 'Flávio Sá Leite', capacity: 2500, ticketPrice: 12, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'aas', name: 'Águas Santas Milaneza', shortName: 'AAS', level: 'Andebol 1 (Divisão de Honra)', budget: 140000, fanbase: 5000, stadiumCapacity: 1500, reputation: 65, arena: { name: 'Pavilhão Águas Santas', capacity: 1500, ticketPrice: 10, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'cfb', name: 'Belenenses Andebol', shortName: 'CFB', level: 'Andebol 1 (Divisão de Honra)', budget: 130000, fanbase: 4000, stadiumCapacity: 1683, reputation: 60, arena: { name: 'Acácio Rosa', capacity: 1683, ticketPrice: 10, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
    { id: 'csm', name: 'Marítimo Madeira', shortName: 'CSM', level: 'Andebol 1 (Divisão de Honra)', budget: 120000, fanbase: 3500, stadiumCapacity: 1200, reputation: 55, arena: { name: 'Pavilhão Marítimo', capacity: 1200, ticketPrice: 10, condition: 100 }, sponsors: { main: null, secondary: [] }, squadIds: [], staffIds: [] },
  ] : [];

  const standingsMap: Record<string, StandingRow> = {};

  defaultClubs.forEach((club) => {
    standingsMap[club.id] = {
      clubId: club.id,
      clubName: club.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  completedMatches.forEach((match) => {
    const home = standingsMap[match.homeClubId];
    const away = standingsMap[match.awayClubId];

    if (home) {
      home.played += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;

      if (match.homeScore > match.awayScore) {
        home.won += 1;
        home.points += 3;
      } else if (match.homeScore === match.awayScore) {
        home.drawn += 1;
        home.points += 2;
      } else {
        home.lost += 1;
        home.points += 1;
      }
      home.goalDifference = home.goalsFor - home.goalsAgainst;
    }

    if (away) {
      away.played += 1;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.awayScore > match.homeScore) {
        away.won += 1;
        away.points += 3;
      } else if (match.awayScore === match.homeScore) {
        away.drawn += 1;
        away.points += 2;
      } else {
        away.lost += 1;
        away.points += 1;
      }
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    }
  });

  // Ordenação Estrita: 1º Pontos, 2º Diferença de Golos, 3º Golos Marcados
  const sortedStandings = Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wider">
              🏆 Tabela Classificativa da Competição
            </h2>
            <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Regulamento Oficial da Federação: Vitória = 3 pts | Empate = 2 pts | Derrota = 1 pt.
            </p>
          </div>

          {/* Seletores de Divisão e Grupo */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="border-2 border-black p-2 font-mono text-xs font-black uppercase bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="Andebol 1 (Divisão de Honra)">Andebol 1 (Divisão de Honra)</option>
              <option value="Andebol 2 (Divisão Nacional)">Andebol 2 (Divisão Nacional)</option>
              <option value="Andebol 3 (Divisão Regional)">Andebol 3 (Divisão Regional)</option>
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="border-2 border-black p-2 font-mono text-xs font-black uppercase bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="Série Norte">Série Norte</option>
              <option value="Série Centro">Série Centro</option>
              <option value="Série Sul">Série Sul</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Brutalista */}
      <div className="border-4 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto dark:border-white dark:bg-zinc-900 dark:text-white">
        <table className="w-full text-left font-mono border-collapse">
          <thead>
            <tr className="border-b-4 border-black bg-yellow-400 text-black text-xs uppercase font-black">
              <th className="p-3 text-center">Pos</th>
              <th className="p-3">Clube</th>
              <th className="p-3 text-center">J</th>
              <th className="p-3 text-center">V</th>
              <th className="p-3 text-center">E</th>
              <th className="p-3 text-center">D</th>
              <th className="p-3 text-center">GM</th>
              <th className="p-3 text-center">GS</th>
              <th className="p-3 text-center">DG</th>
              <th className="p-3 text-center bg-black text-white dark:bg-white dark:text-black">PTS</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((row, index) => {
              const isUserClub = userClub && row.clubId === userClub.id;
              const isChampionZone = index === 0;
              const isEuropeanZone = index >= 1 && index <= 2;
              const isRelegationZone = index >= sortedStandings.length - 2;

              return (
                <tr
                  key={row.clubId}
                  className={`border-b-2 border-zinc-200 font-bold text-sm ${
                    isUserClub ? 'bg-yellow-100 dark:bg-yellow-950 font-black' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <td className="p-3 text-center font-black">
                    <span className={`inline-block w-6 text-center ${
                      isChampionZone ? 'bg-yellow-400 text-black rounded-none px-1 font-black' : isEuropeanZone ? 'bg-blue-200 text-blue-900 px-1' : isRelegationZone ? 'bg-red-200 text-red-900 px-1' : ''
                    }`}>
                      {index + 1}º
                    </span>
                  </td>
                  <td className="p-3 uppercase">
                    {row.clubName} {isUserClub && '⭐ (O Teu Clube)'}
                  </td>
                  <td className="p-3 text-center">{row.played}</td>
                  <td className="p-3 text-center text-green-600 dark:text-green-400">{row.won}</td>
                  <td className="p-3 text-center text-yellow-600 dark:text-yellow-400">{row.drawn}</td>
                  <td className="p-3 text-center text-red-600 dark:text-red-400">{row.lost}</td>
                  <td className="p-3 text-center">{row.goalsFor}</td>
                  <td className="p-3 text-center">{row.goalsAgainst}</td>
                  <td className="p-3 text-center">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="p-3 text-center font-black bg-zinc-100 text-lg dark:bg-zinc-800">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legenda de Zonas */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono font-bold border-t-2 border-zinc-200 pt-3 dark:border-zinc-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-yellow-400 border border-black inline-block" />
            <span>1º Lugar: Campeão Nacional & EHF Champions League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-blue-300 border border-black inline-block" />
            <span>2º-3º: EHF European League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-300 border border-black inline-block" />
            <span>Últimos 2: Zona de Despromoção de Divisão</span>
          </div>
        </div>
      </div>
    </div>
  );
};
