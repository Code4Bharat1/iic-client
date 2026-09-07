import { useRef, useState } from 'react';
import PhotoGrid from './PhotoGrid';

export default function PhotoUploader({ label, photos = [], onUpload, uploading, disabled, disabledHint }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    if (disabled) return;
    const file = files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-ink-800">{label}</p>
        {photos.length > 0 && <span className="text-xs text-emerald-600 font-medium">{photos.length} uploaded</span>}
      </div>
      <div
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`rounded-md border-2 border-dashed px-3 py-4 text-center transition-colors ${
          disabled
            ? 'border-ink-100 bg-ink-50/60 cursor-not-allowed'
            : `cursor-pointer ${dragOver ? 'border-brand-600 bg-brand-50' : 'border-ink-200 hover:border-ink-300'}`
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-ink-500">
          {disabled ? (disabledHint || 'Locked') : uploading ? 'Uploading…' : 'Drag & drop, or tap to choose a photo'}
        </p>
      </div>
      {photos.length > 0 && <PhotoGrid photos={photos} gridClassName="grid-cols-4 gap-2 mt-2" thumbClassName="h-16" />}
    </div>
  );
}
