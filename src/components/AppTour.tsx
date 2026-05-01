import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  // Hangi wizard adımına geçilmeli
  wizardStep?: number;
  // Hangi tab açılmalı
  tab?: 'flow' | 'cabinet' | 'hub';
  // Bu adımda beklenecek extra süre (ms) — DOM render için
  waitMs?: number;
}

interface AppTourProps {
  run: boolean;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  onTourEnd: () => void;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

// ─── TUR ADIMLARI ────────────────────────────────────────────────────────────
const buildSteps = (): TourStep[] => [
  {
    target: '#idea',
    title: '1. Giriş: Fikir Defteri',
    tab: 'flow',
    wizardStep: 0,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Felsefe</h4>
          <p className="text-sm italic">"Austin Kleon der ki: Deha olmanıza gerek yok. Yaratıcılık, kendinizi bir 'scenius' içinde konumlandırmaktır."</p>
        </div>
        <p className="text-sm">Buraya en küçük gözlemini bile yaz. Amatörler, kaybedecek bir şeyi olmadığı için denemekten çekinmezler.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#tag-input',
    title: '2. Etiketler: Gruplandır',
    tab: 'flow',
    wizardStep: 0,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Aynı etiketteki fikirler zamanla birikerek bir <strong>Stok (Stock)</strong> oluşturur. Austin Kleon'un tavsiyesi: Ortak noktaları bul ve onları birleştir.</p>
        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Devam Et butonuna basarak ilerleyebilirsin.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#step-24h',
    title: '3. 24 Saat Testi',
    tab: 'flow',
    wizardStep: 1,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Austin Kleon</h4>
          <p className="text-sm italic">"Her şeyi anında paylaşmak insan spam'ine yol açabilir."</p>
        </div>
        <p className="text-sm">Fikri 24 saat beklet. Hâlâ heyecan veriyorsa işleme al, yoksa <strong>Müzeye Kaldır</strong>.</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">İki yol var:</p>
          <p className="text-xs">✅ <strong>Evet, işleme al</strong> → Döküman adımına geçer</p>
          <p className="text-xs">🏛️ <strong>Müzeye Kaldır</strong> → Taslak saklanır, tur biter</p>
        </div>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#wizard-media',
    title: '4. Döküman & Artıklar',
    tab: 'flow',
    wizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Süreci Paylaş</h4>
          <p className="text-sm italic">"Sucuğun nasıl yapıldığını göster. Artıklar (residue), ürünün kendisi kadar değerlidir."</p>
        </div>
        <p className="text-sm">Görsel ekle, ses kaydı al veya yazı notları tut.</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">İki yol var:</p>
          <p className="text-xs">📤 <strong>Paylaşacağım →</strong> So What? testine geçer</p>
          <p className="text-xs">🏛️ <strong>Müzeye Al</strong> → Taslak saklanır, tur biter</p>
        </div>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#raw-material',
    title: '5. Ham Madde',
    tab: 'flow',
    wizardStep: 2,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Kod parçaları, karalamalar veya ham notlarını buraya dök. Austin Kleon'a göre <em>"Ham halini paylaşmak dürüstlüktür."</em></p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#so-what-step',
    title: '6. So What? Testi',
    tab: 'flow',
    wizardStep: 3,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Cömertlik</h4>
          <p className="text-sm italic">"Paylaşım bir cömertlik eylemidir, ego tatmini değil."</p>
        </div>
        <p className="text-sm">Kendine sor: Bu başkası için yararlı mı?</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Üç yol var:</p>
          <p className="text-xs">✨ <strong>Bir kıvılcım — devam</strong> → Hikaye adımına geçer</p>
          <p className="text-xs">🏛️ <strong>Emin değilim</strong> → Taslak saklanır</p>
          <p className="text-xs">🗑️ <strong>Sadece gürültü — sil</strong> → Fikir silinir</p>
        </div>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#narrative-step',
    title: '7. Hikaye & Bağlam',
    tab: 'flow',
    wizardStep: 4,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Austin Kleon</h4>
          <p className="text-sm italic">"İş kendi başına konuşmaz. İnsanlar hikayeyi bilmek isterler."</p>
        </div>
        <p className="text-sm">Geçmişte ne hedefledin, şimdi neredesin? İki cümle yeter — hikayeni buraya yaz.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#attribution-step',
    title: '8. Atıf Adabı',
    tab: 'flow',
    wizardStep: 4,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Dürüstlük</h4>
          <p className="text-sm italic">"Atıf İnternet'in ana para birimidir. Linksiz atıf neredeyse görünmezdir."</p>
        </div>
        <p className="text-sm">İlham aldığın kişiyi ve kaynağı belirt. Sonra <strong>Harmanla →</strong> butonuna bas.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#polished-story-preview',
    title: '9. Harmanlanan Hikaye',
    tab: 'flow',
    wizardStep: 5,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Son Rötuş</h4>
          <p className="text-sm italic">"İyi bir fikir asla tam bitmez, sadece yayınlanır." — Kleon</p>
        </div>
        <p className="text-sm">Metni düzenleyebilir veya ✨ <strong>AI Süsle</strong> butonuyla zenginleştirebilirsin. Sonra <strong>Devam →</strong> butonuna bas.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#vampire-step',
    title: '10. Vampir Testi',
    tab: 'flow',
    wizardStep: 6,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Enerji Kontrolü — Austin Kleon</h4>
          <p className="text-sm italic">"Vampir testi basittir: Bir şey seni enerjik hissettiriyorsa, devam et. Seni tüketiyorsa, bırak."</p>
        </div>
        <p className="text-sm">Kleon'a göre mükemmeliyetçilik en büyük vampirdir. Beğeni sayısı, retweet beklentisi — bunlar yaratıcılığını öldürür.</p>
        <p className="text-sm">Fikrinin seni besleyip beslemediğini kontrol et. Hazırsan <strong>"Gözünü kapat ve yayınla"</strong> butonuna bas!</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#wizard-actions',
    title: '11. Yayınla',
    tab: 'flow',
    wizardStep: 6,
    content: (
      <div className="space-y-4">
        <p className="text-sm">Gözünü kapat ve yayınla. Gerçek başarı süreklilikte ve ham haliyle paylaşabilme cesaretindedir.</p>
        <p className="text-[10px] font-bold uppercase text-accent">Butona tıkla ve yayınla!</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#hemingway-step',
    title: '12. Hemingway Tekniği',
    tab: 'flow',
    wizardStep: 7,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Süreklilik</h4>
          <p className="text-sm italic">"Hemingway, ertesi gün nereye gideceğini bildiğinde yazmayı bırakırdı."</p>
        </div>
        <p className="text-sm">Yarın nereden başlayacağını yaz. Bu metot, <em>writer's block</em>'u ortadan kaldırır.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#nav-cabinet',
    title: '13. Merak Kabinesi',
    tab: 'cabinet',
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Wunderkammern</h4>
          <p className="text-sm italic">"Zevklerin seni sen yapan şeydir. Toplamak yaratmayı besler."</p>
        </div>
        <p className="text-sm">Burası senin müzen. Tüm fikirlerin burada gruplanmış halde durur.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#nav-hub',
    title: '14. Dünya Karargahı',
    tab: 'hub',
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Domain Sahibi Ol</h4>
          <p className="text-sm italic">"Sosyal ağlar birer uydudur. Karargahın ise senin kontrolünde olmalıdır."</p>
        </div>
        <p className="text-sm">Burası senin klanını topladığın yer. Tüm yayınlarını buradan yönet.</p>
      </div>
    ),
    placement: 'right',
  },
];

// ─── TOOLTIP POZİSYON HESAPLAMA ───────────────────────────────────────────────
function getTooltipPosition(
  targetEl: Element,
  tooltipEl: HTMLDivElement,
  placement: string
) {
  const targetRect = targetEl.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  const MARGIN = 12;
  const ARROW = 10;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = targetRect.bottom + MARGIN + ARROW;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'top':
      top = targetRect.top - tooltipRect.height - MARGIN - ARROW;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - MARGIN - ARROW;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + MARGIN + ARROW;
      break;
  }

