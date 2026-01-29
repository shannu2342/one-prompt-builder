import express, { Response } from 'express';
import { grokService } from '../services/grokService';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/generate
// @desc    Generate website and/or mobile app from prompt
// @access  Private
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { prompt, types, framework, features } = req.body;

    // Validation
    if (!prompt) {
      res.status(400).json({ error: 'Please provide a prompt' });
      return;
    }

    // Support both single type (backward compatible) and multiple types
    let typesToGenerate: string[] = [];
    
    if (req.body.type) {
      // Backward compatibility: single type
      typesToGenerate = [req.body.type];
    } else if (types && Array.isArray(types)) {
      // New: multiple types
      typesToGenerate = types;
    } else {
      res.status(400).json({ error: 'Please provide type or types array' });
      return;
    }

    // Validate types
    const validTypes = ['website', 'mobile-app'];
    const invalidTypes = typesToGenerate.filter(t => !validTypes.includes(t));
    if (invalidTypes.length > 0) {
      res.status(400).json({ 
        error: `Invalid types: ${invalidTypes.join(', ')}. Must be "website" or "mobile-app"` 
      });
      return;
    }

    // Generate projects for each type
    const results: any = {};
    
    for (const type of typesToGenerate) {
      try {
        const projectType = type as 'website' | 'mobile-app';
        const generatedCode = await grokService.generateProject({
          prompt,
          type: projectType,
          framework,
          features,
        });
        results[type] = generatedCode;
      } catch (error: any) {
        console.error(`Error generating ${type}:`, error);
        results[type] = {
          error: `Failed to generate ${type}`,
          details: error.message
        };
      }
    }

    res.json({
      success: true,
      generatedCode: results,
      types: typesToGenerate,
      message: typesToGenerate.length > 1 
        ? 'Website and mobile app generated successfully' 
        : 'Project generated successfully',
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate project',
      details: error.message 
    });
  }
});

// @route   POST /api/generate/enhance
// @desc    Enhance existing code with additional features
// @access  Private
router.post('/enhance', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const { existingCode, enhancementPrompt } = req.body;

    // Validation
    if (!existingCode || !enhancementPrompt) {
      res.status(400).json({ error: 'Please provide existing code and enhancement prompt' });
      return;
    }

    // Enhance code using Grok
    const enhancedCode = await grokService.enhanceCode(existingCode, enhancementPrompt);

    res.json({
      success: true,
      enhancedCode,
      message: 'Code enhanced successfully',
    });
  } catch (error: any) {
    console.error('Enhancement error:', error);
    res.status(500).json({ 
      error: 'Failed to enhance code',
      details: error.message 
    });
  }
});

export default router;
