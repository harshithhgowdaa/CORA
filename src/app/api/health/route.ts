import { NextResponse } from 'next/server'
export function GET() { return NextResponse.json({ status: 'ok', service: 'cora', timestamp: new Date().toISOString() }) }
