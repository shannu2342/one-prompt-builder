# Backend Code - Complete Reference

## 1. Server Entry Point (backend/src/server.ts)

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

## 2. Authentication Routes (backend/src/routes/auth.ts)

```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage/inMemoryStorage';

const router = Router();

// Register new user
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

// Login user
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

## 3. Project Routes (backend/src/routes/projects.ts)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../storage/inMemoryStorage';

const router = Router();
router.use(authMiddleware);

// Get all projects for authenticated user
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

// Create new project
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

## 4. Generate Routes (backend/src/routes/generate.ts)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateCode } from '../services/grokService';
import { storage } from '../storage/inMemoryStorage';

const router = Router();
router.use(authMiddleware);

// Generate code from prompt using Grok API
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

## 5. Admin Routes (backend/src/routes/admin.ts)

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
    });
    
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

// Get all users (admin only)
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

// Get analytics (admin only)
router.get('/analytics', adminAuthMiddleware, (_req, res): void => {
  try {
    const users = storage.getAllUsers();
    const projects = storage.getAllProjects();
    const activities = storage.getAllUsersActivity();
    
    const totalGenerations = activities.reduce((sum, a) => sum + (a.totalGenerations || 0), 0);
    
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(p => {
        const user = storage.findUserById(p.userId);
        return {
          projectId: p._id,
          projectName: p.name,
          userName: user?.name || 'Unknown',
          type: p.type,
          createdAt: p.createdAt
        };
      });
    
    res.json({
      totalUsers: users.length,
      totalProjects: projects.length,
      totalGenerations,
      recentActivity: recentProjects,
      stats: {
        websiteProjects: projects.filter(p => p.type === 'website' || p.type === 'both').length,
        mobileProjects: projects.filter(p => p.type === 'mobile-app' || p.type === 'both').length,
        dualProjects: projects.filter(p => p.type === 'both').length
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
```

## 6. Grok AI Service (backend/src/services/grokService.ts)

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
      systemPrompt = `You are an expert web developer. Generate production-ready code for a ${framework || 'HTML/CSS/JS'} website based on the user's requirements. Return the code in JSON format with keys: html, css, js, and any additional files needed. Make it modern, responsive, and production-ready.`;
    } else if (type === 'mobile-app') {
      systemPrompt = `You are an expert mobile app developer. Generate production-ready React Native code based on the user's requirements. Return the code in JSON format with keys: App.js, package.json, and any additional components needed. Include navigation, styling, and best practices.`;
    } else {
      systemPrompt = `You are an expert full-stack developer. Generate both a website and mobile app based on the user's requirements. Return the code in JSON format with separate sections for website (html, css, js) and mobile app (App.js, components). Ensure consistency between both platforms.`;
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
    if (axios.isAxiosError(error)) {
      throw new Error(`Grok API error: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to generate code with Grok API');
  }
}
```

## 7. Deployment Service (backend/src/services/deploymentService.ts)

```typescript
import axios from 'axios';

export async function deployToVercel(projectCode: any, projectName: string): Promise<string> {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    throw new Error('Vercel token not configured');
  }

  try {
    // Create deployment
    const response = await axios.post(
      'https://api.vercel.com/v13/deployments',
      {
        name: projectName.toLowerCase().replace(/\s+/g, '-'),
        files: [
          {
            file: 'index.html',
            data: projectCode.html || ''
          },
          {
            file: 'styles.css',
            data: projectCode.css || ''
          },
          {
            file: 'script.js',
            data: projectCode.js || ''
          }
        ],
        projectSettings: {
          framework: null
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.url;
  } catch (error) {
    console.error('Vercel deployment error:', error);
    throw new Error('Failed to deploy to Vercel');
  }
}

export async function deployToNetlify(projectCode: any, projectName: string): Promise<string> {
  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
  
  if (!NETLIFY_TOKEN) {
    throw new Error('Netlify token not configured');
  }

  try {
    // Create site
    const siteResponse = await axios.post(
      'https://api.netlify.com/api/v1/sites',
      {
        name: projectName.toLowerCase().replace(/\s+/g, '-')
      },
      {
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Deploy files
    const deployResponse = await axios.post(
      `https://api.netlify.com/api/v1/sites/${siteResponse.data.id}/deploys`,
      {
        files: {
          '/index.html': projectCode.html || '',
          '/styles.css': projectCode.css || '',
          '/script.js': projectCode.js || ''
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return deployResponse.data.ssl_url || deployResponse.data.url;
  } catch (error) {
    console.error('Netlify deployment error:', error);
    throw new Error('Failed to deploy to Netlify');
  }
}
```

## 8. In-Memory Storage (backend/src/storage/inMemoryStorage.ts)

See next section for complete storage implementation...
