# Project Documentation Guide for Cursor AI Integration

## Overview
This guide explains how to structure your project documentation to maximize the effectiveness of the Cursor AI agent and how to configure Supastarter for internal tool development.

## Project Documentation Structure

### Location and Purpose
The `project_documentation` folder in the root directory serves as the primary source of project context for the Cursor AI agent. This folder should contain comprehensive documentation about your project's:

- Functionality and features
- Technical architecture
- Database schema
- API endpoints
- Business logic
- Integration points
- Configuration details

### Required Documentation Files

1. `project_description.md`
   - Overall project overview
   - Core features and functionality
   - Technical stack details
   - Architecture diagrams
   - Development guidelines
   - Project roadmap

2. `project_database_schema_description.md`
   - Database schema overview
   - Table relationships
   - Field descriptions
   - Indexing strategy
   - Data migration plans
   - Access patterns

3. `project_api_documentation.md`
   - API endpoint documentation
   - Request/response formats
   - Authentication methods
   - Rate limiting details
   - Error handling

4. `project_business_logic.md`
   - Core business rules
   - Workflow descriptions
   - State machines
   - Validation rules
   - Integration logic

### Documentation Format Guidelines

1. Use clear, consistent markdown formatting
2. Include code examples where relevant
3. Keep documentation up-to-date with code changes
4. Use descriptive headers and subheaders
5. Include inline comments for complex explanations
6. Add links to related documentation sections

## Configuring Supastarter for Internal Tools

### Overview
When using Supastarter for internal tools, several SaaS-specific features can be disabled or removed to optimize the application for internal use.

### Configuration Steps

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_TYPE=internal
   DISABLE_SUBSCRIPTION=true
   DISABLE_MARKETING=true
   ```

2. **Feature Flags to Disable**
   - Subscription management
   - Public marketing pages
   - User registration (if using SSO)
   - Usage limits
   - Billing integration

3. **Remove Unnecessary Components**
   - Delete or disable the following directories:
     ```
     packages/app/app/(marketing)
     packages/app/app/(auth)/register
     packages/app/app/(dashboard)/billing
     packages/payments
     ```

4. **Authentication Configuration**
   - Configure `packages/auth` for internal authentication methods
   - Set up SSO if required
   - Remove public registration flows

5. **Database Schema Adjustments**
   - Remove subscription-related tables
   - Simplify user model
   - Add internal-tool specific schemas

### Internal Tool Optimizations

1. **Performance**
   - Enable full SSR for all pages
   - Implement aggressive caching
   - Use React Server Components extensively

2. **Security**
   - Configure internal network access
   - Set up VPN requirements if needed
   - Implement role-based access control

3. **Monitoring**
   - Set up internal logging
   - Configure error tracking
   - Add performance monitoring

4. **Development Workflow**
   - Use local development environment
   - Set up CI/CD for internal deployment
   - Configure staging environments

## Best Practices

1. **Documentation Updates**
   - Keep documentation in sync with code changes
   - Review documentation during code reviews
   - Use automated documentation tools where possible

2. **AI Agent Integration**
   - Update documentation when adding new features
   - Include examples for complex functionality
   - Maintain clear separation of concerns

3. **Internal Tool Development**
   - Focus on user experience for internal users
   - Implement keyboard shortcuts
   - Add bulk operations support
   - Include admin features

## Maintenance

Regular maintenance tasks:
1. Review and update documentation monthly
2. Validate AI agent's understanding of the system
3. Update internal tool configurations
4. Check for security updates
5. Review and optimize performance

Remember to keep this guide updated as your project evolves and new requirements emerge. 