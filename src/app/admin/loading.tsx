/* Shown while a review-panel page loads its data (the queue, an application).
   Rendered inside the layout, so only after the reviewer check has passed. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-3 w-28 rounded-full bg-line" />
      <div className="mt-3 h-8 w-64 max-w-full rounded-lg bg-line" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-full bg-line-soft" />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-white" />
        ))}
      </div>
      <div className="mt-5 h-[420px] rounded-[18px] bg-white" />
    </div>
  );
}
