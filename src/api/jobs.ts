import { apiClient } from './client';
import { User } from './auth';

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedBy: User | string;
  applicants: (User | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  jobType: Job['jobType'];
  experienceLevel: Job['experienceLevel'];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export const getAllJobs = async (filters?: JobFilters): Promise<Job[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }
  const response = await apiClient.get(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

export const getJobById = async (id: string): Promise<Job> => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (data: Omit<Job, '_id' | 'postedBy' | 'applicants' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  const response = await apiClient.post('/jobs', data);
  return response.data;
};

export const updateJob = async (id: string, data: Partial<Omit<Job, '_id' | 'postedBy' | 'applicants' | 'createdAt' | 'updatedAt'>>): Promise<Job> => {
  const response = await apiClient.put(`/jobs/${id}`, data);
  return response.data;
};

export const deleteJob = async (id: string): Promise<void> => {
  await apiClient.delete(`/jobs/${id}`);
};

export const applyToJob = async (jobId: string): Promise<void> => {
  await apiClient.post(`/jobs/${jobId}/apply`);
}; 