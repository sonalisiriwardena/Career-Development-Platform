import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

export interface IJob {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'intermediate' | 'senior' | 'executive';
  postedBy: mongoose.Types.ObjectId;
  status: 'active' | 'closed';
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [{
      type: String,
      required: true,
    }],
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'senior', 'executive'],
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    applicants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1 });

export const Job = models.Job || model<IJob>('Job', jobSchema); 