/* Shown while a dashboard page loads its data. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-3 w-28 rounded-full bg-line" />
      <div className="mt-3 h-8 w-72 max-w-full rounded-lg bg-line" />
      <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-line-soft" />
      <div className="mt-8 h-40 rounded-[18px] bg-white" />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="h-56 rounded-[18px] bg-white" />
        <div className="h-56 rounded-[18px] bg-white" />
      </div>
    </div>
  );
}
