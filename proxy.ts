import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  console.log(
    `[request] ${request.method} ${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.next();
}
