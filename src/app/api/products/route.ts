import { NextResponse } from 'next/server';
import { getProductsPaginated } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

    const result = await getProductsPaginated(offset, limit);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Failed to fetch paginated products:', err);
    return NextResponse.json(
      { products: [], total: 0, hasMore: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
