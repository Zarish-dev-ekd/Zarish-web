import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { isAdminUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { CustomerComment } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LOCAL_FILE = path.join(process.cwd(), 'src', 'data', 'comments.json');

function getLocalComments(): CustomerComment[] {
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      const raw = fs.readFileSync(LOCAL_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not read local comments.json:', err);
  }
  return [];
}

function saveLocalComments(comments: CustomerComment[]): void {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write local comments.json:', err);
  }
}

async function syncToStorePolicies(comments: CustomerComment[]) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('store_policies').upsert(
      {
        slug: 'customer-comments',
        title: 'Customer Comments & Feedback Data',
        content: comments,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );
    if (error) {
      console.error('store_policies upsert error:', error.message);
    }
  } catch (err) {
    console.error('syncToStorePolicies exception:', err);
  }
}

async function getAllCommentsFromDb(): Promise<CustomerComment[]> {
  let listFromTable: CustomerComment[] = [];
  let listFromPolicy: CustomerComment[] = [];
  const localList = getLocalComments();

  // 1. Try reading from Supabase customer_comments table
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('customer_comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      listFromTable = data;
    }
  } catch {
    // Table may not exist yet
  }

  // 2. Try reading from Supabase store_policies backup
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('store_policies')
      .select('content')
      .eq('slug', 'customer-comments')
      .maybeSingle();

    if (!error && data?.content) {
      const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      if (Array.isArray(parsed)) {
        listFromPolicy = parsed;
      }
    }
  } catch {
    // ignore
  }

  // Merge all unique comments by ID so NO comment is ever lost
  const commentMap = new Map<string, CustomerComment>();
  for (const c of [...listFromTable, ...listFromPolicy, ...localList]) {
    if (c && c.id && !commentMap.has(c.id)) {
      commentMap.set(c.id, {
        ...c,
        name: c.name || 'Anonymous',
        email: c.email || '',
        message: c.message || '',
        created_at: c.created_at || new Date().toISOString(),
      });
    }
  }

  const all = Array.from(commentMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (all.length > 0) {
    saveLocalComments(all);
  }

  return all;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyApproved = searchParams.get('onlyApproved') === 'true';

    const all = await getAllCommentsFromDb();
    const sorted = [...all].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const filtered = onlyApproved ? sorted.filter((c) => c.status === 'approved') : sorted;

    return NextResponse.json(
      { success: true, comments: filtered },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const message = String(body.message || '').trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 2) {
      return NextResponse.json({ error: 'Please enter a message or comment.' }, { status: 400 });
    }

    const newComment: CustomerComment = {
      id: crypto.randomUUID(),
      name,
      email: email || '',
      message,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Fetch current comments and prepend new comment
    const current = await getAllCommentsFromDb();
    const updated = [newComment, ...current.filter((c) => c.id !== newComment.id)];

    // 2. Save locally
    saveLocalComments(updated);

    // 3. Save to Supabase store_policies (cloud shared backup)
    await syncToStorePolicies(updated);

    // 4. Also insert into customer_comments table if created in Supabase
    try {
      const supabase = createAdminClient();
      const { error: insErr } = await supabase.from('customer_comments').insert([
        {
          id: newComment.id,
          name: newComment.name,
          email: newComment.email || '',
          message: newComment.message,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at,
        },
      ]);
      if (insErr) {
        console.warn('customer_comments table insert notice:', insErr.message);
      }
    } catch {
      // Table may not exist yet
    }

    revalidatePath('/admin/comments');

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your comment has been received.',
        comment: newComment,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('Error posting comment:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user || !isAdminUser(user)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const current = await getAllCommentsFromDb();
    const filtered = current.filter((c) => c.id !== id);

    saveLocalComments(filtered);
    await syncToStorePolicies(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('customer_comments').delete().eq('id', id);
    } catch {
      // ignore
    }

    revalidatePath('/admin/comments');

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
