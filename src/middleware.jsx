import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value
  const role = request.cookies.get('userRole')?.value

  const { pathname } = request.nextUrl

  // Public auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  // App protected pages (cart is now public for guest users)
  const isProtectedPage = pathname.startsWith('/profile')
  // Admin area
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminLoginPage = pathname === '/admin/login'
  

  // If NOT logged in and accessing protected page -> redirect to login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Admin area guard (login page is public)
  if (isAdminPage && !isAdminLoginPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // Logged in but not admin -> block
  if (isAdminPage && !isAdminLoginPage && token && role !== 'admin') {
    return new NextResponse('Not allowed', { status: 403 })
  }

  // If logged in and accessing login/signup page -> redirect to profile
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // If logged in and hitting admin login, send to admin home
  if (token && isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Otherwise, allow
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/profile/:path*',
    '/cart/:path*',
    '/admin/:path*',
  ],
}

