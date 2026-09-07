'use client';
import { useState } from 'react';

// Read-only grid of photo thumbnails with click-to-enlarge. Shared by
// PhotoUploader (upload previews) and any page that just displays photos
// already on a record (e.g. issue reports) so full-size viewing works the
// same way everywhere, for every role.
export default function PhotoGrid({ photos = [], gridClassName = 'grid-cols-4 gap-2', thumbClassName = 'h-16' }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!photos.length) return null;

  return (
    <>
      <div className={`grid ${gridClassName}`}>
        {photos.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setPreviewUrl(url)}
            className={`${thumbClassName} w-full rounded border border-ink-200 overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-500`}
            aria-label="View full-size photo"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt=""
            className="max-h-full max-w-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-5 right-6 text-white text-3xl leading-none hover:text-ink-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
