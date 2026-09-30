/**
 * 7meters - Authentication & Password Recovery Modal
 * Sistema de login, registo e recuperação de password com envio de email temático de andebol.
 * Acesso de Administrador reservado para: rochap.filipe@gmail.com
 */

import React, { useState } from 'react';
import { useGameStore, UserAccount } from '../../store/useGameStore';
import { GAME_CONFIG } from '../../core/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: UserAccount) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const { setCurrentUser } = useGameStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>('rochap.filipe@gmail.com');
  const [name, setName] = useState<string>('Filipe Rocha');
  const [password, setPassword] = useState<string>('••••••••');
  const [recoverySent, setRecoverySent] = useState<boolean>(false);
  const [securityCode, setSecurityCode] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const isAdmin = email.trim().toLowerCase() === GAME_CONFIG.ADMIN_EMAIL.toLowerCase();

    if (mode === 'recovery') {
      setRecoverySent(true);
      setSecurityCode('7M-' + Math.floor(100000 + Math.random() * 900000));
      setFeedback('Email de recuperação enviado com sucesso para a tua caixa de correio!');
      return;
    }

    const user: UserAccount = {
      email: email.trim(),
      name: name.trim() || (isAdmin ? 'Filipe Rocha (Admin)' : 'Treinador de Andebol'),
      isAdmin,
      isLoggedIn: true,
    };

    setCurrentUser(user);
    if (onSuccessLogin) onSuccessLogin(user);
    onClose();
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

        {/* Quick Admin fill indicator */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs font-mono text-zinc-400">
          <span>Admin: <strong className="text-amber-400">{GAME_CONFIG.ADMIN_EMAIL}</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail(GAME_CONFIG.ADMIN_EMAIL);
              setName('Filipe Rocha');
              setPassword('admin123');
            }}
            className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Preencher Demo
          </button>
        </div>

        {feedback && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300">
            📢 {feedback}
          </div>
        )}

        {/* Recovery Email Simulator Preview */}
        {mode === 'recovery' && recoverySent && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs space-y-2">
            <div className="border-b border-zinc-800 pb-2 text-zinc-400">
              📬 SIMULADOR DE EMAIL RECEBIDO:
            </div>
            <div className="text-zinc-300">De: apoio@7meters.pt (Serviço Central)</div>
            <div className="text-zinc-300">Para: {email}</div>
            <div className="font-bold text-amber-400">
              Assunto: [7meters] Recuperação de Credenciais de Treinador
            </div>
            <p className="text-zinc-400">
              Olá Treinador,<br />
              O teu código de verificação é: <strong className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5">{securityCode}</strong>.<br />
              Usa este código para definir uma nova palavra-passe.
            </p>
            <button
              onClick={() => {
                setMode('login');
                setRecoverySent(false);
                setFeedback('Código validado! Podes agora iniciar sessão.');
              }}
              className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-xs text-white hover:bg-emerald-500 transition-colors"
            >
              Confirmar Código e Voltar ao Login
            </button>
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
                  <label className="text-xs font-semibold text-zinc-300">Palavra-passe:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setFeedback(null);
                    }}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Esqueceste-te da password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-3 font-bold text-xs text-zinc-950 hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20"
            >
              {mode === 'login' && 'Entrar no Balneário'}
              {mode === 'register' && 'Criar Conta de Treinador'}
              {mode === 'recovery' && 'Enviar Email de Recuperação'}
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
