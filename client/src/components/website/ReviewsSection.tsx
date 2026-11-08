import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Star, Quote, CheckCircle2, MessageSquarePlus, Send } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchReviews = () => {
    api.get<Review[]>('/reviews')
      .then(res => setReviews(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);

    try {
      await api.post('/reviews', {
        rating,
        title,
        comment,
      });
      setSuccessMsg(t('reviews.form_success', 'Thank you! Your verified review has been published.'));
      setTitle('');
      setComment('');
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="scroll-mt-24 py-24 bg-slate-900 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-16">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
              {t('reviews.badge', 'Guest Reviews')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t('reviews.title', 'What Our Guests Say')}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-300">
                4.95 / 5.0 • {t('reviews.rating_summary', 'Based on verified guest stays in Bole, Addis Ababa')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showForm ? t('reviews.close_btn', 'Close Form') : t('reviews.write_btn', 'Write a Review')}</span>
          </button>
        </div>

        {/* Submit Review Form (collapsible) */}
        {showForm && (
          <div className="mb-12 p-6 bg-slate-950 border border-amber-500/30 rounded-2xl max-w-2xl mx-auto shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">{t('reviews.form_title', 'Share Your Stay Experience')}</h3>
            <p className="text-xs text-slate-400 mb-4">{t('reviews.form_desc', 'Your feedback helps us continue providing the best hotel service in Addis Ababa.')}</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('reviews.form_rating', 'Your Rating')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${rating >= star ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('reviews.form_title_label', 'Review Title *')}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('reviews.form_title_placeholder', 'e.g. Wonderful stay and warm Ethiopian hospitality')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('reviews.form_comment_label', 'Detailed Review *')}</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t('reviews.form_comment_placeholder', 'Tell future guests about your room, concierge service, dining, or spa experience...')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? t('reviews.form_submitting', 'Publishing...') : t('reviews.form_submit', 'Publish Verified Review')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {t('reviews.verified_guest', 'Verified Guest')}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-slate-100">{rev.title}</h4>
                <p className="text-slate-400 text-xs font-light leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{rev.customer_name}</span>
                  <span className="text-[10px] text-slate-500">{rev.customer_country || (language === 'am' ? 'ኢትዮጵያ' : 'Ethiopia')}</span>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(rev.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
