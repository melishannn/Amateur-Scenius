import { Post } from '../types';
import { Music, Type } from 'lucide-react';

export default function Hub({ posts }: { posts: Post[] }) {
  const platforms = [
    { name: 'Kendi Web Sitem', energy: 15, desc: 'sağlıklı karargah' },
    { name: 'X (Twitter) — Uydu', energy: 40, desc: 'sağlıklı uydu' },
    { name: 'LinkedIn — Uydu', energy: 25, desc: 'sağlıklı uydu' },
    { name: 'Instagram', energy: 75, desc: 'vampir uyarısı' },
  ];

  return (
    <div className="space-y-10 pb-32">
      <div className="space-y-2">
        <h2 className="serif text-4xl italic text-text">Dünya Karargahı</h2>
        <p className="text-sm text-muted leading-relaxed serif italic">
          Sosyal ağlar gelip geçicidir. Asıl mülkiyet senin alan adında. Diğerleri sadece birer uydu.
        </p>
      </div>

      <div className="flex flex-col items-center gap-12 py-10 relative">
        {/* Core Hub */}
        <div className="w-40 h-40 rounded-full bg-text text-bg flex flex-col items-center justify-center text-center p-6 border-[8px] border-bg shadow-2xl z-10 transition-transform hover:scale-105 duration-500">
          <div className="text-[11px] font-bold tracking-[0.3em] font-mono leading-tight uppercase">SENİN<br/>ALAN ADIN</div>
        </div>

        <div className="text-[10px] font-mono text-muted uppercase tracking-[0.5em] animate-pulse">↕ İÇERİK AKIŞI</div>

        {/* Satellites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          {platforms.map((p) => {
            const isVampire = p.energy > 50;
            return (
              <div key={p.name} className="glass border border-border p-6 rounded-[32px] shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className="font-bold text-sm mb-3 serif italic text-text">{p.name}</div>
                <div className="h-1.5 bg-bg rounded-full overflow-hidden mb-3 border border-border/50">
                  <div 
                    className={`h-full transition-all duration-1000 delay-300 ${isVampire ? 'bg-danger' : 'bg-green'}`} 
                    style={{ width: `${p.energy}%` }} 
                  />
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-widest ${isVampire ? 'text-danger' : 'text-green'}`}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase text-center opacity-40">YAYINLANMIŞ ESERLER</h3>
        <div className="space-y-4">
          {posts.filter(p => p.isPublished).length === 0 ? (
            <div className="glass-card border border-dashed border-border/80 p-12 rounded-[32px] text-center text-muted italic serif text-sm">
              Henüz dünyaya açılan bir eserin yok. Hemen bir tane harmanla.
            </div>
          ) : (
            posts.filter(p => p.isPublished).sort((a,b) => b.id - a.id).map(post => (
              <div key={post.id} className="glass-card border border-border p-8 rounded-[40px] shadow-sm hover:shadow-lg transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                   <div className="space-y-1">
                      <div className="text-[9px] font-bold text-accent uppercase tracking-widest">{post.rehberType ? `🗺️ ${post.rehberType}` : '📝 HARMANLANMIŞ HİKAYE'}</div>
                      <div className="text-[10px] text-muted">{post.date} &bull; {post.platform || 'Karargah'}</div>
                   </div>
                   <div className="flex gap-1">
                      {post.tags?.map(t => (
                        <span key={t} className="text-[9px] font-bold bg-bg px-2 py-1 rounded-md opacity-60 uppercase">{t}</span>
                      ))}
                   </div>
                </div>
                
                <div className="serif text-lg leading-relaxed text-text italic" dangerouslySetInnerHTML={{ __html: post.content }} />
                
                {post.media && post.media.length > 0 && (
                  <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
                    {post.media.map((m, i) => (
                      <div key={i} className="shrink-0 w-24 h-24 bg-bg rounded-2xl border border-border overflow-hidden">
                        {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
                        {m.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-accent-soft/20 text-accent"><Music size={16} /></div>}
                        {m.type === 'text' && <div className="w-full h-full flex items-center justify-center bg-yellow-soft/20 text-muted"><Type size={16} /></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="bg-blue-soft border border-blue/20 p-6 rounded-[32px] text-xs text-text leading-relaxed serif italic shadow-inner">
        <strong>Dünya Karargahı Notu:</strong> İstatistikler enerjini nasıl yönettiğine dair bir aynadır. Sosyal ağlar seni değil, sen onları kullanmalısın.
      </div>
    </div>
  );
}
