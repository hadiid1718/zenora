import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? api.patch(`/admin/categories/${editing._id}`, payload)
        : api.post('/admin/categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editing ? 'Category updated' : 'Category created');
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditing(null);
    setName('');
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ name: name.trim() });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
        <Button onClick={() => setIsOpen(true)} icon={Plus}>
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : !data?.categories?.length ? (
        <p className="text-surface-800/50 text-center py-12">No categories yet</p>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-200 divide-y divide-surface-100">
          {data.categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="font-medium text-surface-900">{cat.name}</p>
                <p className="text-xs text-surface-800/40">{cat.courseCount ?? 0} courses</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 rounded-lg text-surface-800/40 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this category?'))
                      deleteMutation.mutate(cat._id);
                  }}
                  className="p-1.5 rounded-lg text-surface-800/40 hover:text-error-600 hover:bg-error-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Web Development"
            required
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
