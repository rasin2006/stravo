import React from 'react';

function ThumbUpIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbDownIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

export default function BinaryRatingButtons({
  onPositive,
  onNegative,
  disabled = false,
  loading = false,
  positiveLabel = 'Interesting',
  negativeLabel = 'Not interesting',
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onPositive}
        disabled={disabled || loading}
        aria-label={positiveLabel}
        className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg bg-primary px-3 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <span className="text-sm">Saving…</span>
        ) : (
          <>
            <ThumbUpIcon />
            <span className="text-xs font-semibold">{positiveLabel}</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onNegative}
        disabled={disabled || loading}
        aria-label={negativeLabel}
        className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-destructive bg-surface px-3 py-3 text-destructive transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <ThumbDownIcon />
        <span className="text-xs font-semibold">{negativeLabel}</span>
      </button>
    </div>
  );
}
