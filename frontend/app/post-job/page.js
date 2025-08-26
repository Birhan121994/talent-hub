'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PostJobPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  // Redirect if not employer or not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'employer') {
      toast.error('Only employers can post jobs');
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      description: value
    }));
    
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }));
    }
  };

  const handleRequirementsChange = (value) => {
    setFormData(prev => ({
      ...prev,
      requirements: value
    }));
    
    if (errors.requirements) {
      setErrors(prev => ({
        ...prev,
        requirements: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description || formData.description === '<p><br></p>') {
      newErrors.description = 'Description is required';
    }
    if (!formData.requirements || formData.requirements === '<p><br></p>') {
      newErrors.requirements = 'Requirements are required';
    }
    if (!formData.location) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/jobs/', {
        ...formData,
        salary: formData.salary || null
      });
      
      toast.success('Job posted successfully!');
      router.push('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        toast.error('Your session has expired. Please log in again.');
        logout();
        router.push('/login');
      } else if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        toast.error('Failed to post job. Please try again.');
      }
    }
    
    setLoading(false);
  };

  // Show nothing while checking authentication
  if (!user || user.role !== 'employer') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-32">
        <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
        </div>
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-32">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
              Post a New Job
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. Remote, New York, NY, etc."
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Salary (optional)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g. 75000"
                  />
                  {errors.salary && (
                    <p className="text-red-500 text-sm mt-2">{errors.salary}</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Job Description *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the role, responsibilities, and what makes your company great..."
                  error={errors.description}
                />
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 pt-3">
                  Requirements & Qualifications *
                </label>
                <RichTextEditor
                  value={formData.requirements}
                  onChange={handleRequirementsChange}
                  placeholder="List the required skills, experience, and qualifications. You can use bullet points for better readability."
                  error={errors.requirements}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting Job...
                    </div>
                  ) : (
                    'Post Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;