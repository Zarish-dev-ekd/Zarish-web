'use client';

import { useState, useEffect, useMemo } from 'react';
import type { CustomerComment } from '@/lib/types';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CustomerComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/comments?admin=true');
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

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setActionLoadingId(id);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to update status');
      }

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setSuccess(`Comment marked as ${newStatus}.`);
    } catch (err: any) {
      console.error('Status update error:', err);
      setError(err?.message || 'Failed to update comment status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this comment?')) {
      return;
    }

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
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.message || 'Failed to delete comment');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = comments.length;
    const pending = comments.filter((c) => c.status === 'pending').length;
    const approved = comments.filter((c) => c.status === 'approved').length;
    const rejected = comments.filter((c) => c.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [comments]);

  // Filtering
  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      // Status filter
      if (statusFilter !== 'all' && comment.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = comment.name.toLowerCase().includes(q);
        const matchEmail = comment.email.toLowerCase().includes(q);
        const matchMsg = comment.message.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchMsg) return false;
      }
      return true;
    });
  }, [comments, statusFilter, searchQuery]);

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
              {stats.total} total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6F66] mt-1 m-0">
            Review customer feedback, approve comments to publish, or manage submitted testimonials.
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
            {showSql ? 'Hide SQL' : 'Database SQL'}
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
            <span className="font-bold text-white">Supabase SQL Schema (Optional)</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.customer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
ALTER TABLE public.customer_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved comments" ON public.customer_comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Public insert comments" ON public.customer_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage comments" ON public.customer_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
                alert('SQL copied to clipboard!');
              }}
              className="px-2.5 py-1 rounded bg-[#7B5B3A] hover:bg-[#63472C] text-white font-semibold cursor-pointer"
            >
              Copy SQL
            </button>
          </div>
          <p className="text-[11px] text-[#C4B5A5] leading-relaxed">
            Comments are automatically saved to your local storage and store_policies table right away. You can optionally paste this into Supabase SQL Editor if you prefer a dedicated table.
          </p>
          <pre className="p-3 bg-black/40 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-300">
{`CREATE TABLE IF NOT EXISTS public.customer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);`}
          </pre>
        </div>
      )}

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] shadow-2xs">
          <div className="text-[11px] font-bold text-[#7A6F66] uppercase tracking-wider">
            All Comments
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#2C241E] mt-1">
            {stats.total}
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Pending Review
            </span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-900 mt-1">
            {stats.pending}
          </div>
        </div>

        {/* Approved */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Approved / Published
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1">
            {stats.approved}
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
            Rejected / Hidden
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-900 mt-1">
            {stats.rejected}
          </div>
        </div>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="p-4 bg-white border border-[#E8E0D5] rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: 'all', label: 'All', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'approved', label: 'Approved', count: stats.approved },
                { key: 'rejected', label: 'Rejected', count: stats.rejected },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#7B5B3A] text-white shadow-2xs'
                      : 'bg-[#FAF6F0] text-[#6B5744] hover:bg-[#F2ECE4]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-[#7B5B3A]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6B]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, text..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2D5C7] rounded-lg bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:outline-none focus:border-[#7B5B3A]"
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
            {searchQuery || statusFilter !== 'all'
              ? 'No comments match your filter'
              : 'No customer comments yet'}
          </h3>
          <p className="text-xs text-[#7A6F66] max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search term or status filter above.'
              : 'When visitors submit comments via the "Leave a comment" form, they will appear here for your review and approval.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredComments.map((comment) => {
            const isProcessing = actionLoadingId === comment.id;
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
                className={`p-4 sm:p-5 rounded-xl border bg-white shadow-2xs transition-all ${
                  comment.status === 'pending'
                    ? 'border-amber-200 ring-1 ring-amber-100'
                    : comment.status === 'approved'
                    ? 'border-emerald-200/70'
                    : 'border-rose-200/70 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Customer info & avatar */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E2D5C7] text-[#7B5B3A] font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#2C1D13] leading-tight">
                          {comment.name}
                        </h4>

                        {/* Status badge */}
                        {comment.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {comment.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Approved
                          </span>
                        )}
                        {comment.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            ✕ Rejected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#7A6F66] flex-wrap">
                        <a
                          href={`mailto:${comment.email}`}
                          className="hover:text-[#7B5B3A] underline decoration-dotted"
                          title="Send email"
                        >
                          {comment.email}
                        </a>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    {comment.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(comment.id, 'approved')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        title="Approve and publish"
                      >
                        <span>✓</span>
                        <span>Approve</span>
                      </button>
                    )}

                    {comment.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Reject / Hide comment"
                      >
                        <span>Reject</span>
                      </button>
                    )}

                    {comment.status !== 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(comment.id, 'pending')}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-[#7A6F66] hover:bg-gray-100 transition-all cursor-pointer"
                        title="Reset to pending"
                      >
                        Reset
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isProcessing}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete comment permanently"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Comment Body */}
                <div className="mt-3 pt-3 border-t border-[#F2ECE4]">
                  <p className="text-xs sm:text-sm text-[#3D2B1F] leading-relaxed whitespace-pre-wrap font-normal">
                    &ldquo;{comment.message}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
