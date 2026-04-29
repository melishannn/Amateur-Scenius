import { LogOut, User, Mail, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: { name: string; email: string; uid: string } | null;
  login: () => void;
  logout: () => void;
}

export default function Profile({ user, login, logout }: ProfileProps) {
  return (
    <div className="space-y-10 pb-32">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent text-white rounded-full shadow-lg shadow-accent/30 mb-4">
          <User size={32} />
        </div>
        <h2 className="serif text-4xl italic text-text">Sana Ait Alan</h2>
        <p className="text-sm text-muted leading-relaxed serif italic">
          Menzili uzun yolculuklarda, en güçlü karargah kişinin kendi kimliğidir.
        </p>
      </div>

      <div className="glass-card border border-border p-8 rounded-[40px] shadow-sm max-w-lg mb-8">
        {user ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#cdb4db] to-[#a2d2ff] flex items-center justify-center text-xl font-bold text-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xl font-bold text-text mb-1">{user.name}</div>
                <div className="flex items-center gap-2 text-xs text-muted font-mono bg-bg px-3 py-1.5 rounded-lg border border-border/50">
                  <Mail size={12} /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted font-mono bg-bg px-3 py-1.5 mt-2 rounded-lg border border-border/50 w-fit">
                  Yaş: 24
                </div>
              </div>
            </div>

            <div className="bg-success-soft border border-success/20 p-5 rounded-2xl flex items-start gap-4">
              <ShieldCheck className="text-success mt-1 shrink-0" size={20} />
              <div>
                <div className="font-bold text-success text-sm mb-1 uppercase tracking-widest">Senkronizasyon Aktif</div>
                <div className="text-xs text-success/80">Tüm notların ve fikirlerin Firebase bulutunda güvenle saklanıyor. İstediğin cihazdan erişebilirsin.</div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <button onClick={logout} className="flex items-center justify-center gap-2 w-full bg-danger-soft hover:bg-danger text-danger hover:text-white py-4 rounded-2xl transition-all font-bold text-sm">
                <LogOut size={16} /> Karargahtan Çıkış Yap
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 pt-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-bg border border-border flex items-center justify-center text-muted mb-6">
              <User size={32} />
            </div>
            <div>
              <div className="text-lg font-bold text-text mb-2">Misafir Modundasın</div>
              <div className="text-sm text-muted">
                Şu anki fikirlerin sadece bu tarayıcıda geçici olarak saklanıyor. Kalıcı olarak depolamak ve senkronize etmek için giriş yapmalısın.
              </div>
            </div>
            
            <div className="pt-4">
              <button onClick={login} className="flex items-center justify-center gap-3 w-full bg-gradient-to-br from-[#cdb4db] to-[#a2d2ff] hover:from-[#bfa1d0] hover:to-[#8dbff4] text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(205,180,219,0.5)] transition-all">
                Google ile Giriş Yap
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] text-muted uppercase tracking-[0.2em] opacity-40 mt-12 pb-8">
        Melogicard tarafından geliştirilmiştir
      </div>
    </div>
  );
}
