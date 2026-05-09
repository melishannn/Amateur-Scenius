import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Archive, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MessageAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  icon?: 'archive' | 'check';
}

export function MessageAlertDialog({ open, onOpenChange, title, description, onConfirm, icon = 'archive' }: MessageAlertDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-text/20 backdrop-blur-md z-[200]" />
                <AlertDialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[210] rounded-[28px] p-8 max-w-[380px] w-[calc(100%-32px)] glass-card flex flex-col items-center outline-none antialiased"
        >
          {/* İkon dairesi */}
            <div 
              className="w-[56px] h-[56px] rounded-full flex items-center justify-center mb-4 bg-accent/20 text-accent"
            >
              {icon === 'archive' ? <Archive size={24} /> : <CheckCircle size={24} />}
            </div>

            <AlertDialog.Title 
              className="text-[1.05rem] font-semibold text-text leading-[1.4] text-center font-display mb-2"
            >
              {title}
            </AlertDialog.Title>

            <AlertDialog.Description className="text-sm text-center text-text-secondary leading-relaxed font-sans mb-8">
              {description}
            </AlertDialog.Description>

            <div className="flex flex-row w-full gap-3">
              <AlertDialog.Action asChild>
                <button 
                  onClick={onConfirm}
                  className="w-full py-[14px] px-[28px] rounded-[100px] text-[0.8rem] tracking-[0.08em] uppercase transition-all shadow-md active:scale-95 bg-accent text-white font-bold"
                >
                  OK
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
