import { LayoutDashboard, Archive, Radio, Database, Brain, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string } | null;
  login: () => void;
  logout: () => void;
  onToggleLofi: () => void;
  isLofiPlaying: boolean;
}

export default function Navigation({ activeTab, setActiveTab, user, login, logout, onToggleLofi, isLofiPlaying }: NavigationProps) {
  const tabs = [
    { id: 'flow', label: 'Akış', icon: LayoutDashboard },
    { id: 'cabinet', label: 'Merak Kabinesi', icon: Archive },
    { id: 'hub', label: 'Dünya Karargahı', icon: Radio },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="w-full h-full flex flex-col p-4 md:p-8 gap-4 overflow-y-auto no-scrollbar relative">
      <div className="hidden md:block mb-4 shrink-0">
        <div className="flex items-center gap-3 text-accent mb-2">
          <Brain size={28} className="text-accent" />
          <div className="serif italic text-2xl text-text leading-none font-bold">
            Amateur Scenius
          </div>
        </div>
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted mb-1 opacity-60">
          Müze Rehberi
        </div>
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
             <User size={14} /> Giriş Yap
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
        <button
          onClick={onToggleLofi}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300 text-xs font-bold uppercase tracking-widest border-2 ${
            isLofiPlaying ? 'bg-[#1DB954] text-white border-[#1DB954]/20 shadow-[0_0_15px_rgba(29,185,84,0.4)]' : 'border-border text-muted hover:text-text hover:border-accent'
          }`}
        >
          🎵 Lo-Fi {isLofiPlaying ? 'Kapat' : 'Oyna'}
        </button>

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
        <div className="text-[10px] text-center text-muted uppercase tracking-widest opacity-40 pb-4 md:pb-0">
          Mühendisin Kitaplığı tarafından yapıldı
        </div>
      </div>
    </nav>
  );
}