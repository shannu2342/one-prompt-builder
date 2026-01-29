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

// Admin logout
router.post('/logout', adminAuthMiddleware, (req, res): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    storage.deleteAdminSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get all users
router.get('/users', adminAuthMiddleware, (_req, res): void => {
  try {
    const users = storage.getAllUsers();
    const usersWithActivity = users.map(user => {
      const activity = storage.getUserActivity(user._id);
      const projects = storage.findProjectsByUserId(user._id);
      return {
        ...user,
        password: undefined, // Don't send passwords
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

// Get user details
router.get('/users/:id', adminAuthMiddleware, (req, res): void => {
  try {
    const user = storage.findUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const projects = storage.findProjectsByUserId(user._id);
    const activity = storage.getUserActivity(user._id);
    
    res.json({
      user: {
        ...user,
        password: undefined // Don't send password
      },
      projects,
      activity: activity || {
        totalGenerations: 0,
        prompts: [],
        projects: [],
        lastActive: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get all prompts
router.get('/prompts', adminAuthMiddleware, (_req, res): void => {
  try {
    const allProjects = storage.getAllProjects();
    const prompts = allProjects.map(p => {
      const user = storage.findUserById(p.userId);
      return {
        id: p._id,
        userId: p.userId,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        prompt: p.prompt,
        type: p.type,
        createdAt: p.createdAt,
        projectName: p.name
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(prompts);
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get prompts by user
router.get('/prompts/user/:userId', adminAuthMiddleware, (req, res): void => {
  try {
    const projects = storage.findProjectsByUserId(req.params.userId);
    const prompts = projects.map(p => ({
      id: p._id,
      prompt: p.prompt,
      type: p.type,
      createdAt: p.createdAt,
      projectName: p.name
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(prompts);
  } catch (error) {
    console.error('Get user prompts error:', error);
    res.status(500).json({ error: 'Failed to fetch user prompts' });
  }
});

// Get project code
router.get('/code/:projectId', adminAuthMiddleware, (req, res): void => {
  try {
    const project = storage.findProjectById(req.params.projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const user = storage.findUserById(project.userId);
    
    res.json({
      project: {
        ...project,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown'
      },
      code: project.generatedCode
    });
  } catch (error) {
    console.error('Get project code error:', error);
    res.status(500).json({ error: 'Failed to fetch project code' });
  }
});

// Get analytics
router.get('/analytics', adminAuthMiddleware, (_req, res): void => {
  try {
    const users = storage.getAllUsers();
    const projects = storage.getAllProjects();
    const activities = storage.getAllUsersActivity();
    
    const totalGenerations = activities.reduce((sum, a) => sum + (a.totalGenerations || 0), 0);
    
    // Recent activity (last 10)
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
