import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('op-token')?.value
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/operator/:path*'],
}
