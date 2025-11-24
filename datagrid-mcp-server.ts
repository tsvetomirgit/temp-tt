#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Tool,
  Resource,
  Prompt,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get project root (mcp folder is at ts-mcp/mcp)
const PROJECT_ROOT = join(__dirname, '..');
const COMPONENT_PATH = join(PROJECT_ROOT, 'angular', 'src', 'app', 'datagrid.ts');
const TEMPLATE_PATH = join(PROJECT_ROOT, 'angular', 'src', 'app', 'datagrid.html');
const APP_COMPONENT_PATH = join(PROJECT_ROOT, 'angular', 'src', 'app', 'app.ts');
const APP_TEMPLATE_PATH = join(PROJECT_ROOT, 'angular', 'src', 'app', 'app.html');

interface User {
  id: number;
  name: string;
  creation: Date | string;
  color: string;
}

class DatagridMCPServer {
  private server: Server;
  private users: User[] = [];
  private dataFilePath: string;

  constructor() {
    this.server = new Server(
      {
        name: 'datagrid-mcp-server',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // Store data in a JSON file for persistence
    this.dataFilePath = join(__dirname, 'datagrid-data.json');
    this.loadData();
    this.setupHandlers();
  }

  private loadData() {
    try {
      const data = readFileSync(this.dataFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.users = parsed.users || [];
      // Convert date strings back to Date objects
      this.users = this.users.map((user: any) => ({
        ...user,
        creation: typeof user.creation === 'string' ? new Date(user.creation) : user.creation,
      }));
    } catch (error) {
      // File doesn't exist yet, start with empty array
      this.users = [];
    }
  }

  private saveData() {
    try {
      writeFileSync(
        this.dataFilePath,
        JSON.stringify({ users: this.users }, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  private readComponentFile(path: string): string {
    try {
      return readFileSync(path, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private generateAppComponentCode(currentCode: string, users: User[]): string {
    // Check if DatagridComponent is already imported
    const hasDatagridComponentImport = currentCode.includes('DatagridComponent') || currentCode.includes('from \'./datagrid\'');
    
    // Check if users property exists
    const hasUsersProperty = currentCode.includes('users') && currentCode.includes(':');

    let updatedCode = currentCode;

    // Add import if not present
    if (!hasDatagridComponentImport) {
      // Find the last import statement
      const importRegex = /(import\s+.*?from\s+['"].*?['"];?\s*\n)/g;
      const imports = currentCode.match(importRegex) || [];
      const lastImportIndex = currentCode.lastIndexOf(imports[imports.length - 1] || '');
      
      if (lastImportIndex !== -1) {
        const insertIndex = lastImportIndex + (imports[imports.length - 1]?.length || 0);
        const newImport = "import { DatagridComponent } from './datagrid';\n";
        updatedCode = updatedCode.slice(0, insertIndex) + newImport + updatedCode.slice(insertIndex);
      } else {
        // Add at the beginning if no imports found
        updatedCode = "import { DatagridComponent } from './datagrid';\n" + updatedCode;
      }
    }

    // Add DatagridComponent to imports array in @Component decorator
    if (!currentCode.includes('DatagridComponent') || !currentCode.match(/imports:\s*\[[^\]]*DatagridComponent/)) {
      updatedCode = updatedCode.replace(
        /imports:\s*\[([^\]]*)\]/,
        (match, imports) => {
          const importsList = imports.trim();
          return `imports: [${importsList ? importsList + ', ' : ''}DatagridComponent]`;
        }
      );
    }

    // Add users property if not present
    if (!hasUsersProperty) {
      // Find the class and add users property
      const classMatch = updatedCode.match(/(export\s+class\s+App\s*\{[^}]*)/);
      if (classMatch) {
        const usersProperty = `  users = ${JSON.stringify(users, null, 2).replace(/\n/g, '\n  ')};\n`;
        updatedCode = updatedCode.replace(
          /(export\s+class\s+App\s*\{)/,
          `$1\n${usersProperty}`
        );
      }
    } else {
      // Update existing users property
      updatedCode = updatedCode.replace(
        /(users\s*[:=]\s*)(\[[^\]]*\]|any\[\]|.*?);/s,
        `$1${JSON.stringify(users, null, 2)};`
      );
    }

    return updatedCode;
  }

  private generateAppTemplateCode(currentTemplate: string): string {
    // Check if datagrid tag already exists
    if (currentTemplate.includes('<datagrid')) {
      return currentTemplate; // Already has datagrid
    }

    // Find a good place to insert the datagrid (e.g., in content-area)
    if (currentTemplate.includes('content-area')) {
      // Insert before closing content-area div
      return currentTemplate.replace(
        /(\s*<\/div>\s*<\/div>\s*<\/div>\s*<router-outlet)/,
        `\n      <datagrid [users]="users"></datagrid>\n$1`
      );
    } else {
      // Add before router-outlet
      return currentTemplate.replace(
        /(<router-outlet)/,
        `<datagrid [users]="users"></datagrid>\n$1`
      );
    }
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_datagrid_users',
          description: 'Get all users from the datagrid',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'set_datagrid_users',
          description: 'Set or replace all users in the datagrid. Accepts an array of user objects.',
          inputSchema: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                description: 'Array of user objects with id, name, creation (ISO date string), and color',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    creation: { type: 'string', description: 'ISO date string' },
                    color: { type: 'string' },
                  },
                  required: ['id', 'name', 'creation', 'color'],
                },
              },
            },
            required: ['users'],
          },
        },
        {
          name: 'add_datagrid_user',
          description: 'Add a new user to the datagrid',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'User name',
              },
              color: {
                type: 'string',
                description: 'Favorite color',
              },
            },
            required: ['name', 'color'],
          },
        },
        {
          name: 'update_datagrid_user',
          description: 'Update an existing user in the datagrid',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'User ID to update',
              },
              name: {
                type: 'string',
                description: 'Updated user name',
              },
              color: {
                type: 'string',
                description: 'Updated favorite color',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_datagrid_user',
          description: 'Delete a user from the datagrid',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'User ID to delete',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'get_datagrid_schema',
          description: 'Get the schema/structure of the datagrid component',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'search_datagrid_users',
          description: 'Search users by name or color',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'clear_datagrid_users',
          description: 'Clear all users from the datagrid',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ] as Tool[],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_datagrid_users':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(this.users, null, 2),
                },
              ],
            };

