import express, { Response } from 'express';
import { storage } from '../storage/inMemoryStorage';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/projects
// @desc    Get all projects for the logged-in user
// @access  Private
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const projects = storage.findProjectsByUserId(req.user._id);

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const project = storage.findProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user owns the project
    if (project.userId !== req.user._id) {
      res.status(403).json({ error: 'Not authorized to access this project' });
      return;
    }

    res.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { name, type, prompt, generatedCode } = req.body;

    // Validation
    if (!name || !type || !prompt) {
      res.status(400).json({ error: 'Please provide name, type, and prompt' });
      return;
    }

    // Create project
    const project = storage.createProject({
      userId: req.user._id,
      name,
      type,
      prompt,
      generatedCode: generatedCode || {},
      versions: [
        {
          code: generatedCode || {},
          timestamp: new Date(),
          description: 'Initial version',
        },
      ],
    });

    // Track user activity
    storage.addPromptToActivity(req.user._id, {
      id: project._id,
      text: prompt,
      projectId: project._id,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const project = storage.findProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user owns the project
    if (project.userId !== req.user._id) {
      res.status(403).json({ error: 'Not authorized to update this project' });
      return;
    }

    const { name, generatedCode, description } = req.body;

    // Update project
    const updates: any = {};
    if (name) updates.name = name;
    if (generatedCode) {
      updates.generatedCode = generatedCode;
      // Add new version
      updates.versions = [
        ...project.versions,
        {
          code: generatedCode,
          timestamp: new Date(),
          description: description || 'Updated version',
        },
      ];
    }

    const updatedProject = storage.updateProject(req.params.id, updates);

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const project = storage.findProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if user owns the project
    if (project.userId !== req.user._id) {
      res.status(403).json({ error: 'Not authorized to delete this project' });
      return;
    }

    storage.deleteProject(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
