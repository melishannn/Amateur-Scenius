import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ArrowRight, Trash2, Music, FileText, Plus, X, AlertTriangle, Tag } from 'lucide-react';
import { DeleteAlertDialog } from './ui/DeleteAlertDialog';
import { MoveTagDialog } from './ui/MoveTagDialog';

interface CabinetProps {
  posts: Post[];
  stars: number[];
  toggleStar: (id: number) => void;
  saveNote: (id: number, note: string) => void;
  notes: Record<number, string>;
  addPost: (post: Post) => void;
  deletePost: (id: number) => void;
  deleteTag: (tag: string) => void;
  publishPost: (id: number) => void;
  updatePostTags: (id: number, newTags: string[]) => void;
  archivePostsByTag: (tag: string) => void;
}

// ─── ŞABLON TANIM ────────────────────────────────────────────────────────────
const TEMPLATE_DEFS = {
  technical: {
    icon: '🛠️',
    label: 'Adım Adım Teknik Rehber',
    color: '#4A72FF',
    colorSoft: '#4A72FF1A',
    colorBorder: '#4A72FF33',
    context: {
      headline: 'Aaron Franklin Stili — Mutfağını Paylaş',
      body: `Aaron Franklin her yıl barbekü tekniklerini anlatan saatler uzunluğunda videolar yayınlar. Sadece sonucu değil, fire build'i, et seçimini, sıcaklık kontrolünü — her aşamayı. Okuyucu seni "izleyerek" aynı sonuca ulaşabilmeli.`,
      quote: '"İnsanlara nasıl yapıldığını göstermek, onları hem aydınlatır hem de sana bağlar." — Austin Kleon',
      whenToUse: 'Bu 6 içerik birbirini takip eden adımlarsa kullan.',
      fields: [
        { label: 'Araçlar & Materyaller', hint: 'Hangi kütüphaneleri, araçları, ekipmanları kullandın? Okuyucu listeden alışveriş yapabilmeli.' },
        { label: 'Aşama 1 — Hazırlık & Başlangıç', hint: 'Sıfırdan nasıl başladın? Kurulum, hazırlık, ilk adım.' },
        { label: 'Aşama 2 — Asıl İş & İpuçları', hint: 'Ticari sırları paylaş. "Normalde kimse şunu söylemez ama..." diye başla.' },
        { label: 'Aşama 3 — Sonuç & Hatalardan Dersler', hint: 'Ne çalıştı, ne çalışmadı? Bir dahaki sefere ne yapardın?' },
      ]
    }
  },
  documentary: {
    icon: '🎬',
    label: '"Nasıl Yaptım?" Belgeseli',
    color: '#E76F51',
    colorSoft: '#E76F511A',
    colorBorder: '#E76F5133',
    context: {
      headline: 'Sucuğun Nasıl Yapıldığını Göster',
      body: `İnsanlar "sucuğun nasıl yapıldığını" görmek ister. Sadece sonucu değil, mutfağı paylaş. Karşılaştığın duvarları, çıkmaz sokakları, "ikinci perde" zorluklarını — Kleon'un dediği "throwing rocks" anlarını — açık yüreklilikle yaz. Bu seni güvenilir kılar.`,
      quote: '"Başarı hikayeleri ilham verir, ama hata hikayeleri öğretir." — Austin Kleon',
      whenToUse: 'Bu içerikler bir projenin farklı aşamalarındaki hataları ve başarıları temsil ediyorsa kullan.',
      fields: [
        { label: 'Başlangıçta Asıl Hedefin Neydi?', hint: 'Ne yapmak istiyordun? Başlarken ne hayal ediyordun?' },
        { label: 'Throwing Rocks — İkinci Perde Zorlukları', hint: 'Nerede tökezledin? Hangi varsayımların yanlış çıktı? Utanmadan yaz.' },
        { label: 'Sürecin Öğrettikleri', hint: 'Sonunda ne elde ettin? Bir dahaki sefere ne yapardın?' },
      ]
    }
  },
  readingList: {
    icon: '📚',
    label: 'İlham ve Atıf Kitapçığı',
    color: '#2A9D8F',
    colorSoft: '#2A9D8F1A',
    colorBorder: '#2A9D8F33',
    context: {
      headline: 'Açık Düğüm (Open Node) Ol',
      body: `Kleon, kaynaklarını paylaşmanın seni "açık bir düğüm" yaptığını söyler — topluluğun içinde bir kavşak noktasısın. Seni besleyen kitapları, videoları, kişileri paylaştığında, başkalarına kendi öğrenme yolculuklarında harita veriyorsun.`,
      quote: '"Başkalarına yol göster, onlar da seni takip eder." — Austin Kleon, Show Your Work',
      whenToUse: 'Bu içerikler öğrendiğin kaynaklar, okuduğun dokümanlar veya başkalarından kaptığın fikirlerden oluşuyorsa kullan.',
      fields: [
        { label: 'Kitaplar & Makaleler', hint: 'Hangilerini okudun? Linkleriyle yaz. Neden öneriyor olduğunu bir cümleyle açıkla.' },
        { label: 'Videolar, Podcastler, Kurslar', hint: 'Hangilerini izledin/dinledin? İnsanların bulabilmesi için bağlantı ver.' },
        { label: 'Açık Düğümler — Takip Et', hint: 'Bu alanda kimleri takip etmeliyiz ve neden? "Çünkü..." diye açıkla.' },
      ]
    }
  },
  oldVsNew: {
    icon: '🌱',
    label: '"Eski vs. Yeni" Gelişim Şablonu',
    color: '#6A4C93',
    colorSoft: '#6A4C931A',
    colorBorder: '#6A4C9333',
    context: {
      headline: 'Amatörlükten Ustalığa Yolculuk',
      body: `"Bu işe başladığımda ne bilmiyordum, şu an neyi farklı yapıyorum?" kıyaslaması, okuyucuya hem mütevazılık hem de ilham verir. Yanlış inançlarını, yanılgılarını, köşe dönümlerini paylaş. Amatörlük bir başlangıç noktasıdır, utanılacak bir şey değil.`,
      quote: '"Amatör olmak bir ayrıcalıktır — henüz merakı öldürülmemiş birisin." — Austin Kleon',
      whenToUse: 'Bu içerikler zaman içindeki değişimini gösteriyorsa — erken dönem vs. şimdiki hali — kullan.',
      fields: [
        { label: 'Eskiden Ne Biliyordun?', hint: 'Hangi yanlış inançlara sahiptin? Neyi bilmiyordum diye şimdi güldüğün ne var? Dürüst ol.' },
        { label: 'Şu An Neyi Farklı Yapıyorsun?', hint: 'En büyük kırılma anın ne oldu? Seni dönüştüren şey ne?' },
      ]
    }
  }
} as const;

type TemplateKey = keyof typeof TEMPLATE_DEFS;

