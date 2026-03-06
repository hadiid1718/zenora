import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Play, FileText, CheckCircle2,
  Check, BookOpen, Menu, X,
} from 'lucide-react';
import api from '../../lib/api';
import { cn, formatDuration } from '../../lib/utils';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['learning', courseId],
    queryFn: async () => {
      const res = await api.get(`/student/courses/${courseId}`);
      return res.data.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: (lessonId) =>
      api.post(`/student/courses/${course?._id || courseId}/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning', courseId] });
      toast.success('Lesson completed!');
    },
  });

  const course = data?.course;
  const enrollment = data?.enrollment;
  const modules = course?.modules || [];
  const completedLessons = new Set(
    (enrollment?.progress?.completedLessons || []).map((l) => l.lessonId?.toString())
  );

  // Find current lesson
  const allLessons = modules.flatMap((m, mi) =>
    (m.lessons || []).map((l, li) => ({ ...l, moduleIndex: mi, lessonIndex: li }))
  );

  const currentLesson = selectedLesson
    ? allLessons.find((l) => l._id === selectedLesson)
    : allLessons.find((l) => !completedLessons.has(l._id)) || allLessons[0];

  const currentIndex = allLessons.findIndex((l) => l._id === currentLesson?._id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-surface-900">Course not found</h2>
        <Button onClick={() => navigate('/my-courses')} className="mt-4">
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-surface-900 border-b border-surface-800 flex items-center px-4 gap-4 shrink-0">
        <button
          onClick={() => navigate('/my-courses')}
          className="text-surface-200/60 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-white truncate">{course.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <ProgressBar
            value={enrollment?.progress || 0}
            className="w-24 sm:w-32"
            size="sm"
            color="accent"
          />
          <span className="text-xs text-surface-200/60">
            {Math.round(enrollment?.progress || 0)}%
          </span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-md text-surface-200/60 hover:text-white hover:bg-surface-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video / content area */}
        <div className="flex-1 flex flex-col">
          {/* Video player area */}
          <div className="bg-black flex items-center justify-center aspect-video max-h-[70vh]">
            {currentLesson?.video?.url ? (
              <video
                key={currentLesson._id}
                controls
                className="w-full h-full"
                src={currentLesson.video.url}
              />
            ) : (
              <div className="text-center text-surface-200/40 px-8">
                <FileText className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">{currentLesson?.title}</h3>
                {currentLesson?.content && (
                  <p className="text-sm max-w-2xl">{currentLesson.content}</p>
                )}
              </div>
            )}
          </div>

          {/* Lesson controls */}
          <div className="p-4 bg-surface-900 border-t border-surface-800 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-surface-200/60"
              disabled={!prevLesson}
              onClick={() => setSelectedLesson(prevLesson?._id)}
              icon={ChevronLeft}
            >
              Previous
            </Button>

            {currentLesson && !completedLessons.has(currentLesson._id) && (
              <Button
                size="sm"
                onClick={() => completeMutation.mutate(currentLesson._id)}
                isLoading={completeMutation.isPending}
                icon={Check}
              >
                Mark Complete
              </Button>
            )}

            {currentLesson && completedLessons.has(currentLesson._id) && (
              <span className="flex items-center gap-1.5 text-sm text-success-500">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-surface-200/60"
              disabled={!nextLesson}
              onClick={() => setSelectedLesson(nextLesson?._id)}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Course sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-surface-900 border-l border-surface-800 overflow-y-auto shrink-0 hidden md:block">
            <div className="p-4 border-b border-surface-800">
              <h3 className="text-sm font-semibold text-white">Course Content</h3>
              <p className="text-xs text-surface-200/40 mt-0.5">
                {completedLessons.size}/{allLessons.length} completed
              </p>
            </div>

            {modules.map((mod, mi) => (
              <div key={mi} className="border-b border-surface-800">
                <div className="px-4 py-3 bg-surface-900/50">
                  <p className="text-xs font-semibold text-surface-200/50 uppercase tracking-wider">
                    Section {mi + 1}
                  </p>
                  <p className="text-sm text-white mt-0.5">{mod.title}</p>
                </div>
                {mod.lessons?.map((lesson) => {
                  const isActive = currentLesson?._id === lesson._id;
                  const isCompleted = completedLessons.has(lesson._id);

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => setSelectedLesson(lesson._id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive
                          ? 'bg-brand-600/20 border-l-2 border-brand-500'
                          : 'hover:bg-surface-800/50 border-l-2 border-transparent'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
                      ) : lesson.type === 'video' ? (
                        <Play className="w-4 h-4 text-surface-200/40 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-surface-200/40 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs truncate',
                            isActive ? 'text-white font-medium' : 'text-surface-200/70'
                          )}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration > 0 && (
                          <p className="text-xs text-surface-200/30 mt-0.5">
                            {formatDuration(lesson.duration)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
};

export default LearningPage;
