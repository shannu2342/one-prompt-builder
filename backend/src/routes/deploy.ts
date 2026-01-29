import express, { Response } from 'express';
import { deploymentService } from '../services/deploymentService';
import { Project } from '../models/Project';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/deploy/vercel
// @desc    Deploy project to Vercel
// @access  Private
router.post('/vercel', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { projectId, projectName, files } = req.body;

    // Validation
    if (!projectName || !files) {
      res.status(400).json({ error: 'Please provide project name and files' });
      return;
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      res.status(500).json({ error: 'Vercel token not configured' });
      return;
    }

    // Deploy to Vercel
    const result = await deploymentService.deployToVercel({
      platform: 'vercel',
      projectName,
      files,
      token: vercelToken,
    });

    if (!result.success) {
      res.status(500).json({ error: result.error });
      return;
    }

    // Update project if projectId provided
    if (projectId) {
      await Project.findOneAndUpdate(
        { _id: projectId, userId: req.user._id },
        {
          deploymentUrl: result.url,
          deploymentPlatform: 'vercel',
          status: 'published',
        }
      );
    }

    res.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
      message: 'Successfully deployed to Vercel',
    });
  } catch (error: any) {
    console.error('Vercel deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/deploy/netlify
// @desc    Deploy project to Netlify
// @access  Private
router.post('/netlify', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { projectId, projectName, files } = req.body;

    // Validation
    if (!projectName || !files) {
      res.status(400).json({ error: 'Please provide project name and files' });
      return;
    }

    const netlifyToken = process.env.NETLIFY_TOKEN;
    if (!netlifyToken) {
      res.status(500).json({ error: 'Netlify token not configured' });
      return;
    }

    // Deploy to Netlify
    const result = await deploymentService.deployToNetlify({
      platform: 'netlify',
      projectName,
      files,
      token: netlifyToken,
    });

    if (!result.success) {
      res.status(500).json({ error: result.error });
      return;
    }

    // Update project if projectId provided
    if (projectId) {
      await Project.findOneAndUpdate(
        { _id: projectId, userId: req.user._id },
        {
          deploymentUrl: result.url,
          deploymentPlatform: 'netlify',
          status: 'published',
        }
      );
    }

    res.json({
      success: true,
      url: result.url,
      deploymentId: result.deploymentId,
      message: 'Successfully deployed to Netlify',
    });
  } catch (error: any) {
    console.error('Netlify deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/deploy/export/:projectId
// @desc    Export project as ZIP file
// @access  Private
router.post('/export/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user._id,
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Create ZIP export
    const zipPath = await deploymentService.createZipExport(
      project.name,
      project.generatedCode.files
    );

    res.download(zipPath, `${project.name}.zip`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up the file after download
      const fs = require('fs');
      fs.unlinkSync(zipPath);
    });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
