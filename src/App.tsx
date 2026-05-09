import logo from './assets/logo.png';
import { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Wizard from './components/Wizard';
import Cabinet from './components/Cabinet';
import Hub from './components/Hub';
import Profile from './components/Profile';
import { AppTour } from './components/AppTour';
import { Brain, LogOut, User, LayoutDashboard, Archive, Radio, Database, Menu, X } from 'lucide-react';
import { Post, AppState } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('scenius_activeTab') || 'flow');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [appState, setAppState] = useState<AppState>(() => {
    const postsSaved = localStorage.getItem('scenius_posts');
    let chainSaved = localStorage.getItem('scenius_chain');
    const starsSaved = localStorage.getItem('scenius_stars');
    const revisitsSaved = localStorage.getItem('scenius_revisits');
    
    // Clean up any AI commentary that was saved previously
    if (chainSaved && chainSaved.includes('Harika bir felsefe')) {
      chainSaved = '';
      localStorage.setItem('scenius_chain', '');
    }
    
    let initialPosts: any[] = [];
    if (postsSaved) {
      initialPosts = JSON.parse(postsSaved);
    }
    
    // Yalnızca hiç post yoksa başlangıç postlarını yükle, ki kılavuz için "stok" örneği olsun
    if (initialPosts.length === 0) {
      initialPosts = [
        {
          id: Date.now() - 3000,
          content: "Amatör olmanın en büyük avantajı, hata yapma özgürlüğüdür. Profesyonellerin aksine, bizim kaybedecek bir şanımız yok, bu da bizi daha cesur kılıyor.",
          tags: ["cesaret"],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isDraft: false,
          isPublished: false,
          isArchived: false,
        },
        {
          id: Date.now() - 2000,
          content: "Kusursuzluk bir öğrenme engelidir. Mükemmeli beklerken, aslında ilerleme fırsatını kaçırıyoruz. Hatalı da olsa üretmek, hiçbir şey yapmamaktan daha öğreticidir.",
          tags: ["cesaret"],
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          isDraft: false,
          isPublished: false,
          isArchived: false,
        },
        {
          id: Date.now() - 1000,
          content: "Eserini dünyayla paylaşmak korkutucu olabilir ama asıl korkutucu olan, seninle aynı şeyleri düşünen insanlarla asla bağ kuramamaktır. Fikirlerin, henüz tanışmadığın dostlarına birer davetiyedir.",
          tags: ["cesaret"],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isDraft: false,
          isPublished: false,
          isArchived: false,
        }
      ];
    }

    return {
      posts: initialPosts,
      chain: chainSaved || '',
      stars: starsSaved ? JSON.parse(starsSaved) : [],
      revisits: revisitsSaved ? JSON.parse(revisitsSaved) : {},
    };
  });

  useEffect(() => {
    localStorage.setItem('scenius_activeTab', activeTab);
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('scenius_posts', JSON.stringify(appState.posts));
    localStorage.setItem('scenius_chain', appState.chain);
    localStorage.setItem('scenius_stars', JSON.stringify(appState.stars));
    localStorage.setItem('scenius_revisits', JSON.stringify(appState.revisits));
  }, [appState]);

  const handleNavigation = (tab: string) => {
    if (activeTab === 'flow' && tab === 'flow') {
      window.dispatchEvent(new CustomEvent('force-wizard-reset'));
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleRehber = () => setActiveTab('flow');
    const handleExit = () => setActiveTab('cabinet');
    const handleContinue = () => setActiveTab('flow');
    window.addEventListener('start-mini-rehber', handleRehber);
    window.addEventListener('exit-wizard', handleExit);
    window.addEventListener('continue-draft', handleContinue);
    return () => {
      window.removeEventListener('start-mini-rehber', handleRehber);
      window.removeEventListener('exit-wizard', handleExit);
      window.removeEventListener('continue-draft', handleContinue);
    };
  }, []);



  const mainRef = useRef<HTMLElement>(null);

  const addPost = (post: Post) => {
    setAppState((prev) => ({
      ...prev,
      posts: [post, ...prev.posts], // add to top
    }));
  };

  const toggleStar = (id: number) => {
    setAppState((prev) => ({
      ...prev,
      stars: prev.stars.includes(id) 
        ? prev.stars.filter(s => s !== id) 
        : [...prev.stars, id],
    }));
  };

  const publishPost = (id: number) => {
    if (confirm(t('app.confirm_publish'))) {
      setAppState((prev) => ({
        ...prev,
        posts: prev.posts.map(p => p.id === id ? { ...p, isPublished: true } : p)
      }));
    }
  };

  const saveRevisitNote = (id: number, note: string) => {
    setAppState((prev) => ({
      ...prev,
      revisits: { ...prev.revisits, [id]: note },
    }));
  };

  const saveHemingway = (chain: string) => {
    setAppState((prev) => ({ ...prev, chain }));
  };

  const clearProject = () => {
    if (confirm(t('app.confirm_delete_all'))) {
      setAppState({
        posts: [],
        chain: '',
        stars: [],
        revisits: {},
      });
      localStorage.clear();
    }
  };

  const updatePostTags = (id: number, newTags: string[]) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.map(p => p.id === id ? { ...p, tags: newTags } : p)
    }));
  };

  useEffect(() => {
    const handleSwitchToFlow = () => setActiveTab('flow');
    window.addEventListener('continue-draft', handleSwitchToFlow);
    window.addEventListener('start-mini-rehber', handleSwitchToFlow);
    return () => {
      window.removeEventListener('continue-draft', handleSwitchToFlow);
      window.removeEventListener('start-mini-rehber', handleSwitchToFlow);
    };
  }, []);

  useEffect(() => {
    const handleStartTour = (e?: any) => {
      let startIndex = 0;
      if (e?.detail?.step !== undefined) {
        startIndex = e.detail.step;
      } else {
        // Full tour starts from step 0
        startIndex = 0;
      }
      setTourStepIndex(startIndex);
      setIsTourRunning(true);
    };

    window.addEventListener('start-tour', handleStartTour);
    return () => {
      window.removeEventListener('start-tour', handleStartTour);
    };
  }, [activeTab]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('scenius_tour_completed');
    if (!hasSeenTour) {
      setTourStepIndex(0);
      setIsTourRunning(true);
      localStorage.setItem('scenius_tour_completed', 'true');
    }
  }, []);

  useEffect(() => {
    const handleNextTourStep = () => {
      if (isTourRunning) {
        setTourStepIndex(prev => prev + 1);
      }
    };
    window.addEventListener('wizard-next-step', handleNextTourStep);
    window.addEventListener('wizard-published', handleNextTourStep);
    return () => {
      window.removeEventListener('wizard-next-step', handleNextTourStep);
      window.removeEventListener('wizard-published', handleNextTourStep);
    };
  }, [isTourRunning]);

  const deletePost = (id: number) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== id),
      stars: prev.stars.filter(s => s !== id),
    }));
  };

  const deleteTag = (tag: string) => {
    if (confirm(t('app.confirm_delete_tag', { tag }))) {
      setAppState((prev) => {
        const remainingPosts = prev.posts.filter(p => !p.tags.includes(tag));
        const remainingIds = remainingPosts.map(p => p.id);
        const remainingStars = prev.stars.filter(s => remainingIds.includes(s));
        return {
          ...prev,
          posts: remainingPosts,
          stars: remainingStars,
        };
      });
    }
  };

  const archivePostsByTag = (tag: string) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.map(p => 
        (p.tags.includes(tag) && !p.rehberType) ? { ...p, isArchived: true } : p
      )
    }));
  };

  const tabs = [
    { id: 'flow', icon: LayoutDashboard },
    { id: 'cabinet', icon: Archive },
    { id: 'hub', icon: Radio },
    { id: 'profile', icon: User },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-bg overflow-hidden relative">
      <div 
        style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)' }}
        className="absolute w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] top-[-20%] left-[-20%] z-0 pointer-events-none" 
      />
      <div 
        style={{ background: 'radial-gradient(circle, rgba(134, 217, 202, 0.1) 0%, transparent 70%)' }}
        className="absolute w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] bottom-[-15%] right-[-10%] z-0 pointer-events-none" 
      />
      <div 
        style={{ background: 'radial-gradient(circle, rgba(239, 130, 130, 0.08) 0%, transparent 70%)' }}
        className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] top-[20%] left-[10%] z-0 pointer-events-none" 
      />

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="hidden md:flex flex-col shrink-0 border-r border-border z-30 bg-bg/80 backdrop-blur-md"
          >
            <div className="w-64 h-full">
              <Navigation 
                 activeTab={activeTab} 
                 setActiveTab={handleNavigation} 
                 onToggleLofi={() => setIsLofiPlaying(!isLofiPlaying)}
                 isLofiPlaying={isLofiPlaying}
                 onToggleSidebar={() => setIsSidebarOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex fixed top-8 left-8 z-40 p-3 bg-surface border border-border/50 shadow-lg rounded-2xl text-text hover:text-accent hover:border-accent hover:shadow-[0_0_20px_rgba(124,92,255,0.2)] transition-all"
          title={t('navigation.open_menu')}
        >
          <Menu size={20} />
        </button>
      )}

      <main ref={mainRef} className="scroll-container flex-1 overflow-y-auto no-scrollbar relative z-10 pt-16 md:pt-0 pb-28 md:pb-0">
        <div className="w-full max-w-3xl mx-auto px-4 py-8 md:p-16">
          <div style={{ display: activeTab === 'flow' ? 'block' : 'none' }}>
            <Wizard 
              addPost={addPost} 
              archivePostsByTag={archivePostsByTag}
              hemingwayChain={appState.chain}
              saveHemingway={saveHemingway}
            />
          </div>
          <div style={{ display: activeTab !== 'flow' ? 'block' : 'none' }}>
            {activeTab === 'cabinet' && (
              <Cabinet 
                posts={appState.posts} 
                stars={appState.stars}
                toggleStar={toggleStar}
                saveNote={saveRevisitNote}
                notes={appState.revisits}
                addPost={addPost}
                deletePost={deletePost}
                deleteTag={deleteTag}
                publishPost={publishPost}
                updatePostTags={updatePostTags}
                archivePostsByTag={archivePostsByTag}
                scrollRef={mainRef}
                isLoading={false}
              />
            )}
            {activeTab === 'hub' && <Hub posts={appState.posts} scrollRef={mainRef} />}
            {activeTab === 'profile' && <Profile />}
          </div>
        </div>
      </main>
      
      <div className="md:hidden fixed top-0 w-full glass border-b border-white/40 p-3 flex justify-between items-center z-40 h-16 shadow-sm">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[#7a6090] hover:bg-white/40 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" onClick={() => { handleNavigation('flow'); setIsMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/30 flex items-center justify-center shadow-lg border border-white/40">
              <img src={logo} alt="Logo" className="w-[85%] h-[85%] object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="serif text-[1.05rem] text-[#1a0f2e] font-bold leading-none">Amateur Scenius</span>
              <span className="text-[9px] font-mono text-[#7a6090] tracking-widest uppercase opacity-60">Scenius Labs</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 z-[100] bg-white/20 backdrop-blur-xl"
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-0 left-0 h-full w-4/5 max-w-sm glass border-r border-white/40 shadow-2xl z-[101] flex flex-col"
          >
            <div className="flex justify-start p-4 border-b border-white/30">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-white/50 text-[#7a6090] rounded-xl hover:bg-white shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Navigation 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  handleNavigation(tab);
                  setIsMobileMenuOpen(false);
                }} 
                onToggleLofi={() => setIsLofiPlaying(!isLofiPlaying)}
                isLofiPlaying={isLofiPlaying}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bottom-nav-mobile md:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 transition-all duration-300">
        <div className="bg-white/40 border border-white/40 p-2 rounded-[32px] flex items-center gap-2 shadow-xl shadow-[#cdb4db]/20 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.id)}
                className={`
                  relative flex items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-500
                  ${isActive ? 'bg-white shadow-md' : 'text-[#6b5ca5]/60 hover:bg-white/40'}
                `}
              >
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-[#1a1c22]' : ''} 
                />
              </button>
            );
          })}
        </div>
      </div>

      <AppTour 
        run={isTourRunning}
        stepIndex={tourStepIndex}
        setStepIndex={setTourStepIndex}
        onTourEnd={() => setIsTourRunning(false)}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
}
