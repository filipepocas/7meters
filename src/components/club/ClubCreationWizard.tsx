/**
 * 7meters - Club Creation Wizard (Construção da Equipa de Raiz)
 * Wizard em 6 passos para criar um clube do zero:
 * 1. Nome, Sigla e Cidade
 * 2. Camisola e Cores (1000 combinações possíveis)
 * 3. Escolha do Pavilhão (1000 imagens e opções com diferentes custos e capacidades)
 * 4. Contratação de Staff Completo (Treinador, Fisio, Guarda-Roupa, Administrativo, Diretor)
 * 5. Contratação do Plantel Inicial (16 jogadores)
 * 6. Inscrição em Grupo/Divisão e Orçamento Inicial (1.500.000 €)
 */

import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Club } from '../../types/club.types';
import { Player } from '../../types/player.types';
import { StaffMember } from '../../types/staff.types';
import { getArenaById, searchArenasCatalog, DetailedArena } from '../../utils/generators/arenaGen';
import { getJerseyById, COLOR_PALETTE, PATTERNS } from '../../utils/generators/jerseyGen';
import { generateClubSquad } from '../../utils/generators/playerGen';
import { generateClubStaff } from '../../utils/generators/staffGen';
import { generateLeagueCalendar } from '../../engine/calendarEngine';
import { generateClubProfile } from '../../utils/generators/clubGen';
import { JerseyVisual } from '../common/JerseyVisual';
import { GAME_CONFIG } from '../../core/constants';
import confetti from 'canvas-confetti';

interface ClubCreationWizardProps {
  onComplete: () => void;
}

