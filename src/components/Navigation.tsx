import { LayoutDashboard, Archive, Radio, Database, Brain, LogOut, User, Globe, Moon,Sun, PanelLeftClose } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string } | null;
  login: () => void;
  logout: () => void;
  onToggleLofi: () => void;
  isLofiPlaying: boolean;
  onToggleSidebar?: () => void;
}

export default function Navigation({ activeTab, setActiveTab, user, login, logout, onToggleLofi, isLofiPlaying, onToggleSidebar }: NavigationProps) {
  const { t, lang, setLang } = useLanguage();
  const [isDark, setIsDark] = useState(false);
 
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      setIsDark(true);
    } else if (theme === 'light') {
      html.classList.add('light');
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
        setIsDark(true);
      } else {
        html.classList.add('light');
        setIsDark(false);
      }
    }
  }, []);
 
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const tabs = [
    { id: 'flow', label: t('nav.flow'), icon: LayoutDashboard },
    { id: 'cabinet', label: t('nav.cabinet'), icon: Archive },
    { id: 'hub', label: t('nav.hub'), icon: Radio },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];
  
  return (
    <nav className="w-full h-full flex flex-col p-4 md:p-8 gap-4 overflow-y-auto no-scrollbar relative">
      <div className="hidden md:flex items-start justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 text-accent mb-2 cursor-pointer" onClick={() => setActiveTab('flow')}>
            <Brain size={28} className="text-accent" />
            <div className="serif italic text-2xl text-text leading-none font-bold">
              {t('nav.title')}
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-1 opacity-60">
            {t('nav.subtitle')}
          </div>
        </div>
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-muted hover:text-text hover:bg-surface rounded-xl transition-colors shrink-0"
            title="Menüyü Kapat"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {/* User Auth Section */}
      <div className="flex flex-col gap-2 mb-2 pointer-events-auto shrink-0">
        {user ? (
          <div className="flex items-center justify-between glass-card border border-border p-3 rounded-2xl relative group">
            <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-bold text-text truncate">{user.name}</span>
               <span className="text-[10px] text-muted truncate">{user.email}</span>
            </div>
            <button onClick={logout} className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 absolute right-2 glass-card">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={login} className="flex items-center gap-2 justify-center w-full glass-card border-accent text-accent hover:bg-accent hover:text-white transition-colors p-3 rounded-2xl text-xs font-bold tracking-wider uppercase border-2">
             <User size={14} /> {t('nav.login')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1 pt-4 border-t border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-3 px-4 py-3 md:px-5 md:py-3 rounded-2xl transition-all duration-300 text-sm whitespace-nowrap shrink-0 w-full text-left
                ${isActive ? 'bg-accent text-white shadow-md shadow-accent/20 font-bold' : 'text-muted hover:glass-card hover:text-text'}
              `}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -left-3 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(162,210,255,0.5)] md:block hidden"
                  />
                )}
              </div>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-3 shrink-0">
        <div className="grid grid-cols-4 gap-2">

          {/* Dark Mode Toggle */}
          <button
            id="themeBtn"
            onClick={toggleDarkMode}
            className="col-span-1 h-[60px] flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 text-[10px] font-bold uppercase tracking-widest border-2 border-border text-muted hover:text-text hover:border-accent hover:bg-surface"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={16} className="shrink-0" /> : <Moon size={16} className="shrink-0" />}
            <span className="hidden xl:inline leading-none">{isDark ? 'LIGHT' : 'DARK'}</span>
          </button>

          
          <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="col-span-1 h-[60px] flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 text-[10px] font-bold uppercase tracking-widest border-2 border-border text-muted hover:text-text hover:border-accent hover:bg-surface"
          >
            <Globe size={16} className="shrink-0" />
            <span className="leading-none">{lang === 'tr' ? 'EN' : 'TR'}</span>
          </button>
          
          <button
            id="lofiBtn"
            onClick={onToggleLofi}
            className={`col-span-2 h-[60px] flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-2 overflow-hidden ${
              isLofiPlaying ? 'bg-[#1DB954] text-white border-[#1DB954]/20 shadow-[0_0_15px_rgba(29,185,84,0.4)]' : 'border-border text-muted hover:text-text hover:border-accent hover:bg-surface'
            }`}
          >
            <Radio size={16} className="shrink-0" />
            <span className="truncate w-full text-center leading-none px-1">{isLofiPlaying ? t('nav.music_stop') : t('nav.music_play')}</span>
          </button>
        </div>

        {/* Spotify Player */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isLofiPlaying ? 1 : 0, height: isLofiPlaying ? 'auto' : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <iframe
            style={{ borderRadius: '12px', display: 'block' }}
            src="https://open.spotify.com/embed/playlist/7jiQemqr9EFtd2zlzMEQ7h"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </motion.div>

        {/* Footer / Credits */}
        <div className="flex items-center justify-center gap-4 pb-4 md:pb-0">
          <div className="text-[10px] text-center text-muted uppercase tracking-widest opacity-40">
            {t('nav.credits')}
          </div>
        </div>
      </div>
    </nav>
  );
}