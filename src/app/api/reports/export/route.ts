import { NextResponse } from 'next/server'
import { exportReport, type ReportEntity } from '@/app/actions/reports'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = checkRateLimit(`export:${ip}`, 10, 60_000)
  if (!rate.allowed) return NextResponse.json({ error: 'Too many export requests. Try again shortly.' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } })
  const entity = new URL(request.url).searchParams.get('entity') as ReportEntity | null
  if (!entity || !['companies', 'contacts', 'interactions', 'follow_ups', 'opportunities', 'ownership'].includes(entity)) return NextResponse.json({ error: 'Invalid report entity' }, { status: 400 })
  const result = await exportReport(entity)
  if (!result.success) return NextResponse.json({ error: result.error, code: result.code }, { status: result.code === 'FORBIDDEN' ? 403 : result.code === 'UNAUTHENTICATED' ? 401 : 500 })
  return new NextResponse(result.data.content, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${result.data.filename}"` } })
}
