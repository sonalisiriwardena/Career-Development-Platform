import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
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
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
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
      enum: ['jobseeker', 'employer', 'admin'],
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
  { timestamps: true }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 