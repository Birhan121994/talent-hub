'use client';

import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import JobRecommendations from '@/components/JobRecommendations';
import ResumeGenerator from '@/components/ResumeGenerator';
import { 
  Briefcase, User, FileText, Clock, CheckCircle, 
  XCircle, AlertCircle, Pencil, Trash2, Eye,
  ChevronDown, ChevronUp, Search, Filter,
  Upload, Download, X, FileDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const DashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store all jobs for accurate counting
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  
  // Pagination states
  const [currentAppPage, setCurrentAppPage] = useState(1);
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const [itemsPerPage] = useState(5); // Items per page
  
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [user, router]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      if (user?.role === 'developer') {
        const appsResponse = await axios.get('http://localhost:8000/api/applications/');
        // Handle both array and object response formats
        const appsData = Array.isArray(appsResponse.data) ? appsResponse.data : appsResponse.data.results || [];
        setApplications(appsData);
      } else if (user?.role === 'employer') {
        const appsResponse = await axios.get('http://localhost:8000/api/applications/');
        // Handle both array and object response formats
        const appsData = Array.isArray(appsResponse.data) ? appsResponse.data : appsResponse.data.results || [];
        setApplications(appsData);
        
        const jobsResponse = await axios.get('http://localhost:8000/api/jobs/?all=true');

        console.log('Jobs response:', jobsResponse.data);

        // Handle both array and object response formats
        let jobsData = [];
        if (Array.isArray(jobsResponse.data)) {
          jobsData = jobsResponse.data;
        } else if (jobsResponse.data && Array.isArray(jobsResponse.data.results)) {
          jobsData = jobsResponse.data.results;
        } else if (jobsResponse.data && Array.isArray(jobsResponse.data.jobs)) {
          jobsData = jobsResponse.data.jobs;
        }
        
        // Store all jobs for accurate counting
        setAllJobs(jobsData);

        jobsData.forEach(job => {
          console.log('Job:', job.title);
          console.log('  Created By ID:', job.created_by?.id);
          console.log('  Current User ID:', user?.id);
          console.log('  Matches current user:', job.created_by?.id === user?.id);
          console.log('  Is Active:', job.is_active);
        });


        
        // Filter to show only employer's active jobs
        const myActiveJobs = jobsData.filter(job => 
          job.created_by && job.created_by.id === user.id && job.is_active !== false
        );
        setJobs(myActiveJobs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        toast.error('Your session has expired. Please log in again.');
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.applicant?.first_name + ' ' + app.applicant?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
    setCurrentAppPage(1); // Reset to first page when filters change
  };

  // Get current applications for pagination
  const indexOfLastApp = currentAppPage * itemsPerPage;
  const indexOfFirstApp = indexOfLastApp - itemsPerPage;
  const currentApps = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalAppPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Get current jobs for pagination
  const indexOfLastJob = currentJobPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalJobPages = Math.ceil(jobs.length / itemsPerPage);

  const paginateApps = (pageNumber) => setCurrentAppPage(pageNumber);
  const paginateJobs = (pageNumber) => setCurrentJobPage(pageNumber);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/applications/${applicationId}/`,
        { status: newStatus }
      );
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? response.data : app
      ));
      
      toast.success('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response?.status === 403) {
        toast.error('You can only update status for applications to your jobs');
      } else {
        toast.error('Failed to update application status');
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:8000/api/jobs/${jobId}/`);
      toast.success('Job deleted successfully!');
      // Refresh the jobs list
      fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('You can only delete your own jobs');
      } else {
        toast.error('Failed to delete job. Please try again.');
      }
    }
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setJobToDelete(null);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      handleDeleteJob(jobToDelete.id);
    }
    closeDeleteModal();
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    setResumeError('');
    
    if (!file) return;
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume must be less than 5MB');
      return;
    }
    
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setResumeError('Resume must be PDF, DOC, or DOCX format');
      return;
    }
    
    setResumeUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await axios.put('http://localhost:8000/api/auth/resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Resume uploaded successfully!');
      
      // Refresh the page to get updated user data
      await refreshUser();
    } catch (error) {
      console.error('Error uploading resume:', error);
      setResumeError(error.response?.data?.error || 'Failed to upload resume');
      toast.error(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = () => {
    confirmAlert({
      title: 'Confirm Resume Deletion',
      message: 'Are you sure you want to delete your resume?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete('http://localhost:8000/api/auth/resume/');
              toast.success('Resume deleted successfully!');
              await refreshUser();
            } catch (error) {
              console.error('Error deleting resume:', error);
              toast.error('Failed to delete resume');
            }
          }
        },
        {
          label: 'No'
        }
      ]
    });
  };

  const handleResumeDownload = async (applicationId, resumeName = 'resume') => {
    try {
      const token = Cookies.get('accessToken');

      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/applications/${applicationId}/download-resume/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    }
  };

  const handleOwnResumeDownload = async (resumeName = 'resume') => {
    try {
      const token = Cookies.get('accessToken');

      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(`http://localhost:8000/api/users/me/download-resume/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'hired':
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'hired':
        return 'bg-secondary/20 text-secondary dark:bg-secondary/30 dark:text-secondary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  // Calculate accurate active job count
  const activeJobCount = allJobs.filter(job => 
    job.created_by?.id === user?.id && job.is_active !== false
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Job Post"
        message="Are you sure you want to delete this job post? This action cannot be undone."
        confirmText="Delete Job"
        cancelText="Cancel"
        isDestructive={true}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.first_name || user?.username}!
          </p>
        </div>

        {user?.role === 'developer' && (
          <JobRecommendations />
        )}

        {/* Resume Section for Developers */}
        {user?.role === 'developer' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Resume</h3>
            
            {user.resume ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-primary dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">{user.resume_original_name || 'Resume'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded resume</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOwnResumeDownload(user.resume_original_name || 'resume')}
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Download Resume"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={handleResumeDelete}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No resume uploaded yet</p>
                <label className="inline-flex items-center px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resume
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleResumeUpload}
                    accept=".pdf,.doc,.docx"
                    disabled={resumeUploading}
                  />
                </label>
              </div>
            )}
            
            {resumeUploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Uploading resume...</p>
              </div>
            )}
            
            {resumeError && (
              <p className="text-red-500 text-sm mt-2">{resumeError}</p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user?.role === 'developer' ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{applications.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Applications</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {applications.filter(app => app.status === 'shortlisted' || app.status === 'hired').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Positive Responses</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                    <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {applications.filter(app => app.status === 'hired').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Jobs Landed</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeJobCount}</p>
                    <p className="text-gray-600 dark:text-gray-400">Active Job Posts</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                    <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{applications.length}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Applications</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {applications.filter(app => app.status === 'hired').length}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Successful Hires</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>



        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-primary text-primary dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {user?.role === 'developer' ? 'My Applications' : 'Job Applications'}
              </button>
              {user?.role === 'employer' && (
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'jobs'
                      ? 'border-primary text-primary dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  My Job Posts
                </button>
              )}

              {user?.role === 'developer' && (
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'resume'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Resume Builder
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Filters for Employers */}
            {user?.role === 'employer' && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search applicants or jobs..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="applied">Applied</option>
                      <option value='shortlisted'>Shortlisted</option>
                      <option value='rejected'>Rejected</option>
                      <option value='hired'>Hired</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {user?.role === 'developer' ? 'No applications yet' : 'No applications found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  {user?.role === 'developer' 
                    ? 'Start applying to jobs to see them here.' 
                    : 'Applications for your jobs will appear here.'
                  }
                </p>
                {user?.role === 'developer' && (
                  <button
                    onClick={() => router.push('/jobs')}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700"
                  >
                    Browse Jobs
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentApps.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {user?.role === 'developer' 
                                  ? application.job?.title || 'Unknown Job'
                                  : `${application.applicant?.first_name || 'Unknown'} ${application.applicant?.last_name || 'User'}`
                                }
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">
                                {user?.role === 'developer' 
                                  ? application.job?.created_by?.company || 'Unknown Company'
                                  : application.job?.title || 'Unknown Job'
                                }
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                              {getStatusIcon(application.status)}
                            </div>
                          </div>
                          
                          <p className="text-gray-500 dark:text-gray-500 text-sm mb-3">
                            Applied on {new Date(application.applied_at).toLocaleDateString()}
                          </p>

                          {application.cover_letter && (
                            <div className="mt-3">
                              <button
                                onClick={() => setExpandedApplication(
                                  expandedApplication === application.id ? null : application.id
                                )}
                                className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                              >
                                {expandedApplication === application.id ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Hide Cover Letter
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    View Cover Letter
                                  </>
                                )}
                              </button>
                              
                              {expandedApplication === application.id && (
                                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{application.cover_letter}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Resume Download Button for Employers */}
                        {user?.role === 'employer' && (
                          <button
                            onClick={() => handleResumeDownload(application.id, `${application.applicant?.first_name}_${application.applicant?.last_name}_resume`)}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Download Resume"
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Download Resume
                          </button>
                        )}

                        {/* Status Update Controls for Employers */}
                        {user?.role === 'employer' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Status:</span>
                            <div className="flex space-x-2">
                              {getStatusOptions(application.status).map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusUpdate(application.id, status)}
                                  disabled={updatingStatus === application.id}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                    status === 'shortlisted' || status === 'hired'
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                                      : status === 'rejected'
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                                  } disabled:opacity-50`}
                                >
                                  {updatingStatus === application.id ? 'Updating...' : status}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Applications Pagination */}
                {totalAppPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => paginateApps(Math.max(1, currentAppPage - 1))}
                      disabled={currentAppPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: totalAppPages }, (_, i) => i + 1).map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => paginateApps(pageNumber)}
                        className={`w-10 h-10 rounded-lg border transition-colors ${
                          currentAppPage === pageNumber
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      onClick={() => paginateApps(Math.min(totalAppPages, currentAppPage + 1))}
                      disabled={currentAppPage === totalAppPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Jobs Tab (Employers only) */}
        {activeTab === 'jobs' && user?.role === 'employer' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No job posts yet</h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  Create your first job post to start receiving applications.
                </p>
                <button
                  onClick={() => router.push('/post-job')}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700"
                >
                  Post a Job
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentJobs.map((job) => {
                    const stripHtml = (html) => {
                      if (!html) return '';
                      const tmp = document.createElement('DIV');
                      tmp.innerHTML = html;
                      return tmp.textContent || tmp.innerText || '';
                    };
                    
                    const truncatedDescription = stripHtml(job.description).slice(0, 100) + '...';
                    
                    return (
                      <div key={job.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{job.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{job.location}</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                              Posted on {new Date(job.created_at).toLocaleDateString()} • 
                              {job.salary && ` $${job.salary.toLocaleString()}`}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                              {truncatedDescription}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-gray-500">
                              {job.application_count || 0} applications
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => router.push(`/jobs/${job.id}`)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View Job"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/edit-job/${job.id}`)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Edit Job"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(job)}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Job"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Jobs Pagination */}
                {totalJobPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => paginateJobs(Math.max(1, currentJobPage - 1))}
                      disabled={currentJobPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: totalJobPages }, (_, i) => i + 1).map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => paginateJobs(pageNumber)}
                        className={`w-10 h-10 rounded-lg border transition-colors ${
                          currentJobPage === pageNumber
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      onClick={() => paginateJobs(Math.min(totalJobPages, currentJobPage + 1))}
                      disabled={currentJobPage === totalJobPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'resume' && user?.role === 'developer' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ResumeGenerator />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;