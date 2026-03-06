import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  User, Lock, Camera, Save, Globe, Linkedin, Youtube, Twitter,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    website: user?.website || '',
    socialLinks: {
      twitter: user?.socialLinks?.twitter || '',
      linkedin: user?.socialLinks?.linkedin || '',
      youtube: user?.socialLinks?.youtube || '',
    },
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const profileMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => toast.success('Profile updated successfully'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/password', data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.put('/student/settings/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      useAuthStore.setState({ user: res.data.data.user });
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate(profile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwords.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    passwordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image must be under 5MB');
      }
      avatarMutation.mutate(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-sm text-surface-800/50 mt-1">
          Manage your profile and account settings
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Profile Photo</h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar
                    src={user?.avatar?.url}
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    size="xl"
                  />
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors shadow-md">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-surface-800/50 mt-0.5">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                  {avatarMutation.isPending && (
                    <p className="text-xs text-brand-600 mt-1">Uploading...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Headline"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Full-Stack Developer"
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Social Links</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Globe className="absolute left-3 top-9 w-4 h-4 text-surface-800/40" />
                  <Input
                    label="Website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-3 top-9 w-4 h-4 text-surface-800/40" />
                  <Input
                    label="Twitter"
                    value={profile.socialLinks.twitter}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/username"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-9 w-4 h-4 text-surface-800/40" />
                  <Input
                    label="LinkedIn"
                    value={profile.socialLinks.linkedin}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Youtube className="absolute left-3 top-9 w-4 h-4 text-surface-800/40" />
                  <Input
                    label="YouTube"
                    value={profile.socialLinks.youtube}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@channel"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={profileMutation.isPending} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 max-w-lg">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Change Password</h2>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mt-6">
                <Button type="submit" isLoading={passwordMutation.isPending} icon={Lock}>
                  Change Password
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
