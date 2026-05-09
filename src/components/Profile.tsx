import { useState } from 'react';
import { User, MessageSquareHeart, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const { t } = useLanguage();
  const [showFeedback, setShowFeedback] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(
    () => localStorage.getItem('feedback_submitted') === 'true'
  );

  const handleFeedbackSent = () => {
    localStorage.setItem('feedback_submitted', 'true');
    setIsFeedbackSubmitted(true);
    setShowFeedback(false);
  };

  return (
    <div className="space-y-10 pb-32">
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent text-white rounded-full shadow-lg shadow-accent/30 mb-4">
          <User size={32} />
        </div>
        <h2 className="serif text-4xl italic text-text">{t('profile.title')}</h2>
        <p className="text-sm text-muted leading-relaxed serif italic">
          {t('profile.subtitle')}
        </p>
      </div>

      {isFeedbackSubmitted ? (
        <div className="w-full max-w-lg glass-card border flex-col items-center justify-center border-border p-6 rounded-[24px] shadow-sm flex gap-4 text-center">
           <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
             <MessageSquareHeart size={20} />
           </div>
           <div>
             <div className="text-[1rem] font-bold text-text mb-1">
               {t('profile.feedback_thank_you').split('!')[0]}!
             </div>
             <div className="text-sm text-muted leading-relaxed">
               {t('profile.feedback_thank_you').split('!')[1]?.trim() || ''}
             </div>
           </div>
        </div>
      ) : !showFeedback ? (
        <button
          onClick={() => {
            setShowFeedback(true);
            setLoadCount(0);
          }}
          className="w-full max-w-lg glass-card border border-border p-6 rounded-[24px] shadow-sm flex items-center gap-4 text-left transition-all hover:border-accent hover:shadow-md group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform shrink-0">
            <MessageSquareHeart size={20} />
          </div>
          <div className="flex-1">
            <div className="text-[1rem] font-bold text-text mb-1 flex items-center gap-2">
              {t('profile.feedback')}
              <ChevronDown size={14} className="opacity-50" />
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {t('profile.feedback_desc')}
            </div>
          </div>
        </button>
      ) : (
        <div className="w-full max-w-lg glass-card border border-border rounded-[24px] overflow-hidden shadow-sm flex flex-col relative">
          <button 
            onClick={() => setShowFeedback(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-text hover:bg-accent/10 hover:border-accent/30 transition-colors"
          >
            <X size={16} />
          </button>
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSdgSL6L7sQIZftL2fCeF91W8BgpX3qEYFGU-cACoHSyErLfZQ/viewform?embedded=true" 
            width="100%" 
            height="500" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            title="Feedback Form"
            className="bg-transparent"
            onLoad={() => {
              setLoadCount(prev => {
                const newCount = prev + 1;
                if (newCount > 1) {
                  // İkinci yükleme formun gönderildiğini belirtir
                  setTimeout(() => {
                    handleFeedbackSent();
                  }, 2000); // Kullanıcıya Google'ın teşekkür mesajını görmesi için kısa bir süre tanı
                }
                return newCount;
              });
            }}
          >
            Yükleniyor…
          </iframe>
          <div className="p-4 bg-bg border-t border-border flex justify-end">
            <button
              onClick={handleFeedbackSent}
              className="px-6 py-2 bg-accent text-white rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t('profile.feedback_sent')}
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-muted uppercase tracking-[0.2em] opacity-40 mt-12 pb-8">
        {t('profile.credits')}
      </div>
    </div>
  );
}

