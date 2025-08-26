'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Brain, TrendingUp, Target, Clock, Zap } from 'lucide-react';
import JobCard from './JobCard';
import axios from 'axios';

const JobRecommendations = () => {
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'developer') {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/jobs/recommendations/');
      setRecommendedJobs(response.data.recommendations || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      // Fallback: show empty state
      setRecommendedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    await fetchRecommendations();
  };

  // Don't render anything if user is not a developer
  if (!user || user.role !== 'developer') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jobs For You
          </h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8 border border-purple-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl mr-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jobs For You
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered recommendations based on your profile and preferences
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshRecommendations}
          className="flex items-center text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Zap className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* AI Features Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">AI-Powered Matching</span>
        </div>
        <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Personalized Results</span>
        </div>
        <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Smart Ranking</span>
        </div>
      </div>

      {/* Recommendations Grid */}
      {error ? (
        <div className="text-center py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={refreshRecommendations}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : recommendedJobs.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 These recommendations are generated based on your profile, application history, and preferences
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-4">
            <Clock className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Building Your Profile
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400">
              Apply to a few jobs to help our AI understand your preferences better!
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/jobs'}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse All Jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;