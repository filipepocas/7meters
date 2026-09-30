/**
 * 7meters - Facilities, Training & Board Confidence Component
 * Gestão moderna e intuitiva de:
 * 1. Termómetro da Direção (0 a 100%) e risco de demissão
 * 2. Ciclo Semanal de Treinos (Carga Física, Foco Tático, Guarda-Redes & Finalização, Descanso Total)
 * 3. Expansão de Bancadas do Pavilhão (aumento de lugares e receitas de bilheteira)
 * 4. Escola de Formação / Academia de Juniores
 * 5. Departamento Médico (Relatório de Lesões e Semanas de Paragem)
 */

import React, { useState } from 'react';
import { useGameStore, TrainingFocus } from '../../store/useGameStore';

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
  const injuredPlayers = userSquad.filter((p) => p.injury?.isInjured);

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho Moderno */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              🏗️ Pavilhão, Direção & Infraestruturas
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Gere o clube com visão estratégica: expansão de bancadas, academia de juniores, treinos e estabilidade institucional.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 font-mono text-xs font-bold text-emerald-300 backdrop-blur">
            <span>Tesouraria Disponível:</span>
            <span className="text-sm font-black text-white tabular-nums">€{userClub.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300 backdrop-blur">
          ⚡ {feedback}
        </div>
      )}

      {/* SECÇÃO 1: TERMÓMETRO DA DIREÇÃO & SATISFAÇÃO DOS ADEPTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Termómetro da Direção */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Termómetro da Presidência
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold font-mono ${
                boardConfidence > 60
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : boardConfidence > 30
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              }`}
            >
              {boardConfidence}% CONFIANÇA
            </span>
          </div>

          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                boardConfidence > 60
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : boardConfidence > 30
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-rose-600 to-rose-500'
              }`}
              style={{ width: `${boardConfidence}%` }}
            />
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {boardConfidence > 75
              ? 'A presidência do clube está rendida aos teus resultados. O teu lugar está plenamente seguro e o projeto tem apoio total!'
              : boardConfidence > 35
              ? 'A direção mantém a estabilidade no projeto, mas exige vitórias nas próximas jornadas para não perder a paciência.'
              : '⚠️ ALERTA DE DEMISSÃO: O ponteiro da presidência está em zona crítica! Se descer a 0%, recebes guia de marcha imediata.'}
          </p>
        </div>

        {/* Satisfação dos Adeptos */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📣</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Apoio da Massa Adepta
              </h3>
            </div>
            <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              {fanSatisfaction}% ENTUSIASMO
            </span>
          </div>

          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: `${fanSatisfaction}%` }}
            />
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Adeptos entusiasmados enchem o pavilhão nos jogos em casa, gerando a receita máxima de bilheteira (€{(userClub.arena?.ticketPrice || 12).toFixed(2)} por bilhete na lotação de {currentCap.toLocaleString()} lugares).
          </p>
        </div>
      </div>

      {/* SECÇÃO 2: CICLO SEMANAL DE TREINOS */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            🏋️ Ciclo Semanal de Treinos (Foco Metodológico)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Antes de avançar para a jornada, define a preparação da equipa para maximizar a condição física ou a eficácia em campo:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'recuperacao_fisica',
              name: 'Descanso Total',
              icon: '💤',
              bonus: 'Recupera 100% de energia e frescura física.',
              con: 'Sem evolução nos atributos técnicos esta semana.',
            },
            {
              id: 'remate_exterior',
              name: 'GR & Finalização',
              icon: '🎯',
              bonus: 'Aumenta eficácia dos 9m e defesas do guarda-redes.',
              con: 'Desgaste moderado no braço dos laterais.',
            },
            {
              id: 'defesa_coletiva',
              name: 'Foco Tático',
              icon: '🛡️',
              bonus: 'Melhora o entrosamento na muralha e desarme.',
              con: 'Consumo ligeiro de estamina coletiva.',
            },
            {
              id: 'aceleracao_tatica',
              name: 'Carga Física',
              icon: '⚡',
              bonus: 'Aumenta a resistência e estamina a longo prazo.',
              con: 'Gasta energia antes da partida do fim de semana.',
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
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-1 ring-amber-500/40'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-sm text-white">{item.name}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  ✅ {item.bonus}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  ⚠️ {item.con}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECÇÃO 3: EXPANSÃO DO PAVILHÃO DA CASA */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              🏟️ Pavilhão Oficial & Expansão de Bancadas ({userClub.arena.name})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Escolhe o render 3D do teu ringue de andebol visto das bancadas e expande a lotação para multiplicar as receitas de bilheteira.
            </p>
          </div>
          <span className="rounded-full bg-zinc-800 px-3 py-1 font-mono text-xs font-bold text-amber-300 border border-zinc-700">
            Lotação: {currentCap.toLocaleString()} Lugares
          </span>
        </div>

        {/* Galeria 3D AI de Pavilhões de Andebol */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Escolhe o Visual 3D do teu Pavilhão (Gerado por IA • Vista das Bancadas):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.02]'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={arenaOpt.src}
                      alt={arenaOpt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                    {isSelected && (
                      <span className="absolute top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-zinc-950 uppercase shadow">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-zinc-900/90 text-left">
                    <div className="text-xs font-bold text-white truncate">{arenaOpt.title}</div>
                    <div className="text-[10px] text-zinc-400 truncate mt-0.5">{arenaOpt.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Obras de Expansão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
          <div className="relative h-56 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg">
            <img
              src={
                userClub.arena.imagePath && !userClub.arena.imagePath.includes('unsplash')
                  ? userClub.arena.imagePath
                  : '/src/assets/images/arena_elite_grand_1790774574409.jpg'
              }
              alt={userClub.arena.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-lg bg-zinc-900/90 backdrop-blur border border-amber-500/40 text-amber-300 px-2.5 py-1 text-xs font-mono font-bold">
                {currentCap.toLocaleString()} Lugares
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Obras de ampliação aumentam diretamente a bilheteira dos jogos em casa. A um preço de <strong>€{(userClub.arena?.ticketPrice || 12).toFixed(2)}</strong> por bilhete, cada lugar adicional gera receita direta todas as semanas!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center hover:border-zinc-700 transition-colors">
                <div className="text-xs font-semibold text-zinc-400">Bancada Lateral</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">+500 Lugares</div>
                <div className="text-[11px] text-zinc-400 my-1 font-mono">€75.000</div>
                <button
                  onClick={() => handleExpandArena(500, 75000)}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-2 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all"
                >
                  Construir
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center hover:border-zinc-700 transition-colors">
                <div className="text-xs font-semibold text-zinc-400">Bancada Superior</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">+1.500 Lugares</div>
                <div className="text-[11px] text-zinc-400 my-1 font-mono">€200.000</div>
                <button
                  onClick={() => handleExpandArena(1500, 200000)}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-2 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all"
                >
                  Construir
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center hover:border-zinc-700 transition-colors">
                <div className="text-xs font-semibold text-zinc-400">Anel Completo Arena</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">+4.000 Lugares</div>
                <div className="text-[11px] text-zinc-400 my-1 font-mono">€500.000</div>
                <button
                  onClick={() => handleExpandArena(4000, 500000)}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-2 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all"
                >
                  Construir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECÇÃO 4: ESCOLA DE FORMAÇÃO / ACADEMIA */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-4">
        <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              ⭐ Escola de Formação Sub-18 (Nível {academyLevel})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Garante que no início de cada época surgem novos talentos juniores com elevado potencial no teu clube.
            </p>
          </div>

          <button
            onClick={handleUpgradeAcademy}
            className="rounded-xl border border-purple-500/40 bg-purple-950/40 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/60 transition-all font-mono"
          >
            Subir Nível Academia (€{(academyLevel * 120000).toLocaleString()})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {youthAcademy.map((player) => (
            <div
              key={player.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                    {player.position}
                  </span>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    Sub-18 ({player.age} anos)
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{player.name}</div>
                <div className="text-xs text-zinc-400 mt-1 font-mono">
                  OVR {player.overallRating} · Salário Júnior: €250/sem
                </div>
              </div>

              <button
                onClick={() => {
                  promoteYouthPlayer(player.id);
                  setFeedback(`${player.name} foi promovido ao plantel principal sem custos!`);
                }}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2 font-bold text-xs text-white hover:bg-emerald-500 active:scale-[0.98] transition-all"
              >
                Promover ao Plantel Sénior
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECÇÃO 5: DEPARTAMENTO MÉDICO & LESÕES */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-zinc-800 pb-3">
          🏥 Departamento Médico (Relatório de Lesões)
        </h3>

        {injuredPlayers.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-emerald-300 text-xs font-medium flex items-center gap-3">
            <span className="text-lg">✅</span>
            <span>Boletim Clínico Limpo! Nenhum atleta sob cuidados médicos. Todo o plantel está disponível para o próximo confronto.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {injuredPlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-sm text-white">{player.name}</span>
                  <div className="text-rose-300 mt-0.5">
                    Diagnóstico: {player.injury?.description || 'Rotura de fibras na coxa'} · Gravidade: {player.injury?.severity || 'moderada'}
                  </div>
                </div>
                <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 text-xs font-bold font-mono">
                  {player.injury?.weeksRemaining || 3} Semanas de Paragem
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

