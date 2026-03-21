import { NextResponse } from 'next/server'

// Forgot-password flow has been removed per request. Return 404 for any calls.
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
