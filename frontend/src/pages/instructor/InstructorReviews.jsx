import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

const InstructorReviews = () => {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-reviews'],
    queryFn: async () => {
      // Fetch reviews for all instructor courses
      const coursesRes = await api.get('/courses/instructor/my-courses');
      const courses = coursesRes.data.data.courses || [];
      const allReviews = [];
      for (const course of courses.slice(0, 10)) {
        try {
          const reviewsRes = await api.get(`/student/courses/${course._id}/reviews`);
          const reviews = reviewsRes.data.data.reviews || [];
          reviews.forEach((r) => allReviews.push({ ...r, courseName: course.title }));
        } catch {
          // Skip if no reviews
        }
      }
      return allReviews;
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => api.post(`/instructor/reviews/${reviewId}/reply`, { reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-reviews'] });
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reply'),
  });

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Reviews</h1>
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Reviews will appear here once students rate your courses"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Reviews</h1>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-100 rounded-xl animate-shimmer" />
            ))
          : data?.map((review) => (
              <div
                key={review._id}
                className="bg-surface-0 rounded-xl border border-surface-200/60 p-5"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Avatar
                    firstName={review.student?.firstName}
                    lastName={review.student?.lastName}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {review.student?.firstName} {review.student?.lastName}
                        </p>
                        <p className="text-xs text-surface-800/40">{review.courseName}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-surface-800/70 mb-3">{review.comment}</p>
                <p className="text-xs text-surface-800/40 mb-3">{formatDate(review.createdAt)}</p>

                {/* Instructor reply */}
                {review.instructorReply ? (
                  <div className="ml-6 pl-4 border-l-2 border-brand-200 bg-brand-50/30 rounded-r-lg p-3">
                    <p className="text-xs font-medium text-brand-700 mb-1">Your reply</p>
                    <p className="text-sm text-surface-800/70">{review.instructorReply.text}</p>
                  </div>
                ) : replyingTo === review._id ? (
                  <div className="ml-6 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          replyMutation.mutate({ reviewId: review._id, reply: replyText.trim() })
                        }
                        isLoading={replyMutation.isPending}
                      >
                        Reply
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReplyingTo(review._id);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 ml-6"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default InstructorReviews;
