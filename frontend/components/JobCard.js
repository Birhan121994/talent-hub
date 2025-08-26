import Link from 'next/link';
import { MapPin, DollarSign, Calendar, Building, Sparkles } from 'lucide-react';
import { getPlainTextPreview } from '@/utils/htmlUtils';

const JobCard = ({ job }) => {
  const truncatedDescription = getPlainTextPreview(job.description, 120);
  const isNew = Date.now() - new Date(job.created_at).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 card-hover group relative">
      {/* Recommendation Badge - Only show if job has is_recommended flag */}
      {job.is_recommended && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Recommended
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <Building className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{job.created_by?.company || 'Unknown Company'}</span>
          </div>
        </div>
        {isNew && (
          <div className="bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full flex items-center ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </div>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{truncatedDescription}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        
        {job.salary && (
          <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
            <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>${job.salary.toLocaleString()}/year</span>
          </div>
        )}
        
        <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-500">
          {job.application_count} application{job.application_count !== 1 ? 's' : ''}
        </span>
        <Link 
          href={`/jobs/${job.id}`}
          className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 text-sm font-semibold group-hover:scale-105 transform"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;