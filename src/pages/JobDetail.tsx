import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useJobStore from '../store/jobStore';
import useAuthStore from '../store/authStore';
import apiClient from '../api/client';
import type { Job } from '../api/jobs';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadJob(id);
    }
  }, [id]);

  async function loadJob(jobId: string) {
    try {
      setLoading(true);
      const response = await apiClient.get(`/jobs/${jobId}`);
      setJob(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!user || !id) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      await apiClient.post(`/jobs/${id}/apply`);
      // Reload job to get updated applicants list
      await loadJob(id);
      alert('Successfully applied to job!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{job.title}</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Company</p>
            <p className="font-semibold">{job.company}</p>
          </div>
          <div>
            <p className="text-gray-600">Location</p>
            <p className="font-semibold">{job.location}</p>
          </div>
          <div>
            <p className="text-gray-600">Job Type</p>
            <p className="font-semibold">{job.jobType}</p>
          </div>
          <div>
            <p className="text-gray-600">Experience Level</p>
            <p className="font-semibold">{job.experienceLevel}</p>
          </div>
          <div>
            <p className="text-gray-600">Salary Range</p>
            <p className="font-semibold">
              {job.salary?.currency} {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{job.requirements}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Back to Jobs
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
} 