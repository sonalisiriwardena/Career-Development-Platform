import { create } from 'zustand';
import * as jobApi from '../api/jobs';
import type { Job, JobFilters, CreateJobInput, UpdateJobInput } from '../api/jobs';

interface JobState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  createJob: (data: CreateJobInput) => Promise<void>;
  updateJob: (id: string, data: UpdateJobInput) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  applyToJob: (jobId: string) => Promise<void>;
  setFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchJobs: async (filters?: JobFilters) => {
    try {
      set({ isLoading: true, error: null });
      const jobs = await jobApi.getAllJobs(filters);
      set({ jobs, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch jobs',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchJobById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const job = await jobApi.getJobById(id);
      set({ selectedJob: job, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch job',
        isLoading: false,
      });
      throw error;
    }
  },

  createJob: async (data: CreateJobInput) => {
    try {
      set({ isLoading: true, error: null });
      const job = await jobApi.createJob(data);
      set(state => ({
        jobs: [job, ...state.jobs],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create job',
        isLoading: false,
      });
      throw error;
    }
  },

  updateJob: async (id: string, data: UpdateJobInput) => {
    try {
      set({ isLoading: true, error: null });
      const updatedJob = await jobApi.updateJob(id, data);
      set(state => ({
        jobs: state.jobs.map(job => (job._id === id ? updatedJob : job)),
        selectedJob: state.selectedJob?._id === id ? updatedJob : state.selectedJob,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update job',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteJob: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await jobApi.deleteJob(id);
      set(state => ({
        jobs: state.jobs.filter(job => job._id !== id),
        selectedJob: state.selectedJob?._id === id ? null : state.selectedJob,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete job',
        isLoading: false,
      });
      throw error;
    }
  },

  applyToJob: async (jobId: string) => {
    try {
      set({ isLoading: true, error: null });
      await jobApi.applyToJob(jobId);
      // Refresh the job to get updated applicants list
      const updatedJob = await jobApi.getJobById(jobId);
      set(state => ({
        jobs: state.jobs.map(job => (job._id === jobId ? updatedJob : job)),
        selectedJob: state.selectedJob?._id === jobId ? updatedJob : state.selectedJob,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to apply to job',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: JobFilters) => {
    set({ filters });
    get().fetchJobs(filters);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchJobs();
  },

  clearError: () => set({ error: null }),
}));

export default useJobStore; 