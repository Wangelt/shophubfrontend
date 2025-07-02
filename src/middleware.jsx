import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value

  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedPage = pathname.startsWith('/userProfile') || pathname.startsWith('/dashboard') 

  if (!token && isProtectedPage) {
    // If NOT logged in and accessing protected page -> redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (token && isAuthPage) {
    // If logged in and accessing login/register page -> redirect to home or dashboard
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Otherwise, allow
  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/login', '/auth/register', '/userProfile', '/dashboard'], // add all relevant routes
}

