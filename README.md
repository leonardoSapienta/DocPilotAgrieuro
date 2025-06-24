# Supastarter Next.js Application

A modern, full-stack Next.js application built with TypeScript, Shadcn UI, and more.

## Project Structure

The project follows a monorepo structure with the following packages:

- `packages/app`: Main Next.js App Router application (frontend)
- `packages/ai`: AI-related functionality
- `packages/api`: API routes and backend logic
- `packages/auth`: Authentication configuration and helpers
- `packages/database`: Database schema and types
- `packages/i18n`: Internationalization
- `packages/logs`: Logging configuration
- `packages/mail`: Email functionality
- `packages/payments`: Payment processing
- `packages/storage`: File and image storage
- `packages/utils`: Utility functions

## Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Cursor IDE
- Replit account (for deployment)

## Development Setup

### 1. IDE Setup

1. Install [Cursor IDE](https://cursor.sh)
2. Connect Cursor to your Replit workspace:
   - Open your Replit workspace
   - Go to Tools > SSH
   - Click "Connect to Cursor"
   - Copy the SSH connection URL
   - In Cursor: Cmd/Ctrl + Shift + P > "Connect to Remote Host"
   - Paste the SSH URL

### 2. Environment Setup

1. Install pnpm globally:
```bash
npm install -g pnpm
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in the `.env` file
   - For Replit development, set the site URL to your Replit project's public URL:
   ```env
   # For production
   NEXT_PUBLIC_SITE_URL=https://${REPL_SLUG}.${REPL_OWNER}.repl.co
   # For development
   NEXT_PUBLIC_SITE_URL=https://${REPL_SLUG}.${REPL_OWNER}.repl.dev
   ```
   Where:
   - `REPL_SLUG` is your project name
   - `REPL_OWNER` is your Replit username

### 3. Database Setup

1. Create a Neon Database:
   - Go to [neon.tech](https://neon.tech) and sign up/login
   - Click "Create New Project"
   - Choose a name for your project
   - Select your region
   - Click "Create Project"

2. Get your database connection string:
   - In your Neon project dashboard, go to "Connection Details"
   - Select "Prisma" from the "Connection String" dropdown
   - Copy the connection string

3. Configure your database:
   - Open your `.env.local` file
   - Replace the `DATABASE_URL` value with your Neon connection string
   - The connection string should look like:
     ```
     postgresql://[user]:[password]@[host]/[database]?sslmode=require
     ```

4. Push the database schema:
```bash
pnpm --filter database push
```

5. Generate the Prisma client:
```bash
pnpm --filter database generate
```

Note: Neon provides a serverless Postgres database that automatically scales with your needs and includes features like branching, autoscaling, and automated backups.

### 4. Start Development Server

```bash
pnpm dev
```

### 5. Create admin user

```bash
pnpm --filter scripts create:user
```

The application will be available at `http://localhost:3000`

## Key Technologies

- **Frontend**: Next.js 14+, React, TypeScript
- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Server Components, nuqs for URL state
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js

## Development Guidelines

### TypeScript Usage
- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums, use const maps instead

### Component Structure
- Use functional components with TypeScript interfaces
- Follow the file structure:
  1. Exported component
  2. Subcomponents
  3. Helper functions
  4. Static content
  5. Types

### Performance Best Practices
- Minimize 'use client' directives
- Use React Server Components where possible
- Implement proper code splitting
- Optimize images with WebP format
- Follow mobile-first responsive design

### Styling Conventions
- Use Tailwind CSS for styling
- Implement responsive design
- Use the `cn` utility for class names

## Documentation

- [Supastarter Documentation](https://supastarter.dev/docs/nextjs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

## Deployment

The application is configured for deployment on Replit. See `dev_doc/replit_hosting.md` for detailed deployment instructions.

## Support

For additional support:
- Visit [supastarter.dev](https://supastarter.dev)
- Join our Discord community
- Check the GitHub repository for issues and updates
# DocPilot
