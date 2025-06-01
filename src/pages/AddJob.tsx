import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useJobStore from '../store/jobStore';
import useAuthStore from '../store/authStore';
import type { CreateJobInput } from '../api/jobs';

type SalaryField = 'min' | 'max' | 'currency';

type JobFormData = {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  jobType: CreateJobInput['jobType'];
  experienceLevel: CreateJobInput['experienceLevel'];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
};

export default function AddJob() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createJob, isLoading, error } = useJobStore();
  const [jobData, setJobData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    jobType: 'Full-time',
    experienceLevel: 'Entry',
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  });

  if (!user || user.role !== 'employer') {
    return (
      <div className="text-center text-gray-500 py-8">
        You must be logged in as an employer to post jobs
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(jobData);
      navigate('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const updateSalary = (field: SalaryField, value: string | number) => {
    const newSalary = { ...jobData.salary };
    if (field === 'currency') {
      newSalary.currency = value as string;
    } else {
      newSalary[field] = Math.max(0, value as number);
    }
    setJobData({ ...jobData, salary: newSalary });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={jobData.title}
                onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                required
                value={jobData.company}
                onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">
                Job Type
              </label>
              <select
                id="jobType"
                required
                value={jobData.jobType}
                onChange={(e) => setJobData({ ...jobData, jobType: e.target.value as JobFormData['jobType'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                required
                value={jobData.experienceLevel}
                onChange={(e) => setJobData({ ...jobData, experienceLevel: e.target.value as JobFormData['experienceLevel'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead Level</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              required
              value={jobData.location}
              onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                required
                value={jobData.salary.currency}
                onChange={(e) => updateSalary('currency', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">
                Minimum Salary
              </label>
              <input
                type="number"
                id="minSalary"
                required
                min="0"
                value={jobData.salary.min}
                onChange={(e) => updateSalary('min', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700">
                Maximum Salary
              </label>
              <input
                type="number"
                id="maxSalary"
                required
                min="0"
                value={jobData.salary.max}
                onChange={(e) => updateSalary('max', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <textarea
              id="requirements"
              required
              rows={4}
              value={jobData.requirements}
              onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter job requirements..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isLoading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 