import { Suspense } from 'react';
import { cacheTag } from 'next/cache';
import type { Product } from '#/types/product';

async function getProduct(
  id: string
): Promise<(Product & { cachedAt: string }) | null> {
  'use cache';
  cacheTag(`product-${id}`);

  const product: Product | null = await fetch(
    `https://app-router-api.vercel.app/api/products?id=${id}`
  ).then((res) => res.json());

  return product ? { ...product, cachedAt: new Date().toISOString() } : null;
}

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="text-sm text-gray-400">
        No product found for id &quot;{id}&quot;.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-white">
      <div className="text-lg font-medium">{product.name}</div>
      <div className="text-sm text-gray-400">
        Cache tag: <code>product-{id}</code>
      </div>
      <div className="text-sm text-gray-400">
        Static shell cached at (from `&apos;use cache&apos;`):{' '}
        <span data-testid="cached-at">{product.cachedAt}</span>
      </div>

      <Suspense fallback={<div className="text-sm text-gray-500">Loading live stock…</div>}>
        <LiveStock id={id} />
      </Suspense>
    </div>
  );
}

async function LiveStock({ id }: { id: string }) {
  const data: Product | null = await fetch(
    `https://app-router-api.vercel.app/api/products?id=${id}&filter=stock`,
    { cache: 'no-store' }
  ).then((res) => res.json());

  if (!data) {
    return null;
  }

  return (
    <div className="text-sm text-gray-300">
      Live stock (uncached, streamed): {data.stock}
    </div>
  );
}