export const ClubCreationWizard: React.FC<ClubCreationWizardProps> = ({ onComplete }) => {
  const { setUserClub, setUserSquad, setUserStaff, setLeagueCalendar } = useGameStore();

  const [step, setStep] = useState<number>(1);

  // Passo 1: Identidade
  const [clubName, setClubName] = useState<string>('Lousada Andebol Clube');
  const [shortName, setShortName] = useState<string>('LAC');
  const [city, setCity] = useState<string>('Lousada');

  // Passo 2: Camisola (1000 opções)
  const [jerseyId, setJerseyId] = useState<number>(7);
  const [primaryColor, setPrimaryColor] = useState<string>('#003399');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FFCC00');
  const [patternType, setPatternType] = useState<typeof PATTERNS[number]>('stripes_vertical');

  // Passo 3: Pavilhão (1000 opções)
  const [arenaSearch, setArenaSearch] = useState<string>('');
  const [selectedArenaId, setSelectedArenaId] = useState<number>(12);
  const selectedArena = getArenaById(selectedArenaId);

  // Passo 4: Staff
  const [staffQualityTier, setStaffQualityTier] = useState<number>(6);
  const [previewStaff, setPreviewStaff] = useState<StaffMember[]>(() =>
    generateClubStaff('temp_club_id', 6)
  );

  // Passo 5: Plantel
  const [squadQualityTier, setSquadQualityTier] = useState<number>(6);
  const [previewSquad, setPreviewSquad] = useState<Player[]>(() =>
    generateClubSquad('temp_club_id', 6)
  );

  // Passo 6: Grupo / Divisão & Orçamento
  const [division, setDivision] = useState<string>('Andebol 1 (Divisão de Honra)');
  const [group, setGroup] = useState<string>('Série Norte');
  const [startingBudget, setStartingBudget] = useState<number>(GAME_CONFIG.INITIAL_BUDGET);

  // Atualizar preview staff quando muda o tier
  const handleStaffTierChange = (tier: number) => {
    setStaffQualityTier(tier);
    setPreviewStaff(generateClubStaff('temp_club_id', tier));
  };

  // Atualizar preview squad quando muda o tier
  const handleSquadTierChange = (tier: number) => {
    setSquadQualityTier(tier);
    setPreviewSquad(generateClubSquad('temp_club_id', tier));
  };

  // Finalizar e criar o clube
  const handleFinish = () => {
    const clubId = `clb_${Date.now()}_${shortName.toLowerCase()}`;

    const finalJersey = {
      id: jerseyId,
      primaryColor,
      secondaryColor,
      patternType,
      chestSponsorName: '7METERS',
    };

    const finalClub: Club = {
      id: clubId,
      name: clubName.trim(),
      shortName: shortName.trim().toUpperCase(),
      city: city.trim(),
      foundationYear: new Date().getFullYear(),
      level: division,
      budget: startingBudget,
      fanbase: Math.round(selectedArena.capacity * 0.7),
      reputation: 60,
      stadiumCapacity: selectedArena.capacity,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
      },
      arena: {
        name: selectedArena.name,
        capacity: selectedArena.capacity,
        ticketPrice: selectedArena.ticketPrice,
        condition: 100,
        imagePath: selectedArena.imagePath,
        rentalOrMaintenanceCost: selectedArena.rentalOrMaintenanceCost,
        energyEfficiencyRating: selectedArena.energyEfficiencyRating,
        prestigeBonus: selectedArena.prestigeBonus,
      },
      sponsors: {
        main: null,
        secondary: [],
      },
      squadIds: previewSquad.map((p) => p.id),
      staffIds: previewStaff.map((s) => s.id),
    };

    const assignedSquad = previewSquad.map((p) => ({
      ...p,
      currentClubId: clubId,
      clubId,
      isHired: true,
    }));

    const assignedStaff = previewStaff.map((s) => ({
      ...s,
      currentClubId: clubId,
      isHired: true,
    }));

    // Adversários da divisão
    const opponentClubs = [
      generateClubProfile('FC Porto Andebol', division, 350000, 101),
      generateClubProfile('Sporting CP Andebol', division, 340000, 202),
      generateClubProfile('SL Benfica Andebol', division, 330000, 303),
      generateClubProfile('ABC de Braga', division, 180000, 404),
      generateClubProfile('Águas Santas Milaneza', division, 140000, 505),
      generateClubProfile('Belenenses Andebol', division, 130000, 606),
      generateClubProfile('Marítimo Madeira', division, 120000, 707),
    ];

    const allLeagueClubs = [finalClub, ...opponentClubs];
    const calendar = generateLeagueCalendar('liga_andebol_1', allLeagueClubs, 1, 1);

    setUserClub(finalClub);
    setUserSquad(assignedSquad);
    setUserStaff(assignedStaff);
    setLeagueCalendar(calendar);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    onComplete();
  };

  const arenasList = searchArenasCatalog(arenaSearch, 'TODOS', 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-8 border-4 border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(250,204,21,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
        
        {/* Cabeçalho do Wizard */}
        <div className="border-b-4 border-black pb-4 mb-6 dark:border-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <span className="border-2 border-black bg-yellow-400 px-2 py-0.5 font-mono text-xs font-black uppercase text-black">
                7meters • Criação de Clube de Raiz
              </span>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">
                Passo {step} de 6: {
                  step === 1 && 'Identidade do Emblema'
                }{
                  step === 2 && 'Camisola & Cores (1000 Opções)'
                }{
                  step === 3 && 'Escolha do Pavilhão (1000 Arenas)'
                }{
                  step === 4 && 'Contratação da Equipa Técnica (Staff)'
                }{
                  step === 5 && 'Contratação do Plantel de Jogadores'
                }{
                  step === 6 && 'Inscrição na Divisão & Orçamento'
                }
              </h2>
            </div>

            {/* Marcadores de passos */}
            <div className="flex gap-1.5 font-mono font-black">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 flex items-center justify-center border-2 border-black ${
                    step === num
                      ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : step > num
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PASSO 1: Identidade */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Batiza o teu clube de andebol. O nome aparecerá nos boletins de jogo oficiais da Federação, nos bilhetes e no marcador do pavilhão.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase mb-1">
                  Nome Completo do Clube:
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                  placeholder="Ex: Lousada Andebol Clube"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Sigla (3 letras):
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  className="w-full border-2 border-black p-3 font-mono font-bold text-center uppercase dark:border-white dark:bg-zinc-800 dark:text-white"
                  placeholder="LAC"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-black uppercase mb-1">
                  Cidade Sede:
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                  placeholder="Ex: Lousada, Porto, Braga, Lisboa, Funchal..."
                />
              </div>
            </div>

            <div className="border-4 border-black bg-yellow-100 p-4 dark:border-white dark:bg-yellow-950 font-mono text-xs font-bold">
              💡 DICA DO DIRETOR: Começas com o prestígio neutro e o estatuto de fundador. Os teus adeptos e a massa associativa crescerão com as vitórias no pavilhão!
            </div>
          </div>
        )}

        {/* PASSO 2: Camisola & Cores (1000 Combinações) */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Escolhe a camisola e as cores oficiais. Tens 1000 combinações possíveis de equipamentos com cortes desportivos, riscas e golas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Pré-visualização do Equipamento */}
              <div className="flex flex-col items-center justify-center border-4 border-black bg-zinc-100 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-800">
                <JerseyVisual
                  jersey={{
                    id: jerseyId,
                    primaryColor,
                    secondaryColor,
                    patternType,
                    chestSponsorName: '7METERS',
                  }}
                  size="xl"
                />
                <div className="mt-4 font-mono text-center">
                  <span className="border border-black bg-black text-white px-2 py-0.5 text-xs font-black uppercase">
                    Modelo #{jerseyId}
                  </span>
                  <div className="mt-1 font-black text-sm uppercase">{clubName}</div>
                </div>
              </div>

              {/* Controlos de Personalização */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Selecionador do Catálogo de 1000 Camisolas (ID 1-1000):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min={1}
                      max={1000}
                      value={jerseyId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setJerseyId(id);
                        const j = getJerseyById(id);
                        setPrimaryColor(j.primaryColor);
                        setSecondaryColor(j.secondaryColor);
                        setPatternType(j.patternType);
                      }}
                      className="w-full accent-yellow-400"
                    />
                    <span className="border-2 border-black px-3 py-1 font-mono font-black text-sm dark:border-white">
                      #{jerseyId}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Cor Principal:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setPrimaryColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 border-2 border-black ${primaryColor === c.hex ? 'ring-4 ring-yellow-400' : ''}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Cor Secundária:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSecondaryColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 border-2 border-black ${secondaryColor === c.hex ? 'ring-4 ring-yellow-400' : ''}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Padrão Têxtil:
                  </label>
                  <select
                    value={patternType}
                    onChange={(e) => setPatternType(e.target.value as typeof PATTERNS[number])}
                    className="w-full border-2 border-black p-2.5 font-mono text-sm font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="solid">Liso / Clássico</option>
                    <option value="stripes_vertical">Riscas Verticais Tradicionais</option>
                    <option value="stripes_horizontal">Riscas Horizontais</option>
                    <option value="diagonal">Faixa Diagonal Desportiva</option>
                    <option value="modern_abstract">Moderno Abstrato / Geométrico</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3: Escolha do Pavilhão (1000 Arenas) */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                O pavilhão da equipa da casa é o palco dos teus jogos e fonte das tuas receitas de bilheteira!
                Cada pavilhão possui foto interior de alta definição, capacidade e custos próprios.
              </p>

              {/* Pavilhão Atualmente Selecionado */}
              <div className="mt-4 border-4 border-black bg-zinc-900 text-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="relative h-44 overflow-hidden border-2 border-white">
                    <img
                      src={selectedArena.imagePath}
                      alt={selectedArena.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-0.5 text-xs font-black uppercase font-mono">
                      {selectedArena.tier}
                    </span>
                  </div>

                  <div className="md:col-span-2 space-y-2 font-mono">
                    <span className="text-xs text-yellow-400 font-bold uppercase">PAVILHÃO SELECIONADO:</span>
                    <h3 className="text-2xl font-black uppercase text-white">{selectedArena.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Lotação: <strong>{selectedArena.capacity.toLocaleString()} lugares</strong></div>
                      <div>Preço Bilhete: <strong>€{selectedArena.ticketPrice.toFixed(2)}</strong></div>
                      <div>Custo Manutenção: <strong>€{(selectedArena.rentalOrMaintenanceCost || 1200).toLocaleString()}/mês</strong></div>
                      <div>Bónus de Prestígio: <strong>⭐ {selectedArena.prestigeBonus}/10</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Pesquisa de Arenas no Catálogo */}
            <div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Pesquisar entre os 1000 pavilhões (ex: Dragão, Luz, Braga, Municipal...)"
                  value={arenaSearch}
                  onChange={(e) => setArenaSearch(e.target.value)}
                  className="flex-1 border-2 border-black p-2.5 font-mono text-sm font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setSelectedArenaId(Math.floor(1 + Math.random() * 999))}
                  className="border-2 border-black bg-yellow-400 px-4 py-2 font-mono text-xs font-black uppercase text-black hover:bg-yellow-300"
                >
                  🎲 Pavilhão Aleatório
                </button>
              </div>

              {/* Grelha de Pavilhões do Catálogo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                {arenasList.map((arena) => (
                  <div
                    key={arena.idNumber}
                    onClick={() => setSelectedArenaId(arena.idNumber)}
                    className={`cursor-pointer border-2 p-2 transition-all ${
                      selectedArenaId === arena.idNumber
                        ? 'border-yellow-400 bg-yellow-100 ring-2 ring-yellow-400 dark:bg-yellow-950 dark:border-yellow-400'
                        : 'border-black bg-zinc-50 hover:bg-zinc-100 dark:border-white dark:bg-zinc-800'
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden mb-1.5 border border-black">
                      <img src={arena.imagePath} alt={arena.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] font-black uppercase truncate">{arena.name}</div>
                    <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      Cap: {arena.capacity.toLocaleString()} | €{arena.ticketPrice}/jog
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: Contratação de Staff */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                  Um grande clube de andebol precisa de uma equipa técnica sólida.
                  Contrata o Treinador Principal, Fisioterapeuta, Guarda-Roupa, Administrativo e Diretor Desportivo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase">Qualidade:</span>
                {[4, 6, 8].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleStaffTierChange(tier)}
                    className={`border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase ${
                      staffQualityTier === tier ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  >
                    Tier {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {previewStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="border-2 border-black bg-zinc-50 p-3 font-mono text-xs dark:border-white dark:bg-zinc-800"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-black uppercase">
                      {staff.role}
                    </span>
                    <span className="font-black text-blue-600 dark:text-blue-400">
                      OVR {staff.qualityRating}/10
                    </span>
                  </div>
                  <div className="text-sm font-black uppercase">{staff.name}</div>
                  <div className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Salário: €{staff.salary.toLocaleString()}/mês | Idade: {staff.age} anos | {staff.country}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 5: Contratação do Plantel */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                  O teu plantel inicial é composto por 16 atletas profissionais (2 Guarda-Redes, 4 Pontas, 5 Laterais, 2 Centrais e 2 Pivôs).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase">Nível:</span>
                {[5, 6, 7].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleSquadTierChange(tier)}
                    className={`border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase ${
                      squadQualityTier === tier ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  >
                    Tier {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-black bg-zinc-50 p-3 max-h-72 overflow-y-auto space-y-2 dark:border-white dark:bg-zinc-800">
              {previewSquad.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between border-b border-zinc-200 py-1.5 font-mono text-xs dark:border-zinc-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                      {player.position}
                    </span>
                    <span className="font-bold">{player.name}</span>
                    <span className="text-zinc-400">({player.age} anos)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>Rem: {player.shooting} | Def: {player.defense} | GR: {player.goalkeeping}</span>
                    <span className="font-black text-green-600 dark:text-green-400">
                      OVR {player.overallRating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 6: Inscrição na Divisão & Orçamento */}
        {step === 6 && (
          <div className="space-y-6">
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Escolhe em que divisão e grupo queres inscrever o teu clube. Conforme os resultados obtidos, a tua equipa subirá ou descerá de divisão ao fim da época!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Divisão de Campeonato:
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                >
                  <option value="Andebol 1 (Divisão de Honra)">Andebol 1 (Divisão de Honra - Elite)</option>
                  <option value="Andebol 2 (Divisão Nacional)">Andebol 2 (Divisão Nacional)</option>
                  <option value="Andebol 3 (Divisão Regional)">Andebol 3 (Divisão Regional de Acesso)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Série / Grupo Geográfico:
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full border-2 border-black p-3 font-mono font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                >
                  <option value="Série Norte">Série Norte (Porto, Braga, Minho, Lousada)</option>
                  <option value="Série Centro">Série Centro (Coimbra, Aveiro, Leiria, Viseu)</option>
                  <option value="Série Sul">Série Sul (Lisboa, Setúbal, Alentejo, Algarve, Ilhas)</option>
                </select>
              </div>
            </div>

            {/* Orçamento Inicial */}
            <div className="border-4 border-black bg-yellow-300 p-6 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="font-mono text-xs font-black uppercase">Orçamento Base Disponível</span>
                  <div className="text-4xl font-black font-mono mt-1">
                    €{startingBudget.toLocaleString()}
                  </div>
                  <p className="text-xs font-bold mt-1">
                    Orçamento inicial padrão atribuído a todos os clubes fundadores. Podes simular injeções de capital financeiro extra a qualquer momento.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStartingBudget((prev) => prev + 500000)}
                    className="border-2 border-black bg-white px-4 py-2 font-mono text-xs font-black uppercase hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    + €500k Extra
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegação entre Passos */}
        <div className="mt-8 flex justify-between border-t-4 border-black pt-4 dark:border-white">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            className="border-2 border-black bg-zinc-200 px-6 py-2.5 font-black uppercase text-black hover:bg-zinc-300 disabled:opacity-30 dark:bg-zinc-800 dark:text-white dark:border-white"
          >
            ← Voltar
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(6, prev + 1))}
              className="border-2 border-black bg-yellow-400 px-8 py-2.5 font-black uppercase text-black hover:bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Seguinte →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="border-4 border-black bg-green-500 px-10 py-3 font-black uppercase text-white hover:bg-green-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg transition-all animate-pulse"
            >
              🤾 Fundar Clube e Começar a Época!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
