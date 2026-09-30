# Configurar saves cloud

## 1. Preparar o Supabase

1. No projeto Supabase, ativa `Authentication > Providers > Email`.
2. Mantém a confirmação de email ativa e configura o endereço do site e os redirects de recuperação para o domínio de produção (`https://7meters.vercel.app`).
3. No `SQL Editor`, executa `supabase_schema.sql`. O script cria `public.game_saves`, aplica RLS por `auth.uid()` e remove as políticas públicas antigas de clubes, jogadores, partidas e perfis.
4. Em `Authentication > URL Configuration`, permite o domínio publicado e os domínios de preview que pretendes usar.

O cliente só pode ler e alterar a linha cujo `user_id` corresponde à sessão autenticada. Não uses uma chave `service_role` no frontend. As variáveis `VITE_*` são incorporadas no JavaScript público; configura somente a URL e a chave `anon`/`publishable`.

## 2. Configurar a Vercel

Em `Project Settings > Environment Variables`, adiciona:

- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: chave pública `anon`/`publishable`.

Aplica-as a Production e Preview conforme necessário e volta a publicar o deployment.

## 3. Como a sincronização funciona

- Convidados continuam com save local no browser.
- Depois do login, a app lê a linha cloud uma vez. Se ainda não existir, envia o save local; se o save local for mais recente, envia-o; caso contrário, restaura o save cloud.
- Cada utilizador tem uma única linha JSONB. Alterações são agrupadas com debounce de 2 segundos e escritas por `upsert`; não há polling, Storage buckets nem Supabase Realtime.
- Se a rede ou o Supabase falhar, o save local permanece intacto e o indicador mostra o erro.
- A carreira cloud é individual por conta. O utilizador não pode escolher outro UUID no pedido: a política RLS valida o proprietário no servidor.

A recuperação de palavra-passe depende dos templates e URLs de email configurados no painel Supabase. O estado de administrador é definido em `app_metadata.is_admin` por uma operação administrativa confiável; não é concedido com base num email fornecido no browser.
