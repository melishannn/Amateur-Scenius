import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect, memo, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, ChevronLeft, ArrowRight, Trash2, Music, FileText, Plus, X, AlertTriangle, Tag, Info, ArrowLeft, Check } from 'lucide-react';
import { DeleteAlertDialog } from './ui/DeleteAlertDialog';
import { MoveTagDialog } from './ui/MoveTagDialog';
import { InfoModal } from './ui/InfoModal';

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
  archivePostsByIds: (ids: number[]) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
  isLoading?: boolean;
}

// ─── ŞABLON TANIM ──────────────────
const TEMPLATE_DEFS = {
  technical: {
    icon: '🛠️',
    labelKey: 'template.technical.label',
    color: '#4A72FF',
    colorSoft: '#4A72FF1A',
    colorBorder: '#4A72FF33',
    context: {
      headlineKey: 'template.technical.headline',
      bodyKey: 'template.technical.body',
      quoteKey: 'template.technical.quote',
      whenToUseKey: 'template.technical.when',
      fields: [
        { labelKey: 'template.technical.fields.0.label', hintKey: 'template.technical.fields.0.hint' },
        { labelKey: 'template.technical.fields.1.label', hintKey: 'template.technical.fields.1.hint' },
        { labelKey: 'template.technical.fields.2.label', hintKey: 'template.technical.fields.2.hint' },
        { labelKey: 'template.technical.fields.3.label', hintKey: 'template.technical.fields.3.hint' },
      ]
    }
  },
  documentary: {
    icon: '🎬',
    labelKey: 'template.documentary.label',
    color: '#E76F51',
    colorSoft: '#E76F511A',
    colorBorder: '#E76F5133',
    context: {
      headlineKey: 'template.documentary.headline',
      bodyKey: 'template.documentary.body',
      quoteKey: 'template.documentary.quote',
      whenToUseKey: 'template.documentary.when',
      fields: [
        { labelKey: 'template.documentary.fields.0.label', hintKey: 'template.documentary.fields.0.hint' },
        { labelKey: 'template.documentary.fields.1.label', hintKey: 'template.documentary.fields.1.hint' },
        { labelKey: 'template.documentary.fields.2.label', hintKey: 'template.documentary.fields.2.hint' },
      ]
    }
  },
  readingList: {
    icon: '📚',
    labelKey: 'template.readingList.label',
    color: '#2A9D8F',
    colorSoft: '#2A9D8F1A',
    colorBorder: '#2A9D8F33',
    context: {
      headlineKey: 'template.readingList.headline',
      bodyKey: 'template.readingList.body',
      quoteKey: 'template.readingList.quote',
      whenToUseKey: 'template.readingList.when',
      fields: [
        { labelKey: 'template.readingList.fields.0.label', hintKey: 'template.readingList.fields.0.hint' },
        { labelKey: 'template.readingList.fields.1.label', hintKey: 'template.readingList.fields.1.hint' },
        { labelKey: 'template.readingList.fields.2.label', hintKey: 'template.readingList.fields.2.hint' },
      ]
    }
  },
  oldVsNew: {
    icon: '🌱',
    labelKey: 'template.oldVsNew.label',
    color: '#6A4C93',
    colorSoft: '#6A4C931A',
    colorBorder: '#6A4C9333',
    context: {
      headlineKey: 'template.oldVsNew.headline',
      bodyKey: 'template.oldVsNew.body',
      quoteKey: 'template.oldVsNew.quote',
      whenToUseKey: 'template.oldVsNew.when',
      fields: [
        { labelKey: 'template.oldVsNew.fields.0.label', hintKey: 'template.oldVsNew.fields.0.hint' },
        { labelKey: 'template.oldVsNew.fields.1.label', hintKey: 'template.oldVsNew.fields.1.hint' },
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



const CabinetCard = memo(({ p, selectedItemIds, toggleSelection, toggleStar, setMoveTargetPostId, deleteSingle, stars, t, setSelectedPostId }: {
  p: Post;
  selectedItemIds: number[];
  toggleSelection: (id: number) => void;
  toggleStar: (id: number) => void;
  setMoveTargetPostId: (id: number) => void;
  deleteSingle: (id: number) => void;
  stars: number[];
  t: (k: string) => string;
  setSelectedPostId: (id: number) => void;
}) => (
  <motion.div
    layout
    key={p.id}
    onClick={() => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        setSelectedPostId(p.id);
      }
    }}
    className={`cabinet-card relative glass-card border p-8 rounded-[40px] shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer group hover:-translate-y-1 ${selectedItemIds.includes(p.id) ? 'border-accent ring-2 ring-accent/20' : 'border-border'}`}
  >
    <div className="absolute top-6 left-6 z-10" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={selectedItemIds.includes(p.id)}
        onChange={() => toggleSelection(p.id)}
        className="w-5 h-5 rounded border-border text-accent focus:ring-accent cursor-pointer"
      />
    </div>
    <div className="flex justify-between items-center mb-6 pl-8 cabinet-card-actions">
      <span className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase">{p.date}</span>
      <div className="flex items-center gap-3">
        {!p.isPublished ? (
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-full border border-accent/20">{t('cabinet.draft')}</span>
        ) : (
          <span className="text-[9px] font-bold text-success uppercase tracking-widest px-2 py-1 bg-success/10 rounded-full border border-success/20">{t('cabinet.published')}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleStar(p.id); }}
          className="hover:scale-110 transition-transform p-1"
          title={t('cabinet.star_btn')}
        >
          <Star size={18} className={stars.includes(p.id) ? "fill-[#FFD166] text-[#FFD166]" : "text-muted hover:text-[#FFD166]"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMoveTargetPostId(p.id); }}
          className="text-muted hover:text-[#4A72FF] hover:scale-110 transition-all p-1"
          title={t('cabinet.move_btn')}
        >
          <Tag size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteSingle(p.id); }}
          className="text-muted hover:text-danger hover:scale-110 transition-all p-1"
          title={t('cabinet.delete_btn')}
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
));

