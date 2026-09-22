import { NextRequest, NextResponse } from 'next/server';
import { getPolicy, savePolicy } from '@/lib/policies';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const policy = await getPolicy(slug);
    if (!policy) {
      return NextResponse.json({ success: false, error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, policy });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const result = await savePolicy(slug, body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