  // Ekran sınırlarına göre düzelt
  const padding = 16;
  left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
  top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

  return { top, left };
}

// ─── SPOTLIGHT OVERLAY ────────────────────────────────────────────────────────
function SpotlightOverlay({ targetRect }: { targetRect: DOMRect | null }) {
  if (!targetRect) return (
    <div className="fixed inset-0 bg-black/60 z-[9998]" style={{ pointerEvents: 'none' }} />
  );

  const rect = targetRect;
  const PAD = 8;

  return (
    <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: 'none' }}>
      {/* Üst */}
      <div className="absolute bg-black/60" style={{ top: 0, left: 0, right: 0, height: rect.top - PAD }} />
      {/* Alt */}
      <div className="absolute bg-black/60" style={{ top: rect.bottom + PAD, left: 0, right: 0, bottom: 0 }} />
      {/* Sol */}
      <div className="absolute bg-black/60" style={{ top: rect.top - PAD, left: 0, width: rect.left - PAD, height: rect.height + PAD * 2 }} />
      {/* Sağ */}
      <div className="absolute bg-black/60" style={{ top: rect.top - PAD, left: rect.right + PAD, right: 0, height: rect.height + PAD * 2 }} />
      {/* Spotlight border */}
      <div className="absolute rounded-2xl" style={{
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        boxShadow: '0 0 0 3px #7c5cff',
        border: '2px solid rgba(124,92,255,0.6)',
      }} />
    </div>
  );
}

