# TODO: MongoDB Integration & Admin CMS - COMPLETED

## Phase 1: Setup & Dependencies
- [x] Update package.json with new dependencies (mongoose, express-session, bcryptjs, dotenv)
- [x] Install dependencies via npm install
- [x] Create .env and .env.example files

## Phase 2: Database Layer
- [x] Create config/db.js - MongoDB connection
- [x] Create models/Contact.js - Contact submissions model
- [x] Create models/SiteContent.js - Editable content model
- [x] Create models/User.js - Admin user model
- [x] Create config/seed.js - Seed default content and admin user

## Phase 3: Authentication & Middleware
- [x] Create middleware/auth.js - Session-based auth middleware
- [x] Create routes/auth.js - Login/logout/me routes

## Phase 4: API Routes
- [x] Create routes/content.js - CRUD for site content
- [x] Update routes/contact.js - Replace JSON with MongoDB

## Phase 5: Server Updates
- [x] Update server.js - Add DB connection, sessions, new routes

## Phase 6: Dynamic Content Loading (Main Site)
- [x] Create public/js/content-loader.js - Fetch and inject content
- [x] Update public/index.html - Add data-content attributes

## Phase 7: Admin Dashboard
- [x] Create public/admin/index.html - Login page
- [x] Create public/admin/dashboard.html - Admin dashboard
- [x] Create public/admin/css/admin.css - Admin styles
- [x] Create public/admin/js/login.js - Login logic
- [x] Create public/admin/js/dashboard.js - Dashboard logic

## Phase 8: Testing & Finalization
- [x] Seed the database
- [x] Server starts successfully

# TODO: Pro Aesthetic Upgrades (new)

## 1) Color Moodboard designer preview
- [ ] Add moodboard widget markup to public/index.html
- [ ] Add public/js/moodboard.js (palette + apply CSS variables)
- [ ] Add CSS for moodboard + palette swatches to public/css/styles.css
- [ ] Wire initialization in public/index.html / public/js/main.js

## 2) Signature Style scroll reveal
- [ ] Enhance scroll reveal behavior in public/js/main.js
- [ ] Extend CSS reveal transitions in public/css/styles.css
- [ ] Add data-reveal attributes or activate reveal on existing sections

## 3) Accessibility/Contrast mode toggle
- [ ] Add toggle markup to public/index.html (and optional store page)
- [ ] Add theme CSS classes to public/css/styles.css
- [ ] Persist toggle in public/js/main.js (localStorage)

