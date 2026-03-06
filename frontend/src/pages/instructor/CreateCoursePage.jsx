import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, Plus, Trash2, GripVertical } from 'lucide-react';
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
  const [errors, setErrors] = useState({});

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