// ─── DELETE ONAY DIALOG STATE TYPE ──────────────────────────────────────────
type DeleteTarget = {
  type: 'single' | 'selected' | 'allInTag';
  ids: number[];
  label: string;
  count: number;
};

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function Cabinet({ posts, stars, toggleStar, saveNote, notes, addPost, deletePost, deleteTag, publishPost, updatePostTags, archivePostsByTag }: CabinetProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'starred' | 'draft' | 'published'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [showStockAlertForTag, setShowStockAlertForTag] = useState<string | null>(null);

  // ─── Dialog State ───
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [moveTargetPostId, setMoveTargetPostId] = useState<number | null>(null);

  // ─── Silme fonksiyonları ───
  const toggleSelection = (id: number) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteSelected = () => {
    if (selectedItemIds.length === 0) return;
    setDeleteTarget({ 
      type: 'selected', 
      ids: selectedItemIds, 
      label: `seçili ${selectedItemIds.length} fikri`,
      count: selectedItemIds.length 
    });
  };

  const deleteAllInTag = (tagPosts: Post[]) => {
    if (tagPosts.length === 0) return;
    setDeleteTarget({ 
      type: 'allInTag', 
      ids: tagPosts.map(p => p.id),
      label: `bu etiketteki TÜM ${tagPosts.length} fikri`,
      count: tagPosts.length
    });
  };

  const deleteSingle = (id: number) => {
    setDeleteTarget({ type: 'single', ids: [id], label: 'bu fikri', count: 1 });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTarget.ids.forEach(id => deletePost(id));
    setSelectedItemIds(prev => prev.filter(id => !deleteTarget.ids.includes(id)));
    if (selectedPostId && deleteTarget.ids.includes(selectedPostId)) {
      setSelectedPostId(null);
    }
    setDeleteTarget(null);
  };

  // Modal state — 3 aşamalı: 'context' | 'form' | 'preview' | 'done'
  const [templateModal, setTemplateModal] = useState<{
    tag: string;
    type: TemplateKey;
    count: number;
    step: 'context' | 'form' | 'preview' | 'done';
    answers: string[];
  } | null>(null);

  // ─── STOK BİRİKTİ SİHİRBAZI (AUSTIN KLEON STİLİ) ────────────────────────────
  const [stockWizard, setStockWizard] = useState<{
    tag: string;
    step: number;
    selectedPostIds: number[];
    approvedKeywords: string[];
    suggestedTemplate: TemplateKey;
    answers: string[];
    isFormReferenced?: boolean;
  } | null>(null);

  const stopWords = ['ve','ile','bu','bir','da','de','den','dan', 'için','ama','çok','ben','biz','şu','ne','ki','ya','mi', 'daha','olan','gibi','kadar','sonra','önce','her', 'vardı', 'yaptım', 'ettim', 'olan'];
  
  const findCommonWords = (postIds: number[]) => {
    const selectedPosts = posts.filter(p => postIds.includes(p.id));
    const wordMap: Record<string, number> = {};
    selectedPosts.forEach(post => {
      const text = post.content.replace(/<[^>]*>/g, '').toLowerCase();
      const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w));
      const unique = Array.from(new Set(words));
      unique.forEach(word => {
        if (!wordMap[word]) wordMap[word] = 0;
        wordMap[word]++;
      });
    });
    return Object.entries(wordMap)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  };

  const suggestTemplate = (keywords: string[]) => {
    const scores: Record<TemplateKey, number> = { technical: 0, documentary: 0, readingList: 0, oldVsNew: 0 };
    const signals: Record<TemplateKey, string[]> = {
      technical: ['başlangıç','kurulum','araç','adım','aşama','kurdum','yaptım', 'kurmak', 'nasıl'],
      documentary: ['hata','zorlandım','çuvalladım','problem','sorun','çözdüm', 'deneyim', 'süreç'],
      readingList: ['kitap','kaynak','öğrendim','link','okudum','izledim', 'yazı', 'not'],
      oldVsNew: ['eskiden','şimdi','değişti','artık','önce','sonra', 'fark', 'geldi']
    };
    keywords.forEach(kw => {
      Object.entries(signals).forEach(([type, words]) => {
        if (words.some(w => kw.includes(w) || w.includes(kw))) scores[type as TemplateKey]++;
      });
    });
    return (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as TemplateKey);
  };

  const openStockWizard = (tag: string) => {
    const tagPosts = groups[tag] || [];
    setStockWizard({
      tag,
      step: 0,
      selectedPostIds: tagPosts.map(p => p.id), // Varsayılan hepsi seçili
      approvedKeywords: [],
      suggestedTemplate: 'technical',
      answers: []
    });
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'starred') return stars.includes(p.id);
    if (filter === 'draft') return !p.isPublished;
    if (filter === 'published') return p.isPublished;
    return true;
  });

  const STOCK_TARGET = 10;
  const groups: Record<string, Post[]> = {};

  filteredPosts.forEach(p => {
    if (p.isArchived) return;
    p.tags.forEach(t => {
      if (!groups[t]) groups[t] = [];
      groups[t].push(p);
    });
  });

  const getTagIcon = (tag: string) => {
    const icons: Record<string, string> = {
      '#yazılım': '💻', '#kod': '💻', '#tasarım': '🎨', '#müzik': '🎵',
      '#ses': '🎧', '#yazı': '✍️', '#fotoğraf': '📷', '#video': '🎬',
      '#kitap': '📚', '#not': '📝', '#fikir': '💡', '#genel': '📦',
      '#mini-rehber': '🗺️'
    };
    for (const [k, v] of Object.entries(icons)) {
      if (tag.toLowerCase().includes(k.replace('#', ''))) return v;
    }
    return '🗂️';
  };

  const getThumbnail = (posts: Post[]) => {
    for (const p of posts) {
      const img = p.media?.find(m => m.type === 'image');
      if (img) return img.url;
    }
    return null;
  };

  const getAttributionStatus = (posts: Post[]) => {
    const latest = [...posts].reverse().find(p => p.attrName);
    if (latest) return `atıf: ${latest.attrName}`;
    return 'atıf yok';
  };

  const openTemplateModal = (tag: string, type: TemplateKey, count: number) => {
    const fieldCount = TEMPLATE_DEFS[type].context.fields.length;
    setTemplateModal({ tag, type, count, step: 'context', answers: Array(fieldCount).fill('') });
  };

  const closeModal = () => setTemplateModal(null);

  const modalNext = () => {
    if (!templateModal) return;
    const order: typeof templateModal.step[] = ['context', 'form', 'preview', 'done'];
    const next = order[order.indexOf(templateModal.step) + 1];
    setTemplateModal({ ...templateModal, step: next });
  };

  const setAnswer = (i: number, val: string) => {
    if (!templateModal) return;
    const answers = [...templateModal.answers];
    answers[i] = val;
    setTemplateModal({ ...templateModal, answers });
  };

  const buildGuideContent = (type: TemplateKey, tag: string, answers: string[]) => {
    const g = (i: number) => answers[i] || '';
    const header = `<strong>[MİNİ REHBER — ${tag.toUpperCase()} — ${type.toUpperCase()}]</strong><br><br>`;
    if (type === 'technical') {
      return header +
        `<strong>{t('Araçlar & Materyaller:')}</strong><br>${g(0)}<br><br>` +
        `<strong>{t('Aşama 1 — Hazırlık & Başlangıç:')}</strong><br>${g(1)}<br><br>` +
        `<strong>{t('Aşama 2 — Asıl İş & İpuçları:')}</strong><br>${g(2)}<br><br>` +
        `<strong>{t('Aşama 3 — Sonuç & Dersler:')}</strong><br>${g(3)}`;
    } else if (type === 'documentary') {
      return header +
        `<strong>{t('Başlangıç Hedefi:')}</strong><br>${g(0)}<br><br>` +
        `<strong>{t('Throwing Rocks — Zorluklar:')}</strong><br>${g(1)}<br><br>` +
        `<strong>{t('Sürecin Öğrettikleri:')}</strong><br>${g(2)}`;
    } else if (type === 'readingList') {
      return header +
        `<strong>{t('Kitaplar & Makaleler:')}</strong><br>${g(0)}<br><br>` +
        `<strong>{t('Videolar & Podcastler:')}</strong><br>${g(1)}<br><br>` +
        `<strong>{t('Açık Düğümler — Takip Et:')}</strong><br>${g(2)}`;
    } else if (type === 'oldVsNew') {
      return header +
        `<strong>{t('Eskiden (Yanlış İnançlar):')}</strong><br>${g(0)}<br><br>` +
        `<strong>{t('Şu An (Dönüşüm):')}</strong><br>${g(1)}`;
    }
    return header;
  };

  const publishGuide = () => {
    if (!templateModal) return;
    const { tag, type, answers } = templateModal;
    addPost({
      id: Date.now(),
      content: buildGuideContent(type, tag, answers),
      tags: [tag, '#mini-rehber'],
      isPublished: true,
      date: new Date().toLocaleDateString('tr-TR'),
      isTeaching: true,
      guideType: type,
      sourceTag: tag,
    } as Post);
    setTemplateModal({ ...templateModal, step: 'done' });
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

  return (
    <div className="space-y-6 pb-32">

      {/* DELETE DIALOG */}
      <DeleteAlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Emin misiniz?"
        description={deleteTarget ? `${deleteTarget.label} silmek istediğinize emin misiniz?` : ''}
        onConfirm={confirmDelete}
        itemCount={deleteTarget?.count}
      />

      {/* MOVE TAG DIALOG */}
      <MoveTagDialog
        open={!!moveTargetPostId}
        onOpenChange={(open) => !open && setMoveTargetPostId(null)}
        currentTags={moveTargetPostId ? posts.find(p => p.id === moveTargetPostId)?.tags || [] : []}
        allTags={allTags}
        onConfirm={(newTags) => {
          if (moveTargetPostId) {
            updatePostTags(moveTargetPostId, newTags);
            setMoveTargetPostId(null);
          }
        }}
      />

      {/* BAŞLIK */}
      <div className="space-y-4 mb-10">
        <h2 className="serif text-4xl italic text-text">{t('Merak Kabinesi')}</h2>
        <p className="text-sm text-muted leading-relaxed serif italic">
          {t('Her eser bir müze objesidir. Kategorilere tıkla, serüvenin galerisini gör. Favori fikirlerini yıldızla.')}
        </p>
      </div>

      {/* FİLTRE ÇUBUĞU */}
      <div className="space-y-6 mb-10">
        <div className="flex flex-wrap gap-3">
          {(['all', 'starred', 'draft', 'published'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedTag(null); }}
              className={`
                px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all duration-300
                ${filter === f
                  ? 'bg-accent text-text border-accent shadow-lg shadow-accent/20'
                  : 'glass-card text-muted border-border hover:border-accent hover:text-accent shadow-sm'}
              `}
            >
              {f === 'all' && 'Tümü'}
              {f === 'starred' && '⭐ Yıldızlılar'}
              {f === 'draft' && 'Taslaklar'}
              {f === 'published' && 'Yayınlananlar'}
            </button>
          ))}
        </div>

        {/* ETİKET BULUTU */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 py-2 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto tag-cloud-scroll border-b border-border/50 pb-4">
            <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{t('Etiketler:')}</span>
            </div>
            <div className="flex gap-2">
              {allTags
                .filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()))
                .map(tag => {
                  const tagPostsCount = groups[tag]?.length ?? 0;
                  const hasBucketAlert = tagPostsCount >= 3 && tagPostsCount < STOCK_TARGET;
                  const hasMilestoneAlert = tagPostsCount >= STOCK_TARGET;

                  return (
                    <div key={tag} className="relative group/tag">
                      <button
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`
                          px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest border whitespace-nowrap transition-all relative overflow-hidden h-full flex items-center gap-2
                          ${selectedTag === tag
                            ? 'bg-text text-bg border-text shadow-md'
                            : 'bg-surface/50 text-muted border-border hover:border-accent hover:text-accent'}
                        `}
                      >
                        <span className="relative z-10">{tag}</span>
                        {(hasBucketAlert || hasMilestoneAlert) && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                              setShowStockAlertForTag(tag === showStockAlertForTag ? null : tag);
                            }}
                            className="relative z-20 p-1 -m-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer group/alert"
                          >
                            <AlertTriangle 
                              size={12} 
                              className={`${hasMilestoneAlert ? 'text-accent animate-pulse' : 'text-accent/60'} group-hover/alert:scale-125 transition-transform shrink-0`} 
                            />
                          </div>
                        )}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-accent/20 group-hover/tag:bg-accent/40 transition-all"
                          style={{ width: `${Math.min(tagPostsCount / STOCK_TARGET * 100, 100)}%` }}
                        />
                      </button>
                      
                      {/* Hover Tooltip for Quick Action */}
                      {(hasBucketAlert || hasMilestoneAlert) && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/tag:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap">
                          <div className="bg-text text-bg text-[10px] p-2 rounded-lg shadow-xl font-bold uppercase tracking-widest">
                            {hasMilestoneAlert ? '🏁 Milestone: Rehber Oluştur' : '📦 Stok Birikti!'}
                          </div>
                          <div className="w-2 h-2 bg-text rotate-45 mx-auto -mt-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              placeholder={t("Etiketlerde ara...")}
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full glass-card border border-border px-4 py-1.5 rounded-full text-[10px] outline-none focus:border-accent transition-colors"
            />
            {tagSearch && (
              <button onClick={() => setTagSearch('')} className="text-[10px] font-bold text-muted hover:text-danger uppercase tracking-widest whitespace-nowrap">{t('Temizle')}</button>
            )}
          </div>
        </div>
      </div>

      {/* MİLESTONE & PATTERN AREA */}
      <div className="space-y-4 mb-10">
        {selectedTag && showStockAlertForTag === selectedTag && (groups[selectedTag]?.length ?? 0) >= 3 && (
          <div className="space-y-4">
            {groups[selectedTag].length >= STOCK_TARGET ? (
              <div className="bg-accent text-text rounded-[32px] p-8 shadow-xl border-4 border-surface ring-1 ring-accent">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0 animate-bounce">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <div className="grow space-y-1 text-center md:text-left">
                    <div className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase text-bg">{t('STOCK CONSOLIDATION')}</div>
                    <div className="text-lg font-bold leading-tight">
                      <strong>{selectedTag}</strong> {t('— 10 esere ulaştın! Austin Kleon der ki: "Kendi sesini bulmanın yolu, başkalarının seslerini birleştirmekten geçer." Hemen bir rehber oluştur.')}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2 text-bg">{t('Şablon Seç veya Sihirbazı Başlat')}</div>
                  </div>
                  <button
                    onClick={() => openStockWizard(selectedTag)}
                    className="bg-text text-bg px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl flex items-center gap-2 group shrink-0"
                  >
                    {t('Sihirbazla Devam Et')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-8">
                  {(['technical', 'documentary', 'readingList', 'oldVsNew'] as TemplateKey[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setTemplateModal({ tag: selectedTag, type, count: groups[selectedTag].length, step: 'context', answers: Array(TEMPLATE_DEFS[type].context.fields.length).fill('') })}
                      className="bg-white dark:bg-surface border border-transparent p-4 rounded-2xl hover:border-text group transition-all text-center flex flex-col items-center gap-2"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">{TEMPLATE_DEFS[type].icon}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap text-text">{TEMPLATE_DEFS[type].label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#E9F0FF]/90 dark:bg-[#1a1c29]/80 backdrop-blur-md border border-[#D1E0FF] dark:border-[#2e3b5e] rounded-[32px] p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#4A72FF] text-white rounded-xl flex items-center justify-center text-xl shadow-md shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#4A72FF] dark:text-[#82a4ff] uppercase tracking-widest">Stok Birikti — {selectedTag.replace('#', '')}</h3>
                      <p className="text-[10px] text-gray-600 dark:text-gray-300">"{selectedTag}" etiketinde {groups[selectedTag].length} eser birikti. Onları birleştirip bir değer üretmek ister misin?</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={() => openStockWizard(selectedTag)}
                      className="bg-[#4A72FF] text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-sm flex items-center gap-2"
                    >
                      {t('Sihirbazı Başlat')}
                    </button>
                    {(['technical', 'documentary', 'readingList', 'oldVsNew'] as TemplateKey[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setTemplateModal({ tag: selectedTag, type, count: groups[selectedTag].length, step: 'context', answers: Array(TEMPLATE_DEFS[type].context.fields.length).fill('') })}
                        className="bg-white dark:bg-[#1f2233] border border-[#D1E0FF] dark:border-[#2e3b5e] px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-[#4A72FF] dark:hover:border-[#82a4ff] hover:text-[#4A72FF] dark:hover:text-[#82a4ff] text-gray-700 dark:text-gray-200 transition-all shadow-sm flex items-center gap-2"
                      >
                        <span>{TEMPLATE_DEFS[type].icon}</span>
                        <span>{TEMPLATE_DEFS[type].label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ŞEHİR / ETİKET GÖRÜNÜMÜ */}
      <AnimatePresence mode="wait">
        {selectedTag ? (
          <motion.div
            key="tag-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button onClick={() => setSelectedTag(null)} className="flex items-center gap-2 text-sm text-accent hover:underline font-bold uppercase tracking-widest shrink-0">
                <ChevronLeft size={16} /> {t('Kabineye Dön')}
              </button>
            </div>
            <h3 className="serif text-[22px] h-[39px] leading-[19px] not-italic text-text">
              {getTagIcon(selectedTag)} {selectedTag}
              <span className="text-sm font-sans not-italic text-muted ml-4 tracking-[0.3em] font-normal uppercase opacity-50">/ {groups[selectedTag]?.length} Eser</span>
            </h3>

            <div className="pt-4">
              {(() => {
                const tagPosts = groups[selectedTag] || [];
                const allSelected = tagPosts.length > 0 && selectedItemIds.length === tagPosts.length;
                const someSelected = selectedItemIds.length > 0 && selectedItemIds.length < tagPosts.length;

                const handleSelectAll = () => {
                  if (allSelected) setSelectedItemIds([]);
                  else setSelectedItemIds(tagPosts.map(p => p.id));
                };

                const renderPost = (p: Post) => (
                  <motion.div
                    layout
                    key={p.id}
                    onClick={() => {
                      const selection = window.getSelection();
                      if (!selection || selection.toString().length === 0) {
                        setSelectedPostId(p.id);
                      }
                    }}
                    className={`relative glass-card border p-8 rounded-[40px] shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer group hover:-translate-y-1 ${selectedItemIds.includes(p.id) ? 'border-accent ring-2 ring-accent/20' : 'border-border'}`}
                  >
                    <div className="absolute top-6 left-6 z-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(p.id)}
                        onChange={() => toggleSelection(p.id)}
                        className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between items-center mb-6 pl-8">
                      <span className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase">{p.date}</span>
                      <div className="flex items-center gap-3">
                        {!p.isPublished ? (
                          <span className="text-[9px] font-bold text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-full border border-accent/20">{t('Taslak')}</span>
                        ) : (
                          <span className="text-[9px] font-bold text-success uppercase tracking-widest px-2 py-1 bg-success/10 rounded-full border border-success/20">{t('Yayınlanmış')}</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStar(p.id); }}
                          className="hover:scale-110 transition-transform p-1"
                          title="Yıldızla"
                        >
                          <Star size={18} className={stars.includes(p.id) ? "fill-[#FFD166] text-[#FFD166]" : "text-muted hover:text-[#FFD166]"} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMoveTargetPostId(p.id); }}
                          className="text-muted hover:text-[#4A72FF] hover:scale-110 transition-all p-1"
                          title="Kategoriyi Değiştir"
                        >
                          <Tag size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSingle(p.id); }}
                          className="text-muted hover:text-danger hover:scale-110 transition-all p-1"
                          title="Fikri Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div
                      className="timeline-content text-lg md:text-xl leading-relaxed text-text serif italic opacity-90 group-hover:opacity-100 transition-opacity no-scrollbar overflow-hidden break-words line-clamp-[12]"
                      dangerouslySetInnerHTML={{ __html: p.content }}
                    />
                  </motion.div>
                );

                return (
                  <div className="space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-surface/50 p-4 rounded-[24px] border border-border">
                      <div className="flex items-center gap-3 cursor-pointer pl-4 py-2" onClick={handleSelectAll}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={input => { if (input) input.indeterminate = someSelected; }}
                          readOnly
                          className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
                        />
                        <span className="text-xs font-bold text-text uppercase tracking-widest select-none">{t('Select All')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedItemIds.length > 0 && (
                          <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 text-[10px] text-white bg-danger hover:bg-danger/90 font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors shadow-md"
                          >
                            <Trash2 size={14} /> Seçilenleri Sil ({selectedItemIds.length})
                          </button>
                        )}
                        <button
                          onClick={() => deleteAllInTag(tagPosts)}
                          className="flex items-center gap-2 text-[10px] text-danger hover:underline font-bold uppercase tracking-widest bg-danger-soft px-4 py-2.5 rounded-full shrink-0"
                        >
                          <Trash2 size={14} /> {t('Tüm Eserleri Sil')}
                        </button>
                      </div>
                    </div>

                    {/* Timeline Görünümü */}
                    <div className="relative pl-8 md:pl-12 py-4 space-y-10 before:absolute before:left-3 md:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent">
                      <AnimatePresence>
                        {tagPosts.length === 0 ? (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted text-[11px] italic serif p-4">{t('Burada hiç fikir yok.')}</motion.p>
                        ) : (
                          tagPosts.sort((a, b) => b.id - a.id).map(p => {
                            return (
                              <div key={p.id} className="relative">
                                <div className={`absolute -left-[2.1rem] md:-left-[2.6rem] top-7 w-4 h-4 rounded-full border-2 z-10 transition-colors ${
                                  p.isPublished
                                    ? 'bg-success border-success shadow-[0_0_12px_rgba(34,197,94,0.6)]'
                                    : 'bg-bg border-accent'
                                }`} />
                                {renderPost(p)}
                              </div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {Object.keys(groups).length === 0 ? (
              <div className="glass-card border border-dashed border-border/80 p-20 rounded-[40px] text-center text-muted italic serif text-lg animate-pulse">
                {t('Bu kategoride henüz bir müze objesi yok.')}
                <br />
                <span className="text-xs font-sans not-italic uppercase tracking-widest mt-4 block opacity-50">{t('Kayıp eserler aranıyor...')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {Object.entries(groups).map(([tag, tagPosts]) => {
                  const pct = Math.min(100, (tagPosts.length / 10) * 100);
                  const thumb = getThumbnail(tagPosts);
                  return (
                    <div
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className="group bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500"
                    >
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <div className="text-[13px] font-bold text-text uppercase tracking-wider">{tag.replace('#', '')}</div>
                            <div className="w-8 h-[2px] bg-text/10" />
                            <div className="text-4xl font-bold text-text pt-2 leading-none">{tagPosts.length}</div>
                          </div>
                          <div className="w-12 h-12 bg-bg rounded-lg overflow-hidden flex items-center justify-center border border-border/50">
                            {thumb ? (
                              <img src={thumb} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-xl opacity-30">{getTagIcon(tag)}</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-8 space-y-2">
                          <div className="h-1.5 bg-text/5 dark:bg-black/30 border border-text/10 dark:border-white/10 rounded-full relative">
                            <div
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out bg-white/80 dark:bg-white/60 backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:shadow-[0_0_12px_rgba(255,255,255,0.4)] border border-white/80 dark:border-white/50 group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.9)] dark:group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] dark:group-hover:border-white"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-muted uppercase tracking-widest">
                            <span>{tagPosts.length} / 10 eser</span>
                            <span>%{Math.round(pct)}</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border/40">
                          <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">{getAttributionStatus(tagPosts)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAY PANELİ */}
      <AnimatePresence>
        {selectedPostId && selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPostId(null)}
              className="fixed inset-0 bg-text/10 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md glass border-l border-border z-[70] shadow-2xl p-10 detail-panel"
            >
              <button onClick={() => setSelectedPostId(null)} className="text-[10px] font-bold tracking-[0.4em] text-muted hover:text-accent mb-12 uppercase flex items-center gap-2 group transition-colors">
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('KAPAT')}
              </button>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-[0.5em] opacity-40">MÜZE ETİKETİ — {selectedPost.date}</div>
                  <div className="flex flex-wrap gap-3">
                    {selectedPost.tags.map(t => (
                      <span key={t} className="px-3 py-1 border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-muted">{t}</span>
                    ))}
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${selectedPost.isPublished ? 'border-success text-success bg-success/10' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                      {selectedPost.isPublished ? 'yayınlandı' : 'taslak'}
                    </span>
                  </div>
                </div>

                <div
                  className="text-lg md:text-xl lg:text-2xl leading-[1.7] md:leading-[1.8] text-text serif italic opacity-95 break-words"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />

                {!selectedPost.isPublished && (
                  <div className="bg-accent-soft border border-accent/20 p-6 rounded-[24px] space-y-3">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{t('Hemingway Taktiği')}</div>
                    <p className="text-xs text-text/70 leading-relaxed serif italic">
                      {t('Bu taslak yarım kalmış. Kaldığın yerden devam etmek için aşağıdaki butona bas — fikir Akış\'a yüklenecek.')}
                    </p>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('continue-draft', {
                          detail: { 
                            content: selectedPost.content, 
                            tags: selectedPost.tags.join(', '),
                            originalIdea: (selectedPost as any).originalIdea,
                            originalDoc: (selectedPost as any).originalDoc
                          }
                        }));
                        setSelectedPostId(null);
                      }}
                      className="w-full bg-accent text-text py-3 rounded-full font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
                    >
                      {t('Bugün Devam Et')} <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <div className="text-[10px] font-bold text-muted tracking-[0.4em] uppercase opacity-40">{t('MÜZE ESERLERİ')}</div>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedPost.media.map((m, i) => (
                        <div key={i} className="glass-card border border-border rounded-[24px] overflow-hidden shadow-sm">
                          {m.type === 'image' && <img src={m.url} alt={m.name} className="w-full h-auto object-cover max-h-96" />}
                          {m.type === 'audio' && (
                            <div className="p-6 space-y-3">
                              <div className="flex items-center gap-3">
                                <Music size={18} className="text-accent" />
                                <span className="text-xs font-bold text-text truncate">{m.name || 'Ses Kaydı'}</span>
                              </div>
                              <audio controls src={m.url} className="w-full h-8" />
                            </div>
                          )}
                          {m.type === 'text' && (
                            <div className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-muted" />
                                <span className="text-xs font-bold text-text">{m.name || 'Doküman'}</span>
                              </div>
                              <button onClick={() => {
                                const win = window.open('', '_blank');
                                if (win) {
                                  win.document.write(`<html><head><title>${m.name || 'Doküman'}</title><meta charset="utf-8"></head><body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem 1rem; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1a1a1a; background: #fafafa;"><h1 style="font-size: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid #eaeaea; padding-bottom: 1rem;">${m.name || 'Doküman'}</h1><div style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 14px; background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea;">${m.content || ''}</div></body></html>`);
                                  win.document.close();
                                } else {
                                  alert(m.content || 'İçerik bulunamadı.');
                                }
                              }} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">{t('Görüntüle')}</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPost.attrName && (
                  <div className="pt-10 border-t border-border space-y-4">
                    <div className="text-[10px] font-bold text-muted tracking-[0.4em] uppercase opacity-40">{t('ATIF — İLHAM KAYNAĞI')}</div>
                    <div className="text-sm">
                      <strong className="block text-lg serif italic text-accent">{selectedPost.attrName}</strong>
                      <a href={selectedPost.attrLink} target="_blank" rel="noreferrer" className="text-xs text-text/50 hover:text-accent hover:underline break-all transition-colors line-clamp-1">{selectedPost.attrLink}</a>
                    </div>
                  </div>
                )}

                <div className="bg-bg border border-border p-8 rounded-[32px] space-y-4 shadow-inner">
                  <label className="text-[10px] font-bold text-muted tracking-[0.3em] uppercase opacity-60">{t('Yeniden Ziyaret Notu')}</label>
                  <textarea
                    value={notes[selectedPost.id] || ''}
                    onChange={(e) => saveNote(selectedPost.id, e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm italic serif text-text/80 resize-none outline-none leading-relaxed"
                    placeholder={t("Bu fikir bugün ne anlam taşıyor?")}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 pt-4 pb-12">
                  <button
                    onClick={() => toggleStar(selectedPost.id)}
                    className={`shrink-0 h-14 md:h-16 px-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] border flex items-center justify-center gap-3 transition-all duration-300 ${
                      stars.includes(selectedPost.id)
                        ? 'bg-[#FFD166] text-[#3d2960] border-[#FFD166] shadow-xl'
                        : 'bg-surface text-text border-border hover:border-[#FFD166] hover:text-[#3d2960] shadow-sm'
                    }`}
                  >
                    <Star size={16} className={stars.includes(selectedPost.id) ? 'fill-[#3d2960]' : ''} />
                    {stars.includes(selectedPost.id) ? 'Yıldızlı' : 'Yıldızla'}
                  </button>

                  {!selectedPost.isPublished && (
                    <button
                      onClick={() => publishPost(selectedPost.id)}
                      className="flex-1 h-14 md:h-16 rounded-full bg-success text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all"
                    >
                      {t('Yayınla')}
                    </button>
                  )}

                  <button
                    onClick={() => setMoveTargetPostId(selectedPost.id)}
                    className="w-14 md:w-16 h-14 md:h-16 rounded-full glass-card border border-[#4A72FF]/30 text-[#4A72FF] hover:bg-[#4A72FF]/10 flex items-center justify-center transition-colors shadow-sm shrink-0"
                    title="Kategoriyi Değiştir"
                  >
                    <Tag size={16} className="md:w-5 md:h-5" />
                  </button>

                  <button
                    onClick={() => {
                      deleteSingle(selectedPost.id);
                      setSelectedPostId(null);
                    }}
                    className="w-14 md:w-16 h-14 md:h-16 rounded-full glass-card border border-danger/30 text-danger hover:bg-danger-soft flex items-center justify-center transition-colors shadow-sm shrink-0"
                    title="Eseri Sil"
                  >
                    <Trash2 size={16} className="md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ŞABLON MODALI */}
      <AnimatePresence>
        {templateModal && (() => {
          const def = TEMPLATE_DEFS[templateModal.type];
          const { step, answers, tag, type } = templateModal;

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={step !== 'done' ? closeModal : undefined}
                className="fixed inset-0 bg-text/20 backdrop-blur-md z-[80]"
              />

              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:w-[580px] glass rounded-t-[40px] md:rounded-[40px] z-[90] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
              >
                <div className="flex items-start justify-between p-6 pb-5 shrink-0"
                  style={{ background: def.colorSoft, borderBottom: `1px solid ${def.colorBorder}` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl shadow-md shrink-0"
                      style={{ background: def.color }}>{def.icon}</div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50 mb-0.5" style={{ color: def.color }}>
                        {tag} · {templateModal.count} ESER
                      </div>
                      <h3 className="text-base font-bold text-text leading-tight">{def.label}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {(['context', 'form', 'preview'] as const).map((s, i) => (
                      <div key={s} className="w-2 h-2 rounded-full transition-all"
                        style={{ background: ['context', 'form', 'preview'].indexOf(step) >= i ? def.color : def.colorBorder }} />
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 p-7 space-y-6">

                  {step === 'context' && (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: def.color }}>
                          {def.context.headline}
                        </h4>
                        <p className="text-sm leading-relaxed text-text/80">{def.context.body}</p>
                        <div className="text-[11px] italic leading-relaxed p-4 rounded-[16px] border-l-4"
                          style={{ background: def.colorSoft, borderColor: def.color, color: def.color }}>
                          {def.context.quote}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t('Dolduracağın Alanlar')}</h4>
                        {def.context.fields.map((field, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-[12px] border"
                            style={{ background: def.colorSoft, borderColor: def.colorBorder }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                              style={{ background: def.color }}>{i + 1}</div>
                            <div>
                              <div className="text-[11px] font-bold text-text">{field.label}</div>
                              <div className="text-[10px] text-text/50 italic mt-0.5">{field.hint}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={modalNext}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ background: def.color }}>
                        {t('Başla — Soruları Cevapla')} <ArrowRight size={14} />
                      </button>
                      <button onClick={closeModal}
                        className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors">
                        {t('Vazgeç')}
                      </button>
                    </>
                  )}

                  {step === 'form' && (
                    <>
                      <p className="text-[11px] text-muted italic">{t('Her soruyu dürüstçe cevapla. Mükemmel olmasına gerek yok.')}</p>
                      {def.context.fields.map((field, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ background: def.color }}>{i + 1}</div>
                            <label className="text-[11px] font-bold text-text uppercase tracking-wide">{field.label}</label>
                          </div>
                          <p className="text-[10px] text-muted italic leading-relaxed border-l-2 pl-3"
                            style={{ borderColor: def.color + '60' }}>{field.hint}</p>
                          <textarea
                            value={answers[i]}
                            onChange={e => setAnswer(i, e.target.value)}
                            rows={4}
                            className="w-full p-4 bg-transparent text-text border rounded-[16px] text-sm outline-none resize-none leading-relaxed transition-colors focus:border-current"
                            style={{ borderColor: answers[i] ? def.color : def.colorBorder }}
                            placeholder={`${field.label} hakkında yaz...`}
                          />
                        </div>
                      ))}

                      <button onClick={modalNext}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all"
                        style={{ background: def.color }}>
                        {t('Önizle →')}
                      </button>
                      <button onClick={() => setTemplateModal({ ...templateModal, step: 'context' })}
                        className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors">
                        {t('← Geri')}
                      </button>
                    </>
                  )}

                  {step === 'preview' && (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t('Rehber Önizleme')}</h4>
                        <div className="bg-bg border border-border rounded-[20px] p-6 space-y-4 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: buildGuideContent(type, tag, answers) }} />
                      </div>

                      <div className="text-[11px] italic p-4 rounded-[16px] text-center leading-relaxed"
                        style={{ background: def.colorSoft, color: def.color }}>
                        {t('"İyi bir fikir asla tam bitmez, sadece yayınlanır." — Austin Kleon')}
                      </div>

                      <button onClick={publishGuide}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ background: def.color }}>
                        {t('Yayınla ✓')}
                      </button>
                      <button onClick={() => setTemplateModal({ ...templateModal, step: 'form' })}
                        className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors">
                        {t('← Düzelt')}
                      </button>
                    </>
                  )}

                  {step === 'done' && (
                    <div className="text-center space-y-8 py-6">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl"
                        style={{ background: def.color }}>✓</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-text">{t('Stok Tamamlandı!')}</h3>
                        <p className="text-sm text-muted leading-relaxed">
                          <strong className="text-text">{tag}</strong> {t('etiketindeki eserlerini kalıcı bir değere dönüştürdün.')}
                        </p>
                      </div>
                      <div className="text-xs italic leading-relaxed p-5 rounded-[20px]"
                        style={{ background: def.colorSoft, color: def.color }}>
                        {t('"Küçük şeyler zamanla büyür. Bu rehber, birinin öğrenme yolculuğundaki bir kavşak noktası olacak." — Austin Kleon')}
                      </div>
                      <button onClick={closeModal}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg"
                        style={{ background: def.color }}>
                        {t('Kabineye Dön')}
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
      {/* STOCK BİRİKTİ SİHİRBAZI (YENİ AKIŞ) */}
      <AnimatePresence>
        {stockWizard && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => stockWizard.step === 5 ? setStockWizard(null) : undefined}
              className="fixed inset-0 bg-text/40 backdrop-blur-xl z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-bg shadow-2xl z-[110] flex flex-col border-l border-border"
            >
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent text-bg rounded-xl flex items-center justify-center text-xl font-bold">🛠️</div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text">{t('Stock Consolidation')}</h3>
                    <p className="text-[10px] text-muted font-bold opacity-60 uppercase tracking-tighter">{stockWizard.tag} · {stockWizard.selectedPostIds.length} Fikir Seçildi</p>
                  </div>
                </div>
                <button onClick={() => setStockWizard(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} className="text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
                
                {/* STEP 0: ZAMAN ÇİZGİSİ + SEÇİM */}
                {stockWizard.step === 0 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-text">{t('ADIM 0 — Zaman Çizgisi + Seçim')}</h4>
                      <p className="text-xs text-muted leading-relaxed">{t('Birleştirmek istediğin fikirleri seç. Kleon felsefesi: "Noktaları birleştir, bütünü gör."')}</p>
                    </div>
                    
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                      {(groups[stockWizard.tag] || []).map((p) => {
                        const isSelected = stockWizard.selectedPostIds.includes(p.id);
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              const ids = isSelected 
                                ? stockWizard.selectedPostIds.filter(id => id !== p.id)
                                : [...stockWizard.selectedPostIds, p.id];
                              setStockWizard({ ...stockWizard, selectedPostIds: ids });
                            }}
                            className={`relative p-4 rounded-2xl cursor-pointer transition-all border-2 group ${
                              isSelected ? 'bg-accent/5 border-accent scale-[1.01] shadow-lg shadow-accent/5' : 'bg-surface border-transparent hover:border-border'
                            }`}
                          >
                            <div className={`absolute -left-[24px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-bg ring-4 ring-transparent transition-all ${
                              isSelected ? 'bg-accent ring-accent/20' : 'bg-border'
                            }`} />
                            
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="text-[9px] font-bold text-muted uppercase tracking-widest">{p.date}</div>
                                <div className="text-sm text-text/80 line-clamp-2 leading-relaxed italic serif" dangerouslySetInnerHTML={{ __html: p.content }} />
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-accent border-accent text-bg scale-110' : 'border-border text-transparent'
                              }`}>
                                <ArrowRight size={10} className="rotate-[-45deg]" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      disabled={stockWizard.selectedPostIds.length < 2}
                      onClick={() => {
                        const keywords = findCommonWords(stockWizard.selectedPostIds);
                        setStockWizard({ 
                          ...stockWizard, 
                          step: 1, 
                          approvedKeywords: keywords.slice(0, 4),
                          suggestedTemplate: suggestTemplate(keywords)
                        });
                      }}
                      className={`w-full py-5 rounded-[24px] font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                        stockWizard.selectedPostIds.length >= 2 
                          ? 'bg-text text-bg hover:scale-[0.98]' 
                          : 'bg-surface text-muted cursor-not-allowed opacity-50'
                      }`}
                    >
                      {stockWizard.selectedPostIds.length < 2 ? 'En az 2 fikir seç' : `${stockWizard.selectedPostIds.length} Fikri Birleştir →`}
                    </button>
                  </div>
                )}

                {/* STEP 1: ÖRÜNTÜ EKRANI */}
                {stockWizard.step === 1 && (
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-accent tracking-[0.3em] uppercase">{t('ADIM 1 — ÖRÜNTÜ BULUNDU')}</div>
                      <h4 className="text-2xl font-bold text-text">Seçtiğin {stockWizard.selectedPostIds.length} fikir arasındaki ortak noktalar:</h4>
                      <p className="text-xs text-muted">{t('Aşağıdaki kelimeler seçtiğin fikirlerde en çok geçen örüntülerdir. Rehberinde vurgulamak istediklerini onayla.')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {findCommonWords(stockWizard.selectedPostIds).map(word => {
                        const isApproved = stockWizard.approvedKeywords.includes(word);
                        return (
                          <button
                            key={word}
                            onClick={() => {
                              const kws = isApproved 
                                ? stockWizard.approvedKeywords.filter(k => k !== word)
                                : [...stockWizard.approvedKeywords, word];
                              const newSuggest = suggestTemplate(kws);
                              setStockWizard({ ...stockWizard, approvedKeywords: kws, suggestedTemplate: newSuggest });
                            }}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
                              isApproved ? 'bg-accent border-accent text-bg shadow-md' : 'bg-surface border-border text-muted hover:border-accent'
                            }`}
                          >
                            {isApproved ? '✓' : '＋'} {word}
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-surface/50 border border-border rounded-[32px] p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl animate-pulse">✨</div>
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('SİSTEM ÖNERİSİ')}</h4>
                          <p className="text-sm font-bold text-text">{t('Bu fikirler ve onayladığın kelimeler en çok şu şablona uyuyor:')}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-bg border-2 border-accent rounded-2xl flex items-center gap-4 shadow-inner">
                        <span className="text-3xl">{TEMPLATE_DEFS[stockWizard.suggestedTemplate].icon}</span>
                        <div>
                          <p className="text-sm font-bold text-accent uppercase tracking-widest">{TEMPLATE_DEFS[stockWizard.suggestedTemplate].label}</p>
                          <p className="text-[10px] text-muted italic">{t('Kleon der ki: "Rehberin yapısı içindeki örüntüye göre şekillenir."')}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setStockWizard({ ...stockWizard, step: 2 })}
                      className="w-full py-5 bg-text text-bg rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl hover:scale-[0.98] transition-all"
                    >
                      {t('Onayladıklarımla Devam Et →')}
                    </button>
                  </div>
                )}

                {/* STEP 2: ŞABLON SEÇİMİ */}
                {stockWizard.step === 2 && (
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-text">{t('ADIM 2 — Şablonu Kesinleştir')}</h4>
                        <p className="text-xs text-muted leading-relaxed">{t('Önerilen şablon en uygunu gibi görünüyor, ancak istersen başka bir tane seçebilirsin.')}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(TEMPLATE_DEFS).map(([key, def]) => {
                          const isSuggested = stockWizard.suggestedTemplate === key;
                          const isSelected = stockWizard.suggestedTemplate === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setStockWizard({ ...stockWizard, suggestedTemplate: key as TemplateKey })}
                              className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden group ${
                                isSelected ? 'bg-accent/5 border-accent' : 'bg-surface border-transparent hover:border-border'
                              }`}
                            >
                              {isSuggested && (
                                <div className="absolute top-0 right-0 bg-accent text-bg px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">{t('ÖNERİLEN')}</div>
                              )}
                              <div className="flex items-center gap-4">
                                <span className="text-3xl group-hover:scale-110 transition-transform">{def.icon}</span>
                                <div>
                                  <h5 className="text-sm font-bold text-text uppercase tracking-widest">{def.label}</h5>
                                  <p className="text-[10px] text-muted mt-1 leading-relaxed">{def.context.whenToUse}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          const fieldCount = TEMPLATE_DEFS[stockWizard.suggestedTemplate].context.fields.length;
                          setStockWizard({ ...stockWizard, step: 3, answers: Array(fieldCount).fill('') });
                        }}
                        className="w-full py-5 bg-text text-bg rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                      >
                        {t('Seçili Şablonla Yazmaya Başla →')}
                      </button>
                  </div>
                )}

                {/* STEP 3: FORM + REFERANSLAR */}
                {stockWizard.step === 3 && (
                  <div className="space-y-10">
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-text">{t('ADIM 3 — Rehberi Oluştur')}</h4>
                        <p className="text-xs text-muted leading-relaxed">{t('Fikirlerini birleştirerek yeni bir değer üret. Yan taraftaki referansları kullanarak hızlanabilirsin.')}</p>
                      </div>

                      <div className="space-y-12">
                        {TEMPLATE_DEFS[stockWizard.suggestedTemplate].context.fields.map((field, i) => (
                          <div key={i} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent text-bg rounded-lg flex items-center justify-center text-xs font-bold">{i+1}</div>
                              <h5 className="text-sm font-bold uppercase tracking-widest text-accent">{field.label}</h5>
                            </div>
                            
                            <p className="text-[10px] text-muted italic leading-relaxed border-l-2 pl-4 border-accent/30">{field.hint}</p>

                            <textarea
                              id={`stock-field-${i}`}
                              value={stockWizard.answers[i]}
                              onChange={e => {
                                const ans = [...stockWizard.answers];
                                ans[i] = e.target.value;
                                setStockWizard({ ...stockWizard, answers: ans });
                              }}
                              rows={6}
                              className="w-full p-6 bg-surface text-text border-2 border-border focus:border-accent rounded-[32px] text-sm outline-none resize-none leading-relaxed transition-all shadow-inner serif italic"
                              placeholder={t("Fikirlerini burada harmanla...")}
                            />

                            <div className="space-y-3">
                              <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] opacity-60">{t('Seçtiğin fikirlerden:')}</div>
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {posts.filter(p => stockWizard.selectedPostIds.includes(p.id)).map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      const ans = [...stockWizard.answers];
                                      const clean = p.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 120);
                                      ans[i] = ans[i] ? ans[i] + '\n\n' + clean + '...' : clean + '...';
                                      setStockWizard({ ...stockWizard, answers: ans });
                                      setTimeout(() => {
                                        const ta = document.getElementById(`stock-field-${i}`);
                                        if (ta) {
                                          ta.scrollTop = ta.scrollHeight;
                                          ta.focus();
                                        }
                                      }, 50);
                                    }}
                                    className="shrink-0 p-3 bg-accent/5 border border-accent/20 rounded-xl text-[10px] italic text-text/60 max-w-[180px] hover:bg-accent/10 hover:border-accent/40 transition-all text-left group"
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="font-bold opacity-60 text-[8px] uppercase">{p.date}</span>
                                      <Plus size={10} className="text-accent" />
                                    </div>
                                    <div className="line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.content }} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setStockWizard({ ...stockWizard, step: 4 })}
                        className="w-full py-5 bg-text text-bg rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                      >
                        {t('Önizleme ve Yayınla →')}
                      </button>
                  </div>
                )}

                {/* STEP 4: ÖNİZLEME → YAYINLA */}
                {stockWizard.step === 4 && (
                  <div className="space-y-10">
                    <div className="space-y-3 text-center">
                      <div className="text-[10px] font-bold text-accent tracking-[0.3em] uppercase">{t('ADIM 4 — SON DOKUNUŞLAR')}</div>
                      <h4 className="text-2xl font-bold text-text">{t('Tamamlanmış Rehberin')}</h4>
                    </div>

                    <div className="bg-surface border-2 border-border p-8 rounded-[40px] space-y-6 shadow-inner serif italic text-sm leading-relaxed text-text/80 shadow-accent/5">
                      <div dangerouslySetInnerHTML={{ __html: buildGuideContent(stockWizard.suggestedTemplate, stockWizard.tag, stockWizard.answers) }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setStockWizard({ ...stockWizard, step: 3 })}
                        className="py-5 border-2 border-border rounded-[24px] font-bold uppercase tracking-widest text-xs hover:bg-surface transition-colors"
                      >
                        {t('← Düzenle')}
                      </button>
                      <button
                        onClick={() => {
                          const { tag, suggestedTemplate, answers } = stockWizard;
                          addPost({
                            id: Date.now(),
                            content: buildGuideContent(suggestedTemplate, tag, answers),
                            tags: [tag, '#mini-rehber'],
                            isPublished: true,
                            date: new Date().toLocaleDateString('tr-TR'),
                            isTeaching: true,
                            guideType: suggestedTemplate,
                            sourceTag: tag,
                          } as Post);
                          archivePostsByTag(tag);
                          setStockWizard({ ...stockWizard, step: 5 });
                        }}
                        className="py-5 bg-success text-white rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                      >
                        {t('Yayınla ✓')}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: TEBRİKLER / SON */}
                {stockWizard.step === 5 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center text-6xl shadow-2xl animate-bounce">🎊</div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-text">{t('Muazzam Stok Eritme!')}</h3>
                      <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
                        {t('Seçtiğin fikirleri birleştirerek')} <strong>{stockWizard.tag}</strong> {t('üzerine harika bir rehber oluşturdun. Austin Kleon gurur duyardı!')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setStockWizard(null);
                        setSelectedTag(null);
                        setShowStockAlertForTag(null);
                      }}
                      className="px-12 py-5 bg-text text-bg rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                    >
                      {t('Kabineye Dön')}
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}