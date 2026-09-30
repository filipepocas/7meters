-- ==============================================================
-- 7METERS HANDBALL MANAGER - ESQUEMA DE BASE DE DADOS SUPABASE
-- ==============================================================
-- Copia e cola este código no "SQL Editor" do teu projeto Supabase
-- e clica em "Run" para criar as tabelas automaticamente.

-- 1. Tabela de Treinadores / Utilizadores
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Clubes de Andebol
CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  owner_email TEXT REFERENCES public.profiles(email) ON DELETE SET NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  city TEXT DEFAULT 'Portugal',
  foundation_year INT DEFAULT 2026,
  level TEXT DEFAULT 'Andebol 1 (Divisão de Honra)',
  budget BIGINT DEFAULT 1500000,
  fanbase INT DEFAULT 2500,
  reputation INT DEFAULT 60,
  stadium_capacity INT DEFAULT 3000,
  primary_color TEXT DEFAULT '#003399',
  secondary_color TEXT DEFAULT '#FFCC00',
  arena_name TEXT DEFAULT 'Pavilhão Municipal',
  arena_image TEXT,
  arena_ticket_price NUMERIC(6,2) DEFAULT 12.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Plantel / Jogadores
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  age INT NOT NULL,
  country TEXT DEFAULT 'Portugal',
  overall_rating INT DEFAULT 65,
  shooting INT DEFAULT 7,
  defense INT DEFAULT 7,
  goalkeeping INT DEFAULT 5,
  energy_level INT DEFAULT 100,
  moral INT DEFAULT 8,
  salary INT DEFAULT 1200,
  market_value BIGINT DEFAULT 45000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Resultados de Jogos
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  season INT DEFAULT 1,
  round_number INT DEFAULT 1,
  home_club_id TEXT REFERENCES public.clubs(id),
  away_club_id TEXT REFERENCES public.clubs(id),
  home_score INT DEFAULT 0,
  away_score INT DEFAULT 0,
  simulated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Segurança de Linha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público para Leitura/Escrita
CREATE POLICY "Acesso Total para Leitura de Clubes" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Acesso Total para Escrita de Clubes" ON public.clubs FOR ALL USING (true);

CREATE POLICY "Acesso Total para Jogadores" ON public.players FOR ALL USING (true);
CREATE POLICY "Acesso Total para Partidas" ON public.matches FOR ALL USING (true);
CREATE POLICY "Acesso Total para Profiles" ON public.profiles FOR ALL USING (true);
