import React from 'react';

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
        className="flex min-h-[56px] flex-col items-center justify-center rounded-lg bg-primary px-3 py-3 text-primary-foreground transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <span className="text-sm">Saving…</span>
        ) : (
          <>
            <span className="text-xl font-bold leading-none">+</span>
            <span className="mt-1 text-xs font-semibold">{positiveLabel}</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={onNegative}
        disabled={disabled || loading}
        className="flex min-h-[56px] flex-col items-center justify-center rounded-lg border-2 border-destructive bg-surface px-3 py-3 text-destructive transition-opacity disabled:opacity-50"
      >
        <span className="text-xl font-bold leading-none">−</span>
        <span className="mt-1 text-xs font-semibold">{negativeLabel}</span>
      </button>
    </div>
  );
}
