import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { AuthRequest } from '../middleware/auth';

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      minSalary,
    } = req.query;

    const query: any = {};

    // Text search across multiple fields
    if (search) {
      query.$text = { $search: search as string };
    }

    // Specific field filters
    if (location) {
      query.location = location;
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    if (minSalary) {
      query['salary.min'] = { $gte: parseInt(minSalary as string) };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName company')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName company')
      .populate('applicants', 'firstName lastName email');

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = new Job({
      ...req.body,
      postedBy: new mongoose.Types.ObjectId(req.user._id),
    });

    await job.save();
    res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ error: validationErrors.join(', ') });
    } else {
      res.status(500).json({ error: 'Failed to create job' });
    }
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user._id) {
      res.status(403).json({ error: 'Not authorized to update this job' });
      return;
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('postedBy', 'firstName lastName company');

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.postedBy.toString() !== req.user._id) {
      res.status(403).json({ error: 'Not authorized to delete this job' });
      return;
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const applyToJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Check if user has already applied
    if (job.applicants.some(id => id.equals(userId))) {
      res.status(400).json({ error: 'Already applied to this job' });
      return;
    }

    job.applicants.push(userId);
    await job.save();

    res.json({ message: 'Successfully applied to job' });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ error: 'Failed to apply to job' });
  }
}; 