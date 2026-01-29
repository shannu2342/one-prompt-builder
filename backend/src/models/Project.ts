import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectVersion {
  code: any;
  timestamp: Date;
  description?: string;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  prompt: string;
  type: 'website' | 'mobile-app';
  framework: string;
  generatedCode: any;
  versions: IProjectVersion[];
  status: 'draft' | 'published' | 'archived';
  deploymentUrl?: string;
  deploymentPlatform?: 'vercel' | 'netlify' | 'github';
  metadata: {
    pages?: number;
    components?: number;
    dependencies?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectVersionSchema = new Schema<IProjectVersion>({
  code: {
    type: Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    maxlength: 200,
  },
});

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['website', 'mobile-app'],
      required: true,
    },
    framework: {
      type: String,
      required: true,
      default: 'html',
    },
    generatedCode: {
      type: Schema.Types.Mixed,
      required: true,
    },
    versions: [projectVersionSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    deploymentUrl: {
      type: String,
      trim: true,
    },
    deploymentPlatform: {
      type: String,
      enum: ['vercel', 'netlify', 'github'],
    },
    metadata: {
      pages: Number,
      components: Number,
      dependencies: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ name: 'text', description: 'text' });

export const Project = mongoose.model<IProject>('Project', projectSchema);
