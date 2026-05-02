# Environment Setup Guide

## Environment Variables

The Cylin Painters application requires several environment variables to function properly. Below is a comprehensive guide for setting up your environment.

### Quick Start

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the actual values for your environment (see sections below).

---

## Environment Variables Explained

### Server Configuration

- **PORT** (default: 3000)
  - The port on which the server will run
  - For Render deployment, this is typically auto-managed, but you can set it

- **NODE_ENV** (default: production)
  - Set to `production` for Render/live deployment
  - Set to `development` for local development

---

## MongoDB Configuration

### Important: Setting up MongoDB

1. **Create a MongoDB Cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a Database User** with a strong password
3. **Whitelist IP Addresses** - Allow your application's IP to connect

### Environment Variables

- **MONGODB_URI** (required)
  - Full connection string from MongoDB Atlas
  - Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/cylin-painters?retryWrites=true&w=majority`
  - Example: `mongodb+srv://user123:myPassword@cluster0.8fml9ow.mongodb.net/cylin-painters?retryWrites=true&w=majority`

- **DB_USER**
  - Your MongoDB username (used for reference/documentation)

- **DB_PASSWORD**
  - Your MongoDB password (used for reference/documentation)

- **DB_NAME** (default: cylin-painters)
  - The name of your MongoDB database

---

## Session & Security

- **SESSION_SECRET** (required)
  - A long, random string used to sign session cookies
  - MUST be changed in production
  - Generate a secure value: use a UUID generator or: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - **DO NOT use the default value in production**

---

## Admin Credentials

- **ADMIN_USERNAME** (default: admin)
  - Username for admin login
  - Recommended to change from default

- **ADMIN_PASSWORD** (default: your-secure-admin-password)
  - Password for admin login
  - **MUST be changed in production - use a strong password**

---

## Email Configuration

### Setting up Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Navigate to "App passwords"
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Set Environment Variables**:
   - **EMAIL_USER**: Your Gmail address (e.g., `your-email@gmail.com`)
   - **EMAIL_PASS**: The 16-character App Password from step 2
   - **EMAIL_FROM_NAME**: Display name for emails (e.g., "Cylin Painters")
   - **EMAIL_SERVICE** (default: gmail)

**Note**: Using Gmail app passwords is more secure than using your main password.

### Alternative Email Providers

You can also use other providers by modifying `utils/email.js`:
- Outlook/Office365
- SendGrid
- Mailgun
- Custom SMTP servers

---

## Application Settings

- **APP_URL**
  - Local: `http://localhost:3000`
  - Production (Render): `https://yourdomain.onrender.com`
  - Used for email links and redirects

- **CORS_ORIGIN**
  - Local: `http://localhost:3000`
  - Production: `*` or specific domain

---

## Render Deployment Setup

### Prerequisites
- Render account (free tier available)
- GitHub repository with your code

### Deployment Steps

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select the Cylin Painters repository

2. **Auto-Detect Settings**
   - Render will auto-detect the `render.yaml` configuration
   - Build command: `npm install`
   - Start command: `npm start`

3. **Set Environment Variables**
   - In Render dashboard, go to "Environment"
   - Click "Add from file" and select `render.yaml`
   - Or manually add each variable:
     - PORT (auto-set)
     - MONGODB_URI
     - SESSION_SECRET (generate a new one)
     - ADMIN_USERNAME
     - ADMIN_PASSWORD
     - EMAIL_USER
     - EMAIL_PASS
     - NODE_ENV: `production`
     - APP_URL: `https://your-app-name.onrender.com`

4. **MongoDB Atlas Configuration**
   - In MongoDB Atlas, whitelist the Render IP:
     - Go to "Network Access"
     - Add IP address `0.0.0.0/0` (allows all)
     - Or add specific Render IP if available

5. **Deploy**
   - Render will automatically build and deploy when you push to master branch

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

### 3. Edit `.env` with Local Values
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/cylin-painters?retryWrites=true&w=majority
SESSION_SECRET=your-local-development-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Cylin Painters
EMAIL_SERVICE=gmail
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### 4. Start Development Server
```bash
npm start
# or for auto-reload development:
npm run dev
```

### 5. Access the Application
- **Main Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
  - Default credentials: admin / admin123

---

## New Features - Admin Announcements

### Admin Dashboard Features

#### Members Management
- View all registered customers
- See member details: name, email, phone, address, registration date
- Located in Admin Dashboard → "Members" section

#### Announcements System
- Create announcements (saved as drafts)
- Edit draft announcements
- Send announcements to all registered members via email
- View announcement status and delivery count
- Delete announcements

### How to Use Announcements

1. **Login to Admin Dashboard**
   - Go to http://localhost:3000/admin (or your production URL)
   - Enter admin credentials

2. **Navigate to Announcements**
   - Click "Announcements" in the sidebar

3. **Create New Announcement**
   - Click "New Announcement" button
   - Enter title and message
   - Click submit to save as draft

4. **Send Announcement**
   - Click "Send" button on the draft announcement
   - Confirm action
   - All registered members will receive the announcement via email

5. **View Members**
   - Click "Members" in the sidebar
   - View all registered customer details

---

## Troubleshooting

### MongoDB Connection Issues
- Error: `Failed to connect to MongoDB`
  - Check MONGODB_URI is correct
  - Verify IP whitelist in MongoDB Atlas
  - Ensure network connection is stable

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASS are correct
- Verify Gmail app password (16 characters)
- Check that 2FA is enabled on Gmail account
- Verify email account is in "Send & Receive" mode

### Render Deployment Fails
- Check build logs in Render dashboard
- Verify all required environment variables are set
- Ensure `render.yaml` is in the root directory
- Check GitHub branch is set to "master"

### Admin Login Issues
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set correctly
- Clear browser cookies and try again
- Check SESSION_SECRET is set

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong passwords** for admin and database users
3. **Rotate secrets regularly** in production
4. **Enable HTTPS** in production (Render does this automatically)
5. **Whitelist specific IPs** in MongoDB Atlas if possible
6. **Use environment-specific passwords** (different for dev/prod)
7. **Regenerate SESSION_SECRET** for each deployment

---

## Support & Additional Resources

- [MongoDB Atlas Documentation](https://docs.mongodb.com/manual/)
- [Render Deployment Guide](https://render.com/docs)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

