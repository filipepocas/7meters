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
      {/* Cabeçalho Moderno */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              🏆 Classificação do Campeonato
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Regulamento Oficial: Vitória = 3 pts · Empate = 2 pts · Derrota = 1 pt. Desempate: Pontos › Diferença de Golos.
            </p>
          </div>

          {/* Seletores de Divisão e Grupo */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="Andebol 1 (Divisão de Honra)">Andebol 1 (Divisão de Honra)</option>
              <option value="Andebol 2 (Divisão Nacional)">Andebol 2 (Divisão Nacional)</option>
              <option value="Andebol 3 (Divisão Regional)">Andebol 3 (Divisão Regional)</option>
            </select>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="Série Norte">Série Norte</option>
              <option value="Série Centro">Série Centro</option>
              <option value="Série Sul">Série Sul</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Sofascore / Modern Sports Style */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-6 backdrop-blur shadow-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-8 sm:w-12">#</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4">Clube</th>
                <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center">J</th>
                <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center text-emerald-400">V</th>
                <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center text-amber-400">E</th>
                <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center text-rose-400">D</th>
                <th className="hidden sm:table-cell py-2.5 sm:py-3 px-2 sm:px-3 text-center">GM</th>
                <th className="hidden sm:table-cell py-2.5 sm:py-3 px-2 sm:px-3 text-center">GS</th>
                <th className="hidden xs:table-cell py-2.5 sm:py-3 px-1.5 sm:px-3 text-center">DG</th>
                <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-center font-bold text-white bg-zinc-800/40 rounded-t-xl">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs sm:text-sm">
              {sortedStandings.map((row, index) => {
                const isUserClub = userClub && row.clubId === userClub.id;
                const isChampionZone = index === 0;
                const isEuropeanZone = index >= 1 && index <= 2;
                const isRelegationZone = index >= sortedStandings.length - 2;

                return (
                  <tr
                    key={row.clubId}
                    className={`transition-colors font-medium ${
                      isUserClub
                        ? 'bg-amber-500/10 hover:bg-amber-500/15'
                        : 'hover:bg-zinc-800/40 text-zinc-300'
                    }`}
                  >
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <span
                          className={`w-1 h-4 sm:h-5 rounded-full ${
                            isChampionZone
                              ? 'bg-amber-400'
                              : isEuropeanZone
                              ? 'bg-blue-400'
                              : isRelegationZone
                              ? 'bg-rose-500'
                              : 'bg-transparent'
                          }`}
                        />
                        <span className={`font-mono text-[11px] sm:text-xs tabular-nums ${isChampionZone ? 'text-amber-400 font-bold' : ''}`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 max-w-[140px] sm:max-w-none">
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <span className={`truncate font-semibold ${isUserClub ? 'text-white font-bold' : 'text-zinc-200'}`}>
                          {row.clubName}
                        </span>
                        {isUserClub && (
                          <span className="hidden sm:inline-block shrink-0 rounded-md bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                            A Tua Equipa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-zinc-400">{row.played}</td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-emerald-400 font-semibold">{row.won}</td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-amber-400">{row.drawn}</td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-rose-400">{row.lost}</td>
                    <td className="hidden sm:table-cell py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-zinc-400">{row.goalsFor}</td>
                    <td className="hidden sm:table-cell py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums text-zinc-400">{row.goalsAgainst}</td>
                    <td className="hidden xs:table-cell py-2.5 sm:py-3 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs tabular-nums font-semibold">
                      <span className={row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-400' : 'text-zinc-400'}>
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2.5 sm:px-4 text-center font-mono text-sm sm:text-base font-bold text-white bg-zinc-800/30 tabular-nums">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legenda de Zonas Sofisticada */}
        <div className="mt-6 flex flex-wrap gap-6 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>1º Lugar: Campeão Nacional & EHF Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>2º-3º: EHF European League</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Últimos 2: Zona de Despromoção</span>
          </div>
        </div>
      </div>
    </div>
  );
};
