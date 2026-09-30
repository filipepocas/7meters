/**
 * 7meters - Facilities, Training & Board Confidence Component (Estilo Elifoot)
 * Gestão de:
 * 1. Termómetro da Direção (0 a 100%) e risco de demissão
 * 2. Ciclo Semanal de Treinos (Carga Física, Foco Tático, Guarda-Redes & Finalização, Descanso Total)
 * 3. Expansão de Bancadas do Pavilhão (aumento de lugares e receitas de bilheteira)
 * 4. Escola de Formação / Academia de Juniores
 * 5. Departamento Médico (Relatório de Lesões e Semanas de Paragem)
 */

import React, { useState } from 'react';
import { useGameStore, TrainingFocus } from '../../store/useGameStore';
import { generateRandomPlayer } from '../../utils/generators/playerGen';

export const FacilitiesView: React.FC = () => {
  const {
    userClub,
    userSquad,
    youthAcademy,
    promoteYouthPlayer,
    upgradeArenaCapacity,
    trainingFocus,
    setTrainingFocus,
    boardConfidence,
    fanSatisfaction,
    setUserClub,
    setUserSquad,
  } = useGameStore();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [academyLevel, setAcademyLevel] = useState<number>(2);

  if (!userClub) return null;

  const currentCap = userClub.arena?.capacity || userClub.stadiumCapacity || 2500;

  // Expansão do Pavilhão
  const handleExpandArena = (seats: number, cost: number) => {
    if (userClub.budget < cost) {
      setFeedback(`Saldo insuficiente! Precisas de €${cost.toLocaleString()} para esta expansão.`);
      return;
    }

    const success = upgradeArenaCapacity(seats, cost);
    if (success) {
      setFeedback(`🏗️ Obras concluídas no ${userClub.arena.name}! A lotação aumentou em +${seats.toLocaleString()} lugares.`);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Melhorar Academia de Formação
  const handleUpgradeAcademy = () => {
    const cost = academyLevel * 120000;
    if (userClub.budget < cost) {
      setFeedback(`Saldo insuficiente! Precisas de €${cost.toLocaleString()} para subir o nível da academia.`);
      return;
    }

    setUserClub({
      ...userClub,
      budget: userClub.budget - cost,
    });
    setAcademyLevel((lvl) => lvl + 1);
    setFeedback(`⭐ Escola de Formação melhorada para Nível ${academyLevel + 1}! Os novos jovens juniores terão maior potencial.`);
    setTimeout(() => setFeedback(null), 5000);
  };

  // Atletas Lesionados
  const injuredPlayers = userSquad.filter((p) => p.injury.isInjured);

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Cabeçalho */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-wider">
              🏗️ Finanças, Infraestruturas & Direção (Elifoot)
            </h2>
            <p className="mt-1 text-sm font-bold text-zinc-600 dark:text-zinc-300">
              Gere o clube como uma empresa desportiva: bilheteira, obras no pavilhão, academia e confiança da direção.
            </p>
          </div>

          <div className="border-2 border-black bg-yellow-400 px-4 py-2 font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            💰 Tesouraria: €{userClub.budget.toLocaleString()}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="border-4 border-black bg-yellow-300 p-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚡ {feedback}
        </div>
      )}

      {/* SECÇÃO 1: TERMÓMETRO DA DIREÇÃO & SATISFAÇÃO DOS ADEPTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Termómetro da Direção */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h3 className="text-lg font-black uppercase">
              🏛️ Termómetro da Direção
            </h3>
            <span
              className={`px-2 py-0.5 text-xs font-black ${
                boardConfidence > 60
                  ? 'bg-green-500 text-white'
                  : boardConfidence > 30
                  ? 'bg-amber-400 text-black'
                  : 'bg-red-600 text-white animate-pulse'
              }`}
            >
              {boardConfidence}% CONFIANÇA
            </span>
          </div>

          <div className="h-4 bg-zinc-200 border-2 border-black overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                boardConfidence > 60
                  ? 'bg-green-500'
                  : boardConfidence > 30
                  ? 'bg-amber-400'
                  : 'bg-red-600'
              }`}
              style={{ width: `${boardConfidence}%` }}
            />
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {boardConfidence > 75
              ? 'A presidência do clube está rendida aos teus resultados. O teu lugar está 100% seguro!'
              : boardConfidence > 35
              ? 'A direção mantém a estabilidade, mas exige vitórias nas próximas jornadas para não perder a paciência.'
              : '⚠️ ALERTA MÁXIMO DE DESPEDIMENTO: Se o termómetro descer a 0%, recebes guia de marcha imediata!'}
          </p>
        </div>

        {/* Satisfação dos Adeptos */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-3">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h3 className="text-lg font-black uppercase">
              📣 Apoio da Massa Adepta
            </h3>
            <span className="bg-blue-600 text-white px-2 py-0.5 text-xs font-black">
              {fanSatisfaction}% ENTUSIASMO
            </span>
          </div>

          <div className="h-4 bg-zinc-200 border-2 border-black overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${fanSatisfaction}%` }}
            />
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Adeptos entusiasmados enchem o pavilhão nos jogos em casa, gerando a receita máxima de bilheteira (€{(userClub.arena?.ticketPrice || 12).toFixed(2)} por bilhete).
          </p>
        </div>
      </div>

      {/* SECÇÃO 2: CICLO SEMANAL DE TREINOS (MÓDULO 6.1) */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-4">
        <h3 className="text-xl font-black uppercase border-b-2 border-black pb-2">
          🏋️ O Ciclo Semanal de Treinos (Foco de Trabalho)
        </h3>
        <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
          Antes de avançar para a jornada do fim de semana, define a metodologia de trabalho da semana:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'recuperacao_fisica',
              name: 'Descanso Total',
              icon: '💤',
              bonus: 'Mantém a frescura física e recupera 100% de energia.',
              con: 'Sem evolução técnica durante a semana.',
            },
            {
              id: 'remate_exterior',
              name: 'GR & Finalização',
              icon: '🎯',
              bonus: 'Aumenta percentagem de golo exterior e reflexos de baliza.',
              con: 'Desgaste moderado no ombro dos atiradores.',
            },
            {
              id: 'defesa_coletiva',
              name: 'Foco Tático',
              icon: '🛡️',
              bonus: 'Melhora entrosamento da defesa e eficácia de desarme.',
              con: 'Consumo ligeiro de estamina.',
            },
            {
              id: 'aceleracao_tatica',
              name: 'Carga Física',
              icon: '⚡',
              bonus: 'Aumenta resistência física a longo prazo.',
              con: 'Gasta energia imediata dos atletas antes do jogo.',
            },
          ].map((item) => {
            const isSelected = trainingFocus === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setTrainingFocus(item.id as TrainingFocus);
                  setFeedback(`Foco semanal definido: ${item.name}!`);
                }}
                className={`border-4 border-black p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-black text-sm uppercase">{item.name}</span>
                </div>
                <div className="text-[11px] text-green-700 dark:text-green-300 font-bold">
                  ✅ {item.bonus}
                </div>
                <div className="text-[11px] text-red-700 dark:text-red-300 font-bold mt-1">
                  ⚠️ {item.con}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECÇÃO 3: EXPANSÃO DO PAVILHÃO DA CASA (MÓDULO 5.2) */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b-2 border-black pb-2 gap-2">
          <div>
            <h3 className="text-xl font-black uppercase">
              🏟️ O Pavilhão da Casa & Expansão de Bancadas ({userClub.arena.name})
            </h3>
            <p className="text-xs text-zinc-500 font-bold">
              Vista 3D do ringue de andebol a partir das bancadas com iluminação de jogo e piso oficial.
            </p>
          </div>
          <span className="bg-yellow-400 text-black px-2.5 py-1 text-xs font-black uppercase border border-black">
            Lotação Atual: {currentCap.toLocaleString()} Lugares
          </span>
        </div>

        {/* Galeria 3D AI de Pavilhões de Andebol (Escolha do Ringue e Bancadas) */}
        <div>
          <label className="block text-xs font-black uppercase mb-2 text-zinc-700 dark:text-zinc-300">
            🎨 Escolhe o Visual 3D do teu Pavilhão (Gerado por IA • Vista das Bancadas):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: 'elite',
                title: 'Arena de Elite Europeia',
                subtitle: 'Bancadas elevadas e campo vibrante',
                src: '/src/assets/images/arena_elite_grand_1790774574409.jpg',
              },
              {
                id: 'urban',
                title: 'Pavilhão Contemporâneo',
                subtitle: 'Piso turquesa e balizas oficiais',
                src: '/src/assets/images/arena_urban_modern_1790774588799.jpg',
              },
              {
                id: 'champions',
                title: 'Coliseu dos Campeões',
                subtitle: 'Ecrã 360° e bancadas repletas',
                src: '/src/assets/images/arena_champions_cup_1790774601559.jpg',
              },
              {
                id: 'municipal',
                title: 'Pavilhão Municipal Pro',
                subtitle: 'Iluminação LED e arquibancada',
                src: '/src/assets/images/arena_municipal_pro_1790774613164.jpg',
              },
            ].map((arenaOpt) => {
              const isSelected =
                (userClub.arena?.imagePath || '').includes(arenaOpt.id) ||
                userClub.arena?.imagePath === arenaOpt.src;

              return (
                <div
                  key={arenaOpt.id}
                  onClick={() => {
                    setUserClub({
                      ...userClub,
                      arena: {
                        ...userClub.arena,
                        imagePath: arenaOpt.src,
                      },
                    });
                    setFeedback(`Pavilhão atualizado com o visual 3D: ${arenaOpt.title}!`);
                  }}
                  className={`border-3 cursor-pointer overflow-hidden transition-all ${
                    isSelected
                      ? 'border-yellow-400 ring-2 ring-yellow-400 scale-[1.02]'
                      : 'border-black hover:border-yellow-400 dark:border-white'
                  }`}
                >
                  <div className="relative h-28 w-full bg-zinc-950">
                    <img
                      src={arenaOpt.src}
                      alt={arenaOpt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-yellow-400 text-black px-1.5 py-0.5 text-[9px] font-black uppercase">
                        SELECIONADO
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-left">
                    <div className="text-[11px] font-black uppercase truncate">{arenaOpt.title}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{arenaOpt.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Obras de Expansão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
          <div className="relative h-56 overflow-hidden border-2 border-black bg-zinc-950">
            <img
              src={
                userClub.arena.imagePath && !userClub.arena.imagePath.includes('unsplash')
                  ? userClub.arena.imagePath
                  : '/src/assets/images/arena_elite_grand_1790774574409.jpg'
              }
              alt={userClub.arena.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 bg-black/90 text-yellow-400 px-2 py-0.5 text-xs font-black uppercase border border-yellow-400">
              Lotação: {currentCap.toLocaleString()} Lugares
            </span>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Gastar dinheiro do clube em obras de ampliação aumenta a lotação máxima e as receitas de bilheteira de cada jornada em casa.
              Preço por bilhete: <strong>€{(userClub.arena.ticketPrice || 12).toFixed(2)}</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border-2 border-black p-3 bg-zinc-50 dark:bg-zinc-800 text-center">
                <div className="text-xs font-black uppercase">Bancada Lateral</div>
                <div className="text-base font-black text-green-600">+500 Lugares</div>
                <div className="text-xs text-zinc-500 my-1">Custo: €75.000</div>
                <button
                  onClick={() => handleExpandArena(500, 75000)}
                  className="w-full border-2 border-black bg-yellow-400 py-1 font-black uppercase text-xs text-black hover:bg-yellow-300"
                >
                  Construir
                </button>
              </div>

              <div className="border-2 border-black p-3 bg-zinc-50 dark:bg-zinc-800 text-center">
                <div className="text-xs font-black uppercase">Bancada Superior</div>
                <div className="text-base font-black text-green-600">+1.500 Lugares</div>
                <div className="text-xs text-zinc-500 my-1">Custo: €200.000</div>
                <button
                  onClick={() => handleExpandArena(1500, 200000)}
                  className="w-full border-2 border-black bg-yellow-400 py-1 font-black uppercase text-xs text-black hover:bg-yellow-300"
                >
                  Construir
                </button>
              </div>

              <div className="border-2 border-black p-3 bg-zinc-50 dark:bg-zinc-800 text-center">
                <div className="text-xs font-black uppercase">Anel Completo Arena</div>
                <div className="text-base font-black text-green-600">+4.000 Lugares</div>
                <div className="text-xs text-zinc-500 my-1">Custo: €500.000</div>
                <button
                  onClick={() => handleExpandArena(4000, 500000)}
                  className="w-full border-2 border-black bg-yellow-400 py-1 font-black uppercase text-xs text-black hover:bg-yellow-300"
                >
                  Construir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECÇÃO 4: ESCOLA DE FORMAÇÃO / ACADEMIA (MÓDULO 5.2) */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-4">
        <div className="flex flex-wrap justify-between items-center border-b-2 border-black pb-2 gap-2">
          <div>
            <h3 className="text-xl font-black uppercase">
              ⭐ Escola de Formação Sub-18 (Nível {academyLevel})
            </h3>
            <p className="text-xs text-zinc-500">
              Garante que no início de cada época aparecem novos jovens talentos juniores de maior potencial na cantera do clube.
            </p>
          </div>

          <button
            onClick={handleUpgradeAcademy}
            className="border-2 border-black bg-purple-600 text-white px-3 py-1.5 text-xs font-black uppercase hover:bg-purple-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Subir Nível Academia (€{(academyLevel * 120000).toLocaleString()})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {youthAcademy.map((player) => (
            <div
              key={player.id}
              className="border-2 border-black bg-zinc-50 p-4 dark:border-white dark:bg-zinc-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black dark:bg-white dark:text-black">
                    {player.position}
                  </span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    Sub-18 ({player.age} anos)
                  </span>
                </div>
                <div className="text-base font-black uppercase">{player.name}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  OVR {player.overallRating} • Salário de Júnior: €250/sem
                </div>
              </div>

              <button
                onClick={() => {
                  promoteYouthPlayer(player.id);
                  setFeedback(`${player.name} foi promovido ao plantel principal sem custos!`);
                }}
                className="mt-4 w-full border-2 border-black bg-green-500 py-1.5 font-black uppercase text-xs text-white hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Promover ao Plantel Sénior
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECÇÃO 5: DEPARTAMENTO MÉDICO & LESÕES (MÓDULO 6.2) */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:text-white space-y-3">
        <h3 className="text-xl font-black uppercase border-b-2 border-black pb-2">
          🏥 Departamento Médico (Relatório de Lesões)
        </h3>

        {injuredPlayers.length === 0 ? (
          <div className="border-2 border-black bg-green-50 p-4 text-green-900 font-bold text-xs">
            ✅ Boletim Clínico Limpo! Nenhum atleta sob cuidados médicos no pavilhão. Todo o plantel está disponível para o jogo do fim de semana.
          </div>
        ) : (
          <div className="space-y-2">
            {injuredPlayers.map((player) => (
              <div
                key={player.id}
                className="border-2 border-red-600 bg-red-50 p-3 text-red-900 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-black text-sm uppercase">{player.name}</span>
                  <div className="text-red-700 mt-0.5">
                    Diagnóstico: {player.injury.description || 'Rotura de fibras na coxa'} • Gravidade: {player.injury.severity}
                  </div>
                </div>
                <span className="font-black bg-red-600 text-white px-2 py-1 text-xs">
                  {player.injury.weeksRemaining || 3} Semanas de Paragem
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
