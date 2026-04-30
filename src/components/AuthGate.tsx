import React, { useState } from 'react';
import { User, LogIn, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginWithGoogle, registerWithEmail, loginWithEmail, resetPassword } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthGateProps {
  onLogin: () => void;
  onSkip: () => void;
}

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword';

export default function AuthGate({ onLogin, onSkip }: AuthGateProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleError = (e: any) => {
    let message = e.message || 'Bir hata oluştu.';
    if (message.includes('auth/invalid-email')) message = t('auth.err_email');
    else if (message.includes('auth/user-not-found') || message.includes('auth/invalid-credential')) message = t('auth.err_cred');
    else if (message.includes('auth/wrong-password')) message = t('auth.err_cred');
    else if (message.includes('auth/email-already-in-use')) message = t('auth.err_in_use');
    else if (message.includes('auth/weak-password')) message = t('auth.err_weak');
    else if (message.includes('auth/operation-not-allowed')) message = t('auth.err_disabled');
    setError(message);
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError(t('auth.err_email'));
    if (mode !== 'forgotPassword' && !password) return setError(t('auth.err_cred'));

    setError('');
    setMsg('');
    setLoading(true);

    try {
      if (mode === 'signIn') {
        await loginWithEmail(email, password);
      } else if (mode === 'signUp') {
        await registerWithEmail(email, password);
      } else if (mode === 'forgotPassword') {
        await resetPassword(email);
        setMsg(t('auth.reset_sent'));
        setMode('signIn');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-gradient-to-br from-[#ede7f6] via-[#fce4ec] to-[#e3f2fd]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-[32px] shadow-[0_20px_60px_rgba(100,70,140,0.18)]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#cdb4db] to-[#a2d2ff] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#cdb4db]/50">
            ✦
          </div>
          <div>
            <div className="text-xl font-bold text-[#1a0f2e] tracking-tight">{t('nav.title')}</div>
            <div className="text-xs font-mono text-[#7a6090] tracking-widest uppercase">{t('auth.subtitle')}</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1a0f2e] mb-1">
            {mode === 'signIn' && t('auth.welcome')}
            {mode === 'signUp' && t('auth.signup')}
            {mode === 'forgotPassword' && t('auth.forgot')}
          </h2>
          <p className="text-xs text-[#7a6090]">
            {mode === 'signIn' && t('auth.desc_sign_in')}
            {mode === 'signUp' && t('auth.desc_sign_up')}
            {mode === 'forgotPassword' && t('auth.desc_forgot')}
          </p>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 text-xs font-semibold p-3 border border-red-100 rounded-xl">{error}</div>}
        {msg && <div className="mb-4 bg-green-50 text-green-600 text-xs font-semibold p-3 border border-green-100 rounded-xl">{msg}</div>}

        <form onSubmit={handleEmailAction} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-[#1a0f2e] mb-1.5 ml-1 block opacity-80">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6090]" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full bg-white/50 border border-white/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:border-[#cdb4db] outline-none transition-all placeholder:text-[#7a6090]/50 text-[#1a0f2e] font-medium"
              />
            </div>
          </div>

          {mode !== 'forgotPassword' && (
            <div>
              <label className="text-xs font-bold text-[#1a0f2e] mb-1.5 ml-1 block opacity-80">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6090]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/50 border border-white/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:border-[#cdb4db] outline-none transition-all placeholder:text-[#7a6090]/50 text-[#1a0f2e] font-medium"
                />
              </div>
            </div>
          )}

          {mode === 'signIn' && (
            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                onClick={() => { setMode('forgotPassword'); setError(''); setMsg(''); }}
                className="text-xs font-semibold text-[#7a6090] hover:text-[#cdb4db] transition-colors"
              >
                {t('auth.forgot_q')}
              </button>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#b57bee] to-[#8dbff4] hover:opacity-90 text-white rounded-2xl py-3.5 font-bold text-sm shadow-[0_8px_20px_rgba(181,123,238,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'signIn' && t('auth.welcome')}
              {mode === 'signUp' && t('auth.signup')}
              {mode === 'forgotPassword' && t('auth.send_link')}
            </button>
          </div>
        </form>

        {mode !== 'forgotPassword' && (
          <>
            <div className="relative flex items-center py-2 mb-4">
              <div className="flex-grow border-t border-[#7a6090]/10"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-[#7a6090] uppercase tracking-wider font-semibold">
                {t('auth.or')}
              </span>
              <div className="flex-grow border-t border-[#7a6090]/10"></div>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <button 
                onClick={loginWithGoogle}
                className="flex items-center justify-center w-14 h-14 bg-white hover:bg-[#f8f9fa] border border-[#eaeaea] rounded-2xl hover:scale-105 transition-all shadow-sm"
              >
                <svg width="24" height="24" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                  <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                </svg>
              </button>
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 text-center mt-6">
          {mode === 'forgotPassword' && (
            <button 
              onClick={() => { setMode('signIn'); setError(''); setMsg(''); }} 
              className="text-xs font-semibold text-[#7a6090] hover:text-[#1a0f2e] transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> {t('auth.back')}
            </button>
          )}

          {mode === 'signIn' && (
            <p className="text-xs text-[#7a6090]">
              {t('auth.no_account')} <button onClick={() => { setMode('signUp'); setError(''); setMsg(''); }} className="font-bold text-[#b57bee] hover:underline">{t('auth.signup')}</button>
            </p>
          )}
          
          {mode === 'signUp' && (
            <p className="text-xs text-[#7a6090]">
              {t('auth.has_account')} <button onClick={() => { setMode('signIn'); setError(''); setMsg(''); }} className="font-bold text-[#b57bee] hover:underline">{t('nav.login')}</button>
            </p>
          )}

          <div className="h-px w-full bg-[#7a6090]/10 my-1"></div>

          <button onClick={onSkip} className="text-xs text-[#7a6090] hover:text-[#1a0f2e] transition-colors font-semibold py-1">
            {t('auth.guest')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
