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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900 dark:border-white dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
          <div className="flex items-center gap-2">
            <span className="border-2 border-black bg-yellow-400 px-2 py-0.5 text-xs font-black uppercase text-black">
              7meters Handball
            </span>
            <h2 className="text-2xl font-black uppercase">
              {mode === 'login' && 'Acesso Treinador'}
              {mode === 'register' && 'Novo Registo de Clube'}
              {mode === 'recovery' && 'Recuperar Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-black bg-red-500 px-3 py-1 font-mono text-sm font-black text-white hover:bg-red-600 dark:border-white"
          >
            X
          </button>
        </div>

        {/* Quick Admin fill indicator */}
        <div className="my-3 flex items-center justify-between border-2 border-dashed border-black bg-yellow-100 p-2 font-mono text-xs dark:bg-yellow-950 dark:border-white">
          <span>Admin do Sistema: <strong>{GAME_CONFIG.ADMIN_EMAIL}</strong></span>
          <button
            type="button"
            onClick={() => {
              setEmail(GAME_CONFIG.ADMIN_EMAIL);
              setName('Filipe Rocha');
              setPassword('admin123');
            }}
            className="border border-black bg-white px-2 py-0.5 font-bold uppercase hover:bg-zinc-200 dark:bg-zinc-800"
          >
            Preencher Admin
          </button>
        </div>

        {feedback && (
          <div className="mb-4 border-2 border-black bg-blue-100 p-3 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200 dark:border-white">
            📢 {feedback}
          </div>
        )}

        {/* Recovery Email Simulator Preview */}
        {mode === 'recovery' && recoverySent && (
          <div className="mb-4 border-4 border-black bg-zinc-50 p-4 font-mono text-xs dark:bg-zinc-800 dark:border-white">
            <div className="border-b-2 border-black pb-2 mb-2 font-bold text-zinc-500 dark:text-zinc-400">
              📬 SIMULADOR DE EMAIL RECEBIDO:
            </div>
            <div className="font-bold">De: apoio@7meters.pt (Serviço Central de Andebol)</div>
            <div className="font-bold">Para: {email}</div>
            <div className="font-black text-sm my-2 text-yellow-600 dark:text-yellow-400">
              Assunto: [7meters] Recuperação de Credenciais de Treinador - Pavilhão Central
            </div>
            <p className="text-zinc-700 dark:text-zinc-300">
              Olá Treinador,<br />
              Recebemos o pedido de redefinição de acesso ao teu clube de andebol no 7meters.<br />
              O teu código de verificação é: <strong className="text-black bg-yellow-300 px-2 py-1 dark:text-black">{securityCode}</strong>.<br />
              Usa este código para definir uma nova palavra-passe e voltar ao banco de suplentes!
            </p>
            <button
              onClick={() => {
                setMode('login');
                setRecoverySent(false);
                setFeedback('Código validado! Podes agora iniciar sessão.');
              }}
              className="mt-3 w-full border-2 border-black bg-green-500 py-1 font-black uppercase text-white hover:bg-green-600"
            >
              Confirmar Código e Voltar ao Login
            </button>
          </div>
        )}

        {(!recoverySent || mode !== 'recovery') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Nome do Treinador / Presidente:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-black p-2.5 font-mono text-sm font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                  placeholder="Ex: Carlos Resende"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Endereço de Email:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-black p-2.5 font-mono text-sm font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                placeholder="treinador@clube.pt"
              />
            </div>

            {mode !== 'recovery' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-black uppercase">Palavra-passe:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setFeedback(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Esqueceste-te da password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-black p-2.5 font-mono text-sm font-bold dark:border-white dark:bg-zinc-800 dark:text-white"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full border-4 border-black bg-yellow-400 p-3 font-black uppercase tracking-wider text-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all dark:border-white"
            >
              {mode === 'login' && 'Entrar no Balneário'}
              {mode === 'register' && 'Criar Conta de Treinador'}
              {mode === 'recovery' && 'Enviar Email de Recuperação'}
            </button>
          </form>
        )}

        {/* Alternar modos */}
        <div className="mt-6 flex justify-between border-t-2 border-black pt-4 font-mono text-xs font-bold dark:border-white">
          {mode === 'login' ? (
            <>
              <span>Ainda não tens equipa?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFeedback(null);
                }}
                className="text-blue-600 font-black uppercase hover:underline dark:text-blue-400"
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
                className="text-blue-600 font-black uppercase hover:underline dark:text-blue-400"
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
