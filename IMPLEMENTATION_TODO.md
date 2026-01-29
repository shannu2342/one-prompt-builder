# Full Redesign Implementation TODO

## Configuration
- [x] GrapesJS for visual editor
- [x] Separate admin login
- [x] Build both in parallel

## Phase 1: Backend - Admin Infrastructure

### Admin Authentication
- [ ] Create Admin model with separate credentials
- [ ] Add admin authentication routes (`/api/admin/login`)
- [ ] Create admin auth middleware
- [ ] Add admin session management

### Admin API Endpoints
- [ ] GET `/api/admin/users` - List all users
- [ ] GET `/api/admin/users/:id` - User details with activity
- [ ] GET `/api/admin/prompts` - All prompts across platform
- [ ] GET `/api/admin/prompts/:userId` - User's prompts
- [ ] GET `/api/admin/code/:projectId` - View generated code
- [ ] GET `/api/admin/analytics` - Platform analytics

### Data Tracking
- [ ] Update Project model to track prompts
- [ ] Add activity logging
- [ ] Track visual edits separately from code
- [ ] Store edit history

## Phase 2: Frontend - Admin Panel

### Admin Pages
- [ ] `/admin/login` - Admin login page
- [ ] `/admin` - Admin dashboard with stats
- [ ] `/admin/users` - User list table
- [ ] `/admin/users/[id]` - User detail page
- [ ] `/admin/prompts` - All prompts list
- [ ] `/admin/code/[projectId]` - Code viewer

### Admin Components
- [ ] AdminLayout component
- [ ] UserTable component
- [ ] PromptList component
- [ ] CodeViewer component (Monaco for admin)
- [ ] Analytics charts
- [ ] Activity timeline

## Phase 3: Frontend - Visual Editor

### Dependencies
- [ ] Install grapesjs
- [ ] Install grapesjs-react
- [ ] Install react-color
- [ ] Install additional GrapesJS plugins

### Visual Editor Components
- [ ] VisualEditor main component
- [ ] EditorToolbar component
- [ ] ColorPicker panel
- [ ] IconPicker panel
- [ ] ImageUploader component
- [ ] StylePanel component
- [ ] LayersPanel component

### Project Detail Page Redesign
- [ ] Remove CodeEditor component
- [ ] Remove file sidebar
- [ ] Add GrapesJS editor
- [ ] Add visual editing toolbar
- [ ] Keep preview panel
- [ ] Add save visual changes endpoint

### Visual Editing Features
- [ ] Drag and drop elements
- [ ] Inline text editing
- [ ] Color theme picker
- [ ] Icon replacement
- [ ] Image upload/replace
- [ ] Layout adjustments
- [ ] Responsive breakpoints
- [ ] Undo/Redo

## Phase 4: Integration

### Code Synchronization
- [ ] Convert visual changes to code updates
- [ ] Update backend with visual edits
- [ ] Sync GrapesJS state with project
- [ ] Auto-save visual changes

### API Updates
- [ ] POST `/api/projects/:id/visual-edit` - Save visual changes
- [ ] GET `/api/projects/:id/visual-state` - Load visual state
- [ ] PUT `/api/projects/:id/apply-visual-changes` - Apply to code

## Phase 5: Testing & Polish

### Testing
- [ ] Test admin login flow
- [ ] Test user tracking
- [ ] Test prompt viewing
- [ ] Test code viewer
- [ ] Test visual editor
- [ ] Test visual changes sync
- [ ] Test mobile responsiveness

### Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Improve UI/UX
- [ ] Add help tooltips
- [ ] Add keyboard shortcuts

## Estimated Implementation Order

### Step 1: Admin Backend (30 min)
1. Admin model and authentication
2. Admin API endpoints
3. Activity tracking

### Step 2: Admin Frontend (45 min)
1. Admin login page
2. Admin dashboard
3. User management pages
4. Code viewer

### Step 3: Visual Editor Setup (30 min)
1. Install GrapesJS
2. Create VisualEditor component
3. Basic integration

### Step 4: Visual Editor Features (60 min)
1. Toolbar and panels
2. Color picker
3. Icon/image tools
4. Style customization

### Step 5: Integration & Testing (30 min)
1. Sync visual changes to code
2. Test all features
3. Bug fixes and polish

**Total Estimated Time: ~3 hours**

## Current Status
- [x] Dual generation feature implemented
- [x] Redesign plan created
- [ ] Starting implementation...
