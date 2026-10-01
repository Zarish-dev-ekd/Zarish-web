import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import type { CustomerComment } from '@/lib/types';
import fs from 'fs';
import path from 'path';

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
    await supabase.from('store_policies').upsert(
      {
        slug: 'customer-comments',
        title: 'Customer Comments & Feedback Data',
        content: comments,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );
  } catch {
    // ignore
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyApproved = searchParams.get('onlyApproved') === 'true';

    // 1. Try reading from Supabase customer_comments table
    try {
      const supabase = await createClient();
      let query = supabase.from('customer_comments').select('*').order('created_at', { ascending: false });
      if (onlyApproved) {
        query = query.eq('status', 'approved');
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ success: true, comments: data });
      }
    } catch {
      // Table may not exist yet, fallback to store_policies or local file
    }

    // 2. Try reading from store_policies backup
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('store_policies')
        .select('content')
        .eq('slug', 'customer-comments')
        .maybeSingle();

      if (data?.content) {
        const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
        if (Array.isArray(parsed)) {
          const filtered = onlyApproved ? parsed.filter((c: CustomerComment) => c.status === 'approved') : parsed;
          saveLocalComments(parsed);
          return NextResponse.json({ success: true, comments: filtered });
        }
      }
    } catch {
      // Fallback to local
    }

    // 3. Fallback to local comments.json
    const local = getLocalComments();
    const sorted = [...local].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const filtered = onlyApproved ? sorted.filter((c) => c.status === 'approved') : sorted;

    return NextResponse.json({ success: true, comments: filtered });
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Please enter a message or comment.' }, { status: 400 });
    }

    const newComment: CustomerComment = {
      id: crypto.randomUUID(),
      name,
      email,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Save to local file
    const local = getLocalComments();
    const updated = [newComment, ...local.filter((c) => c.id !== newComment.id)];
    saveLocalComments(updated);

    // 2. Sync to Supabase store_policies backup
    await syncToStorePolicies(updated);

    // 3. Try inserting into Supabase customer_comments table if present
    try {
      const supabase = createAdminClient();
      await supabase.from('customer_comments').insert([
        {
          id: newComment.id,
          name: newComment.name,
          email: newComment.email,
          message: newComment.message,
          status: newComment.status,
          created_at: newComment.created_at,
          updated_at: newComment.updated_at,
        },
      ]);
    } catch {
      // customer_comments table might not exist yet, store_policies & local file already safe
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your comment has been submitted and is awaiting approval.',
      comment: newComment,
    });
  } catch (err: any) {
    console.error('Error posting comment:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_reply } = body;

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const local = getLocalComments();
    const targetIdx = local.findIndex((c) => c.id === id);

    if (targetIdx === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const updatedComment: CustomerComment = {
      ...local[targetIdx],
      ...(status ? { status } : {}),
      ...(admin_reply !== undefined ? { admin_reply } : {}),
      updated_at: new Date().toISOString(),
    };

    local[targetIdx] = updatedComment;
    saveLocalComments(local);
    await syncToStorePolicies(local);

    try {
      const supabase = createAdminClient();
      await supabase
        .from('customer_comments')
        .update({
          ...(status ? { status } : {}),
          ...(admin_reply !== undefined ? { admin_reply } : {}),
          updated_at: updatedComment.updated_at,
        })
        .eq('id', id);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    const local = getLocalComments();
    const filtered = local.filter((c) => c.id !== id);
    saveLocalComments(filtered);
    await syncToStorePolicies(filtered);

    try {
      const supabase = createAdminClient();
      await supabase.from('customer_comments').delete().eq('id', id);
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
