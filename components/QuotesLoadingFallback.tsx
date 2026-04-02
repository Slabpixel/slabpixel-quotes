/** Static shell shown while server components fetch quotes (Suspense). */
export function QuotesLoadingFallback({ label = "Loading quotes" }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__text">{label}</span>
    </div>
  );
}
