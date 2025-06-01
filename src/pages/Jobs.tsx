import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import useJobStore from '../store/jobStore';
import useAuthStore from '../store/authStore';
import type { Job, JobFilters } from '../api/jobs';
import { useNavigate } from 'react-router-dom';

export default function Jobs() {
  const { jobs, isLoading: loading, error, fetchJobs, applyToJob } = useJobStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    jobType: '',
    experienceLevel: '',
    minSalary: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      await fetchJobs({
        search: searchTerm,
        ...filters,
      });
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }

  const handleSearch = () => {
    loadJobs();
  };

  const handleApply = async (jobId: string) => {
    try {
      await applyToJob(jobId);
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center flex-1 bg-gray-50 rounded-lg px-3 py-2">
            <Search className="text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="ml-2 flex-1 bg-transparent outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          {user?.role === 'employer' && (
            <button
              onClick={() => navigate('/jobs/add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Post Job
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            <select
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>

            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Experience Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead Level</option>
            </select>

            <input
              type="text"
              placeholder="Min Salary"
              value={filters.minSalary}
              onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Job Listings</h2>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="divide-y">
          {jobs.map((job) => (
            <div key={job._id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  <p className="text-gray-500">{job.location}</p>
                  <p className="text-gray-500">{formatSalary(job.salary)}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {job.jobType}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                      {job.experienceLevel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleApply(job._id)}
                  disabled={!user || (Array.isArray(job.applicants) && job.applicants.includes(user._id))}
                  className={`px-4 py-2 rounded ${
                    !user
                      ? 'bg-gray-300 cursor-not-allowed'
                      : Array.isArray(job.applicants) && job.applicants.includes(user._id)
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {!user
                    ? 'Sign in to Apply'
                    : Array.isArray(job.applicants) && job.applicants.includes(user._id)
                    ? 'Applied'
                    : 'Apply Now'}
                </button>
              </div>
              <p className="mt-4 text-gray-700">{job.description}</p>
              {job.requirements && (
                <div className="mt-4">
                  <h4 className="font-semibold">Requirements:</h4>
                  <p className="mt-2 text-gray-700">{job.requirements}</p>
                </div>
              )}
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No jobs found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}