// ─── ANA KOMPONENT ────────────────────────────────────────────────────────────
export function AppTour({
  run,
  stepIndex,
  setStepIndex,
  onTourEnd,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}: AppTourProps) {
  const steps = buildSteps();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = steps[stepIndex];

  // ─── HEDEF ELEMENTI BUL ───────────────────────────────────────────────────
  const findAndPositionTarget = useCallback(() => {
    if (!currentStep || !run) return;
    const el = document.querySelector(currentStep.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      if (tooltipRef.current) {
        const pos = getTooltipPosition(el, tooltipRef.current, currentStep.placement || 'bottom');
        setTooltipPos(pos);
      }
      setVisible(true);
    }, 150);
  }, [currentStep, run]);

  // ─── ADIM DEĞİŞİNCE ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!run || !currentStep) return;

    setVisible(false);
    setIsTransitioning(true);
    setTargetRect(null);

    // Sidebar aç
    if (!isSidebarOpen) setIsSidebarOpen(true);

    // Tab değiştir
    if (currentStep.tab) setActiveTab(currentStep.tab);

    // Wizard adımını güncelle
    if (currentStep.wizardStep !== undefined) {
      window.dispatchEvent(new CustomEvent('set-wizard-step', {
        detail: { step: currentStep.wizardStep }
      }));
    }

    // DOM'un render olması için bekle
    const waitTime = currentStep.waitMs ?? 300;
    const timer = setTimeout(() => {
      findAndPositionTarget();
      setIsTransitioning(false);
    }, waitTime);

    return () => clearTimeout(timer);
  }, [stepIndex, run, findAndPositionTarget, isSidebarOpen, setIsSidebarOpen, setActiveTab]);

  // ─── RESIZE'DA POZİSYONU GÜNCELLE ────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const el = currentStep ? document.querySelector(currentStep.target) : null;
      if (el && tooltipRef.current) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        const pos = getTooltipPosition(el, tooltipRef.current, currentStep?.placement || 'bottom');
        setTooltipPos(pos);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [currentStep]);

  if (!run || !currentStep) return null;

  const handleNext = () => {
    if (isTransitioning) return;
    if (stepIndex >= steps.length - 1) {
      onTourEnd();
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const handlePrev = () => {
    if (isTransitioning || stepIndex <= 0) return;
    setStepIndex(stepIndex - 1);
  };

  const handleSkip = () => onTourEnd();

  const isLast = stepIndex === steps.length - 1;

  return createPortal(
    <>
      {/* Spotlight */}
      <SpotlightOverlay targetRect={targetRect} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 9999,
          width: 340,
          opacity: visible && !isTransitioning ? 1 : 0,
          transform: visible && !isTransitioning ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(124,92,255,0.15)',
          backdropFilter: 'blur(20px)',
          color: '#1a0f2e',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c5cff', marginBottom: 4 }}>
                {stepIndex + 1} / {steps.length}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1a0f2e' }}>
                {currentStep.title}
              </div>
            </div>
            <button
              onClick={handleSkip}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b8ab0', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#f0ecfa', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #7c5cff, #a78bfa)',
              borderRadius: 99,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Content */}
          <div style={{ fontSize: 13, lineHeight: 1.6, color: '#3d2d5e', marginBottom: 20 }}>
            {currentStep.content}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleSkip}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#ef8282', padding: '4px 0'
              }}
            >
              Geç
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {stepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  disabled={isTransitioning}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 14px', borderRadius: 12,
                    border: '1px solid #e8e0f5', background: 'transparent',
                    cursor: 'pointer', fontSize: 11, fontWeight: 800,
                    letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a6090',
                    opacity: isTransitioning ? 0.4 : 1,
                  }}
                >
                  <ChevronLeft size={14} /> Geri
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 16px', borderRadius: 12,
                  border: 'none', background: '#7c5cff',
                  cursor: isTransitioning ? 'wait' : 'pointer',
                  fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: 'white',
                  opacity: isTransitioning ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {isTransitioning ? '...' : isLast ? 'Başla ✦' : 'Devam Et'}
                {!isTransitioning && !isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}