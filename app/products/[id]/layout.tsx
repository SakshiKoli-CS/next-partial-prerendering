import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

async function getCategory(id: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`category-${id}`);

  return { cachedAt: new Date().toISOString() };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  return (
    <div className="space-y-4 text-white">
      <div className="text-sm text-gray-400">
        Layout shell cached at (&apos;hours&apos; profile):{' '}
        <span data-testid="layout-cached-at">{category.cachedAt}</span>
      </div>

      <Suspense
        fallback={<div className="text-sm text-gray-500">Loading related items…</div>}
      >
        <RelatedItems />
      </Suspense>

      {children}
    </div>
  );
}

async function RelatedItems() {
  // Independent, layout-level Suspense boundary — separate delay/timing
  // from the page-level LiveStock boundary, to prove nested boundaries
  // at different tree depths stream independently.
  await new Promise((resolve) => setTimeout(resolve, 800));

  return (
    <div className="text-sm text-gray-300">
      Related items loaded (layout-level streamed, 800ms delay)
    </div>
  );
}
