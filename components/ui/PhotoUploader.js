import { useRef, useState } from 'react';

export default function PhotoUploader({ label, photos = [], onUpload, uploading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
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
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-md border-2 border-dashed px-3 py-4 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-brand-600 bg-brand-50' : 'border-ink-200 hover:border-ink-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-xs text-ink-500">{uploading ? 'Uploading…' : 'Drag & drop, or tap to choose a photo'}</p>
      </div>
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {photos.map((url) => (
            <img key={url} src={url} alt="" className="h-16 w-full object-cover rounded border border-ink-200" />
          ))}
        </div>
      )}
    </div>
  );
}
