import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`rise-in relative w-full ${width} rounded-lg bg-white shadow-popover border border-ink-150 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
          <h2 className="font-display text-[1.15rem] text-ink-900">{title}</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 rounded-md p-1" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-ink-100 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
