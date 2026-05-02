# Cylin Painters

A comprehensive website for Cylin Painters, featuring admin management, customer registration, product catalog, and review system.

## Features

### Admin Features
- **Dashboard** for managing website content
- **Contact Form Submissions** management
- **Members Management** - View all registered customers with details
- **Announcements System** - Create, manage, and send announcements to members via email
- **Product and Review Management**
- **Social Media Links Management**
- **Content Editing** (hero, services, gallery, about, etc.)

### Customer Features
- **User Registration** with address field
- **Authentication** (session-based)
- **Product Browsing** and discovery
- **Review and Rating System**
- **Pro Features Access**
- **Email Notifications** for announcements and updates

### General Features
- **Responsive Design** for all devices
- **Contact Form** with email notifications
- **Dynamic Content Management**
- **Quote Request System** with emails
- **Announcement Broadcasting** to all registered members

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Session-based
- **Email**: Nodemailer

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your MongoDB URI
   - Set up email credentials (Gmail recommended)
   - Change session secret

4. Start MongoDB service

5. Seed the database (optional):
   ```bash
   node config/seed.js
   ```

6. Start the server:
   ```bash
   npm start
   ```

## Usage

- Access the website at `http://localhost:3000`
- Admin login at `http://localhost:3000/admin`
- Customer registration at `http://localhost:3000/register`

## Email Configuration

To enable email notifications:
1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an app password
4. Set EMAIL_USER and EMAIL_PASS in .env

## Render Deployment

For Render deployment, create environment variables in the Render service dashboard using the names below. You can use `.env.render` as a local reference template:
- `PORT`
- `MONGODB_URI`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `EMAIL_USER`
- `EMAIL_PASS`

Use the provided MongoDB Atlas connection string in `MONGODB_URI` and update the credentials to your own values.

## New Features: Admin Announcements & Members Management

### Announcements System
Admins can now create and send announcements to all registered members:

1. **Create Announcements** - Draft announcements before sending
2. **Send to Members** - Automatically send via email to all registered customers
3. **Track Delivery** - See how many members received the announcement
4. **Edit/Delete** - Modify drafts or remove announcements

### Members Management
View all registered customers in one dashboard:
- Customer name, email, phone
- Address and registration date
- Quick export capability

### Using These Features

1. Login to Admin Dashboard: `http://localhost:3000/admin`
2. Click **Members** to view all registered customers
3. Click **Announcements** to manage and send announcements
4. Create new announcement → Send to all members

**For detailed setup and configuration instructions, see [SETUP.md](./SETUP.md)**

## API Endpoints

### Admin Announcements & Members
- `GET /api/admin/members` - Get all registered members
- `GET /api/admin/announcements` - Get all announcements
- `POST /api/admin/announcements` - Create new announcement
- `PUT /api/admin/announcements/:id` - Update draft announcement
- `POST /api/admin/announcements/:id/send` - Send announcement to all members
- `DELETE /api/admin/announcements/:id` - Delete announcement

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/customers/register` - Customer registration
- `POST /api/customers/login` - Customer login

### Content Management
- `GET /api/content` - Get all content
- `PUT /api/content/:section` - Update content section

### Contacts & Quotes
- `POST /api/contact` - Submit contact/quote form
- `GET /api/contacts` - Get all contacts (admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Reviews
- `GET /api/reviews` - Get approved reviews
- `POST /api/reviews` - Submit review (customer)
- `GET /api/reviews/admin/all` - Get all reviews (admin)
- `PUT /api/reviews/:id/approve` - Approve review (admin)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License