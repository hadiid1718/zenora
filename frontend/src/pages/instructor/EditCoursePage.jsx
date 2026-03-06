import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Save, Upload, ChevronDown, ChevronUp,
  GripVertical, Play, FileText, Send, Image,
} from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState('details');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonData, setNewLessonData] = useState({});

  const { data: course, isLoading } = useQuery({
    queryKey: ['edit-course', id],
    queryFn: () => api.get(`/courses/${id}`).then((r) => r.data.data.course),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/courses/categories').then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => api.put(`/courses/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-course', id] });
      toast.success('Course updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const addModuleMutation = useMutation({
    mutationFn: (title) => api.post(`/courses/${id}/modules`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-course', id] });
      setNewModuleTitle('');
      toast.success('Module added');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add module'),
  });

  const addLessonMutation = useMutation({
    mutationFn: ({ moduleIndex, lesson }) =>
      api.post(`/courses/${id}/modules/${moduleIndex}/lessons`, lesson),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['edit-course', id] });
      setNewLessonData((p) => ({ ...p, [variables.moduleIndex]: undefined }));
      toast.success('Lesson added');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add lesson'),
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/courses/${id}/submit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-course', id] });
      toast.success('Course submitted for review');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit'),
  });

  const thumbnailMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('thumbnail', file);
      return api.post(`/courses/${id}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-course', id] });
      toast.success('Thumbnail uploaded');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12 text-surface-800/50">Course not found</div>;
  }

  const handleDetailsSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      price: Number(formData.get('price')) || 0,
      discountPrice: Number(formData.get('discountPrice')) || undefined,
      level: formData.get('level'),
      language: formData.get('language'),
      category: formData.get('category'),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Edit Course</h1>
          <p className="text-sm text-surface-800/50 mt-0.5">{course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.status === 'published' ? 'brand' : course.status === 'draft' ? 'default' : 'warning'}>
            {course.status}
          </Badge>
          {(course.status === 'draft' || course.status === 'rejected') && (
            <Button
              onClick={() => submitMutation.mutate()}
              isLoading={submitMutation.isPending}
              icon={Send}
              size="sm"
            >
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-surface-200">
        {['details', 'curriculum', 'media'].map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeSection === s
                ? 'text-brand-700 border-b-2 border-brand-600'
                : 'text-surface-800/50 hover:text-surface-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Details */}
      {activeSection === 'details' && (
        <form onSubmit={handleDetailsSave} className="max-w-3xl space-y-5">
          <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-5">
            <Input label="Title" name="title" defaultValue={course.title} />
            <Input label="Subtitle" name="subtitle" defaultValue={course.subtitle} />
            <Textarea label="Description" name="description" defaultValue={course.description} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (USD)" name="price" type="number" step="0.01" defaultValue={course.price} />
              <Input label="Discount Price" name="discountPrice" type="number" step="0.01" defaultValue={course.discountPrice} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Level"
                name="level"
                defaultValue={course.level}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
              />
              <Select
                label="Category"
                name="category"
                defaultValue={course.category?._id || course.category}
                options={(categoriesData?.categories || []).map((c) => ({ value: c._id, label: c.name }))}
              />
            </div>
            <Input label="Language" name="language" defaultValue={course.language || 'English'} />
            <Button type="submit" isLoading={updateMutation.isPending} icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Curriculum */}
      {activeSection === 'curriculum' && (
        <div className="max-w-3xl space-y-4">
          {course.modules?.map((mod, mi) => (
            <div key={mi} className="bg-surface-0 rounded-2xl border border-surface-200/60 overflow-hidden">
              <div className="px-5 py-4 bg-surface-50 border-b border-surface-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-surface-800/30" />
                  <h3 className="text-sm font-semibold text-surface-900">
                    Section {mi + 1}: {mod.title}
                  </h3>
                </div>
                <span className="text-xs text-surface-800/40">{mod.lessons?.length || 0} lessons</span>
              </div>

              <div className="divide-y divide-surface-100">
                {mod.lessons?.map((lesson, li) => (
                  <div key={li} className="flex items-center gap-3 px-5 py-3">
                    {lesson.type === 'video' ? (
                      <Play className="w-4 h-4 text-surface-800/40" />
                    ) : (
                      <FileText className="w-4 h-4 text-surface-800/40" />
                    )}
                    <span className="flex-1 text-sm text-surface-800/70">{lesson.title}</span>
                    {lesson.isFreePreview && (
                      <Badge variant="accent" className="text-xs">Preview</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Add lesson */}
              <div className="px-5 py-3 border-t border-surface-100">
                {newLessonData[mi] !== undefined ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Lesson title"
                      value={newLessonData[mi]?.title || ''}
                      onChange={(e) =>
                        setNewLessonData((p) => ({ ...p, [mi]: { ...p[mi], title: e.target.value } }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Select
                        options={[
                          { value: 'video', label: 'Video' },
                          { value: 'text', label: 'Text' },
                          { value: 'quiz', label: 'Quiz' },
                        ]}
                        value={newLessonData[mi]?.type || 'video'}
                        onChange={(e) =>
                          setNewLessonData((p) => ({ ...p, [mi]: { ...p[mi], type: e.target.value } }))
                        }
                        className="w-32"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-surface-800/60">
                        <input
                          type="checkbox"
                          checked={newLessonData[mi]?.isFreePreview || false}
                          onChange={(e) =>
                            setNewLessonData((p) => ({
                              ...p,
                              [mi]: { ...p[mi], isFreePreview: e.target.checked },
                            }))
                          }
                          className="rounded border-surface-300 text-brand-600"
                        />
                        Free Preview
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const lessonData = newLessonData[mi];
                          if (!lessonData?.title?.trim()) return toast.error('Title required');
                          addLessonMutation.mutate({
                            moduleIndex: mi,
                            lesson: {
                              title: lessonData.title.trim(),
                              type: lessonData.type || 'video',
                              isFreePreview: lessonData.isFreePreview || false,
                            },
                          });
                        }}
                        isLoading={addLessonMutation.isPending}
                      >
                        Add Lesson
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewLessonData((p) => ({ ...p, [mi]: undefined }))}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setNewLessonData((p) => ({ ...p, [mi]: { title: '', type: 'video' } }))
                    }
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Plus className="w-4 h-4" /> Add Lesson
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add module */}
          <div className="bg-surface-0 rounded-2xl border border-dashed border-surface-300 p-5">
            <div className="flex items-center gap-3">
              <Input
                placeholder="New section title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (!newModuleTitle.trim()) return;
                  addModuleMutation.mutate(newModuleTitle.trim());
                }}
                isLoading={addModuleMutation.isPending}
                icon={Plus}
                size="sm"
              >
                Add Section
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Media */}
      {activeSection === 'media' && (
        <div className="max-w-3xl">
          <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-surface-900">Course Thumbnail</h2>
            {course.thumbnail && (
              <div className="w-64 aspect-video rounded-xl overflow-hidden bg-surface-100">
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium text-surface-800/70 hover:bg-surface-50 cursor-pointer transition-colors">
                <Image className="w-4 h-4" />
                {course.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) thumbnailMutation.mutate(file);
                  }}
                />
              </label>
              {thumbnailMutation.isPending && (
                <span className="ml-3 text-sm text-surface-800/50">Uploading...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCoursePage;
