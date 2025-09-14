# Multi-Tenant Notes API

A secure, scalable multi-tenant notes application built with Next.js, Supabase, and TypeScript.

## Features

- **Multi-tenancy**: Complete data isolation between organizations
- **Authentication**: JWT-based auth with email/password
- **Role-based Access**: Owner, Admin, and Member roles
- **Subscription Tiers**: Free, Pro, and Enterprise plans with feature gating
- **Notes Management**: CRUD operations with search, tags, and privacy controls
- **Export**: JSON and CSV export capabilities
- **API**: RESTful API with CORS support

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run database migrations: Execute SQL scripts in `/scripts` folder
5. Start development server: `npm run dev`

### Environment Variables

Required environment variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Production (optional)
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Notes
- `GET /api/notes` - List notes (with pagination, search, filters)
- `POST /api/notes` - Create note
- `GET /api/notes/[id]` - Get note by ID
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note
- `GET /api/notes/export` - Export notes (JSON/CSV)
- `GET /api/notes/tags` - Get all tags

### Users
- `GET /api/users` - List organization users
- `POST /api/users` - Invite user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Subscription
- `GET /api/subscription/limits` - Get usage limits
- `POST /api/subscription/upgrade` - Upgrade plan

### Utility
- `GET /api/health` - Health check
- `OPTIONS /api/cors` - CORS preflight

## Database Schema

### Tables
- `tenants` - Organization data
- `profiles` - User profiles with tenant association
- `notes` - Notes with tenant isolation

### Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure complete tenant data isolation
- JWT-based authentication with role checks

## Subscription Plans

### Free
- 5 notes maximum
- 1 user
- Basic features only

### Pro ($9/month)
- 100 notes maximum
- 5 users
- Private notes, tags, export

### Enterprise ($29/month)
- Unlimited notes and users
- All features including API access

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### CORS Configuration

The application includes comprehensive CORS support:
- Configurable allowed origins
- Preflight request handling
- Credential support for authenticated requests

### Security Features

- Row Level Security (RLS) for data isolation
- JWT token validation
- CORS protection
- Security headers (X-Frame-Options, CSP, etc.)
- Input validation and sanitization

## Development

### Project Structure

\`\`\`
app/
├── api/           # API routes
├── auth/          # Authentication pages
├── dashboard/     # Protected dashboard pages
└── page.tsx       # Landing page

components/        # Reusable UI components
lib/              # Utility functions and configurations
scripts/          # Database migration scripts
\`\`\`

### Key Features

1. **Multi-tenancy**: Each organization has isolated data
2. **Feature Gating**: Subscription-based feature access
3. **Role-based Access**: Different permissions for owners/admins/members
4. **Search & Filtering**: Full-text search with tag filtering
5. **Export**: JSON and CSV export with subscription gating

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
