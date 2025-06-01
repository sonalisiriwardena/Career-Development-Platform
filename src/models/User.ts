import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer' | 'admin';
  profile?: {
    title?: string;
    bio?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      startDate: Date;
      endDate?: Date;
      current: boolean;
      description: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field: string;
      startDate: Date;
      endDate?: Date;
      current: boolean;
    }>;
  };
  company?: {
    name: string;
    position: string;
    website: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['jobseeker', 'employer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },
    profile: {
      title: String,
      bio: String,
      skills: [String],
      experience: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      }],
      education: [{
        school: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
      }],
    },
    company: {
      name: String,
      position: String,
      website: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.skills': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = models.User || model<IUser>('User', userSchema); 