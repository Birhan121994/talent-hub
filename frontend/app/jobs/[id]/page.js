'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ApplicationModal from '@/components/ApplicationModal';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, DollarSign, Calendar, User, Building, ArrowLeft, Pencil } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobDetailPage = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchJob();
    if (user) {
      checkApplicationStatus();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/jobs/${id}/`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get('http://localhost:8000/api/applications/');
      const userApplications = response.data;
      const hasApplied = userApplications.some(app => app.job.id === parseInt(id));
      setHasApplied(hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Job Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push('/jobs')}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Other Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Jobs
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Building className="h-5 w-5 mr-2" />
                  <span>{job.created_by.company}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>${job.salary.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {user?.id === job.created_by.id && (
              <button
                onClick={() => router.push(`/edit-job/${job.id}`)}
                className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-400 px-3 py-1 rounded-md text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors inline-flex items-center"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit Job
              </button>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Job Description</h2>
            <div 
              className="text-gray-600 dark:text-gray-400 prose prose-blue max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Requirements</h2>
            <div 
              className="text-gray-600 dark:text-gray-400 prose prose-blue max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">About {job.created_by.company}</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <User className="h-5 w-5 mr-2" />
              <span>Posted by: {job.created_by.first_name} {job.created_by.last_name}</span>
            </div>
          </div>
        </div>

        {/* Application Section */}
        {user?.role === 'developer' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Apply for this Position</h2>
            
            {hasApplied ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                <p className="text-green-800 dark:text-green-300">
                  ✓ You have successfully applied for this position. We'll review your application and get back to you soon!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Application Requirements</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Resume (PDF, DOC, or DOCX format)</li>
                    <li>• Optional cover letter</li>
                    <li>• Make sure your profile information is up to date</li>
                  </ul>
                </div>
                
                {!user.resume && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      ⚠️ You haven't uploaded a resume to your profile yet. You can upload one during the application process or add it to your profile first.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setApplicationModalOpen(true)}
                  className="bg-primary dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium w-full"
                >
                  Start Application
                </button>
              </>
            )}
          </div>
        )}

        {!user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Interested in this position?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to apply for this job</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-primary dark:bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700"
            >
              Sign In to Apply
            </button>
          </div>
        )}

        {user?.role === 'employer' && user.id === job.created_by.id && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-blue-800 dark:text-blue-300">
              This is your job posting. You've received {job.application_count} application(s) so far.
            </p>
          </div>
        )}
      </div>

      {/* Application Modal */}
      {job && (
        <ApplicationModal
          job={job}
          isOpen={applicationModalOpen}
          onClose={() => setApplicationModalOpen(false)}
          onApplicationSubmit={() => {
            setHasApplied(true);
            setApplicationModalOpen(false);
            // Refresh the page to show the success message
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }}
        />      
      )}
    </div>
  );
};

export default JobDetailPage;