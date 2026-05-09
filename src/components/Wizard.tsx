import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { Sparkles, Trash2, CheckCircle2, ChevronRight, Share2, ImageIcon, Mic, Quote, Wand2, Type, Music, Info, X, FileText, Layout, Palette, Clock, Tag, Send, ChevronLeft } from 'lucide-react';
import { InfoModal } from './ui/InfoModal';
import { MessageAlertDialog } from './ui/MessageAlertDialog';
import { GoogleGenAI } from "@google/genai";

// API call configuration is now handled via the backend Server endpoint optionally.
// For client side API preview without a backend:
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "API_KEY_PLACEHOLDER" });

interface WizardProps {
  addPost: (post: Post) => void;
  archivePostsByTag: (tag: string) => void;
  hemingwayChain: string;
  saveHemingway: (chain: string) => void;
}

// ─── REHBER ALAN TANIMLARI ────────────────────────────────────────────────────
// Her şablon tipi için zengin label + hint + placeholder
const GUIDE_FIELDS = {
  technical: [
    {
      key: 'tools',
      labelKey: 'guide.technical.tools.label',
      hintKey: 'guide.technical.tools.hint',
      phKey: 'guide.technical.tools.ph',
    },
    {
      key: 's1',
      labelKey: 'guide.technical.s1.label',
      hintKey: 'guide.technical.s1.hint',
      phKey: 'guide.technical.s1.ph',
    },
    {
      key: 's2',
      labelKey: 'guide.technical.s2.label',
      hintKey: 'guide.technical.s2.hint',
      phKey: 'guide.technical.s2.ph',
    },
    {
      key: 's3',
      labelKey: 'guide.technical.s3.label',
      hintKey: 'guide.technical.s3.hint',
      phKey: 'guide.technical.s3.ph',
    },
  ],
  documentary: [
    {
      key: 'target',
      labelKey: 'guide.documentary.target.label',
      hintKey: 'guide.documentary.target.hint',
      phKey: 'guide.documentary.target.ph',
    },
    {
      key: 'difficulties',
      labelKey: 'guide.documentary.difficulties.label',
      hintKey: 'guide.documentary.difficulties.hint',
      phKey: 'guide.documentary.difficulties.ph',
    },
    {
      key: 'lessons',
      labelKey: 'guide.documentary.lessons.label',
      hintKey: 'guide.documentary.lessons.hint',
      phKey: 'guide.documentary.lessons.ph',
    },
  ],
  readingList: [
    {
      key: 'sources',
      labelKey: 'guide.readingList.sources.label',
      hintKey: 'guide.readingList.sources.hint',
      phKey: 'guide.readingList.sources.ph',
    },
    {
      key: 'multimedia',
      labelKey: 'guide.readingList.multimedia.label',
      hintKey: 'guide.readingList.multimedia.hint',
      phKey: 'guide.readingList.multimedia.ph',
    },
    {
      key: 'follows',
      labelKey: 'guide.readingList.follows.label',
      hintKey: 'guide.readingList.follows.hint',
      phKey: 'guide.readingList.follows.ph',
    },
  ],
  oldVsNew: [
    {
      key: 'oldWay',
      labelKey: 'guide.oldVsNew.oldWay.label',
      hintKey: 'guide.oldVsNew.oldWay.hint',
      phKey: 'guide.oldVsNew.oldWay.ph',
    },
    {
      key: 'newWay',
      labelKey: 'guide.oldVsNew.newWay.label',
      hintKey: 'guide.oldVsNew.newWay.hint',
      phKey: 'guide.oldVsNew.newWay.ph',
    },
  ],
} as const;



// ─── MEMOIZED AI OUTPUT DISPLAY ────────────────────────────────────────────────
const PolishedStoryDisplay = memo(({ 
  value, 
  onChange, 
  onRefresh, 
  isLoading, 
  t 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  onRefresh: () => void; 
  isLoading: boolean; 
  t: (k: string) => string;
}) => {
  const polishedStoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading && polishedStoryRef.current) {
      polishedStoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [value, isLoading]);

  return (
    <div className="relative group" ref={polishedStoryRef}>
      <textarea 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-surface p-8 pt-10 border border-border rounded-[32px] text-lg leading-relaxed text-text italic serif shadow-md min-h-[320px] focus:border-accent outline-none transition-all" 
        placeholder={t("wizard.story_generating")} 
      />
      <div className="absolute top-4 left-8 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
        <Type size={14} className="text-muted" /><span className="text-[9px] font-bold uppercase tracking-widest text-muted">{t('wizard.editable')}</span>
      </div>
      <button 
        onClick={onRefresh} 
        disabled={isLoading} 
        className="absolute -top-3 -right-3 w-14 h-14 bg-accent text-text rounded-full flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform disabled:opacity-50 z-10 border-4 border-surface" 
        title={t('wizard.polish_ai')}
      >
        {isLoading ? <Wand2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
        <span className="text-[7px] font-bold mt-0.5">{t('wizard.polish')}</span>
      </button>
    </div>
  );
});

