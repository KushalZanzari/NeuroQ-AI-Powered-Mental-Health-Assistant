import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  SunIcon, 
  MoonIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from "../../services/api";


const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      email: user?.email || '',
      language: user?.language || 'en',
    },
  });

  const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    const res = await api.put("/auth/update-profile", {
      full_name: data.full_name,
      username: data.username
    });

    updateUser(res.data.user);
    setIsEditing(false);

    toast.success("Profile updated successfully!");
  } catch (error) {
    toast.error("Failed to update profile.");
  } finally {
    setIsLoading(false);
  }
};


  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    // { value: 'es', label: 'Español' },
    // { value: 'fr', label: 'Français' },
    // { value: 'de', label: 'Deutsch' },
    // { value: 'it', label: 'Italiano' },
    // { value: 'pt', label: 'Português' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
        <div className="flex items-center">
          <HeartIcon className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-primary-100">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Personal Information</h2>
              <p className="card-description">Update your personal details</p>
            </div>
            <div className="card-content">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('full_name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      type="text"
                      className="input"
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                      Username
                    </label>
                    <input
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Username can only contain letters, numbers, and underscores',
                        },
                      })}
                      type="text"
                      className="input"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="input"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Full Name</p>
                      <p className="text-sm text-muted-foreground">{user?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Username</p>
                      <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          {/* Theme Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Appearance</h3>
            </div>
            <div className="card-content space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {theme === 'dark' ? (
                    <MoonIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <SunIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">Theme</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="btn btn-outline"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Language</h3>
            </div>
            <div className="card-content">
              <div className="flex items-center space-x-1 mb-2">
                <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Preferred Language</span>
              </div>
              <select className="input">
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Stats */}
          {/* <div className="card">
            <div className="card-header">
              <h3 className="card-title">Account Statistics</h3>
            </div>
            <div className="card-content space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total check-ins</span>
                <span className="text-sm font-medium text-foreground">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI sessions</span>
                <span className="text-sm font-medium text-foreground">8</span>
              </div>
              
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
