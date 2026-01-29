# One-Prompt Builder - Complete Code Reference

This document contains all the important code files from the project.

---

## Table of Contents
1. [Backend Code](#backend-code)
2. [Frontend Code](#frontend-code)
3. [Configuration Files](#configuration-files)
4. [Startup Scripts](#startup-scripts)

---

## Backend Code

### 1. Backend Server (server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import generateRoutes from './routes/generate';
import deployRoutes from './routes/deploy';
import adminRoutes from './routes/admin';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
```

### 2. Authentication Routes (routes/auth.ts)

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage/inMemoryStorage';

const router = Router();

// Register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }
    
    const existingUser = storage.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = storage.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    const user = storage.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
```

### 3. Project Routes (routes/projects.ts)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage/inMemoryStorage';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all projects for user
router.get('/', (req, res): void => {
  try {
    const userId = (req as any).user.id;
    const projects = storage.findProjectsByUserId(userId);
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', (req, res): void => {
  try {
    const userId = (req as any).user.id;
    const project = storage.findProjectById(req.params.id);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    if (project.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', (req, res): void => {
  try {
    const userId = (req as any).user.id;
    const { name, type, prompt, description } = req.body;
    
    if (!name || !type || !prompt) {
      res.status(400).json({ error: 'Please provide name, type, and prompt' });
      return;
    }
    
    const project = storage.createProject({
      userId,
      name,
      type,
      prompt,
      description,
      generatedCode: {},
      versions: []
    });
    
    // Track user activity
    storage.trackUserActivity(userId, {
      type: 'project_created',
      projectId: project._id,
      prompt
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', (req, res): void => {
  try {
    const userId = (req as any).user.id;
    const project = storage.findProjectById(req.params.id);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    if (project.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const updatedProject = storage.updateProject(req.params.id, req.body);
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', (req, res): void => {
  try {
    const userId = (req as any).user.id;
    const project = storage.findProjectById(req.params.id);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    if (project.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    storage.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
```

### 4. Generate Routes (routes/generate.ts)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateCode } from '../services/grokService';
import { storage } from '../storage/inMemoryStorage';

const router = Router();

router.use(authMiddleware);

// Generate code from prompt
router.post('/', async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { prompt, type, framework, projectId } = req.body;
    
    if (!prompt || !type) {
      res.status(400).json({ error: 'Prompt and type are required' });
      return;
    }
    
    // Generate code using Grok API
    const generatedCode = await generateCode(prompt, type, framework);
    
    // Update project if projectId provided
    if (projectId) {
      const project = storage.findProjectById(projectId);
      if (project && project.userId === userId) {
        storage.updateProject(projectId, {
          generatedCode,
          versions: [
            ...project.versions,
            {
              code: generatedCode,
              timestamp: new Date().toISOString()
            }
          ]
        });
      }
    }
    
    // Track generation activity
    storage.trackUserActivity(userId, {
      type: 'code_generated',
      projectId,
      prompt
    });
    
    res.json({
      success: true,
      generatedCode,
      message: 'Code generated successfully'
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

### 5. Admin Routes (routes/admin.ts)

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage/inMemoryStorage';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Admin login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }
    
    const admin = storage.findAdminByUsername(username);
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || 'admin-secret-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    storage.createAdminSession({
      adminId: admin.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    storage.updateAdminLastLogin(admin.id);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users
router.get('/users', adminAuthMiddleware, (req, res): void => {
  try {
    const users = storage.getAllUsers();
    const usersWithActivity = users.map(user => {
      const activity = storage.getUserActivity(user._id);
      const projects = storage.findProjectsByUserId(user._id);
      return {
        ...user,
        password: undefined,
        projectCount: projects.length,
        activity: activity || {
          totalGenerations: 0,
          prompts: [],
          projects: [],
          lastActive: user.createdAt
        }
      };
    });
    res.json(usersWithActivity);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
```

### 6. Grok Service (services/grokService.ts)

```typescript
import axios from 'axios';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.GROK_API_KEY || '';

export async function generateCode(
  prompt: string,
  type: 'website' | 'mobile-app' | 'both',
  framework?: string
): Promise<any> {
  if (!GROK_API_KEY) {
    throw new Error('Grok API key not configured. Please add GROK_API_KEY to your .env file');
  }

  try {
    let systemPrompt = '';
    
    if (type === 'website') {
      systemPrompt = `You are an expert web developer. Generate production-ready code for a ${framework || 'HTML/CSS/JS'} website based on the user's requirements. Return the code in JSON format with keys: html, css, js, and any additional files needed.`;
    } else if (type === 'mobile-app') {
      systemPrompt = `You are an expert mobile app developer. Generate production-ready React Native code based on the user's requirements. Return the code in JSON format with keys: App.js, package.json, and any additional components needed.`;
    } else {
      systemPrompt = `You are an expert full-stack developer. Generate both a website and mobile app based on the user's requirements. Return the code in JSON format with separate sections for website and mobile app.`;
    }

    const response = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.choices[0].message.content;
    
    // Try to parse as JSON
    try {
      return JSON.parse(generatedText);
    } catch {
      // If not JSON, return as raw code
      return {
        code: generatedText,
        type,
        framework
      };
    }
  } catch (error) {
    console.error('Grok API error:', error);
    throw new Error('Failed to generate code with Grok API');
  }
}
```

### 7. In-Memory Storage (storage/inMemoryStorage.ts)

```typescript
import bcrypt from 'bcryptjs';

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

interface Project {
  _id: string;
  userId: string;
  name: string;
  type: string;
  prompt: string;
  description?: string;
  generatedCode: any;
  versions: any[];
  createdAt: string;
  updatedAt: string;
}

interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
}

class InMemoryStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private admins: Map<string, Admin> = new Map();
  private userActivity: Map<string, any> = new Map();
  private adminSessions: Map<string, any> = new Map();
  private idCounter = 1;

  constructor() {
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    this.admins.set('1', {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
  }

  // User methods
  createUser(userData: Omit<User, '_id' | 'createdAt'>): User {
    const id = String(this.idCounter++);
    const user: User = {
      _id: id,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  findUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Project methods
  createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>): Project {
    const id = String(this.idCounter++);
    const project: Project = {
      _id: id,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(id, project);
    return project;
  }

  findProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  findProjectsByUserId(userId: string): Project[] {
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.projects.get(id);
    if (project) {
      const updated = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.projects.set(id, updated);
      return updated;
    }
    return undefined;
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  // Admin methods
  findAdminByUsername(username: string): Admin | undefined {
    return Array.from(this.admins.values()).find(a => a.username === username);
  }

  createAdminSession(session: any): void {
    this.adminSessions.set(session.token, session);
  }

  findAdminSession(token: string): any {
    return this.adminSessions.get(token);
  }

  deleteAdminSession(token: string): boolean {
    return this.adminSessions.delete(token);
  }

  updateAdminLastLogin(adminId: string): void {
    const admin = this.admins.get(adminId);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
    }
  }

  // Activity tracking
  trackUserActivity(userId: string, activity: any): void {
    const existing = this.userActivity.get(userId) || {
      userId,
      totalGenerations: 0,
      prompts: [],
      projects: [],
      lastActive: new Date().toISOString()
    };

    existing.totalGenerations++;
    existing.prompts.push({
      id: String(this.idCounter++),
      text: activity.prompt,
      timestamp: new Date().toISOString()
    });
    existing.lastActive = new Date().toISOString();

    this.userActivity.set(userId, existing);
  }

  getUserActivity(userId: string): any {
    return this.userActivity.get(userId);
  }

  getAllUsersActivity(): any[] {
    return Array.from(this.userActivity.values());
  }
}

export const storage = new InMemoryStorage();
```

### 8. Auth Middleware (middleware/auth.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Frontend Code

### 1. Landing Page (app/page.tsx)

```typescript
'use client';

import Link from 'next/link';
import { Sparkles, Code, Smartphone, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">One-Prompt Builder</span>
        </div>
        <div className="space-x-4">
          <Link
            href="/login"
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Build Websites & Apps with{' '}
            <span className="text-blue-600">One Prompt</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Transform your ideas into production-ready websites and mobile apps using the
            power of Grok AI. No coding required, just describe what you want.
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Start Building Free
            </Link>
            <button className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg border border-gray-200">
              View Demo
            </button>
          </div>

          {/* Example Prompt */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <p className="text-gray-700 font-mono text-sm">
                "Create a modern portfolio website with dark theme, hero section, projects gallery, and contact form"
              </p>
            </div>
            <div className="mt-4 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <Code className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI-Powered Generation</h3>
            <p className="text-gray-600">
              Leverage Grok AI to generate production-ready code from natural language descriptions.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <Smartphone className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Multi-Platform</h3>
            <p className="text-gray-600">
              Create websites and mobile apps simultaneously from a single prompt.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Deploy</h3>
            <p className="text-gray-600">
              One-click deployment to Vercel, Netlify, or export your project files.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 2. Login Page (app/login/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">One-Prompt Builder</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up
          </Link>
        </p>

        <Link
          href="/"
          className="block text-center mt-4 text-gray-500 hover:text-gray-700"
        >
