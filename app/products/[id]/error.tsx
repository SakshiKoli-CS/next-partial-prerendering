'use client';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-2 text-sm text-vercel-pink">
      <p>Something went wrong loading this section.</p>
      <p className="text-xs text-gray-500">{error.message}</p>
      <button onClick={() => reset()} className="underline">
        Try again
      </button>
    </div>
  );
}
