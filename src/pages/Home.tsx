import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Building } from 'lucide-react';
import useJobStore from '../store/jobStore';
import useAuthStore from '../store/authStore';
import type { Job } from '../api/jobs';

export default function Home() {
  const { jobs, isLoading: loading, error, fetchJobs } = useJobStore();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    jobCount: 0,
    userCount: 0,
    companyCount: 0
  });

  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  async function loadJobs() {
    try {
      await fetchJobs();
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }

  async function loadStats() {
    try {
      // In a real application, you would fetch these stats from your backend
      setStats({
        jobCount: 1000,
        userCount: 50000,
        companyCount: 500
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  // Only show the first 2 jobs in the featured section
  const featuredJobs = jobs.slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-extrabold text-blue-700 drop-shadow mb-2">Find Your Dream Career</h1>
        <p className="text-xl text-gray-600 mb-6">Connect with top companies, discover opportunities, and take the next step in your professional journey.</p>
        <Link to="/jobs" className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-600 transition-all duration-200">
          Browse All Jobs <TrendingUp className="ml-2 h-5 w-5" />
        </Link>
      </section>

      <div className="grid md:grid-cols-3 gap-8 my-16">
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500 hover:scale-105 transition">
          <div className="text-blue-600 mb-4">
            <TrendingUp className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{stats.jobCount.toLocaleString()}+</h3>
          <p className="text-gray-600">Active Job Listings</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500 hover:scale-105 transition">
          <div className="text-blue-600 mb-4">
            <Users className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{stats.userCount.toLocaleString()}+</h3>
          <p className="text-gray-600">Professional Network</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500 hover:scale-105 transition">
          <div className="text-blue-600 mb-4">
            <Building className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{stats.companyCount.toLocaleString()}+</h3>
          <p className="text-gray-600">Partner Companies</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-xl p-10 max-w-4xl mx-auto border border-blue-100">
        <h2 className="text-3xl font-bold mb-8 text-blue-700">Featured Jobs</h2>
        <div className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No jobs available</div>
          ) : (
            featuredJobs.map((job: Job) => (
              <div key={job._id} className="border-b pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-gray-500">{job.location}</p>
                    <p className="text-gray-500">
                      {job.salary?.currency} {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-blue-700 hover:to-blue-600 transition"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}