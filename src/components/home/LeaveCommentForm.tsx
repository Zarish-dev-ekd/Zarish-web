'use client';

import { useState } from 'react';

interface LeaveCommentFormProps {
  className?: string;
  description?: string;
}

export default function LeaveCommentForm({
  className = '',
  description = 'Your feedback means a lot to us. Share your experience and let us know what you think!',
}: LeaveCommentFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedMessage) {
      setError('Please enter your comment message.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          message: trimmedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to submit comment. Please try again.');
      }

      setSubmitted(true);
      setName('');
      setMessage('');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-5 sm:p-7 rounded-2xl bg-[#FAF6F0] border border-[#EADCCB] shadow-[0_4px_24px_rgba(44,29,19,0.04)] relative transition-all ${className}`}
    >
      {description && (
        <div className="mb-4">
          <p className="text-xs sm:text-[13px] text-[#6B5744] font-medium leading-relaxed m-0">
            {description}
          </p>
        </div>
      )}

      {submitted ? (
        <div className="py-6 px-4 text-center rounded-xl bg-white border border-[#E2D5C7] space-y-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-lg">
            ✓
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#2C1D13]">
              Thank you for your comment!
            </h4>
            <p className="text-xs text-[#7A6F66] mt-1 max-w-sm mx-auto leading-relaxed">
              Your feedback has been received directly by our team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs font-semibold text-[#7B5B3A] hover:underline pt-1 cursor-pointer"
          >
            Leave another comment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              name="name"
              id="comment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#D9C9B8] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:outline-none focus:border-[#7B5B3A] focus:ring-1 focus:ring-[#7B5B3A]/20 transition-all shadow-2xs"
            />
          </div>

          <div>
            <textarea
              name="message"
              id="comment-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#D9C9B8] rounded-xl bg-white text-[#2C1D13] placeholder-[#8C7B6B] focus:outline-none focus:border-[#7B5B3A] focus:ring-1 focus:ring-[#7B5B3A]/20 transition-all resize-y shadow-2xs"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#2C1D13] hover:bg-[#1A110B] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post comment</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
