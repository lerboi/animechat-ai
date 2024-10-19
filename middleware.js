// middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
  
  return res;
}
