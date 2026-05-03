import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

interface TourStep {
  target: string;
  title: string;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  // Hangi wizard adımına geçilmeli
  wizardStep?: number;
  // Hangi stock wizard adımına geçilmeli
  stockWizardStep?: number;
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
const buildSteps = (t: (key: string) => string): TourStep[] => [
  {
    target: '#idea',
    title: t('tour.step1.title'),
    tab: 'flow',
    wizardStep: 0,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step1.phil')}</h4>
          <p className="text-sm italic">{t('tour.step1.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step1.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#tag-input',
    title: t('tour.step2.title'),
    tab: 'flow',
    wizardStep: 0,
    content: (
      <div className="space-y-4">
        <p className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: t('tour.step2.desc') }} />
        </p>
        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('tour.step2.hint')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#step-24h',
    title: t('tour.step3.title'),
    tab: 'flow',
    wizardStep: 1,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step3.phil')}</h4>
          <p className="text-sm italic">{t('tour.step3.quote')}</p>
        </div>
        <p className="text-sm"><span dangerouslySetInnerHTML={{ __html: t('tour.step3.desc') }} /></p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('tour.step3.ways')}</p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step3.way1') }} /></p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step3.way2') }} /></p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#wizard-media',
    title: t('tour.step4.title'),
    tab: 'flow',
    wizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step4.phil')}</h4>
          <p className="text-sm italic">{t('tour.step4.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step4.desc')}</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('tour.step3.ways')}</p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step4.way1') }} /></p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step4.way2') }} /></p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#raw-material',
    title: t('tour.step5.title'),
    tab: 'flow',
    wizardStep: 2,
    content: (
      <div className="space-y-4">
        <p className="text-sm"><span dangerouslySetInnerHTML={{ __html: t('tour.step5.desc') }} /></p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#so-what-step',
    title: t('tour.step6.title'),
    tab: 'flow',
    wizardStep: 3,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step6.phil')}</h4>
          <p className="text-sm italic">{t('tour.step6.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step6.desc')}</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('tour.step6.ways')}</p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step6.way1') }} /></p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step6.way2') }} /></p>
          <p className="text-xs"><span dangerouslySetInnerHTML={{ __html: t('tour.step6.way3') }} /></p>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#narrative-step',
    title: t('tour.step7.title'),
    tab: 'flow',
    wizardStep: 4,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step7.phil')}</h4>
          <p className="text-sm italic">{t('tour.step7.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step7.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#attribution-step',
    title: t('tour.step8.title'),
    tab: 'flow',
    wizardStep: 4,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step8.phil')}</h4>
          <p className="text-sm italic">{t('tour.step8.quote')}</p>
        </div>
        <p className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: t('tour.step8.desc') }} />
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#story-preview-header',
    title: t('tour.step9.title'),
    tab: 'flow',
    wizardStep: 5,
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step9.phil')}</h4>
          <p className="text-sm italic">{t('tour.step9.quote')}</p>
        </div>
        <p className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: t('tour.step9.desc') }} />
        </p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#vampire-step',
    title: t('tour.step10.title'),
    tab: 'flow',
    wizardStep: 6,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step10.phil')}</h4>
          <p className="text-sm italic">{t('tour.step10.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step10.desc1')}</p>
        <p className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: t('tour.step10.desc2') }} />
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#wizard-actions',
    title: t('tour.step11.title'),
    tab: 'flow',
    wizardStep: 6,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step11.desc')}</p>
        <p className="text-[10px] font-bold uppercase text-accent">{t('tour.step11.hint')}</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#hemingway-step',
    title: t('tour.step12.title'),
    tab: 'flow',
    wizardStep: 7,
    waitMs: 600,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step12.phil')}</h4>
          <p className="text-sm italic">{t('tour.step12.quote')}</p>
        </div>
        <p className="text-sm">
          <span dangerouslySetInnerHTML={{ __html: t('tour.step12.desc') }} />
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '#nav-cabinet',
    title: t('tour.step13.title'),
    tab: 'cabinet',
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step13.phil')}</h4>
          <p className="text-sm italic">{t('tour.step13.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step13.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#cabinet-tags',
    title: t('tour.step14.title'),
    tab: 'cabinet',
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step14.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#stock-wizard-target',
    title: t('tour.step15.title'),
    tab: 'cabinet',
    waitMs: 300,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step15.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#stock-step-0',
    title: t('tour.step16.title'),
    tab: 'cabinet',
    stockWizardStep: 0,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step16.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#stock-step-1',
    title: t('tour.step17.title'),
    tab: 'cabinet',
    stockWizardStep: 1,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step17.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#stock-step-2',
    title: t('tour.step18.title'),
    tab: 'cabinet',
    stockWizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step18.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#template-technical',
    title: t('tour.step19.title'),
    tab: 'cabinet',
    stockWizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step19.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#template-documentary',
    title: t('tour.step20.title'),
    tab: 'cabinet',
    stockWizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step20.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#template-readingList',
    title: t('tour.step21.title'),
    tab: 'cabinet',
    stockWizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step21.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#template-oldVsNew',
    title: t('tour.step22.title'),
    tab: 'cabinet',
    stockWizardStep: 2,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step22.desc')}</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#stock-step-3',
    title: t('tour.step23.title'),
    tab: 'cabinet',
    stockWizardStep: 3,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step23.phil')}</h4>
          <p className="text-sm italic">{t('tour.step23.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step23.desc')}</p>
        <div className="bg-accent/10 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('tour.step3.ways')}</p>
          <p className="text-xs">
            <span dangerouslySetInnerHTML={{ __html: t('tour.step23.hint') }} />
          </p>
        </div>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '#stock-step-4',
    title: t('tour.step24.title'),
    tab: 'cabinet',
    stockWizardStep: 4,
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <p className="text-sm">{t('tour.step24.desc')}</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '#nav-hub',
    title: t('tour.step25.title'),
    tab: 'hub',
    waitMs: 500,
    content: (
      <div className="space-y-4">
        <div className="border-l-4 border-accent pl-3 py-1">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{t('tour.step25.phil')}</h4>
          <p className="text-sm italic">{t('tour.step25.quote')}</p>
        </div>
        <p className="text-sm">{t('tour.step25.desc')}</p>
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
  const WIN_W = window.innerWidth;
  const WIN_H = window.innerHeight;

  if (WIN_W < 768) {
    return {
      top: WIN_H - tooltipRect.height - 16,
      left: (WIN_W - tooltipRect.width) / 2
    };
  }

  // Available space calculations
  const spaceTop = targetRect.top;
  const spaceBottom = WIN_H - targetRect.bottom;
  const spaceLeft = targetRect.left;
  const spaceRight = WIN_W - targetRect.right;
  const reqWidth = tooltipRect.width + MARGIN + ARROW;
  const reqHeight = tooltipRect.height + MARGIN + ARROW;

  // Decision logic for actual placement
  let actualPlacement = placement;

  // Mobile fallback or space shortage fallback
  if (WIN_W < 1024 && (placement === 'right' || placement === 'left')) {
    actualPlacement = spaceBottom > spaceTop ? 'bottom' : 'top';
  }

  // Ensure chosen placement actually fits
  if (actualPlacement === 'right' && spaceRight < reqWidth) actualPlacement = spaceLeft > spaceRight ? 'left' : (spaceBottom > spaceTop ? 'bottom' : 'top');
  if (actualPlacement === 'left' && spaceLeft < reqWidth) actualPlacement = spaceRight > spaceLeft ? 'right' : (spaceBottom > spaceTop ? 'bottom' : 'top');
  if (actualPlacement === 'bottom' && spaceBottom < reqHeight) actualPlacement = spaceTop > reqHeight ? 'top' : (spaceRight > spaceLeft ? 'right' : 'left');
  if (actualPlacement === 'top' && spaceTop < reqHeight) actualPlacement = spaceBottom > reqHeight ? 'bottom' : (spaceRight > spaceLeft ? 'right' : 'left');

  let top = 0;
  let left = 0;

  switch (actualPlacement) {
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

  // Safe clamping to keep it completely inside the viewport, but only on the NON-overlap axis
  const padding = 16;
  if (actualPlacement === 'top' || actualPlacement === 'bottom') {
    left = Math.max(padding, Math.min(left, WIN_W - tooltipRect.width - padding));
    // Do not aggressively clamp `top`. Let `scrollIntoView` or inherent page scroll handle it, so it doesn't overlap the target.
    // If we absolutely must push it, only push it if it goes completely beyond the document (but window bounds are enough).
  } else {
    top = Math.max(padding, Math.min(top, WIN_H - tooltipRect.height - padding));
  }

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
  const { t } = useLanguage();
  const steps = useMemo(() => buildSteps(t), [t]);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentStep = steps[stepIndex];

  // ─── HEDEF ELEMENTI BUL ───────────────────────────────────────────────────
  const findAndPositionTarget = useCallback((retryCount = 0) => {
    if (!currentStep || !run) return;
    const el = document.querySelector(currentStep.target);
    
    if (!el) {
      if (retryCount < 12) { 
        setTimeout(() => findAndPositionTarget(retryCount + 1), 200);
      } else {
        console.warn(`Tour target not found: ${currentStep.target}`);
        // Default to center if not found
        setTargetRect(null);
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          setTooltipPos({
             top: window.innerHeight / 2 - tooltipRect.height / 2,
             left: window.innerWidth / 2 - tooltipRect.width / 2
          });
        }
        setVisible(true);
        setIsTransitioning(false);
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    // Eğer element görünür değilse (yüksekliği 0 ise) bekle
    if (rect.height === 0 && retryCount < 12) {
      setTimeout(() => findAndPositionTarget(retryCount + 1), 200);
      return;
    }

    setTargetRect(rect);
    const WIN_W = window.innerWidth;
    
    // On mobile, scroll to top so the bottom tooltip doesn't overlap.
    const isMobile = WIN_W < 768;
    el.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'start' : 'center' });

    setTimeout(() => {
      if (tooltipRef.current) {
        const pos = getTooltipPosition(el, tooltipRef.current, currentStep.placement || 'bottom');
        setTooltipPos(pos);
      }
      setVisible(true);
      setIsTransitioning(false);
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

    if (currentStep.stockWizardStep !== undefined) {
      window.dispatchEvent(new CustomEvent('set-stock-wizard-step', {
        detail: { step: currentStep.stockWizardStep }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('set-stock-wizard-step', {
        detail: { step: -1 }
      }));
    }

    // DOM'un render olması için bekle. Wizard geçişleri 400ms sürer.
    const waitTime = currentStep.waitMs ?? (currentStep.wizardStep !== undefined || currentStep.stockWizardStep !== undefined ? 600 : 300);
    const timer = setTimeout(() => {
      findAndPositionTarget();
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
          width: '100%',
          maxWidth: 340,
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
              {t('tour.skip')}
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
                  <ChevronLeft size={14} /> {t('tour.prev')}
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
                {isTransitioning ? '...' : isLast ? t('tour.finish') : t('tour.next')}
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