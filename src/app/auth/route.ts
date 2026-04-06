import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  const response = NextResponse.redirect(new URL('/operator', req.url))
  response.cookies.set('op-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
