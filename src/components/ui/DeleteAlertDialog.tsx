import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  itemCount?: number;
}

export function DeleteAlertDialog({ open, onOpenChange, title, description, onConfirm, itemCount }: DeleteAlertDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-text/20 backdrop-blur-md z-[100]" />
        
        <AlertDialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] rounded-[28px] p-8 max-w-[380px] w-[calc(100%-32px)] shadow-[0_20px_60px_rgba(205,180,219,0.25)] flex flex-col items-center outline-none antialiased"
          style={{ 
            background: 'rgba(255,255,255,0.92)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* İkon dairesi — uyarı */}
            <div 
              className="w-[56px] h-[56px] rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,175,204,0.2)', color: '#E05A7A' }}
            >
              <Trash2 size={24} />
            </div>

            <AlertDialog.Title 
              className="text-[1.05rem] font-semibold text-[#1a0f2e] leading-[1.4] text-center font-geist mb-2"
            >
              {title}
            </AlertDialog.Title>

            <AlertDialog.Description className="text-sm text-center text-muted leading-relaxed font-geist mb-8">
              {description}
            </AlertDialog.Description>

            <div className="flex flex-row w-full gap-3">
              <AlertDialog.Cancel asChild>
                <button 
                  className="flex-1 py-[14px] px-[28px] rounded-[100px] text-[0.8rem] tracking-[0.08em] uppercase transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(205,180,219,0.4)',
                    color: '#3d2960',
                    fontWeight: 600
                  }}
                >
                  Vazgeç
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button 
                  onClick={onConfirm}
                  className="flex-1 py-[14px] px-[28px] rounded-[100px] text-[0.8rem] tracking-[0.08em] uppercase transition-all shadow-[0_4px_16px_rgba(255,175,204,0.5)] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #ffafcc, #ffc8dd)',
                    color: '#1a0f2e',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  Sil
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
