# Connecting Cursor IDE with Replit and Adding Documentation Sources

## Setting up Cursor IDE with Replit

1. **Install Cursor IDE**
   - Download and install Cursor IDE from [cursor.sh](https://cursor.sh)
   - Make sure you have the latest version installed

2. **Connect to Replit**
   - Open your Replit workspace
   - Click on the "Tools" menu in Replit
   - Select "SSH" from the tools menu
   - Click the "Connect to Cursor" button
   - Replit will generate the necessary SSH configuration
   - Copy the SSH connection URL provided by Replit
   - Open Cursor IDE
   - Use the command palette (Cmd/Ctrl + Shift + P)
   - Select "Connect to Remote Host"
   - Paste the SSH connection URL from Replit
   - The connection URL will be in the format:
     ```
     ssh-remote+[workspace-id]@[workspace-id]-[port].kirk.replit.dev
     ```

3. **Authentication**
   - Cursor will prompt you to authenticate with Replit
   - Use your Replit credentials when prompted
   - You may need to generate and add an SSH key to your Replit account

4. **Workspace Synchronization**
   - Once connected, Cursor will sync your Replit workspace
   - All files and directories will be available in your Cursor IDE
   - Changes made in Cursor will automatically sync with Replit

## Adding Documentation Sources to Cursor

1. **Open Cursor Settings**
   - Use the command palette (Cmd/Ctrl + Shift + P)
   - Search for "Open Settings (JSON)"
   - Or navigate to Settings > User Settings

2. **Add Documentation Sources**
   - Add the following configuration to your settings.json:
     ```json
     {
       "docs.sources": [
         {
           "name": "Replit Workspace",
           "url": "https://docs.replit.com/category/replit-workspace",
           "priority": 0.8
         },
         {
           "name": "Supastarter Next.js",
           "url": "https://supastarter.dev/docs/nextjs",
           "priority": 0.9
         }
       ]
     }
     ```

3. **Using the Documentation**
   - Access documentation directly in Cursor using:
     - Command palette: "Search Documentation"
     - Keyboard shortcut: Cmd/Ctrl + K
   - Documentation will be available in autocomplete suggestions
   - Hover over code to see relevant documentation

## Best Practices

1. **Workspace Management**
   - Keep your Replit workspace organized
   - Use .gitignore to exclude unnecessary files
   - Regularly commit changes to version control

2. **Performance Optimization**
   - Close unused files in Cursor to improve performance
   - Use workspace-specific settings when needed
   - Configure file watching and search settings appropriately

3. **Troubleshooting**
   - If connection issues occur:
     - Check your internet connection
     - Verify Replit workspace is running
     - Ensure SSH credentials are correct
     - Try reconnecting to the workspace

## Additional Resources

- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Replit Documentation](https://docs.replit.com)
- [Supastarter Documentation](https://supastarter.dev/docs) 