'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';


const ApplicationModal = ({ job, isOpen, onClose, onApplicationSubmit }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResumeError('');
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('Resume must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes('.' + ext)) {
        setResumeError('Resume must be PDF, DOC, or DOCX format');
        return;
      }
      
      setResume(file);
    }
  };

  const removeResume = () => {
    setResume(null);
    setResumeError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResumeError('');
    
    try {
      const formData = new FormData();
      formData.append('job', job.id);
      
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }
      
      // Only append resume if a new one is uploaded
      if (resume) {
        formData.append('resume', resume);
      }
      
      const response = await api.post('/api/applications/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Application submitted successfully!');
      onApplicationSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.data?.error) {
        if (error.response.data.error === 'Please upload a resume to your profile before applying for jobs') {
          setResumeError('Please upload a resume to apply for jobs');
        } else {
          toast.error(error.response.data.error);
        }
      } else if (error.response?.data) {
        // Handle validation errors
        const errors = error.response.data;
        if (errors.resume) {
          setResumeError(Array.isArray(errors.resume) ? errors.resume.join(' ') : errors.resume);
        } else if (typeof errors === 'object') {
          // Handle other field errors
          const errorMessages = Object.values(errors).flat().join(' ');
          toast.error(errorMessages);
        } else {
          toast.error('Failed to submit application. Please check your inputs.');
        }
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Apply for {job.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resume Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resume *
            </label>
            
            {/* Show profile resume information */}
            {user.resume && !resume && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <div>
                      <span className="text-sm text-blue-800 dark:text-blue-300 block">
                        Using your profile resume: {user.resume_original_name}
                      </span>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Your profile resume will be used for this application
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Option to upload different resume */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Want to use a different resume for this application?
              </p>
              
              {!resume ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upload different resume</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-green-800 dark:text-green-300">{resume.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeResume}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {resumeError && (
              <p className="text-red-500 text-sm mt-1">{resumeError}</p>
            )}
          </div>

          {/* Cover Letter Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Tell us why you're interested in this position and why you'd be a good fit..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary dark:bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>

          {/* Information about resume requirement */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> Your application will use your profile resume unless you upload a different one above.
              {!user.resume && " You need to have a resume in your profile to apply for jobs."}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;