import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('dm-auth')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If already authenticated or on login page, continue
  if (authCookie?.value === process.env.AUTH_SECRET || isLoginPage) {
    // If authenticated and trying to access login, redirect to home
    if (authCookie?.value === process.env.AUTH_SECRET && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
