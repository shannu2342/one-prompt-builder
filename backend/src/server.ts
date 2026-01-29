import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import { errorHandler, notFound } from './middleware/errorHandler';
import { storage } from './storage/inMemoryStorage';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import generateRoutes from './routes/generate';
import deployRoutes from './routes/deploy';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

// Create default admin user
async function createDefaultAdmin() {
  try {
    const existingAdmin = storage.findAdminByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      storage.createAdmin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@builder.com',
      });
      console.log('✅ Default admin created: username=admin, password=admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

createDefaultAdmin();

// Initialize express app
const app = express();

// Note: Using in-memory storage instead of MongoDB for simplicity
console.log('ℹ️  Using in-memory storage (data will be lost on restart)');

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev')); // Logging

// Root route - API welcome message
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to One-Prompt Builder API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      projects: {
        list: 'GET /api/projects',
        create: 'POST /api/projects',
        get: 'GET /api/projects/:id',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
      },
      generate: {
        generate: 'POST /api/generate',
        enhance: 'POST /api/generate/enhance',
      },
      deploy: {
        vercel: 'POST /api/deploy/vercel',
        netlify: 'POST /api/deploy/netlify',
        export: 'POST /api/export/:id',
      },
    },
    documentation: 'See README.md for full API documentation',
  });
});

// Health check route
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 One-Prompt Builder API Server                       ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}                           ║
║                                                           ║
║   User API Endpoints:                                     ║
║   - POST /api/auth/register                               ║
║   - POST /api/auth/login                                  ║
║   - GET  /api/auth/me                                     ║
║   - GET  /api/projects                                    ║
║   - POST /api/projects                                    ║
║   - POST /api/generate                                    ║
║   - POST /api/deploy/vercel                               ║
║   - POST /api/deploy/netlify                              ║
║                                                           ║
║   Admin API Endpoints:                                    ║
║   - POST /api/admin/login                                 ║
║   - GET  /api/admin/users                                 ║
║   - GET  /api/admin/prompts                               ║
║   - GET  /api/admin/code/:projectId                       ║
║   - GET  /api/admin/analytics                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

export default app;