          case 'set_datagrid_users':
            if (!args) {
              throw new Error('Arguments are required');
            }
            const usersArray = args.users as User[];
            this.users = usersArray.map((user) => ({
              ...user,
              creation: typeof user.creation === 'string' ? new Date(user.creation) : user.creation,
            }));
            this.saveData();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      success: true,
                      count: this.users.length,
                      message: `Successfully set ${this.users.length} users`,
                    },
                    null,
                    2
                  ),
                },
              ],
            };

          case 'add_datagrid_user':
            if (!args) {
              throw new Error('Arguments are required');
            }
            const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id), 0) + 1 : 1;
            const newUser: User = {
              id: newId,
              name: args.name as string,
              creation: new Date(),
              color: args.color as string,
            };
            this.users.push(newUser);
            this.saveData();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    { success: true, user: newUser, message: 'User added successfully' },
                    null,
                    2
                  ),
                },
              ],
            };

          case 'update_datagrid_user':
            if (!args) {
              throw new Error('Arguments are required');
            }
            const userId = args.id as number;
            const userIndex = this.users.findIndex((u) => u.id === userId);
            if (userIndex === -1) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({ success: false, message: 'User not found' }, null, 2),
                  },
                ],
                isError: true,
              };
            }
            if (args.name) this.users[userIndex].name = args.name as string;
            if (args.color) this.users[userIndex].color = args.color as string;
            this.saveData();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    { success: true, user: this.users[userIndex], message: 'User updated successfully' },
                    null,
                    2
                  ),
                },
              ],
            };

          case 'delete_datagrid_user':
            if (!args) {
              throw new Error('Arguments are required');
            }
            const deleteId = args.id as number;
            const deleteIndex = this.users.findIndex((u) => u.id === deleteId);
            if (deleteIndex === -1) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({ success: false, message: 'User not found' }, null, 2),
                  },
                ],
                isError: true,
              };
            }
            const deletedUser = this.users.splice(deleteIndex, 1)[0];
            this.saveData();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    { success: true, user: deletedUser, message: 'User deleted successfully' },
                    null,
                    2
                  ),
                },
              ],
            };

          case 'get_datagrid_schema':
            try {
              const componentCode = this.readComponentFile(COMPONENT_PATH);
              const templateCode = this.readComponentFile(TEMPLATE_PATH);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        component: 'datagrid',
                        columns: ['User ID', 'Name', 'Creation date', 'Favorite color'],
                        dataStructure: {
                          id: 'number',
                          name: 'string',
                          creation: 'Date',
                          color: 'string',
                        },
                        componentCode,
                        templateCode,
                        componentPath: COMPONENT_PATH,
                        templatePath: TEMPLATE_PATH,
                      },
                      null,
                      2
                    ),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `Error reading component files: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
                isError: true,
              };
            }

          case 'search_datagrid_users':
            if (!args) {
              throw new Error('Arguments are required');
            }
            const query = (args.query as string).toLowerCase();
            const results = this.users.filter(
              (u) => u.name.toLowerCase().includes(query) || u.color.toLowerCase().includes(query)
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };

          case 'clear_datagrid_users':
            this.users = [];
            this.saveData();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ success: true, message: 'All users cleared' }, null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'datagrid://component',
          name: 'Datagrid Component',
          description: 'The datagrid component TypeScript file',
          mimeType: 'text/typescript',
        },
        {
          uri: 'datagrid://template',
          name: 'Datagrid Template',
          description: 'The datagrid component HTML template',
          mimeType: 'text/html',
        },
        {
          uri: 'datagrid://data',
          name: 'Datagrid Data',
          description: 'Current datagrid user data',
          mimeType: 'application/json',
        },
        {
          uri: 'datagrid://app-component',
          name: 'App Component',
          description: 'The main app component TypeScript file',
          mimeType: 'text/typescript',
        },
        {
          uri: 'datagrid://app-template',
          name: 'App Template',
          description: 'The main app component HTML template',
          mimeType: 'text/html',
        },
      ] as Resource[],
    }));

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'datagrid://component':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'text/typescript',
                  text: this.readComponentFile(COMPONENT_PATH),
                },
              ],
            };

          case 'datagrid://template':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'text/html',
                  text: this.readComponentFile(TEMPLATE_PATH),
                },
              ],
            };

          case 'datagrid://data':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(this.users, null, 2),
                },
              ],
            };

          case 'datagrid://app-component':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'text/typescript',
                  text: this.readComponentFile(APP_COMPONENT_PATH),
                },
              ],
            };

          case 'datagrid://app-template':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'text/html',
                  text: this.readComponentFile(APP_TEMPLATE_PATH),
                },
              ],
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        throw new Error(`Error reading resource: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'use_datagrid_component',
          description: 'Generate code to use <datagrid> component in a specified component with user data. You must specify the componentPath (e.g., "angular/src/app/app.ts" or relative path from project root).',
        },
        {
          name: 'populate_datagrid',
          description: 'Populate the datagrid with user data. You can specify the users array in the arguments.',
        },
        {
          name: 'create_datagrid_with_data',
          description: 'Create a datagrid component prompt with specified user data',
        },
      ] as Prompt[],
    }));

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'use_datagrid_component':
          const promptUsers = args?.users as User[] | undefined;
          if (!promptUsers || !Array.isArray(promptUsers)) {
            throw new Error('Users array is required in arguments');
          }

          const componentPath = args?.componentPath as string | undefined;
          if (!componentPath) {
            throw new Error('componentPath is required. Specify the path to the component TypeScript file (e.g., "angular/src/app/app.ts" or "app.ts" if in the same directory).');
          }

          // Set the users data
          this.users = promptUsers.map((user) => ({
            ...user,
            creation: typeof user.creation === 'string' ? new Date(user.creation) : user.creation,
          }));
          this.saveData();

          // Resolve component paths
          let targetComponentPath: string;
          let targetTemplatePath: string;

          // Handle different path formats
          if (componentPath.startsWith('angular/') || componentPath.startsWith('./angular/')) {
            // Path from project root
            targetComponentPath = join(PROJECT_ROOT, componentPath.replace(/^\.\//, ''));
          } else if (componentPath.startsWith('/')) {
            // Absolute path
            targetComponentPath = componentPath;
          } else {
            // Relative path - assume from angular/src/app
            targetComponentPath = join(PROJECT_ROOT, 'angular', 'src', 'app', componentPath);
          }

          // Determine template path (same name, .html extension, same directory)
          const componentDir = dirname(targetComponentPath);
          const componentBaseName = targetComponentPath.replace(/\.ts$/, '');
          targetTemplatePath = join(componentDir, componentBaseName.split(/[/\\]/).pop() + '.html');

          // Calculate relative import path from target component to datagrid component
          const targetComponentDir = dirname(targetComponentPath);
          const datagridComponentDir = dirname(COMPONENT_PATH);
          
          // Calculate relative import path
          let relativeImportPath: string;
          try {
            if (targetComponentDir === datagridComponentDir) {
              // Same directory
              relativeImportPath = './datagrid';
            } else {
              // Use path.relative to get proper relative path
              const relPath = relative(targetComponentDir, datagridComponentDir);
              relativeImportPath = join(relPath, 'datagrid').replace(/\\/g, '/');
              // Normalize the path - ensure it starts with ./
              if (!relativeImportPath.startsWith('.')) {
                relativeImportPath = './' + relativeImportPath;
              }
            }
          } catch (error) {
            // Fallback to simple relative path
            relativeImportPath = './datagrid';
          }

          // Read target component files
          let targetComponentCode: string;
          let targetTemplateCode: string;
          try {
            targetComponentCode = this.readComponentFile(targetComponentPath);
          } catch (error) {
            throw new Error(`Failed to read component file at ${targetComponentPath}: ${error instanceof Error ? error.message : String(error)}`);
          }

          try {
            targetTemplateCode = this.readComponentFile(targetTemplatePath);
          } catch (error) {
            // Template might not exist, that's okay - we'll mention it in the prompt
            targetTemplateCode = '';
          }

          const promptUsersJson = JSON.stringify(promptUsers, null, 2);
          const datagridComponentCode = this.readComponentFile(COMPONENT_PATH);

          // Extract component name from path for display
          const componentFileName = targetComponentPath.split(/[/\\]/).pop() || componentPath;
          const componentName = componentFileName.replace(/\.ts$/, '');

          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Use the EXISTING DatagridComponent in the ${componentName} component. The DatagridComponent already exists in this project. DO NOT create a new component - only import and use the existing one.

CRITICAL INSTRUCTIONS:
1. The DatagridComponent ALREADY EXISTS in this project - DO NOT create, duplicate, or modify it
2. Import the existing component using the relative path: import { DatagridComponent } from '${relativeImportPath}';
3. Component selector is 'datagrid' - use <datagrid [users]="users"></datagrid> in parent templates
4. Do NOT use <clr-datagrid> in parent templates - that's only inside DatagridComponent's template

User data to use:
${promptUsersJson}

Current ${componentFileName}:
\`\`\`typescript
${targetComponentCode}
\`\`\`

${targetTemplateCode ? `Current ${componentName}.html:
\`\`\`html
${targetTemplateCode}
\`\`\`` : `Note: Template file ${targetTemplatePath} not found. You may need to create it.`}

EXISTING DatagridComponent:
- Location: ${COMPONENT_PATH}
- Relative import path from ${componentFileName}: ${relativeImportPath}
- This component already exists and is fully implemented. Only import it - do not create, modify, or duplicate it.

Required changes (only update ${componentFileName} and ${componentName}.html):
1. ${componentFileName}: 
   - Add: import { DatagridComponent } from '${relativeImportPath}';
   - Add: users = ${promptUsersJson};
   - Add DatagridComponent to the @Component imports array
   - DO NOT create or modify any datagrid component files

2. ${componentName}.html:
   - Add: <datagrid [users]="users"></datagrid>
   - Use 'datagrid' selector, NOT 'clr-datagrid'

Correct template usage:
\`\`\`html
<datagrid [users]="users"></datagrid>
\`\`\`

IMPORTANT: 
- Only modify ${componentFileName} and ${componentName}.html
- The DatagridComponent already exists at ${COMPONENT_PATH}
- Use the relative import path '${relativeImportPath}' based on the file structure
- Do not create new component files`,
                },
              },
            ],
          };

        case 'populate_datagrid':
          const users = args?.users as User[] | undefined;
          if (users && Array.isArray(users)) {
            // Set the users data
            this.users = users.map((user) => ({
              ...user,
              creation: typeof user.creation === 'string' ? new Date(user.creation) : user.creation,
            }));
            this.saveData();
          }

          const currentUsers = users || this.users;
          const populateUsersJson = JSON.stringify(currentUsers, null, 2);

          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Populate the datagrid component with the following user data:

${populateUsersJson}

The datagrid component is located at:
- Component: ${COMPONENT_PATH}
- Template: ${TEMPLATE_PATH}

Please update the component to use this data. The component accepts an @Input() users array.`,
                },
              },
            ],
          };

        case 'create_datagrid_with_data':
          const dataUsers = args?.users as User[] | undefined;
          if (!dataUsers || !Array.isArray(dataUsers)) {
            throw new Error('Users array is required in arguments');
          }

          const dataJson = JSON.stringify(dataUsers, null, 2);
          const componentCode = this.readComponentFile(COMPONENT_PATH);
          const templateCode = this.readComponentFile(TEMPLATE_PATH);

          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Create a datagrid component with the following user data:

${dataJson}

Component code:
\`\`\`typescript
${componentCode}
\`\`\`

Template code:
\`\`\`html
${templateCode}
\`\`\`

Please ensure the component is properly configured to display this data.`,
                },
              },
            ],
          };

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Datagrid MCP server running on stdio');
  }
}

// Start the server
const server = new DatagridMCPServer();
server.run().catch(console.error);

