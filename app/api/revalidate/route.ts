import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ error: 'tag query param required' }, { status: 400 });
  }

  revalidateTag(tag, 'max');

  return NextResponse.json({ revalidated: true, tag });
}
