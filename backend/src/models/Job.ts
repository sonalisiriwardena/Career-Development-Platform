import mongoose from 'mongoose';

export interface IJob extends mongoose.Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  postedBy: mongoose.Types.ObjectId;
  status: 'active' | 'closed';
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema<IJob>({
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
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
  },
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
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead'],
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);