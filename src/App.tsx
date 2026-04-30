import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Wizard from './components/Wizard';
import Cabinet from './components/Cabinet';
import Hub from './components/Hub';
import Profile from './components/Profile';
import AuthGate from './components/AuthGate';
import { Brain, LogOut, User, LayoutDashboard, Archive, Radio, Database, Menu, X } from 'lucide-react';
import { Post, AppState } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('flow');
  const [user, setUser] = useState<{name: string, email: string, uid: string} | null>(null);
  const [skippedAuth, setSkippedAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLofiPlaying, setIsLofiPlaying] = useState(false);
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
    
    return {
      posts: postsSaved ? JSON.parse(postsSaved) : [],
      chain: chainSaved || '',
      stars: starsSaved ? JSON.parse(starsSaved) : [],
      revisits: revisitsSaved ? JSON.parse(revisitsSaved) : {},
    };
  });

  useEffect(() => {
    import('./firebase').then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        onAuthStateChanged(auth, async (userRecord) => {
          if (userRecord) {
            setUser({ name: userRecord.displayName || 'Kullanıcı', email: userRecord.email || '', uid: userRecord.uid });
            const { loadStateFromFirebase } = await import('./firebaseSync');
            const data = await loadStateFromFirebase(userRecord.uid);
            if (data) {
              setAppState(data);
            }
          } else {
            setUser(null);
          }
        });
      });
    }).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('scenius_posts', JSON.stringify(appState.posts));
    localStorage.setItem('scenius_chain', appState.chain);
    localStorage.setItem('scenius_stars', JSON.stringify(appState.stars));
    localStorage.setItem('scenius_revisits', JSON.stringify(appState.revisits));
    
    if (user?.uid) {
      import('./firebaseSync').then(({ saveStateToFirebase }) => {
        saveStateToFirebase(user.uid, appState);
      }).catch(console.error);
    }
  }, [appState, user?.uid]);

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
    if (confirm('Bu eseri yayınlamak istediğinize emin misiniz?')) {
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
    if (confirm('Tüm veriler silinecek. Emin misin?')) {
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

  const deletePost = (id: number) => {
    setAppState((prev) => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== id),
      stars: prev.stars.filter(s => s !== id),
    }));
  };

  const deleteTag = (tag: string) => {
    if (confirm(`"${tag}" etiketine ait tüm eserler silinecek. Emin misin?`)) {
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

  const login = async () => {
    try {
      const { loginWithGoogle } = await import('./firebase');
      await loginWithGoogle();
    } catch(e) { console.error(e); }
  };

  const logout = async () => {
    try {
      const { logout: doLogout } = await import('./firebase');
      await doLogout();
      setUser(null);
    } catch(e) { console.error(e); }
  };

  if (!user && !skippedAuth) {
    return (
      <div className="flex flex-col h-[100dvh] bg-bg relative">
        <motion.div 
          animate={{ x: [0, 80, -40, 0], y: [0, 60, 100, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-80 h-80 md:w-[45rem] md:h-[45rem] bg-accent-soft top-[-10%] left-[-10%] opacity-40 mix-blend-multiply rounded-[40%_60%_70%_30%] blur-[90px] md:blur-[140px] z-0 pointer-events-none" 
        />
        <AuthGate onLogin={login} onSkip={() => setSkippedAuth(true)} />
      </div>
    );
  }

  const tabs = [
    { id: 'flow', icon: LayoutDashboard },
    { id: 'cabinet', icon: Archive },
    { id: 'hub', icon: Radio },
    { id: 'profile', icon: User },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-bg overflow-hidden relative">
      <motion.div 
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, 100, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 md:w-[45rem] md:h-[45rem] bg-accent-soft top-[-10%] left-[-10%] opacity-40 mix-blend-multiply rounded-[40%_60%_70%_30%] blur-[90px] md:blur-[140px] z-0 pointer-events-none" 
      />
      <motion.div 
        animate={{
          x: [0, -90, 40, 0],
          y: [0, -70, -120, 0],
          scale: [0.9, 1.2, 1, 0.9],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 md:w-[40rem] md:h-[40rem] bg-blue-soft bottom-[-10%] right-[-5%] opacity-40 mix-blend-multiply rounded-[60%_40%_30%_70%] blur-[90px] md:blur-[140px] z-0 pointer-events-none" 
      />
      <motion.div 
        animate={{
          x: [0, 50, -80, 0],
          y: [0, -100, 60, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 md:w-[35rem] md:h-[35rem] bg-danger-soft top-[30%] left-[20%] opacity-30 mix-blend-multiply rounded-[50%_50%_60%_40%] blur-[90px] md:blur-[120px] z-0 pointer-events-none" 
      />

      <div className="hidden md:flex flex-col shrink-0 md:w-64 border-r border-border glass z-30">
        <Navigation 
           activeTab={activeTab} 
           setActiveTab={setActiveTab} 
           user={user}
           login={login}
           logout={logout}
           onToggleLofi={() => setIsLofiPlaying(!isLofiPlaying)}
           isLofiPlaying={isLofiPlaying}
        />
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-16 md:pt-0 pb-28 md:pb-0">
        <div className="w-full max-w-3xl mx-auto px-4 py-8 md:p-16">
          <div style={{ display: activeTab === 'flow' ? 'block' : 'none' }}>
            <Wizard 
              addPost={addPost} 
              archivePostsByTag={archivePostsByTag}
              hemingwayChain={appState.chain}
              saveHemingway={saveHemingway}
            />
          </div>
          <AnimatePresence mode="wait">
            {activeTab !== 'flow' && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
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
                  />
                )}
                {activeTab === 'hub' && <Hub posts={appState.posts} />}
                {activeTab === 'profile' && <Profile user={user} login={login} logout={logout} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <div className="md:hidden fixed top-0 w-full glass border-b border-white/40 p-3 flex justify-between items-center z-40 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cdb4db] to-[#a2d2ff] flex items-center justify-center text-white font-bold text-sm shadow-md">
              ✦
            </div>
            <div className="serif text-[1rem] text-[#1a0f2e] font-bold leading-tight">Amateur Scenius</div>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-[#7a6090] hover:bg-white/40 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[100] bg-white/20 backdrop-blur-xl"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm glass border-l border-white/40 shadow-2xl z-[101] flex flex-col"
            >
              <div className="flex justify-end p-4 border-b border-white/30">
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
                    setActiveTab(tab);
                    setIsMobileMenuOpen(false);
                  }} 
                  user={user}
                  login={login}
                  logout={logout}
                  onToggleLofi={() => setIsLofiPlaying(!isLofiPlaying)}
                  isLofiPlaying={isLofiPlaying}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="md:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/40 border border-white/40 p-2 rounded-[32px] flex items-center gap-2 shadow-xl shadow-[#cdb4db]/20 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
    </div>
  );
}
