import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import type { Product } from '#/types/product';

async function getProduct(
  id: string
): Promise<(Product & { cachedAt: string }) | null> {
  'use cache';
  cacheLife('minutes');
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ simulateError?: string }>;
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

      <Suspense fallback={<div className="text-sm text-gray-500">Loading flaky section…</div>}>
        <FlakySection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FlakySection({
  searchParams,
}: {
  searchParams: Promise<{ simulateError?: string }>;
}) {
  // Visit /products/1?simulateError=true to trigger this — proves an
  // error inside one streamed Suspense boundary doesn't take down the
  // static shell or the other streamed sections on the page. searchParams
  // is read here, inside the Suspense boundary, rather than in the page
  // body — reading it there would make the whole route dynamic.
  const { simulateError } = await searchParams;

  if (simulateError === 'true') {
    throw new Error('Simulated error for PPR error-boundary test');
  }

  return <div className="text-sm text-gray-300">Flaky section OK</div>;
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