function VirtualTagTimeline({ sortedPosts, renderPost }: { sortedPosts: Post[], renderPost: (p: Post) => React.ReactNode }) {
  return (
    <div className="space-y-10">
      {sortedPosts.map((p) => (
        <div key={p.id} className="relative">
          <div className={`absolute -left-[2.1rem] md:-left-[2.6rem] top-7 w-4 h-4 rounded-full border-2 z-10 transition-colors ${
            p.isPublished
              ? 'bg-success border-success shadow-[0_0_12px_rgba(34,197,94,0.6)]'
              : 'bg-bg border-accent'
          }`} />
          {renderPost(p)}
        </div>
      ))}
    </div>
  );
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function Cabinet({ posts, stars, toggleStar, saveNote, notes, addPost, deletePost, deleteTag, publishPost, updatePostTags, archivePostsByTag, archivePostsByIds, scrollRef, isLoading }: CabinetProps) {
  const { t, lang } = useLanguage();



  const [filter, setFilter] = useState<'all' | 'starred' | 'draft' | 'published'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [showStockAlertForTag, setShowStockAlertForTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => posts.filter(p => {
    if (filter === 'starred') return stars.includes(p.id);
    if (filter === 'draft') return !p.isPublished;
    if (filter === 'published') return p.isPublished;
    return true;
  }), [posts, filter, stars]);

  const groups = useMemo(() => {
    const g: Record<string, Post[]> = {};
    filteredPosts.forEach(p => {
      if (p.isArchived) return;
      p.tags.forEach(t => {
        if (!g[t]) g[t] = [];
        g[t].push(p);
      });
    });
    return g;
  }, [filteredPosts]);

  const draftCountsByTag = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => {
      if (p.isArchived || p.isPublished) return;
      p.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [posts]);

  const handleSetStockStep = useCallback((e: any) => {
    const step = e.detail.step;
    const tag = e.detail.tag;
    console.log('Cabinet: handleSetStockStep received:', step, tag);
    if (step === -1) {
      setStockWizard(null);
      return;
    }

    const liveGroups: Record<string, Post[]> = {};
    posts.forEach(p => {
      if (p.isArchived) return;
      p.tags.forEach(t => {
        if (!liveGroups[t]) liveGroups[t] = [];
        liveGroups[t].push(p);
      });
    });

    const targetTag = tag || selectedTag || Object.keys(liveGroups)[0] || 'cesaret';
    
    if (targetTag) {
      setSelectedTag(targetTag);
      setShowStockAlertForTag(targetTag);
    }
    setStockWizard({
      tag: targetTag,
      step,
      selectedPostIds: posts.filter(p => !p.isArchived && p.tags.includes(targetTag)).map(p => p.id),
      approvedKeywords: [],
      suggestedTemplate: 'technical',
      answers: ['', '', '', '', '']
    });
  }, [posts, setSelectedTag, setShowStockAlertForTag, selectedTag]);

  useEffect(() => {
    window.addEventListener('set-stock-wizard-step', handleSetStockStep);
    return () => window.removeEventListener('set-stock-wizard-step', handleSetStockStep);
  }, [handleSetStockStep]);

  // ─── Dialog State ───
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [moveTargetPostId, setMoveTargetPostId] = useState<number | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // ─── Silme fonksiyonları ───
  const toggleSelection = (id: number) => {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteSelected = () => {
    if (selectedItemIds.length === 0) return;
    setDeleteTarget({ 
      type: 'selected', 
      ids: selectedItemIds, 
      label: t('cabinet.delete_selected_label', { count: selectedItemIds.length }),
      count: selectedItemIds.length 
    });
  };

  const deleteAllInTag = (tagPosts: Post[]) => {
    if (tagPosts.length === 0) return;
    setDeleteTarget({ 
      type: 'allInTag', 
      ids: tagPosts.map(p => p.id),
      label: t('cabinet.delete_all_tag_label', { count: tagPosts.length }),
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

  useEffect(() => {
    if (deleteTarget || moveTargetPostId || isInfoModalOpen || templateModal || stockWizard) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [deleteTarget, moveTargetPostId, isInfoModalOpen, templateModal, stockWizard]);

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
    console.log('openStockWizard called with tag:', tag);
    if (!tag) {
       console.error('openStockWizard called with null/empty tag');
       return;
    }
    const tagPosts = groups[tag] || [];
    const drafts = tagPosts.filter(p => !p.isPublished);
    console.log('tagPosts length:', tagPosts.length, 'drafts:', drafts.length);
    console.log('groups:', groups);
    
    setStockWizard({
      tag,
      step: 0,
      selectedPostIds: drafts.length > 0 ? drafts.map(p => p.id) : tagPosts.map(p => p.id), // Varsayılan sadece taslaklar seçili
      approvedKeywords: [],
      suggestedTemplate: 'technical',
      answers: []
    });
    console.log('stockWizard state set');
    setTimeout(() => {
    console.log('500ms sonra stockWizard:', stockWizard);
  }, 500);
  };

  const STOCK_TARGET = 10;

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
    if (latest) return `${t('cabinet.attribution')}: ${latest.attrName}`;
    return t('cabinet.no_attribution');
  };

  const openTemplateModal = (tag: string, type: TemplateKey, count: number) => {
    setTemplateModal({ tag, type, count, step: 'context', answers: Array(5).fill('') }); // Fixed size or handle dynamically
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
        `<strong>${t('template.technical.fields.0.label')}:</strong><br>${g(0)}<br><br>` +
        `<strong>${t('template.technical.fields.1.label')}:</strong><br>${g(1)}<br><br>` +
        `<strong>${t('template.technical.fields.2.label')}:</strong><br>${g(2)}<br><br>` +
        `<strong>${t('template.technical.fields.3.label')}:</strong><br>${g(3)}`;
    } else if (type === 'documentary') {
      return header +
        `<strong>${t('template.documentary.fields.0.label')}:</strong><br>${g(0)}<br><br>` +
        `<strong>${t('template.documentary.fields.1.label')}:</strong><br>${g(1)}<br><br>` +
        `<strong>${t('template.documentary.fields.2.label')}:</strong><br>${g(2)}`;
    } else if (type === 'readingList') {
      return header +
        `<strong>${t('template.readingList.fields.0.label')}:</strong><br>${g(0)}<br><br>` +
        `<strong>${t('template.readingList.fields.1.label')}:</strong><br>${g(1)}<br><br>` +
        `<strong>${t('template.readingList.fields.2.label')}:</strong><br>${g(2)}`;
    } else if (type === 'oldVsNew') {
      return header +
        `<strong>${t('template.oldVsNew.fields.0.label')}:</strong><br>${g(0)}<br><br>` +
        `<strong>${t('template.oldVsNew.fields.1.label')}:</strong><br>${g(1)}`;
    }
    return header;
  };

  const publishGuide = () => {
    if (!templateModal) return;
    const { tag, type, answers } = templateModal;
    addPost({
      id: Date.now(),
      content: buildGuideContent(type, tag, answers),
      tags: [tag],
      isPublished: true,
      date: new Date().toLocaleDateString('tr-TR'),
      isTeaching: true,
      guideType: type,
      sourceTag: tag,
    } as Post);
    setTemplateModal({ ...templateModal, step: 'done' });
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);
  const allTags = Array.from(new Set(posts.filter(p => !p.isArchived).flatMap(p => p.tags))).sort();

  return (
    <div className="space-y-6 pb-32">

      {/* DELETE DIALOG */}
      <DeleteAlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('Emin misiniz?')}
        description={deleteTarget ? t('cabinet.delete_confirm', { label: deleteTarget.label }) : ''}
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
        <div className="flex items-center justify-between">
          <h2 className="serif text-4xl italic text-text" id="nav-cabinet">
            {t('Merak Kabinesi')}
          </h2>
          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded-full text-[14px] font-bold transition-all shadow-sm border border-accent/20"
            title={t('wizard.bilgi')}
          >
            i
          </button>
        </div>
        <p className="text-sm text-muted leading-relaxed serif italic">
          {t('Her eser bir müze objesidir. Kategorilere tıkla, serüvenin galerisini gör. Favori fikirlerini yıldızla.')}
        </p>
      </div>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={t('Merak Kabinesi')}
        content={
          <div className="space-y-4">
            <div className="border-l-4 border-accent pl-3 py-1">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('cabinet.info_title')}</h4>
              <p className="text-sm italic">{t('cabinet.info_quote')}</p>
            </div>
            <p className="text-sm">{t('cabinet.info_desc1')}</p>
            <p className="text-sm">{t('cabinet.info_desc2')}</p>
          </div>
        }
      />

      {isLoading && posts.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center relative overflow-hidden animate-pulse">
            <div className="w-1/2 h-1/2 bg-accent rounded-full animate-bounce"></div>
          </div>
          <div className="text-[10px] font-bold text-muted tracking-[0.3em] uppercase">
            {t('cabinet.loading')}
          </div>
        </div>
      ) : (
      <>
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
              {f === 'all' && t('cabinet.all_ideas')}
              {f === 'starred' && t('cabinet.starred')}
              {f === 'draft' && t('cabinet.drafts')}
              {f === 'published' && t('cabinet.published_tab')}
            </button>
          ))}
        </div>

        {/* ETİKET BULUTU */}
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 py-2 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto tag-cloud-scroll border-b border-border/50 pb-4">
            <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-border" id="cabinet-tags">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{t('Etiketler:')}</span>
            </div>
            <div className="flex gap-2">
              {allTags
                .filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()))
                .map(tag => {
                  const tagPostsCount = groups[tag]?.length ?? 0;
                  const draftsCount = draftCountsByTag[tag] ?? 0;
                  const hasBucketAlert = draftsCount >= 3 && draftsCount < STOCK_TARGET;
                  const hasMilestoneAlert = draftsCount >= STOCK_TARGET;

                  return (
                    <div key={tag} className="relative group/tag" id={`tag-container-${tag}`}>
                      <button
                        id={`tag-${tag}`}
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`
                          px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border whitespace-nowrap transition-all relative overflow-hidden h-full flex items-center gap-2
                          ${selectedTag === tag
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent shadow-md'
                            : 'bg-white text-purple-900 border-purple-200 hover:border-purple-300'}
                        `}
                      >
                        <span className="relative z-10">{tag}</span>
                        {(hasBucketAlert || hasMilestoneAlert) && (
                          <div 
                            id="stock-wizard-target"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                              setShowStockAlertForTag(tag === showStockAlertForTag ? null : tag);
                            }}
                            className={`stock-chip relative z-20 p-1 rounded-full transition-all cursor-pointer group/alert flex items-center justify-center
                              ${selectedTag === tag 
                                ? 'bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300' 
                                : 'bg-yellow-50 dark:bg-yellow-900/20 shadow-sm border border-yellow-200'}`}
                          >
                            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-75 animate-ping"></div>
                            <AlertTriangle 
                              size={14} 
                              className={`text-yellow-600 dark:text-yellow-400 group-hover/alert:scale-125 transition-transform shrink-0 animate-pulse relative z-10`} 
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
                          <div className="bg-accent text-white text-[10px] p-2 rounded-lg shadow-xl font-bold uppercase tracking-widest">
                            {hasMilestoneAlert ? '🏁 Milestone: Rehber Oluştur' : '📦 Stok Birikti!'}
                          </div>
                          <div className="w-2 h-2 bg-accent rotate-45 mx-auto -mt-1" />
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
              placeholder={t('cabinet.search_tags_placeholder')}
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full glass-card border border-border px-4 py-1.5 rounded-full text-[10px] outline-none focus:border-accent transition-colors"
            />
            {tagSearch && (
              <button onClick={() => setTagSearch('')} className="text-[10px] font-bold text-muted hover:text-danger uppercase tracking-widest whitespace-nowrap">{t('cabinet.clear_btn')}</button>
            )}
          </div>
        </div>
      </div>

      {/* MİLESTONE & PATTERN AREA */}
      <div className="space-y-4 mb-10">
        {selectedTag && showStockAlertForTag === selectedTag && (draftCountsByTag[selectedTag] ?? 0) >= 3 && (
          <div className="space-y-4">
            {(draftCountsByTag[selectedTag] ?? 0) >= STOCK_TARGET ? (
              <div className="bg-surface backdrop-blur-md border border-accent rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center shadow-inner shrink-0 animate-bounce">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <div className="grow space-y-1 text-center md:text-left">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">{t('STOCK CONSOLIDATION')}</div>
                    <div className="text-lg font-bold leading-tight text-text">
                      <strong className="text-accent">{selectedTag}</strong> {t('cabinet.milestone_reached')}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted mt-2">{t('cabinet.template_suggest_wizard')}</div>
                  </div>
                  <div className="flex gap-2">
                    {(['technical', 'documentary', 'readingList', 'oldVsNew'] as TemplateKey[]).map(type => (
                      <button
                        key={type}
                        id={`template-${type}`}
                        onClick={() => setTemplateModal({ tag: selectedTag, type, count: groups[selectedTag].length, step: 'context', answers: Array(5).fill('') })}
                        className="bg-bg border border-border p-4 rounded-2xl hover:border-accent group transition-all text-center flex flex-col items-center gap-2"
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform">{TEMPLATE_DEFS[type].icon}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap text-text group-hover:text-accent transition-colors">{t(TEMPLATE_DEFS[type].labelKey).split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface backdrop-blur-md border border-border rounded-[32px] p-6 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent text-text rounded-xl flex items-center justify-center text-xl shadow-md shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-accent uppercase tracking-widest">{t('cabinet.stock_piled', { tag: selectedTag.replace('#', '') })}</h3>
                      </div>
                      <p className="text-[10px] text-text opacity-70">{t('cabinet.stock_accumulated', { tag: selectedTag, count: groups[selectedTag].length })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openStockWizard(selectedTag);
                      }}
                      className="bg-accent text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-sm flex items-center gap-2"
                    >
                      {t('cabinet.start_wizard')}
                    </button>
                    {(['technical', 'documentary', 'readingList', 'oldVsNew'] as TemplateKey[]).map(type => (
                      <button
                        key={type}
                        id={`template-${type}`}
                        onClick={() => setTemplateModal({ tag: selectedTag, type, count: groups[selectedTag].length, step: 'context', answers: Array(5).fill('') })}
                        className="bg-bg border border-border px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent text-text transition-all shadow-sm flex items-center gap-2"
                      >
                        <span>{TEMPLATE_DEFS[type].icon}</span>
                        <span>{t(TEMPLATE_DEFS[type].labelKey).split(' ')[0]}</span>
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
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="flex items-center gap-2 text-sm text-accent hover:underline font-bold uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full ring-1 ring-accent/10 transition-all shrink-0"
                      >
                        <ChevronLeft size={16} /> {t('cabinet.return_btn')}
                      </button>
            </div>
            <h3 className="serif text-[22px] h-[39px] flex items-center leading-[19px] not-italic text-text">
              {getTagIcon(selectedTag)} {selectedTag}
              <span className="text-sm font-sans not-italic text-muted ml-4 tracking-[0.3em] font-normal uppercase opacity-50">/ {groups[selectedTag]?.length} {t('cabinet.items_count').replace('{count}', '')}</span>
              {(draftCountsByTag[selectedTag] ?? 0) >= 3 && (
                <div className="ml-4 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/40 relative" title="Biriken taslak uyarısı">
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-75 animate-ping"></div>
                  <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 relative z-10 animate-pulse" />
                </div>
              )}
            </h3>

            <div className="pt-4">
              {(() => {
                const tagPosts = (groups[selectedTag] || []).slice().sort((a, b) => {
                  if (a.isPublished === b.isPublished) return 0;
                  return a.isPublished ? 1 : -1;
                });
                const allSelected = tagPosts.length > 0 && selectedItemIds.length === tagPosts.length;
                const someSelected = selectedItemIds.length > 0 && selectedItemIds.length < tagPosts.length;

                const handleSelectAll = () => {
                  if (allSelected) setSelectedItemIds([]);
                  else setSelectedItemIds(tagPosts.map(p => p.id));
                };

                const renderPost = (p: Post) => (
                  <CabinetCard 
                    key={p.id}
                    p={p}
                    selectedItemIds={selectedItemIds}
                    toggleSelection={toggleSelection}
                    toggleStar={toggleStar}
                    setMoveTargetPostId={setMoveTargetPostId}
                    deleteSingle={deleteSingle}
                    stars={stars}
                    t={t}
                    setSelectedPostId={setSelectedPostId}
                  />
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
                        <span className="text-xs font-bold text-text uppercase tracking-widest select-none">{t('cabinet.select_all')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedItemIds.length > 0 && (
                          <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 text-[10px] text-white bg-danger hover:bg-danger/90 font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-colors shadow-md"
                          >
                            <Trash2 size={14} /> {t('cabinet.delete_selected', { count: selectedItemIds.length })}
                          </button>
                        )}
                        <button
                          onClick={() => deleteAllInTag(tagPosts)}
                          className="flex items-center gap-2 text-[10px] text-danger hover:underline font-bold uppercase tracking-widest bg-danger-soft px-4 py-2.5 rounded-full shrink-0"
                        >
                          <Trash2 size={14} /> {t('cabinet.delete_all_tag')}
                        </button>
                      </div>
                    </div>

                    {/* Timeline Görünümü */}
                    <div 
                      className="relative pl-8 md:pl-12 py-4 space-y-10 before:absolute before:left-3 md:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border/50 before:to-transparent"
                    >
                      {(() => {
                        const sortedPosts = [...tagPosts].sort((a, b) => b.id - a.id);
                        return <VirtualTagTimeline sortedPosts={sortedPosts} renderPost={renderPost} />;
                      })()}
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
              <div className="cabinet-empty-state glass-card border border-dashed border-border/80 p-20 rounded-[40px] text-center text-muted italic serif text-lg animate-pulse">
                {t('cabinet.empty_category')}
                <br />
                <span className="text-xs font-sans not-italic uppercase tracking-widest mt-4 block opacity-50">{t('cabinet.searching_lost_works')}</span>
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
                          <div className="tag-progress-bar h-1.5 bg-text/5 dark:bg-black/30 border border-text/10 dark:border-white/10 rounded-full relative">
                            <div
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out bg-white/80 dark:bg-white/60 backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:shadow-[0_0_12px_rgba(255,255,255,0.4)] border border-white/80 dark:border-white/50 group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.9)] dark:group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)] dark:group-hover:border-white"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-muted uppercase tracking-widest">
                            <span>{t('cabinet.items_count', { count: tagPosts.length })}</span>
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
      </>
      )}

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
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('cabinet.close')}
              </button>

              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-[0.5em] opacity-40">{t('cabinet.museum_tag')} — {selectedPost.date}</div>
                  <div className="flex flex-wrap gap-3">
                    {selectedPost.tags.map(t => (
                      <span key={t} className="px-3 py-1 border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-muted">{t}</span>
                    ))}
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${selectedPost.isPublished ? 'border-success text-success bg-success/10' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                      {selectedPost.isPublished ? t('cabinet.published') : t('cabinet.draft')}
                    </span>
                  </div>
                </div>

                <div
                  className="text-lg md:text-xl lg:text-2xl leading-[1.7] md:leading-[1.8] text-text serif italic opacity-95 break-words"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />

                {!selectedPost.isPublished && (
                  <div className="bg-accent-soft border border-accent/20 p-6 rounded-[24px] space-y-3">
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{t('cabinet.hemingway_tactic')}</div>
                    <p className="text-xs text-text/70 leading-relaxed serif italic">
                      {t('cabinet.draft_incomplete')}
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
                      {t('cabinet.continue_today')} <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <div className="text-[10px] font-bold text-muted tracking-[0.4em] uppercase opacity-40">{t('cabinet.museum_artifacts')}</div>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedPost.media.map((m, i) => (
                        <div key={i} className="glass-card border border-border rounded-[24px] overflow-hidden shadow-sm">
                          {m.type === 'image' && <img src={m.url} alt={m.name} className="w-full h-auto object-cover max-h-96" />}
                          {m.type === 'audio' && (
                            <div className="p-6 space-y-3">
                              <div className="flex items-center gap-3">
                                <Music size={18} className="text-accent" />
                                <span className="text-xs font-bold text-text truncate">{m.name || t('wizard.media_audio')}</span>
                              </div>
                              <audio controls src={m.url} className="w-full h-8" />
                            </div>
                          )}
                          {m.type === 'text' && (
                            <div className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText size={18} className="text-muted" />
                                <span className="text-xs font-bold text-text">{m.name || t('wizard.media_text')}</span>
                              </div>
                              <button onClick={() => {
                                const win = window.open('', '_blank');
                                if (win) {
                                  win.document.write(`<html><head><title>${m.name || t('wizard.media_text')}</title><meta charset="utf-8"></head><body style="font-family: system-ui, -apple-system, sans-serif; padding: 2rem 1rem; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #1a1a1a; background: #fafafa;"><h1 style="font-size: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid #eaeaea; padding-bottom: 1rem;">${m.name || t('wizard.media_text')}</h1><div style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 14px; background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea;">${m.content || ''}</div></body></html>`);
                                  win.document.close();
                                } else {
                                  alert(m.content || t('wizard.noise_delete'));
                                }
                              }} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">{t('cabinet.view')}</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPost.attrName && (
                  <div className="pt-10 border-t border-border space-y-4">
                    <div className="text-[10px] font-bold text-muted tracking-[0.4em] uppercase opacity-40">{t('cabinet.attribution_source')}</div>
                    <div className="text-sm">
                      <strong className="block text-lg serif italic text-accent">{selectedPost.attrName}</strong>
                      <a href={selectedPost.attrLink} target="_blank" rel="noreferrer" className="text-xs text-text/50 hover:text-accent hover:underline break-all transition-colors line-clamp-1">{selectedPost.attrLink}</a>
                    </div>
                  </div>
                )}

                <div className="bg-bg border border-border p-8 rounded-[32px] space-y-4 shadow-inner">
                  <label className="text-[10px] font-bold text-muted tracking-[0.3em] uppercase opacity-60">{t('cabinet.revisit_note')}</label>
                  <textarea
                    id="cabinet-note-input"
                    value={notes[selectedPost.id] || ''}
                    onChange={(e) => saveNote(selectedPost.id, e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm italic serif text-text/80 resize-none outline-none leading-relaxed"
                    placeholder={t("cabinet.revisit_placeholder")}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 pt-4 pb-12">
                  <button
                    onClick={() => toggleStar(selectedPost.id)}
                    className={`flex-1 h-14 md:h-16 px-6 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] border flex items-center justify-center gap-3 transition-all duration-300 ${
                      stars.includes(selectedPost.id)
                        ? 'bg-[#FFD166] text-[#3d2960] border-[#FFD166] shadow-xl'
                        : 'bg-surface text-text border-border hover:border-[#FFD166] hover:text-[#3d2960] shadow-sm'
                    }`}
                  >
                    <Star size={16} className={stars.includes(selectedPost.id) ? 'fill-[#3d2960]' : ''} />
                    {stars.includes(selectedPost.id) ? t('cabinet.starred') : t('cabinet.star')}
                  </button>

                  <button
                    onClick={() => setMoveTargetPostId(selectedPost.id)}
                    className="w-14 md:w-16 h-14 md:h-16 rounded-full glass-card border border-[#4A72FF]/30 text-[#4A72FF] hover:bg-[#4A72FF]/10 flex items-center justify-center transition-colors shadow-sm shrink-0"
                    title={t('cabinet.change_category')}
                  >
                    <Tag size={16} className="md:w-5 md:h-5" />
                  </button>

                  <button
                    onClick={() => {
                      deleteSingle(selectedPost.id);
                      setSelectedPostId(null);
                    }}
                    className="w-14 md:w-16 h-14 md:h-16 rounded-full glass-card border border-danger/30 text-danger hover:bg-danger-soft flex items-center justify-center transition-colors shadow-sm shrink-0"
                    title={t('cabinet.delete_artifact')}
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
        {templateModal && createPortal((() => {
          const def = TEMPLATE_DEFS[templateModal.type];
          const { step, answers, tag, type } = templateModal;

          return (
            <div className="fixed inset-0 z-[9995] isolate">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={step !== 'done' ? closeModal : undefined}
                className="absolute inset-0 bg-text/20 backdrop-blur-md"
              />

             <motion.div
  key="drawer"
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
  className="absolute inset-y-0 right-0 w-full md:w-[520px] bg-bg shadow-2xl flex flex-col border-l border-border pointer-events-auto"
>
                <div className="flex items-start justify-between p-6 pb-5 shrink-0"
                  style={{ background: def.colorSoft, borderBottom: `1px solid ${def.colorBorder}` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[16px] flex items-center justify-center text-2xl shadow-md shrink-0"
                      style={{ background: def.color }}>{def.icon}</div>
                    <div className="pr-4 md:pr-12">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-0.5" style={{ color: def.color }}>
                        {tag} · {templateModal.count} {t('cabinet.template_modal_artifact')}
                      </div>
                      <h3 className="text-sm md:text-base font-bold text-text leading-tight w-full max-w-full line-clamp-2 md:line-clamp-none">{t(def.labelKey)}</h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 relative z-10">
                    <button 
                      onClick={closeModal}
                      className="w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center text-[#7a6090] hover:bg-white hover:scale-105 transition-all"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex items-center gap-1.5 mt-2 md:hidden">
                      {(['context', 'form', 'preview'] as const).map((s, i) => (
                        <div key={s} className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{ background: ['context', 'form', 'preview'].indexOf(step) >= i ? def.color : def.colorBorder }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 p-7 space-y-6">

                  {step === 'context' && (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: def.color }}>
                          {t(def.context.headlineKey)}
                        </h4>
                        <p className="text-sm leading-relaxed text-text/80">{t(def.context.bodyKey)}</p>
                        <div className="text-[11px] italic leading-relaxed p-4 rounded-[16px] border-l-4"
                          style={{ background: def.colorSoft, borderColor: def.color, color: def.color }}>
                          {t(def.context.quoteKey)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t('cabinet.fields_to_fill')}</h4>
                        {def.context.fields.map((field, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-[12px] border"
                            style={{ background: def.colorSoft, borderColor: def.colorBorder }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                              style={{ background: def.color }}>{i + 1}</div>
                            <div>
                              <div className="text-[11px] font-bold text-text">{t(field.labelKey)}</div>
                              <div className="text-[10px] text-text/50 italic mt-0.5">{t(field.hintKey)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={modalNext}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ background: def.color }}>
                        {t('cabinet.start_answer')} <ArrowRight size={14} />
                      </button>
                      <button onClick={closeModal}
                        className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors">
                        {t('cabinet.cancel')}
                      </button>
                    </>
                  )}

                  {step === 'form' && (
                    <>
                      <p className="text-[11px] text-muted italic">{t('cabinet.honest_answer')}</p>
                      {def.context.fields.map((field, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                              style={{ background: def.color }}>{i + 1}</div>
                            <label className="text-[11px] font-bold text-text uppercase tracking-wide">{t(field.labelKey)}</label>
                          </div>
                          <p className="text-[10px] text-muted italic leading-relaxed border-l-2 pl-3"
                            style={{ borderColor: def.color + '60' }}>{t(field.hintKey)}</p>
                          <textarea
                            value={answers[i]}
                            onChange={e => setAnswer(i, e.target.value)}
                            rows={4}
                            className="w-full p-4 bg-transparent text-text border rounded-[16px] text-sm outline-none resize-none leading-relaxed transition-colors focus:border-current"
                            style={{ borderColor: answers[i] ? def.color : def.colorBorder }}
                            placeholder={`${t(field.labelKey)} ${t('hakkında yaz...')}`}
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
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t('cabinet.preview_btn').replace(' →', '')}</h4>
                        <div className="bg-bg border border-border rounded-[20px] p-6 space-y-4 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: buildGuideContent(type, tag, answers) }} />
                      </div>

                      <div className="text-[11px] italic p-4 rounded-[16px] text-center leading-relaxed"
                        style={{ background: def.colorSoft, color: def.color }}>
                        {t('cabinet.kleon_pattern_quote')}
                      </div>

                      <button onClick={publishGuide}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ background: def.color }}>
                        {t('cabinet.publish')} ✓
                      </button>
                      <button onClick={() => setTemplateModal({ ...templateModal, step: 'form' })}
                        className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors">
                        {t('cabinet.edit_btn')}
                      </button>
                    </>
                  )}

                  {step === 'done' && (
                    <div className="text-center space-y-8 py-6">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-xl"
                        style={{ background: def.color }}>✓</div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-text">{t('cabinet.stock_wizard_title').replace(/ADIM 0 — /, '')}</h3>
                        <p className="text-sm text-muted leading-relaxed">
                          <strong className="text-text">{tag}</strong> {t('cabinet.completed_guide_desc', {tag: ''})}
                        </p>
                      </div>
                      <div className="text-xs italic leading-relaxed p-5 rounded-[20px]"
                        style={{ background: def.colorSoft, color: def.color }}>
                        {t('cabinet.kleon_pattern_quote')}
                      </div>
                      <button onClick={closeModal}
                        className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg"
                        style={{ background: def.color }}>
                        {t('cabinet.return_btn')}
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          );
        })(), document.body)}
      {/* STOCK BİRİKTİ SİHİRBAZI (YENİ AKIŞ) */}
      {console.log('stockWizard state:', stockWizard)}
      {createPortal((
        <AnimatePresence>
          {stockWizard && (
            <div className="fixed inset-0 z-[10002]">
              <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => stockWizard.step === 5 ? setStockWizard(null) : undefined}
                className="absolute inset-0 bg-black/20 backdrop-blur-xl pointer-events-auto"
              />
              <motion.div
                id="stockDrawer"
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute inset-y-0 right-0 w-full md:w-[600px] bg-bg shadow-2xl flex flex-col border-l border-border pointer-events-auto"
              >
              {/* Wizard Content ... assuming it closes as before */}
              <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent text-bg rounded-xl flex items-center justify-center text-xl font-bold">🛠️</div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text">{t('stock.wizard_title')}</h3>
                    <p className="text-[10px] text-muted font-bold opacity-60 uppercase tracking-tighter">{stockWizard.tag} · {t('cabinet.ideas_selected', { count: stockWizard.selectedPostIds.length })}</p>
                  </div>
                </div>
                <button onClick={() => setStockWizard(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} className="text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
                
                {/* WIZARD STEP INDICATOR - FOR ALL STEPS */}
                <div className="flex gap-2 mb-6">
                  {[0,1,2,3,4].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= stockWizard.step ? 'bg-accent' : 'bg-border'}`} />
                  ))}
                </div>

                {/* STEP 0: ZAMAN ÇİZGİSİ + SEÇİM */}
                {stockWizard.step === 0 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xl font-bold ${selectedTag === 'cesaret' ? 'text-accent' : 'text-text'}`} id="stock-step-0">{t('stock.step_0_title')}</h4>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{t('stock.step_0_desc')}</p>
                    </div>
                    
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                      { (groups[stockWizard.tag] && groups[stockWizard.tag].length > 0) ? (
                        (groups[stockWizard.tag] || []).filter(p => !p.isPublished).map((p) => {
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
                        })
                      ) : (
                        <div className="p-4 text-xs text-muted italic">Bu etikette henüz fikir yok.</div>
                      )}
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
                            ? 'bg-accent text-white hover:scale-[0.98]' 
                            : 'bg-surface text-muted cursor-not-allowed opacity-50'
                        }`}
                      >
                      {stockWizard.selectedPostIds.length < 2 ? t('stock.select_at_least_2') : t('stock.merge_ideas', { count: stockWizard.selectedPostIds.length })}
                    </button>
                  </div>
                )}

                {/* STEP 1: ÖRÜNTÜ EKRANI */}
                {stockWizard.step === 1 && (
                  <div className="space-y-10">
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-accent tracking-[0.3em] uppercase" id="stock-step-1">{t('stock.step_1_title')}</div>
                      </div>
                      <h4 className="text-2xl font-bold text-text">{t('stock.common_points', { count: stockWizard.selectedPostIds.length })}</h4>
                      <p className="text-xs text-muted">{t('stock.step_1_desc')}</p>

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
                              <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('stock.system_suggestion')}</h4>
                              <p className="text-sm font-bold text-text">{t('stock.system_suggestion_desc')}</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-bg border-2 border-accent rounded-2xl flex items-center gap-4 shadow-inner">
                            <span className="text-3xl">{TEMPLATE_DEFS[stockWizard.suggestedTemplate].icon}</span>
                            <div>
                              <p className="text-sm font-bold text-accent uppercase tracking-widest">{t(TEMPLATE_DEFS[stockWizard.suggestedTemplate].labelKey)}</p>
                              <p className="text-[10px] text-muted italic">{t('stock.kleon_quote_structure')}</p>
                            </div>
                          </div>
                        </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 2 } : null)}
                          className="w-full py-5 bg-accent text-white rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl hover:scale-[0.98] transition-all"
                        >
                          {t('stock.continue_with_approved')}
                        </button>
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 0 } : null)}
                          className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors"
                        >
                          {t('common.back')}
                        </button>
                      </div>
                  </div>
                )}

                {/* STEP 2: ŞABLON SEÇİMİ */}
                {stockWizard.step === 2 && (
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-text" id="stock-step-2">{t('stock.step_2_title')}</h4>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{t('stock.step_2_desc')}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(TEMPLATE_DEFS).map(([key, def]) => {
                          const isSuggested = stockWizard.suggestedTemplate === key;
                          const isSelected = stockWizard.suggestedTemplate === key;
                          return (
                              <button
                                key={key}
                                id={`wizard-template-${key}`}
                                onClick={() => setStockWizard({ ...stockWizard, suggestedTemplate: key as TemplateKey })}
                                className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden group ${
                                  isSelected ? 'bg-accent/5 border-accent' : 'bg-surface border-transparent hover:border-border'
                                }`}
                              >
                                {isSuggested && (
                                  <div className="absolute top-0 right-0 bg-accent text-bg px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">{t('stock.suggested_badge')}</div>
                                )}
                                <div className="flex items-center gap-4">
                                  <span className="text-3xl group-hover:scale-110 transition-transform">{def.icon}</span>
                                  <div>
                                    <h5 className="text-sm font-bold text-text uppercase tracking-widest">{t(def.labelKey)}</h5>
                                    <p className="text-[10px] text-muted mt-1 leading-relaxed">{t(def.context.whenToUseKey)}</p>
                                  </div>
                                </div>
                              </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const fieldCount = TEMPLATE_DEFS[stockWizard.suggestedTemplate].context.fields.length;
                            setStockWizard(prev => prev ? { ...prev, step: 3, answers: Array(fieldCount).fill('') } : null);
                          }}
                          className="w-full py-5 bg-accent text-white rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                        >
                          {t('stock.start_writing')}
                        </button>
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 1 } : null)}
                          className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors"
                        >
                          {t('← Geri Dön')}
                        </button>
                      </div>
                  </div>
                )}

                {/* STEP 3: FORM + REFERANSLAR */}
                {stockWizard.step === 3 && (
                  <div className="space-y-10 pb-10">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-text" id="stock-step-3">{t('stock.step_3_title')}</h4>
                        </div>
                        
                        <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r-[24px] space-y-3">
                          <div className="flex items-center gap-2 text-accent">
                            <Info size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('stock.how_to_answer')}</span>
                          </div>
                          <p className="text-xs text-text/80 leading-relaxed italic">
                            {t('stock.how_to_answer_desc')}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-12">
                        {TEMPLATE_DEFS[stockWizard.suggestedTemplate].context.fields.map((field, i) => (
                          <div key={i} className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent text-bg rounded-lg flex items-center justify-center text-xs font-bold">{i+1}</div>
                              <h5 className="text-sm font-bold uppercase tracking-widest text-accent">{t(field.labelKey)}</h5>
                            </div>
                            
                            <p className="text-[10px] text-muted italic leading-relaxed border-l-2 pl-4 border-accent/30">{t(field.hintKey)}</p>

                            <textarea
                              id={`stock-field-${i}`}
                              value={stockWizard.answers[i]}
                              onChange={e => {
                                const ans = [...stockWizard.answers];
                                ans[i] = e.target.value;
                                setStockWizard(prev => prev ? { ...prev, answers: ans } : null);
                              }}
                              rows={6}
                              className="w-full p-6 bg-surface text-text border-2 border-border focus:border-accent rounded-[32px] text-sm outline-none resize-none leading-relaxed transition-all shadow-inner serif italic"
                              placeholder={t("stock.textarea_placeholder")}
                            />

                            <div className="space-y-3">
                              <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] opacity-60">{t('stock.reference_notes')}</div>
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {posts.filter(p => stockWizard.selectedPostIds.includes(p.id)).map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      const ans = [...stockWizard.answers];
                                      const clean = p.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 120);
                                      ans[i] = ans[i] ? ans[i] + '\n\n' + clean + '...' : clean + '...';
                                      setStockWizard(prev => prev ? { ...prev, answers: ans } : null);
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

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 4 } : null)}
                          className="w-full py-5 bg-accent text-white rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-xl"
                        >
                          {t('stock.preview_and_publish')}
                        </button>
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 2 } : null)}
                          className="w-full py-3 rounded-full border border-border text-[11px] font-bold uppercase tracking-widest text-muted hover:bg-bg transition-colors"
                        >
                          {t('← Geri Dön')}
                        </button>
                      </div>
                  </div>
                )}

                {/* STEP 4: ÖNİZLEME → YAYINLA */}
                {stockWizard.step === 4 && (
                  <div className="space-y-10">
                    <div className="space-y-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-[10px] font-bold text-accent tracking-[0.3em] uppercase" id="stock-step-4">{t('stock.step_4_title')}</div>
                      </div>
                      <h4 className="text-2xl font-bold text-text">{t('stock.completed_guide')}</h4>
                    </div>

                    <div className="bg-surface border-2 border-border p-8 rounded-[40px] space-y-6 shadow-inner serif italic text-sm leading-relaxed text-text/80 shadow-accent/5">
                      <div dangerouslySetInnerHTML={{ __html: buildGuideContent(stockWizard.suggestedTemplate, stockWizard.tag, stockWizard.answers) }} />
                    </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setStockWizard(prev => prev ? { ...prev, step: 3 } : null)}
                          className="py-5 bg-surface rounded-full font-bold uppercase tracking-[0.15em] text-[11px] text-accent hover:opacity-90 transition-all outline-none shadow-[inset_0_4px_8px_rgba(0,0,0,0.08),_inset_0_-4px_8px_rgba(255,255,255,0.9)]"
                        >
                          {t('common.edit')}
                        </button>
                      <button
                        onClick={() => {
                          const { tag, suggestedTemplate, answers, selectedPostIds } = stockWizard;
                          addPost({
                            id: Date.now(),
                            content: buildGuideContent(suggestedTemplate, tag, answers),
                            tags: [tag],
                            isPublished: true,
                            date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US'),
                            isTeaching: true,
                            guideType: suggestedTemplate,
                            sourceTag: tag,
                          } as Post);
                          archivePostsByIds(selectedPostIds);
                          setStockWizard({ ...stockWizard, step: 5 });
                        }}
                        className="py-5 bg-accent text-white rounded-full font-bold uppercase tracking-[0.15em] text-[11px] outline-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),_inset_0_-4px_8px_rgba(0,0,0,0.2),_0_8px_16px_rgba(106,80,167,0.3)] hover:scale-[0.98] transition-all"
                      >
                        {t('common.publish_check')}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: TEBRİKLER / SON */}
                {stockWizard.step === 5 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center text-6xl shadow-2xl animate-bounce">🎊</div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-text">{t('stock.success_title')}</h3>
                      <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
                        {t('stock.success_desc_start')} <strong>{stockWizard.tag}</strong> {t('stock.success_desc_end')}
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
                      {t('stock.return_to_cabinet')}
                    </button>
                  </div>
                )}


              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    ), document.body)}
    </div>
  );
}