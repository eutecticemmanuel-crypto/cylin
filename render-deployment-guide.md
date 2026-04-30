# Render Environment Setup Guide

## Overview
This guide provides all the environment variables needed to deploy Cylin Painters to Render. Copy these values exactly into your Render service's Environment settings.

## Environment Variables

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3000` | The port number for the application to run on |
| `MONGODB_URI` | `mongodb+srv://2400806211_db_user:a675Ony0EChQDCCF@cluster0.8fml9ow.mongodb.net/cylin-painters?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `SESSION_SECRET` | `cylin-painters-secret-key-change-in-production` | Secret key for session management |
| `ADMIN_USERNAME` | `eutecticemmanuel@gmail.com` | Admin login username |
| `ADMIN_PASSWORD` | `St!lla18` | Admin login password |

### Optional Variables (Email Functionality)

| Variable | Value | Description |
|----------|-------|-------------|
| `EMAIL_USER` | `your-email@gmail.com` | Gmail address for sending emails |
| `EMAIL_PASS` | `your-app-password` | Gmail app password (not regular password) |

## Render Service Configuration

### Service Settings
- **Name**: `cylin-painters` (or your preferred name)
- **Environment**: `Node`
- **Branch**: `master`
- **Root Directory**: `/` (leave empty)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Advanced Settings
- **Health Check Path**: `/` (optional)
- **Auto-Deploy**: `Yes` (recommended for automatic updates on push)

## Step-by-Step Setup

1. **Create Render Account**
   - Go to https://dashboard.render.com/
   - Sign in with GitHub

2. **Connect Repository**
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Search for repository: `eutecticemmanuel-crypto/cylin`

3. **Configure Service**
   - **Name**: Enter your preferred service name
   - **Environment**: Select `Node`
   - **Branch**: Select `master`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - In the service dashboard, go to "Environment"
   - Add each variable from the table above
   - Click "Save" after adding all variables

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Your app will be available at the generated URL

## Email Setup (Optional)

To enable email notifications:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update Environment Variables**:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: The 16-character app password

## Database Setup

The MongoDB Atlas connection is already configured. Make sure:
- Your IP address is whitelisted in MongoDB Atlas
- The database user has read/write permissions
- Network access is configured for `0.0.0.0/0` (all IPs) for Render

## Testing Deployment

After deployment, test these features:
- Homepage loads correctly
- Admin login works (`/admin`)
- Customer registration (`/register`)
- Product browsing (`/products`)
- Contact form sends emails

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database Connection Fails**
   - Verify MongoDB Atlas connection string
   - Check IP whitelisting
   - Ensure database user credentials are correct

3. **Emails Not Sending**
   - Verify Gmail app password is correct
   - Check that 2FA is enabled on Gmail account
   - Ensure environment variables are set correctly

4. **Session Issues**
   - Make sure `SESSION_SECRET` is set
   - Check that cookies are enabled in browser

## Security Notes

- Change the `SESSION_SECRET` to a unique, random string in production
- Use strong passwords for admin accounts
- Regularly update dependencies
- Monitor MongoDB Atlas usage and costs

## Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables are set correctly
3. Test locally with the same environment variables
4. Check MongoDB Atlas connection status