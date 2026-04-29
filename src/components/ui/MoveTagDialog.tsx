import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MoveTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTags: string[];
  allTags: string[];
  onConfirm: (newTags: string[]) => void;
}

export function MoveTagDialog({ open, onOpenChange, currentTags, allTags, onConfirm }: MoveTagDialogProps) {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const [mode, setMode] = useState<'select' | 'create'>('select');

  useEffect(() => {
    if (open) {
      setMode('select');
      setSelectedTag('');
      setNewTag('');
    }
  }, [open]);

  const handleConfirm = () => {
    let tagToAdd = mode === 'select' ? selectedTag : newTag.trim();
    if (!tagToAdd) return;
    
    if (!tagToAdd.startsWith('#') && mode === 'create') {
      tagToAdd = '#' + tagToAdd;
    }

    onConfirm([tagToAdd]);
    onOpenChange(false);
  };

  const availableTags = allTags.filter(t => !currentTags.includes(t));

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-text/20 backdrop-blur-md z-[100]" />
        
        <AlertDialog.Content 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] rounded-[28px] p-8 max-w-[400px] w-[calc(100%-32px)] shadow-[0_20px_60px_rgba(205,180,219,0.25)] flex flex-col outline-none antialiased"
          style={{ 
            background: 'rgba(255,255,255,0.92)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(74, 114, 255, 0.1)', color: '#4A72FF' }}
            >
              <Tag size={20} />
            </div>
            <div>
              <AlertDialog.Title className="text-lg font-bold text-[#1a0f2e] font-sans">
                Kategoriyi Değiştir
              </AlertDialog.Title>
              <AlertDialog.Description className="text-xs text-muted mt-1 font-sans">
                Bu fikri hangi etikete taşımak istiyorsunuz?
              </AlertDialog.Description>
            </div>
          </div>

          <div className="flex rounded-full bg-surface-variant p-1 mb-6">
            <button
              onClick={() => setMode('select')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${mode === 'select' ? 'bg-white shadow-sm text-text' : 'text-muted hover:text-text'}`}
            >
              Var Olanlar
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${mode === 'create' ? 'bg-white shadow-sm text-text' : 'text-muted hover:text-text'}`}
            >
              Yeni Oluştur
            </button>
          </div>

          <div className="mb-8 min-h-[100px]">
            {mode === 'select' ? (
              availableTags.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                  {availableTags.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors border ${
                        selectedTag === t 
                          ? 'border-[#4A72FF] bg-[#4A72FF]/5 text-[#4A72FF]' 
                          : 'border-border/50 hover:bg-surface'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-muted italic py-8">
                  Taşınabilecek başka var olan etiket bulunamadı.
                </div>
              )
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-4">YENİ ETİKET ADI</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="örn: ilham-panosu"
                  className="w-full bg-surface border border-border px-4 py-3 text-sm rounded-xl outline-none focus:border-[#4A72FF] transition-colors"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="flex flex-row w-full gap-3 mt-auto">
            <AlertDialog.Cancel asChild>
              <button 
                className="flex-1 py-3 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(205,180,219,0.4)',
                  color: '#3d2960',
                }}
              >
                Vazgeç
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button 
                onClick={handleConfirm}
                disabled={mode === 'select' ? !selectedTag : !newTag.trim()}
                className="flex-1 py-3 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#4A72FF',
                  color: '#ffffff',
                  border: 'none',
                }}
              >
                Taşı
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