export default function Wizard({ addPost, archivePostsByTag, hemingwayChain, saveHemingway }: WizardProps) {
  const { t } = useLanguage();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTagsAiLoading, setIsTagsAiLoading] = useState(false);
  const [isVampireAiLoading, setIsVampireAiLoading] = useState(false);
  const [isNextLineAiLoading, setIsNextLineAiLoading] = useState(false);
  const [vampireQuote, setVampireQuote] = useState<{ quote: string; author: string; warnings: string[] } | null>(null);
  const [isDocAiLoading, setIsDocAiLoading] = useState(false);

  useEffect(() => {
    const handleSetStep = (e: any) => {
      if (e.detail?.step !== undefined) {
        setStep(e.detail.step);
        // Eğer tur başlıyorsa (adım 0'a çekiliyorsa), rehber modunu kapat ki normal akış hedefleri bulunsun
        if (e.detail.step === 0) {
          setFormData(prev => ({ ...prev, rehberType: '', isTeaching: false }));
        }
      }
    };
    window.addEventListener('set-wizard-step', handleSetStep);
    return () => window.removeEventListener('set-wizard-step', handleSetStep);
  }, []);

  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isAiSummarizingAudio, setIsAiSummarizingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsAiSummarizingAudio(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data) {
              const r = await fetchGemini('gemini-1.5-flash', [
                  t("wizard.ai_audio_summary_prompt"),
                  { inlineData: { data: base64data, mimeType: 'audio/webm' } }
              ]);
              if (r.text) {
                set('q1', r.text.trim());
              }
            }
            setIsAiSummarizingAudio(false);
          };
        } catch (e) {
          console.error(e);
          setIsAiSummarizingAudio(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert(t('wizard.mikrofon_hata'));
    }
  };

  const stopVoiceRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  useEffect(() => {
    // Cabinet'ten "mini rehber başlat" eventi
    const handleRehber = (e: any) => {
      reset();
      const { tag, type, count } = e.detail;
      setFormData(prev => ({
        ...prev,
        tags: tag,
        sourceTag: tag,
        idea: `${count} adet "${tag}" çalışmasını birleştiren bir ${type} rehberi`,
        isTeaching: true,
        rehberType: type
      }));
      setStep(0);
    };

    // Cabinet'ten "taslağa devam et" eventi
    const handleDraft = (e: any) => {
      reset();
      const { content, tags, originalIdea, originalDoc } = e.detail;
      setFormData(prev => ({ 
        ...prev, 
        idea: originalIdea || content.replace(/<[^>]*>/g, ' ').trim().slice(0, 500),
        doc: originalDoc || '',
        tags: tags || ''
      }));
      setStep(0);
    };

    window.addEventListener('start-mini-rehber', handleRehber);
    window.addEventListener('continue-draft', handleDraft);
    return () => {
      window.removeEventListener('start-mini-rehber', handleRehber);
      window.removeEventListener('continue-draft', handleDraft);
    };
  }, []);

  const [alertMessage, setAlertMessage] = useState<{title: string, desc: string, icon?: 'archive' | 'check'} | null>(null);

  const [formData, setFormData] = useState({
    idea: hemingwayChain || '',
    tags: '',
    sourceTag: '',
    doc: '',
    isAmateur: false,
    isTeaching: false,
    platform: t('Kendi Web Sitem — Karargah'),
    attrName: '',
    attrLink: '',
    attrHow: '',
    attrWhy: '',
    attrResonate: '',
    originalIdea: '',
    originalDoc: '',
    q1: '',
    q2: '',
    // Mini rehber alanları
    tools: '',
    s1: '',
    s2: '',
    s3: '',
    target: '',
    difficulties: '',
    lessons: '',
    sources: '',
    multimedia: '',
    follows: '',
    oldWay: '',
    newWay: '',
    nextLine: '',
    polishedStory: '',
    rehberType: '',
    media: [] as { type: 'image' | 'audio' | 'text'; url: string; name?: string; content?: string }[]
  });

  useEffect(() => {
    const handleForceReset = () => {
      if (formData.idea.trim() && step < 7) {
        addPost({
          id: Date.now(),
          content: formData.rehberType ? generateFinalStory() : (formData.idea + (formData.doc ? `<br><br>${formData.doc}` : '')),
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['#genel'],
          isPublished: false,
          media: formData.media,
          date: new Date().toLocaleDateString('tr-TR'),
          isAmateur: formData.isAmateur,
          isTeaching: formData.isTeaching,
          rehberType: formData.rehberType,
          originalIdea: formData.idea,
          originalDoc: formData.doc
        });
        setAlertMessage({ title: 'Taslak Kaydedildi', desc: t('wizard.draft_stored') || 'Fikir defterindeki yazınız taslak olarak kaydedildi.', icon: 'archive' });
      }
      reset();
    };

    window.addEventListener('force-wizard-reset', handleForceReset);
    return () => {
      window.removeEventListener('force-wizard-reset', handleForceReset);
    };
  }, [formData, step]);

  const reset = () => {
    setFormData({
      idea: '', tags: '', doc: '', isAmateur: false, isTeaching: false,
      platform: 'Kendi Web Sitem', attrName: '', attrLink: '', attrHow: '', attrWhy: '',
      attrResonate: '', sourceTag: '', originalIdea: '', originalDoc: '',
      tools: '', s1: '', s2: '', s3: '', target: '', difficulties: '',
      lessons: '', sources: '', multimedia: '', follows: '', oldWay: '',
      newWay: '', q1: '', q2: '', nextLine: '', polishedStory: '', rehberType: '', media: []
    });
    setStep(0);
  };

  const set = useCallback((key: keyof typeof formData, val: any) =>
    setFormData(prev => ({ ...prev, [key]: val })), []);

  // ─── AI FONKSİYONLARI ──────────────────────────────────────────────────────
  const fetchGemini = useCallback(async (modelName: string, contents: any, config?: any) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "gemini-1.5-flash", contents, config })
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return { text: data.text || "" };
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("Günlük ücretsiz AI kullanım limitine ulaşıldı. Lütfen biraz bekleyip tekrar deneyin veya AI Studio ayarlarınızı kontrol edin.");
      }
      console.error("Gemini API Error:", error);
      return { text: "" };
    }
  }, []);

  const fetchGeminiStream = useCallback(async (modelName: string, contents: any, onChunk: (text: string) => void, config?: any) => {
    try {
      const response = await fetch('/api/gemini-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "gemini-1.5-flash", contents, config })
      });
      if (!response.ok) throw new Error(await response.text());
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          if (text) {
             fullText += text;
             onChunk(fullText);
          }
        }
      }
      return { text: fullText };
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        alert(t('wizard.ai_error_429'));
      }
      console.error("Gemini Streaming Error:", error);
      return { text: "" };
    }
  }, [t]);

  const handleSuggestTags = useCallback(async () => {
    if (!formData.idea) return;
    setIsTagsAiLoading(true);
    try {
      const r = await fetchGemini('gemini-1.5-flash', t('wizard.ai_tag_prompt', { idea: formData.idea, lang: t('app.lang_name') }));
      if (r.text) set('tags', r.text.trim());
    } catch (e) { console.error(e); } finally { setIsTagsAiLoading(false); }
  }, [formData.idea, fetchGemini, set]);

  const handleGenerateVampireQuote = useCallback(async () => {
    setIsVampireAiLoading(true);
    try {
      const r = await fetchGemini(
        'gemini-1.5-flash',
        t('wizard.ai_vampire_prompt', { idea: formData.idea }),
        { responseMimeType: 'application/json' }
      );
      if (r.text) {
        try {
          setVampireQuote(JSON.parse(r.text));
        } catch (err) {
          console.error("Vampire Quote Parse Error:", err);
          // Fallback if parse fails
          setVampireQuote({
            quote: "Paylaşım bir cömertlik eylemidir, ego tatmini değil.",
            author: "Austin Kleon",
            warnings: ["Mükemmeliyetçilik", "Görünürlük korkusu"]
          });
        }
      }
    } catch (e) { console.error(e); } finally { setIsVampireAiLoading(false); }
  }, [formData.idea, fetchGemini]);

  const handleGenerateNextLine = useCallback(async () => {
    setIsNextLineAiLoading(true);
    try {
      const r = await fetchGemini(
        'gemini-1.5-flash',
        t('wizard.ai_hemingway_prompt', { polishedStory: formData.polishedStory })
      );
      let result = r.text ? r.text.trim() : '';
      if (result.includes('"')) {
        const matches = result.match(/"([^"]+)"/);
        if (matches && matches[1]) result = matches[1];
      }
      set('nextLine', result);
    } catch (e) { console.error(e); } finally { setIsNextLineAiLoading(false); }
  }, [formData.polishedStory, fetchGemini, set]);

  const handleSummarizeDocs = useCallback(async () => {
    const ctx = [formData.doc, ...formData.media.filter(m => m.type === 'text').map(m => `${m.name}: ${m.content}`)].filter(Boolean).join('\n');
    if (!ctx) return;
    setIsDocAiLoading(true);
    try {
      const r = await fetchGemini(
        'gemini-1.5-flash',
        t('wizard.ai_scenius_prompt', { ctx, idea: formData.idea })
      );
      if (r.text) set('idea', r.text.trim());
    } catch (e) { console.error(e); } finally { setIsDocAiLoading(false); }
  }, [formData.doc, formData.media, formData.idea, fetchGemini, set]);

  const handleAiPolish = useCallback(async () => {
    setIsAiLoading(true);
    set('polishedStory', ''); // Clear before starting stream
    try {
      const currentText = formData.polishedStory || formData.q1;
      await fetchGeminiStream(
        'gemini-1.5-flash',
        t('wizard.ai_enrich_prompt', { 
          attrName: formData.attrName, 
          currentText, 
          idea: formData.idea, 
          doc: formData.doc, 
          attrLink: formData.attrLink 
        }),
        (text) => set('polishedStory', text)
      );
    } catch (e) { 
      console.error(e); 
      alert(t('wizard.alert_ai_error')); 
    } finally { 
      setIsAiLoading(false); 
    }
  }, [formData.polishedStory, formData.q1, formData.idea, formData.doc, formData.attrName, formData.attrLink, fetchGeminiStream, set]);

  // ─── ADIM YÖNLENDİRME ──────────────────────────────────────────────────────
  const nextStep = () => {
    window.dispatchEvent(new CustomEvent('wizard-next-step'));
    let target = step + 1;
    if (formData.rehberType) {
      if (step === 0) target = 2;
      if (step === 2) target = 4;
      if (step === 4) target = 5;
      if (step === 5) target = 7;
    }
    if (target === 5 && !formData.polishedStory && !formData.rehberType) {
      set('polishedStory', formData.q1.trim());
    }
    if (target === 6) handleGenerateVampireQuote();
    if (target === 7) handleGenerateNextLine();
    setStep(target);
  };

  const prevStep = () => {
    let target = step - 1;
    if (formData.rehberType) {
      if (step === 7) target = 4;
      if (step === 5) target = 4;
      if (step === 4) target = 2;
      if (step === 2) target = 0;
    }
    if (target >= 0) setStep(target);
  };

  const toCabinet = (msg: string) => {
    addPost({
      id: Date.now(),
      content: formData.rehberType ? generateFinalStory() : (formData.idea + (formData.doc ? `<br><br>${formData.doc}` : '')),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['#genel'],
      isPublished: false,
      media: formData.media,
      date: new Date().toLocaleDateString('tr-TR'),
      isAmateur: formData.isAmateur,
      isTeaching: formData.isTeaching,
      rehberType: formData.rehberType,
      originalIdea: formData.idea,
      originalDoc: formData.doc
    });
    setAlertMessage({ title: 'Taslak Kaydedildi', desc: msg, icon: 'archive' });
    reset();
  };

  const publish = () => {
    window.dispatchEvent(new CustomEvent('wizard-published'));
    addPost({
      id: Date.now(),
      content: formData.rehberType ? generateFinalStory() : generateFinalStory(formData.polishedStory || formData.q1),
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['#genel'],
      isPublished: true,
      isAmateur: formData.isAmateur,
      isTeaching: formData.isTeaching,
      platform: formData.platform,
      attrName: formData.attrName,
      attrLink: formData.attrLink,
      attrHow: formData.attrHow,
      attrWhy: formData.attrWhy,
      attrResonate: formData.attrResonate,
      media: formData.media,
      date: new Date().toLocaleDateString('tr-TR'),
      rehberType: formData.rehberType,
      guideType: formData.rehberType,
      sourceTag: formData.sourceTag,
      originalIdea: formData.idea,
      originalDoc: formData.doc
    });
    if (formData.sourceTag) {
      archivePostsByTag(formData.sourceTag);
    }
    nextStep();
  };

  const generateFinalStory = (overrideStory?: string) => {
    const g = (val: string) => val || '';
    if (formData.rehberType) {
      const tag = formData.tags.toUpperCase();
      const type = formData.rehberType;
      let c = `<div class="glass border border-border p-8 rounded-[32px]"><div class="text-[10px] uppercase font-bold tracking-widest text-accent mb-6 flex items-center gap-2"><span>❖</span> MİNİ REHBER: ${tag} — ${type.toUpperCase()}</div>`;
      if (type === 'technical') {
        c += `<div class="space-y-6"><div class="pt-2"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Araçlar & Malzemeler')}</strong><div class="text-sm">${g(formData.tools)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Aşama 1: Hazırlık')}</strong><div class="text-sm">${g(formData.s1)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Aşama 2: Uygulama')}</strong><div class="text-sm">${g(formData.s2)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Sonuç Tablosu')}</strong><div class="text-sm">${g(formData.s3)}</div></div></div>`;
      } else if (type === 'documentary') {
        c += `<div class="space-y-6"><div class="pt-2"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Hedef')}</strong><div class="text-sm">${g(formData.target)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Karşılaştığım Zorluklar')}</strong><div class="text-sm">${g(formData.difficulties)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-accent uppercase tracking-widest block mb-2">${t('Çıkardığım Dersler')}</strong><div class="text-sm">${g(formData.lessons)}</div></div></div>`;
      } else if (type === 'readingList') {
        c += `<div class="space-y-6"><div class="pt-2"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Okuma Kaynakları')}</strong><div class="text-sm">${g(formData.sources)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Ses ve Video')}</strong><div class="text-sm">${g(formData.multimedia)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-2">${t('Sahiplenilecek Kişiler')}</strong><div class="text-sm">${g(formData.follows)}</div></div></div>`;
      } else if (type === 'oldVsNew') {
        c += `<div class="space-y-6"><div class="pt-2"><strong class="text-[10px] text-muted uppercase tracking-widest block mb-3">${t('Eskiden Böyle Düşünürdüm')}</strong><div class="glass-card p-5 rounded-2xl border border-border/50 italic opacity-80 text-sm">${g(formData.oldWay)}</div></div><div class="pt-4 border-t border-border/50"><strong class="text-[10px] text-accent uppercase tracking-widest block mb-3">${t('Artık Şunu Biliyorum')}</strong><div class="bg-accent/10 p-5 rounded-2xl border border-accent/20 font-medium text-sm">${g(formData.newWay)}</div></div></div>`;
      }
      c += `</div>`;
      return c;
    }

    const prefix = formData.isTeaching ? t('wizard.teaching_prefix') : t('wizard.documenting_prefix');
    const tone = formData.isAmateur ? `<div class="text-xs text-muted italic mb-4">${t('Uzman değilim, deneme yanılma yapıyorum.')}</div>` : '';
    const storyText = overrideStory !== undefined ? overrideStory : (formData.q1 || 'Bugün yeni bir şey denedim.');
    let attr = '';
    if (formData.attrName) {
      attr = `<div class="mt-6 pt-4 border-t border-border/50 text-xs text-muted"><span class="inline-flex items-center gap-1">📌 <strong>${formData.attrName}</strong>${formData.attrLink ? ` <span class="opacity-50">—</span> <a href="${formData.attrLink}" class="text-accent hover:underline break-all" target="_blank">${formData.attrLink}</a>` : ''}</span></div>`;
    }
    return `<div class="glass border border-border p-6 rounded-[24px] shadow-sm">${tone}<div class="text-[10px] uppercase font-bold tracking-widest text-accent mb-2">${prefix}</div><div class="text-base text-text leading-relaxed whitespace-pre-wrap">${storyText}</div>${attr}</div>`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      const res = re.target?.result as string;
      setFormData(prev => ({ ...prev, media: [...prev.media, { type, url: res, name: file.name }] }));
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = (index: number) =>
    setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));

  // ─── STEP 4: REHBER FORMU ─────────────────────────────────────────────────
  // Ortak textarea bileşeni — zengin label + hint + placeholder
  const GuideField = ({
    fieldKey,
    value,
    onChange,
    rows = 4,
  }: {
    fieldKey: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
  }) => {
    const typeFields = GUIDE_FIELDS[formData.rehberType as keyof typeof GUIDE_FIELDS] ?? [];
    const def = typeFields.find((f: any) => f.key === fieldKey);
    if (!def) return null;

    return (
      <div className="space-y-2">
        {/* Alan başlığı */}
        <label className="text-[11px] font-bold text-text uppercase tracking-widest block">
          {t(def.labelKey)}
        </label>
        {/* Bağlam ipucu */}
        <p className="text-[10px] text-muted leading-relaxed italic border-l-2 border-accent/30 pl-3">
          {t(def.hintKey)}
        </p>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="w-full p-4 bg-transparent border border-border rounded-[16px] text-sm focus:border-accent outline-none resize-none leading-relaxed transition-colors"
          placeholder={t(def.phKey)}
        />
      </div>
    );
  };

  // ─── STEP İÇERİKLERİ ────────────────────────────────────────────────────────
  const steps = [
    // STEP 0: Fikir Defteri
    <div key="s0" className="space-y-8">
      {hemingwayChain && (
        <div className="bg-green-soft border border-green/20 py-5 pr-5 pl-0 ml-5 rounded-[24px] shadow-sm">
          <div className="text-[10px] uppercase tracking-widest mb-2 font-bold opacity-60 text-green pl-5">{t('HEMINGWAY TAKTİĞİ')}</div>
          <p className="italic text-text text-left font-normal pl-5" style={{ fontFamily: 'Times New Roman, serif', fontSize: '13px' }}>"{hemingwayChain}"</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="serif text-4xl italic text-text">
            {t('wizard.idea_notebook_title')}
          </h2>
          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center justify-center w-7 h-7 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded-full text-[14px] font-bold transition-all shadow-sm border border-accent/20"
            title={t('wizard.bilgi')}
          >
            i
          </button>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('start-tour'))}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent hover:text-white text-accent rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm border border-accent/20"
        >
          {t('wizard.playbook_btn')}
        </button>
      </div>

      {formData.rehberType && (
        <div className="glass-card border border-accent/20 p-6 rounded-[24px] space-y-3 shadow-sm border-l-4 border-l-accent">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('wizard.pattern_finding')}</span>
          </div>
          <p className="text-xs text-text/70 leading-relaxed italic">
            {t('wizard.kleon_pattern_wizard')}
            <br /><br />
            <strong>{t('wizard.task_label')}</strong> {t('wizard.task_desc')}
          </p>
        </div>
      )}

      {formData.tags && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
          <Sparkles size={12} /> Taslak: {formData.tags}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-[10px] font-bold tracking-widest text-muted uppercase ml-1">{t('wizard.idea_label')}</label>
        <textarea
          id="idea"
          value={formData.idea}
          onChange={e => set('idea', e.target.value)}
          className="w-full p-6 bg-surface border border-border rounded-[24px] focus:border-accent outline-none text-base min-h-[160px] transition-all scrollbar-hide"
          placeholder={formData.tags ? t('wizard.idea_placeholder_tag', { tag: formData.tags }) : t("wizard.idea_placeholder")}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-bold tracking-widest text-muted uppercase">{t('wizard.tags_label')}</label>
          <button
            onClick={handleSuggestTags}
            disabled={isTagsAiLoading || !formData.idea}
            className="text-[10px] font-bold text-accent uppercase flex items-center gap-1 hover:opacity-70 disabled:opacity-30 transition-all"
          >
            {isTagsAiLoading ? <Wand2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            {t('wizard.suggest_ai')}
          </button>
        </div>
        <input
          id="tag-input"
          type="text"
          value={formData.tags}
          onChange={e => set('tags', e.target.value)}
          className="w-full p-4 px-6 bg-surface border border-border rounded-full focus:border-accent outline-none text-sm transition-all"
          placeholder={t("yazılım, tasarım (virgülle ayır)")}
        />
      </div>
      <button
        onClick={() => { if (!formData.idea.trim()) return alert(t('wizard.no_empty')); nextStep(); }}
        className="w-full bg-accent text-text py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:translate-y-1 transition-all"
      >
        {t('common.continue')} <ChevronRight size={18} />
      </button>
    </div>,

    // STEP 1: 24 Saat Testi
    <div key="s1" className="space-y-8 text-center py-10" id="step-24h">
      <h2 className="serif text-4xl italic text-text">
        {t('wizard.test_24h_title')}
      </h2>
      <p className="text-lg text-muted serif italic max-w-sm mx-auto leading-relaxed">
        {t('wizard.test_24h_desc')}
      </p>
      <div className="flex flex-col gap-4 max-w-xs mx-auto pt-6">
        <button onClick={nextStep} className="w-full bg-accent text-text py-4 rounded-full font-bold text-sm shadow-lg">{t('wizard.test_24h_yes')}</button>
        <button onClick={() => toCabinet(t('wizard.draft_saved'))} className="w-full bg-surface border border-border text-muted py-4 rounded-full text-sm font-semibold">{t('wizard.test_24h_no')}</button>
      </div>
    </div>,

    // STEP 2: Döküman & Artıklar
    <div key="s2" className="space-y-6" id="wizard-media">
      <h2 className="serif text-4xl italic text-text">
        {t('wizard.doc_title')}
      </h2>
      <div className="flex flex-wrap gap-3 py-2">
        <button onClick={() => mediaInputRef.current?.click()} className="flex flex-col items-center justify-center w-24 h-24 bg-surface border-2 border-dashed border-border rounded-[24px] hover:border-accent transition-all group">
          <ImageIcon size={24} className="text-muted group-hover:text-accent" />
          <span className="text-[10px] font-bold mt-2 opacity-60">{t('wizard.media_image')}</span>
          <input type="file" accept="image/*" ref={mediaInputRef} onChange={(e) => handleFileUpload(e, 'image')} className="hidden" />
        </button>
        <button onClick={() => {
          const i = document.createElement('input'); i.type = 'file'; i.accept = 'audio/*';
          i.onchange = (e: any) => handleFileUpload(e, 'audio'); i.click();
        }} className="flex flex-col items-center justify-center w-24 h-24 bg-surface border-2 border-dashed border-border rounded-[24px] hover:border-accent transition-all group">
          <Music size={24} className="text-muted group-hover:text-accent" />
          <span className="text-[10px] font-bold mt-2 opacity-60">{t('wizard.media_audio')}</span>
        </button>
        <div className="flex flex-col items-center justify-center w-24 h-24 bg-accent/5 border-2 border-accent/20 rounded-[24px] hover:border-accent transition-all group relative">
          <button 
            onClick={isRecording ? stopVoiceRecord : startVoiceRecord}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-danger text-white animate-pulse' : 'bg-accent text-white shadow-lg'}`}
          >
            {isRecording ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Mic size={20} />}
          </button>
          <span className="text-[10px] font-bold mt-2 text-accent">{isRecording ? t('wizard.stop') : t('wizard.voice_rec')}</span>
          {!isRecording && <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-[8px] text-white flex items-center justify-center rounded-full animate-bounce">!</div>}
        </div>
        <button onClick={() => {
          const name = prompt(t('wizard.prompt_doc_name'));
          if (name) setFormData(prev => ({ ...prev, media: [...prev.media, { type: 'text', url: '', name }] }));
        }} className="flex flex-col items-center justify-center w-24 h-24 bg-surface border-2 border-dashed border-border rounded-[24px] hover:border-accent transition-all group">
          <Type size={24} className="text-muted group-hover:text-accent" />
          <span className="text-[10px] font-bold mt-2 opacity-60">{t('wizard.media_text')}</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        {formData.media.map((m, i) => (
          <div key={i} className="relative group w-full sm:w-40 h-40 bg-bg border border-border rounded-[24px] flex flex-col items-center justify-center overflow-hidden hover:shadow-md transition-all">
            {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" alt="" />}
            {m.type === 'audio' && <div className="flex flex-col items-center"><Music size={32} className="text-accent mb-2" /><span className="text-[10px] font-bold text-muted px-2 text-center truncate w-32">{m.name}</span></div>}
            {m.type === 'text' && (
              <div className="w-full h-full p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Quote size={16} className="text-accent" />
                  <input value={m.name} onChange={(e) => { const nm = [...formData.media]; nm[i].name = e.target.value; setFormData({ ...formData, media: nm }); }} className="text-[10px] font-extrabold uppercase bg-transparent outline-none w-full" placeholder={t('wizard.note_name')} />
                </div>
                <textarea value={m.content} onChange={(e) => { const nm = [...formData.media]; nm[i].content = e.target.value; setFormData({ ...formData, media: nm }); }} className="text-[10px] h-full w-full bg-transparent resize-none outline-none serif italic leading-relaxed" placeholder={t('wizard.note_placeholder')} />
              </div>
            )}
            <button onClick={() => removeMedia(i)} className="absolute top-3 right-3 p-1.5 bg-danger text-white rounded-full opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] font-bold tracking-widest text-muted uppercase">{t('wizard.raw_material_label')}</label>
          <button onClick={handleSummarizeDocs} disabled={isDocAiLoading || (!formData.doc && !formData.media.some(m => m.type === 'text'))} className="text-[10px] font-bold text-accent uppercase flex items-center gap-1 hover:opacity-70 disabled:opacity-30 transition-all border border-accent-soft rounded-full px-3 py-1">
            {isDocAiLoading ? <Wand2 size={10} className="animate-spin" /> : <Sparkles size={10} />} {t('wizard.summarize_ai')}
          </button>
        </div>
        <textarea 
          id="raw-material"
          value={formData.doc} 
          onChange={e => set('doc', e.target.value)} 
          className="w-full p-4 bg-surface border border-border rounded-[24px] focus:border-accent outline-none text-sm min-h-[100px]" 
          placeholder={t("wizard.raw_material_ph")} 
        />
      </div>
      <div className="flex items-start gap-4 p-5 bg-bg border border-border rounded-[24px]">
        <input type="checkbox" id="amateur" checked={formData.isAmateur} onChange={e => set('isAmateur', e.target.checked)} className="mt-1" />
        <label htmlFor="amateur" className="text-sm"><strong className="block">{t('wizard.amateur_mode_label')}</strong><span className="text-muted text-xs">{t('wizard.amateur_mode_desc')}</span></label>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button onClick={nextStep} className="bg-accent text-text py-4 rounded-full font-bold text-sm shadow-md">{t('wizard.share_btn')}</button>
        <button onClick={() => toCabinet(t('wizard.draft_stored'))} className="bg-surface border border-border text-muted py-4 rounded-full text-sm font-semibold">{t('wizard.museum_btn')}</button>
      </div>
    </div>,

    // STEP 3: So What?
    <div key="s3" className="space-y-8" id="so-what-step">
      <h2 className="serif text-4xl italic text-text">
        {t('wizard.so_what_title')}
      </h2>
      <div className="bg-danger-soft border-l-4 border-danger p-6 rounded-[24px] text-sm text-danger leading-relaxed italic">
        <strong>{t('wizard.sturgeon_law')}</strong> {t('wizard.sturgeon_desc')}
      </div>
      <div className="flex flex-col gap-4 pt-6">
        <button onClick={nextStep} className="w-full bg-accent text-text py-4 rounded-full font-bold text-sm shadow-lg">{t('wizard.spark_continue')}</button>
        <button onClick={() => toCabinet(t('wizard.draft_stored'))} className="w-full bg-surface border border-border text-muted py-4 rounded-full text-sm font-semibold">{t('wizard.not_sure_btn')}</button>
        <button onClick={() => { if (confirm(t('wizard.delete_confirm'))) { reset(); setAlertMessage({ title: 'Silindi', desc: t('wizard.deleted_msg'), icon: 'archive' }); } }} className="w-full border border-danger/30 text-danger py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-danger-soft transition-colors">
          <Trash2 size={16} /> {t('wizard.noise_delete')}
        </button>
      </div>
    </div>,

    // STEP 4: Hikaye & Bağlam — ZENGİN FORM
    <div key="s4" className="space-y-10" id="narrative-step">
      <div className="space-y-4">
        <button onClick={() => { reset(); window.dispatchEvent(new CustomEvent('exit-wizard')); }} className="flex items-center gap-2 text-[11px] font-bold text-muted uppercase tracking-widest border border-border px-4 py-2 rounded-xl hover:bg-bg transition-all">
          {t('← İptal')}
        </button>
        <h2 className="text-xl font-bold text-text uppercase tracking-widest">
          {formData.rehberType === 'technical' && `Adım Adım Teknik Rehber — ${formData.tags}`}
          {formData.rehberType === 'documentary' && `"Nasıl Yaptım?" Belgeseli — ${formData.tags}`}
          {formData.rehberType === 'readingList' && `Atıf Kitapçığı — ${formData.tags}`}
          {formData.rehberType === 'oldVsNew' && `Eski vs. Yeni — ${formData.tags}`}
          {!formData.rehberType && 'Hikaye & Bağlam'}
        </h2>
        <div className="w-full h-px bg-border" />
      </div>

      {/* ── Rehber bağlam kutusu ── */}
      {formData.rehberType && (
        <div className="bg-accent/5 p-8 rounded-[32px] border border-accent/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent text-text rounded-lg flex items-center justify-center text-xs">💡</div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{t('Rehber Bağlamı')}</h4>
          </div>
          <div className="text-sm italic leading-relaxed text-text/80">
            {formData.rehberType === 'technical' && "Aaron Franklin'in barbekü videolarını yapmasındaki mantık nedir? Sadece tarif vermez — ateşi nasıl yaktığını, eti nasıl seçtiğini, sıcaklığı nasıl kontrol ettiğini gösterir. Sen de aynısını yap: okuyucu seni 'izleyerek' aynı sonuca ulaşabilmeli."}
            {formData.rehberType === 'documentary' && "İnsanlar 'sucuğun nasıl yapıldığını' görmek ister. Sadece güzel son ürünü değil, mutfağın arka planını paylaş. Yaptığın hataları, çıkmaz sokakları, planlanmayan döngüleri açık yüreklilikle yaz. Bu dürüstlük seni güvenilir kılar."}
            {formData.rehberType === 'readingList' && "Kleon der ki: 'Seni besleyen kaynakları paylaşmak, seni topluluğun içinde bir kavşak noktasına dönüştürür.' Kaynaklarını paylaştığında, başkalarına kendi öğrenme yolculuklarında harita veriyorsun. Açık bir düğüm ol."}
            {formData.rehberType === 'oldVsNew' && "Amatörden uzmana giden yolculuğun en güçlü belgesi, eski yanılgıları göstermektir. Kleon der ki: 'Amatörlük utanılacak değil, kucaklanacak bir şeydir.' Eski yanlışlarını paylaşmak okuyucuya 'ben de yapabilirim' dedirtir."}
          </div>
        </div>
      )}

      {/* ── Teknik Rehber Formu ── */}
      {formData.rehberType === 'technical' && (
        <div className="space-y-8">
          <GuideField fieldKey="tools" value={formData.tools} onChange={v => set('tools', v)} rows={3} />
          <GuideField fieldKey="s1" value={formData.s1} onChange={v => set('s1', v)} rows={4} />
          <GuideField fieldKey="s2" value={formData.s2} onChange={v => set('s2', v)} rows={4} />
          <GuideField fieldKey="s3" value={formData.s3} onChange={v => set('s3', v)} rows={4} />
        </div>
      )}

      {/* ── Belgesel Formu ── */}
      {formData.rehberType === 'documentary' && (
        <div className="space-y-8">
          <GuideField fieldKey="target" value={formData.target} onChange={v => set('target', v)} rows={3} />
          <GuideField fieldKey="difficulties" value={formData.difficulties} onChange={v => set('difficulties', v)} rows={5} />
          <GuideField fieldKey="lessons" value={formData.lessons} onChange={v => set('lessons', v)} rows={4} />
        </div>
      )}

      {/* ── Atıf Kitapçığı Formu ── */}
      {formData.rehberType === 'readingList' && (
        <div className="space-y-8">
          <GuideField fieldKey="sources" value={formData.sources} onChange={v => set('sources', v)} rows={4} />
          <GuideField fieldKey="multimedia" value={formData.multimedia} onChange={v => set('multimedia', v)} rows={4} />
          <GuideField fieldKey="follows" value={formData.follows} onChange={v => set('follows', v)} rows={4} />
        </div>
      )}

      {/* ── Eski vs Yeni Formu ── */}
      {formData.rehberType === 'oldVsNew' && (
        <div className="space-y-8">
          <GuideField fieldKey="oldWay" value={formData.oldWay} onChange={v => set('oldWay', v)} rows={5} />
          <GuideField fieldKey="newWay" value={formData.newWay} onChange={v => set('newWay', v)} rows={5} />
        </div>
      )}

      {/* ── Normal Akış Formu (rehber değilse) — Kleon: "İki cümle yeter" ── */}
      {!formData.rehberType && (
        <>
          {/* Üç perde: Geçmiş → Şimdi → Gelecek */}
          <div className="space-y-4">

            {/* DVD Ekstra notu */}
            <div className="flex items-center gap-3 p-4 bg-bg rounded-[16px] border border-border">
              <span className="text-lg">🎬</span>
              <p className="text-[10px] text-muted leading-relaxed italic">
                <strong className="text-text not-italic">{t('DVD Ekstrası gibi düşün:')}</strong> {t('Bunlar sınav soruları değil. İki cümle yeter — Kleon der ki "dünyanın senden istediği şey sadece kısa bir açıklamadır."')}
              </p>
            </div>

            {/* PERDE 1 — Geçmiş + Şimdi tek kutuda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">{t('Hikaye')}</span>
                  <span className="text-[9px] text-muted opacity-40 hidden sm:inline">{t('— geçmiş · şimdi · gelecek')}</span>
                </div>
                <button
                  onClick={isRecording ? stopVoiceRecord : startVoiceRecord}
                  disabled={isAiSummarizingAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isRecording 
                      ? 'bg-danger text-white animate-pulse shadow-md border border-danger'
                      : isAiSummarizingAudio
                        ? 'bg-bg text-muted cursor-not-allowed border-border'
                        : 'bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20'
                  }`}
                >
                  {isAiSummarizingAudio ? (
                    <><Wand2 size={12} className="animate-spin" /> {t('Özetleniyor...')}</>
                  ) : isRecording ? (
                    <><Mic size={12} /> {t('Kaydı Bitir')}</>
                  ) : (
                    <><Mic size={12} /> {t('Sesli Anlat (AI Özetlesin)')}</>
                  )}
                </button>
              </div>
              <textarea
                value={formData.q1}
                onChange={e => set('q1', e.target.value)}
                rows={3}
                className="w-full p-5 bg-surface border border-border rounded-[20px] text-sm focus:border-accent outline-none resize-none leading-relaxed transition-colors"
                placeholder={isRecording ? t("Sizi dinliyorum...") : t("Ne yapmaya çalıştım, neredeyim, nereye gidiyorum? (iki cümle yeter)")}
              />
            </div>

            {/* PERDE 2 — Müze Etiketi: sadece kaynak linki zorunlu */}
            <div className="space-y-2" id="attribution-step">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">{t('Müze Etiketi')} <span className="opacity-40 normal-case font-normal">{t('(isteğe bağlı)')}</span></span>
                </div>
                {formData.attrLink && (
                  <span className="text-[9px] text-green-600 font-bold">{t('✓ link var')}</span>
                )}
              </div>
              <div className="bg-surface border border-border rounded-[20px] overflow-hidden divide-y divide-border">
                {/* İsim — isteğe bağlı */}
                <input
                  type="text"
                  value={formData.attrName}
                  onChange={e => set('attrName', e.target.value)}
                  className="w-full p-4 px-5 text-sm focus:bg-bg outline-none transition-colors"
                  placeholder={t("Kimin izi var? (Austin Kleon vb.) — isteğe bağlı")}
                />
                {/* Link — zorunlu eğer isim varsa */}
                <input
                  type="url"
                  value={formData.attrLink}
                  onChange={e => set('attrLink', e.target.value)}
                  className={`w-full p-4 px-5 text-sm focus:bg-bg outline-none transition-colors ${formData.attrName && !formData.attrLink ? 'bg-danger-soft/30' : ''}`}
                  placeholder={formData.attrName ? t("🔗 Link zorunlu — Kleon: linksiz atıf kullanışsız") : t("🔗 Kaynak linki")}
                />
              </div>
              {formData.attrName && !formData.attrLink && (
                <p className="text-[10px] text-danger font-medium pl-1">
                  {t('İsim verdin ama link yok — Kleon\'a göre linksiz atıf internette neredeyse görünmez.')}
                </p>
              )}
            </div>

            {/* Amatör modu toggle — kompakt */}
            <button
              onClick={() => set('isAmateur', !formData.isAmateur)}
              className={`w-full flex items-center gap-3 p-4 rounded-[20px] border text-left transition-all ${
                formData.isAmateur
                  ? 'bg-accent-soft border-accent/30'
                  : 'bg-surface border-border hover:border-accent/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 transition-all ${formData.isAmateur ? 'bg-accent text-white' : 'bg-bg'}`}>
                {formData.isAmateur ? '✓' : '🎭'}
              </div>
              <div>
                <div className="text-[11px] font-bold text-text">{t('Amatör Modu')}</div>
                <div className="text-[10px] text-muted">{t('Henüz uzman değilim, deneme yanılma yapıyorum')}</div>
              </div>
            </button>
          </div>

          <button
            onClick={() => { if (formData.attrName && !formData.attrLink) return alert('İsim girdin ama link yok. Lütfen kaynak linkini ekle.'); nextStep(); }}
            className="w-full bg-accent text-text py-4 rounded-full font-bold text-sm shadow-lg"
          >
            {t('Harmanla →')}
          </button>
        </>
      )}

      {formData.rehberType && (
        <button onClick={nextStep} className="w-full bg-accent text-text py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:scale-[1.02] transition-all shadow-xl">
          {t('Önizleme →')}
        </button>
      )}
    </div>,

    // STEP 5: Hikaye Önizleme / Düzenleme
    <div key="s5" id="polished-story-preview" className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="serif text-4xl italic text-text" id="story-preview-header">{formData.rehberType ? t('wizard.guide_preview') : t('wizard.blended_story')}</h2>
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">{formData.rehberType ? t('wizard.final_check') : t('wizard.edit_decorate')}</p>
      </div>

      {formData.rehberType ? (
        <div className="bg-surface p-8 border border-border rounded-[32px] shadow-lg min-h-[400px] overflow-auto max-h-[600px]">
          <div dangerouslySetInnerHTML={{ __html: generateFinalStory() }} />
        </div>
      ) : (
        <PolishedStoryDisplay 
          value={formData.polishedStory} 
          onChange={v => set('polishedStory', v)} 
          onRefresh={handleAiPolish} 
          isLoading={isAiLoading} 
          t={t} 
        />
      )}

      {formData.rehberType ? (
        <div className="bg-surface border border-border text-text p-6 rounded-[24px] text-xs leading-relaxed text-center shadow-md">
          <strong>{t('Kleon der ki:')}</strong> {t('"İyi bir fikir asla tam bitmez, sadece yayınlanır." Hatalarıyla kucakla. Bu senin')} <strong>{t('stoğun')}</strong>.
        </div>
      ) : (
        <div className="space-y-4 pt-6 text-center">
          <label className="text-[10px] font-bold tracking-widest text-muted uppercase block">{t('Yayın Platformu')}</label>
          <select value={formData.platform} onChange={e => set('platform', e.target.value)} className="w-full p-4 bg-surface border border-border rounded-full text-sm text-center appearance-none shadow-sm font-semibold">
            <option>{t('wizard.platform_website')}</option>
            <option>{t('wizard.platform_x')}</option>
            <option>{t('wizard.platform_linkedin')}</option>
            <option>{t('wizard.platform_substack')}</option>
          </select>
        </div>
      )}

      <button onClick={formData.rehberType ? publish : nextStep} className="w-full bg-accent text-text py-4 rounded-full font-bold text-sm shadow-xl">
        {formData.rehberType ? t('wizard.publish_btn') : t('common.continue_arrow')}
      </button>
    </div>,

    // STEP 6: Son Kontroller & Vampir Testi
    <div key="s6" className="space-y-6" id="vampire-step">
      <div className="flex items-center justify-between">
        <h2 className="serif text-4xl italic text-text">{t('wizard.vampire_test_title')}</h2>
        {isVampireAiLoading && <Wand2 size={24} className="animate-spin text-accent" />}
      </div>
      <div className="grid grid-cols-1 gap-4 pt-4">
        <div className="bg-accent-soft p-8 rounded-[32px] border border-accent/10 shadow-sm">
          {vampireQuote ? (
            <>
              <div className="flex items-center gap-3 mb-3"><Sparkles size={18} className="text-accent" /><div className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('wizard.gathering_data_auth')} — {vampireQuote.author}</div></div>
              <p className="text-sm italic serif text-text leading-relaxed">"{vampireQuote.quote}"</p>
            </>
          ) : isVampireAiLoading ? <div className="h-24 animate-pulse bg-surface/50 rounded-lg" /> : <div className="text-muted text-xs italic">{t('wizard.gathering_data')}</div>}
        </div>
        <div className="bg-danger-soft p-8 rounded-[32px] border border-danger/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-danger"><Share2 size={18} /><div className="text-[10px] font-bold uppercase tracking-widest">{t('wizard.vampire_warning')}</div></div>
          {vampireQuote ? (
            <ul className="text-sm italic serif text-text leading-relaxed list-disc list-inside">{vampireQuote.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
          ) : isVampireAiLoading ? <div className="h-24 animate-pulse bg-surface/50 rounded-lg" /> : (
            <p className="text-sm italic serif text-text leading-relaxed">{t('wizard.metrical_prisoner')}</p>
          )}
        </div>
      </div>
      <div className="bg-surface border border-border text-text p-8 rounded-[32px] text-sm leading-relaxed mt-6 shadow-xl">
        <strong>{t('wizard.perfectionism_prison')}</strong> {t('wizard.perfectionism_prison_desc')}
      </div>
      <div id="wizard-actions">
        <button onClick={publish} className="w-full bg-accent text-text py-5 rounded-full font-bold text-lg shadow-2xl mt-6">
          {t('wizard.close_eye_and_publish')}
        </button>
      </div>
    </div>,

    // STEP 7: Yayınlandı & Hemingway
    <div key="s7" className="space-y-12 py-10 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent text-text rounded-full mb-4 shadow-xl"><CheckCircle2 size={32} /></div>
        <h2 className="serif text-4xl italic text-text uppercase tracking-widest">{formData.rehberType ? t('wizard.success_stock') : t('wizard.success_blended')}</h2>
      </div>
      {formData.rehberType ? (
        <div className="bg-surface border border-border text-text p-10 rounded-[48px] shadow-2xl space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-[0.2em]">{t('wizard.permanent_value')}</h3>
          <p className="text-base italic leading-relaxed opacity-80 serif">{t('wizard.permanent_value_quote')}</p>
          <div className="pt-4 opacity-50 text-[10px] uppercase tracking-widest">{t('— Austin Kleon, Show Your Work')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent/5 text-text p-8 rounded-[32px] text-xs leading-relaxed text-left border border-accent/20 shadow-2xl"><strong>{t('wizard.done_trace')}</strong> {t('wizard.done_trace_kleon')}</div>
          <div className="bg-green-soft border border-green/20 p-8 rounded-[32px] text-xs text-green leading-relaxed text-left shadow-sm"><strong>{t('wizard.done_sabbatical_title')}</strong> {t('wizard.done_sabbatical_desc')}</div>
        </div>
      )}
      <div className="space-y-4 py-10">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold tracking-widest text-muted uppercase block">{t('wizard.hemingway_next_label')}</label>
          {isNextLineAiLoading && <Wand2 size={16} className="animate-spin text-accent" />}
        </div>
        <div className="relative" id="hemingway-step">
          <textarea value={formData.nextLine} onChange={e => set('nextLine', e.target.value)} className="w-full p-8 bg-surface border border-border rounded-[32px] text-lg serif italic focus:border-accent outline-none shadow-md transition-all" placeholder={isNextLineAiLoading ? t('wizard.hemingway_ai_suggesting') : t('wizard.hemingway_ph')} />
          <button onClick={handleGenerateNextLine} disabled={isNextLineAiLoading} className="absolute top-4 right-4 text-accent/40 hover:text-accent transition-colors"><Sparkles size={18} /></button>
        </div>
      </div>
      <button onClick={() => { saveHemingway(formData.nextLine); reset(); window.dispatchEvent(new CustomEvent('exit-wizard')); }} className="w-full bg-accent text-text py-5 rounded-full font-bold text-xl shadow-2xl">
        {t('wizard.save_sabbatical_btn')}
      </button>
    </div>
  ];

  const labels = [
    t('wizard.step_title_0'), t('wizard.step_title_1'), t('wizard.step_title_2'), 
    t('wizard.step_title_3'), t('wizard.step_title_4'), t('wizard.step_title_5'), 
    t('wizard.step_title_6'), t('wizard.step_title_7')
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-lg mx-auto">
      {/* Adım göstergesi */}
      <div id="step-indicator" className="sticky top-0 glass-panel z-20 py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0 md:shadow-none md:border-transparent md:backdrop-blur-none">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {labels.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0 last:grow-0 grow">
              <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[9px] md:text-xs font-extrabold border shrink-0 transition-all duration-500 ${i < step ? 'bg-text text-bg border-text' : i === step ? 'bg-accent text-text border-accent' : 'bg-surface text-muted border-border'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className={`hidden sm:block text-[9px] font-bold uppercase tracking-widest ${i === step ? 'text-accent' : 'text-muted opacity-40'}`}>{l}</div>
              {i < labels.length - 1 && <div className={`h-[1px] min-w-[12px] md:min-w-[20px] grow transition-colors duration-500 ${i < step ? 'bg-text' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      {step > 0 && step < 7 && (
        <button onClick={prevStep} className="flex items-center gap-2 text-[10px] font-bold text-muted hover:text-accent uppercase tracking-[0.2em] transition-colors ml-2">
          <ChevronRight size={14} className="rotate-180" /> {t('common.back')}
        </button>
      )}

      <div className="fixed bottom-24 right-4 md:hidden">
        <button onClick={() => confirm(t('wizard.reset_confirm')) && reset()} className="w-10 h-10 bg-surface/80 backdrop-blur-md border border-border rounded-full flex items-center justify-center shadow-lg text-muted hover:text-danger transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <MessageAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => !open && setAlertMessage(null)}
        title={alertMessage?.title || ''}
        description={alertMessage?.desc || ''}
        icon={alertMessage?.icon || 'archive'}
        onConfirm={() => setAlertMessage(null)}
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={t('wizard.info_title')}
        content={
          <div className="space-y-4">
            <div className="border-l-4 border-accent pl-3 py-1">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('wizard.info_stolen')}</h4>
              <p className="text-sm italic">{t('wizard.info_stolen_quote')}</p>
            </div>
            <p className="text-sm">{t('wizard.info_desc1')}</p>
            <p className="text-sm">{t('wizard.info_desc2')}</p>
          </div>
        }
      />
    </div>
  );
}