import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, Plus, Trash2, Image, Video, X } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Arabic', label: 'Arabic' },
];

const CreateCoursePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    level: 'beginner',
    language: 'English',
    price: '',
    discountPrice: '',
    tags: '',
    learningOutcomes: [''],
    requirements: [''],
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [promoVideo, setPromoVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const thumbnailRef = useRef(null);
  const videoRef = useRef(null);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const base64 = await fileToBase64(file);
    setThumbnail(base64);
    setThumbnailPreview(base64);
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be under 100MB');
      return;
    }
    const base64 = await fileToBase64(file);
    setPromoVideo(base64);
    setVideoPreview(URL.createObjectURL(file));
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/courses/categories').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/courses', payload),
    onSuccess: (res) => {
      toast.success('Course created! Add modules and lessons.');
      navigate(`/instructor/courses/${res.data.data.course._id}/edit`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create course');
    },
  });

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleListChange = (field, index, value) => {
    setForm((p) => {
      const list = [...p[field]];
      list[index] = value;
      return { ...p, [field]: list };
    });
  };

  const addListItem = (field) => {
    setForm((p) => ({ ...p, [field]: [...p[field], ''] }));
  };

  const removeListItem = (field, index) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Select a category';
    if (form.price && isNaN(Number(form.price))) errs.price = 'Invalid price';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      category: form.category,
      level: form.level,
      language: form.language,
      price: Number(form.price) || 0,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      learningOutcomes: form.learningOutcomes.filter((o) => o.trim()),
      requirements: form.requirements.filter((r) => r.trim()),
    };
    if (form.discountPrice) payload.discountPrice = Number(form.discountPrice);
    if (thumbnail) payload.thumbnail = thumbnail;
    if (promoVideo) payload.promoVideo = promoVideo;

    createMutation.mutate(payload);
  };

  const categoryOptions = (categoriesData?.categories || []).map((c) => ({
    value: c._id,
    label: c.name,
  }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Create New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900">Basic Information</h2>

          <Input
            label="Course Title"
            placeholder="e.g., Complete JavaScript Masterclass"
            value={form.title}
            onChange={handleChange('title')}
            error={errors.title}
          />

          <Input
            label="Subtitle"
            placeholder="A short tagline for your course"
            value={form.subtitle}
            onChange={handleChange('subtitle')}
          />

          <Textarea
            label="Description"
            placeholder="Describe what students will learn..."
            value={form.description}
            onChange={handleChange('description')}
            error={errors.description}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              placeholder="Select category"
              value={form.category}
              onChange={handleChange('category')}
              error={errors.category}
            />
            <Select
              label="Level"
              options={levelOptions}
              value={form.level}
              onChange={handleChange('level')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Language"
              options={languageOptions}
              value={form.language}
              onChange={handleChange('language')}
            />
            <Input
              label="Tags (comma separated)"
              placeholder="javascript, web development, frontend"
              value={form.tags}
              onChange={handleChange('tags')}
            />
          </div>
        </div>

        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900">Pricing</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              placeholder="49.99"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange('price')}
              error={errors.price}
            />
            <Input
              label="Discount Price (optional)"
              type="number"
              placeholder="29.99"
              min="0"
              step="0.01"
              value={form.discountPrice}
              onChange={handleChange('discountPrice')}
            />
          </div>
        </div>

        {/* Thumbnail & Promo Video */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-surface-900">Media</h2>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-2">
              Course Thumbnail
            </label>
            <p className="text-xs text-surface-800/40 mb-3">
              Recommended: 1280x720px, JPEG or PNG, max 5MB
            </p>
            {thumbnailPreview ? (
              <div className="relative inline-block rounded-xl overflow-hidden border border-surface-200/60">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-64 h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview('');
                    if (thumbnailRef.current) thumbnailRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-surface-900/60 text-white hover:bg-surface-900/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => thumbnailRef.current?.click()}
                className="flex flex-col items-center justify-center w-64 h-36 rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <Image className="w-8 h-8 text-surface-800/25 mb-2" />
                <span className="text-sm font-medium text-surface-800/50">
                  Upload Thumbnail
                </span>
                <span className="text-xs text-surface-800/30 mt-0.5">
                  Click to browse
                </span>
              </button>
            )}
            <input
              ref={thumbnailRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>

          {/* Promo Video */}
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-2">
              Promo Video
            </label>
            <p className="text-xs text-surface-800/40 mb-3">
              A short preview video for your course, MP4 recommended, max 100MB
            </p>
            {videoPreview ? (
              <div className="relative inline-block rounded-xl overflow-hidden border border-surface-200/60">
                <video
                  src={videoPreview}
                  controls
                  className="w-80 max-h-48 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPromoVideo(null);
                    setVideoPreview('');
                    if (videoRef.current) videoRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-surface-900/60 text-white hover:bg-surface-900/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex flex-col items-center justify-center w-80 h-36 rounded-xl border-2 border-dashed border-surface-200 hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <Video className="w-8 h-8 text-surface-800/25 mb-2" />
                <span className="text-sm font-medium text-surface-800/50">
                  Upload Promo Video
                </span>
                <span className="text-xs text-surface-800/30 mt-0.5">
                  Click to browse
                </span>
              </button>
            )}
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Learning outcomes */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Learning Outcomes</h2>
          <p className="text-sm text-surface-800/50">What will students learn in this course?</p>

          {form.learningOutcomes.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder={`Outcome ${i + 1}`}
                value={item}
                onChange={(e) => handleListChange('learningOutcomes', i, e.target.value)}
                className="flex-1"
              />
              {form.learningOutcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem('learningOutcomes', i)}
                  className="p-2 rounded-lg text-surface-800/40 hover:text-error-600 hover:bg-error-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem('learningOutcomes')}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="w-4 h-4" /> Add outcome
          </button>
        </div>

        {/* Requirements */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Requirements</h2>
          <p className="text-sm text-surface-800/50">Prerequisites for students</p>

          {form.requirements.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder={`Requirement ${i + 1}`}
                value={item}
                onChange={(e) => handleListChange('requirements', i, e.target.value)}
                className="flex-1"
              />
              {form.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeListItem('requirements', i)}
                  className="p-2 rounded-lg text-surface-800/40 hover:text-error-600 hover:bg-error-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem('requirements')}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="w-4 h-4" /> Add requirement
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" isLoading={createMutation.isPending}>
            Create Course
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/instructor/courses')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;
