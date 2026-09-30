/**
 * 7meters - Authentication & Password Recovery Modal
 * Sistema de login, registo e recuperação de password com envio de email temático de andebol.
 * Acesso de Administrador reservado para: rochap.filipe@gmail.com
 */

import React, { useEffect, useState } from 'react';
import { useGameStore, UserAccount } from '../../store/useGameStore';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: UserAccount) => void;
  onRecoveryRequested?: () => void;
}

type AuthMode = 'login' | 'register' | 'recovery' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessLogin, onRecoveryRequested }) => {
  const { setCurrentUser } = useGameStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoverySent, setRecoverySent] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setPassword('');
        setFeedback('Define uma nova palavra-passe para concluir a recuperação.');
        onRecoveryRequested?.();
      }
    });
    return () => subscription.unsubscribe();
  }, [onRecoveryRequested]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!supabase || !isSupabaseConfigured) {
      setFeedback('A sincronização cloud ainda não está configurada. Podes continuar a jogar com gravação local.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setRecoverySent(true);
        setFeedback('Enviámos uma ligação de recuperação para o endereço indicado.');
        return;
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        onClose();
        return;
      }

      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() || 'Treinador de Andebol' } },
        });
        if (error) throw error;
        if (!data.session) {
          setFeedback('Conta criada. Confirma o endereço através do email enviado antes de iniciar sessão.');
          setMode('login');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }

      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !authUser) throw userError ?? new Error('Não foi possível validar a sessão.');
      const metadataName = authUser.user_metadata?.name;
      const user: UserAccount = {
        id: authUser.id,
        email: authUser.email ?? email.trim(),
        name: typeof metadataName === 'string' && metadataName.trim()
          ? metadataName.trim()
          : 'Treinador de Andebol',
        isAdmin: authUser.app_metadata?.is_admin === true,
        isLoggedIn: true,
      };
      setCurrentUser(user);
      onSuccessLogin?.(user);
      onClose();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-lg">
              🤾
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === 'login' && 'Acesso Treinador'}
                {mode === 'register' && 'Novo Registo de Clube'}
                {mode === 'recovery' && 'Recuperar Acesso'}
                {mode === 'reset' && 'Definir Nova Palavra-passe'}
              </h2>
              <p className="text-xs text-zinc-400">
                7meters Handball · Gestor Desportivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Modo local ativo. A gravação neste dispositivo continua disponível; a sincronização entre dispositivos ainda não está configurada.
          </div>
        )}

        {feedback && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
            📢 {feedback}
          </div>
        )}

        {/* Recovery Email Simulator Preview */}
        {mode === 'recovery' && recoverySent && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs space-y-2">
            <p className="text-zinc-300">Consulta o email enviado pelo Supabase e abre a ligação neste browser para definir a nova palavra-passe.</p>
          </div>
        )}

        {(!recoverySent || mode !== 'recovery') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome do Treinador / Presidente:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ex: Carlos Resende"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Endereço de Email:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                placeholder="treinador@clube.pt"
              />
            </div>

            {mode !== 'recovery' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">{mode === 'reset' ? 'Nova palavra-passe:' : 'Palavra-passe:'}</label>
                  {mode === 'login' && <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setRecoverySent(false);
                      setFeedback(null);
                    }}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Esqueceste-te da password?
                  </button>}
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-amber-500 py-3 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? 'A processar...' : mode === 'login' && 'Entrar no Balneário'}
              {!isSubmitting && mode === 'register' && 'Criar Conta de Treinador'}
              {!isSubmitting && mode === 'recovery' && 'Enviar Email de Recuperação'}
              {!isSubmitting && mode === 'reset' && 'Guardar Nova Palavra-passe'}
            </button>
          </form>
        )}

        {/* Alternar modos */}
        <div className="flex justify-between border-t border-zinc-800 pt-4 text-xs font-medium text-zinc-400">
          {mode === 'login' ? (
            <>
              <span>Ainda não tens equipa?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFeedback(null);
                }}
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors"
              >
                Registar Novo Clube
              </button>
            </>
          ) : mode === 'recovery' || mode === 'reset' ? (
            <>
              <span>Já tens acesso?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setRecoverySent(false);
                  setFeedback(null);
                }}
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors"
              >
                Voltar ao Login
              </button>
            </>
          ) : (
            <>
              <span>Já tens clube registado?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFeedback(null);
                }}
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors"
              >
                Voltar ao Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
