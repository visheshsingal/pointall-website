// middleware.ts
export const runtime = 'nodejs'; // Explicitly set Node.js runtime
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Bypass Clerk auth for API routes that handle auth internally
const isPublicRoute = createRouteMatcher([
  '/api/user/data(.*)',
  '/api/order/seller-orders(.*)',
  '/api/order/list(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return; // Skip auth for these routes
  auth().protect(); // Protect other routes
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};