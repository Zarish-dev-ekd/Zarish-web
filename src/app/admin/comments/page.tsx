'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CustomerComment } from '@/lib/types';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CustomerComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<CustomerComment | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/comments?admin=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(data.comments);
      } else {
        throw new Error(data?.error || 'Failed to load comments');
      }
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    const id = commentToDelete.id;

    try {
      setActionLoadingId(id);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/comments?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to delete comment');
      }

      setComments((prev) => prev.filter((c) => c.id !== id));
      setSuccess('Comment deleted successfully.');
      setCommentToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.message || 'Failed to delete comment');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered comments
  const filteredComments = useMemo(() => {
    if (!searchQuery.trim()) return comments;
    const q = searchQuery.toLowerCase();
    return comments.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchMsg = c.message?.toLowerCase().includes(q);
      return matchName || matchEmail || matchMsg;
    });
  }, [comments, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C241E] m-0">
              Customer Comments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#7B5B3A] border border-[#EADCCB]">
              {comments.length} received
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6F66] mt-1 m-0">
            View feedback and messages submitted by customers from the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchComments}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-[#7B5B3A] bg-white hover:bg-[#FAF6F0] border border-[#D9C9B8] rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSql(!showSql)}
            className="px-3 py-2 text-xs font-medium text-[#7A6F66] hover:text-[#2C241E] bg-white border border-[#E8E0D5] rounded-xl transition-all cursor-pointer"
          >
            {showSql ? 'Hide SQL' : 'Supabase SQL'}
          </button>
        </div>
      </div>

      {/* ─── Alerts ─── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-bold uppercase underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm flex items-center justify-between">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-xs font-bold uppercase underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── SQL Setup Helper (Collapsible) ─── */}
      {showSql && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#2B2118] text-[#EADCCB] text-xs space-y-2 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Supabase SQL (Optional)</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.customer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
ALTER TABLE public.customer_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert comments" ON public.customer_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view comments" ON public.customer_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
                alert('SQL copied to clipboard!');
              }}
              className="px-2.5 py-1 rounded bg-[#7B5B3A] hover:bg-[#63472C] text-white font-semibold cursor-pointer"
            >
              Copy SQL
            </button>
          </div>
          <p className="text-[11px] text-[#C4B5A5] leading-relaxed">
            All comments are already safely stored locally and backed up automatically. If you want a dedicated table in Supabase, paste this in the Supabase SQL Editor.
          </p>
          <pre className="p-3 bg-black/40 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-300">
{`CREATE TABLE IF NOT EXISTS public.customer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
ALTER TABLE public.customer_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert comments" ON public.customer_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view comments" ON public.customer_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);`}
          </pre>
        </div>
      )}

      {/* ─── Search & Overview Bar ─── */}
      <div className="p-4 bg-white border border-[#E8E0D5] rounded-xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs font-semibold text-[#7A6F66]">
          Total received: <strong className="text-[#2C241E]">{comments.length}</strong>
          {searchQuery && (
            <span className="ml-2 text-[#7B5B3A]">
              ({filteredComments.length} matching search)
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6B]">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, or message..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-[#E2D5C7] rounded-lg bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:outline-none focus:border-[#7B5B3A]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6B] hover:text-[#2C1D13]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── Comments List ─── */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
          <div className="w-6 h-6 border-2 border-[#7B5B3A]/30 border-t-[#7B5B3A] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7A6F66]">Loading customer comments...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E8E0D5] rounded-xl space-y-2">
          <div className="text-3xl">💬</div>
          <h3 className="text-sm sm:text-base font-bold text-[#2C241E]">
            {searchQuery ? 'No comments match your search' : 'No comments received yet'}
          </h3>
          <p className="text-xs text-[#7A6F66] max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different name, email, or keyword.'
              : 'When visitors submit feedback via the "Leave a comment" form, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredComments.map((comment) => {
            const isDeleting = actionLoadingId === comment.id;
            const initials = comment.name
              ? comment.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'U';

            const formattedDate = new Date(comment.created_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={comment.id}
                className="p-4 sm:p-5 rounded-xl border border-[#E8E0D5] bg-white shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Customer info & avatar */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#7B5B3A] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#2C1D13] leading-tight">
                        {comment.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#7A6F66] flex-wrap">
                        {comment.email ? (
                          <>
                            <a
                              href={`mailto:${comment.email}`}
                              className="hover:text-[#7B5B3A] underline decoration-dotted text-[#7B5B3A] font-medium"
                              title="Click to email customer"
                            >
                              {comment.email}
                            </a>
                            <span>•</span>
                          </>
                        ) : null}
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => setCommentToDelete(comment)}
                    disabled={isDeleting}
                    className="p-2 text-[#9E8E80] hover:text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete comment"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>

                {/* Comment Body */}
                <div className="mt-3 pt-3 border-t border-[#F2ECE4]">
                  <p className="text-xs sm:text-sm text-[#3D2B1F] leading-relaxed whitespace-pre-wrap font-normal bg-[#FAF8F5] p-3 rounded-lg border border-[#EADBCE]/50">
                    {comment.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-[#2C241E] m-0">
                  Delete Customer Comment?
                </h3>
                <p className="text-xs text-[#7A6F66] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete the feedback from{' '}
                  <strong className="text-[#2C241E]">{commentToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Comment snippet preview */}
            <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E0D5] text-xs text-[#523E30] italic line-clamp-2">
              &ldquo;{commentToDelete.message}&rdquo;
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                disabled={actionLoadingId === commentToDelete.id}
                className="px-4 py-2 rounded-xl border border-[#E8E0D5] text-xs font-semibold text-[#2C241E] hover:bg-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoadingId === commentToDelete.id}
                className="px-4 py-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {actionLoadingId === commentToDelete.id ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Comment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
