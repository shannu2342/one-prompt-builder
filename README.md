# One-Prompt Site & App Builder

A powerful admin dashboard that creates production-ready websites and mobile apps from a single natural-language prompt using Grok AI.

## Features

- 🤖 **AI-Powered Generation**: Uses Grok API to generate complete websites and mobile apps
- 🎨 **Modern Dashboard**: Built with Next.js 14, TypeScript, and Tailwind CSS
- 📝 **Code Editor**: Monaco Editor with syntax highlighting and multi-file support
- 👁️ **Live Preview**: Real-time preview for websites and mobile apps
- 🚀 **One-Click Deploy**: Deploy to Vercel or Netlify instantly
- 📦 **Export Projects**: Download complete project files
- 🔐 **Authentication**: Secure user authentication with JWT
- 💾 **Version Control**: Track and restore previous versions
- 📱 **Mobile App Support**: Generate React Native apps with full navigation

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Monaco Editor
- Axios for API calls

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Grok API Integration
- Vercel/Netlify API Integration

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation)
- Grok API Key from xAI

## Installation

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/one-prompt-builder
JWT_SECRET=your-super-secret-jwt-key-change-this
GROK_API_KEY=your-grok-api-key-here
VERCEL_TOKEN=your-vercel-token (optional)
NETLIFY_TOKEN=your-netlify-token (optional)
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Run the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## Usage

1. **Sign Up/Login**: Create an account or login
2. **Create Project**: Click "New Project" and enter your prompt
3. **Generate**: Choose website or mobile app and click generate
4. **Preview**: View live preview of generated code
5. **Edit**: Use the code editor to make changes
6. **Deploy**: One-click deploy to Vercel or Netlify
7. **Export**: Download project files as ZIP

## Example Prompts

- "Create a modern portfolio website with dark theme, hero section, projects gallery, and contact form"
- "Build an e-commerce website for artisanal tea brand 'NilgiriTea' with product catalog, cart, and checkout"
- "Generate a React Native fitness tracking app with workout logging, progress charts, and user profile"
- "Create a blog website with Next.js, markdown support, and responsive design"

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Generation
- `POST /api/generate` - Generate website/app from prompt
- `POST /api/generate/enhance` - Enhance existing code

### Deployment
- `POST /api/deploy/vercel` - Deploy to Vercel
- `POST /api/deploy/netlify` - Deploy to Netlify
- `POST /api/export/:id` - Export project as ZIP

## Project Structure

```
one-prompt-builder-v2/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   └── hooks/         # Custom hooks
│   └── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
