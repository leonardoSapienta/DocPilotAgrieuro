# Hosting Supastarter on Replit

This guide will help you set up and host your Supastarter Next.js application on Replit.

## Prerequisites

- A GitHub account with your Supastarter codebase
- A Replit account
- Node.js 20+ knowledge

## Setup Steps

### 1. Create a New Replit Project

1. Log in to [Replit](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter your GitHub repository URL
5. Select "Node.js" as the language
6. Click "Import from GitHub"

### 2. Configure Replit Environment

The project includes a `.replit` configuration file with the following settings:

```ini
modules = ["nodejs-20", "web"]
run = "npm run dev"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run dev"]
```

### 3. Environment Setup

1. Create a new file called `.env` in your Replit project
2. Copy all required environment variables from your local `.env.example`
3. Set the `NEXT_PUBLIC_SITE_URL` environment variable to your Replit project's public URL:
   ```env
   # For production
   NEXT_PUBLIC_SITE_URL=https://${REPL_SLUG}.${REPL_OWNER}.repl.co
   # For development
   NEXT_PUBLIC_SITE_URL=https://${REPL_SLUG}.${REPL_OWNER}.repl.dev
   ```
4. Configure the environment variables in Replit's Secrets manager:
   - Click on "Tools" in the left sidebar
   - Select "Secrets"
   - Add each environment variable from your `.env` file

### 4. Install Dependencies

Run the following commands in the Replit shell:

```bash
npm install -g pnpm
pnpm install
```

### 5. Database Setup

1. Set up your database connection string in the environment variables
2. Run database migrations:
```bash
pnpm db:push
```

### 6. Start the Development Server

1. Click the "Run" button in Replit
2. The application will start in development mode
3. Replit will provide you with a URL where your application is hosted

## Important Considerations

### Performance Optimization

1. Enable caching for static assets
2. Use Replit's persistent storage for uploads
3. Configure proper build output caching

### Security

1. Never commit sensitive environment variables
2. Use Replit's Secrets manager for all credentials
3. Configure CORS settings appropriately

### Monitoring

1. Use Replit's built-in logs for monitoring
2. Set up error tracking
3. Monitor application performance

## Troubleshooting

Common issues and solutions:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for environment variable configuration

2. **Runtime Errors**
   - Check Replit console logs
   - Verify database connection
   - Check for memory/CPU usage limits

3. **Performance Issues**
   - Enable proper caching
   - Optimize database queries
   - Use proper build optimization flags

## Additional Resources

- [Replit Documentation](https://docs.replit.com)
- [Supastarter Documentation](https://supastarter.dev/docs/nextjs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

## Support

For additional support:
- Join our [Discord community](https://discord.gg/BZDNtf8hqt)
- Visit [supastarter.dev](https://supastarter.dev) for more documentation
- Check the [GitHub repository](https://github.com/yourusername/your-repo) for issues and updates 