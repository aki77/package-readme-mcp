#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { getGemPackageReadme } from "./tools/gem-readme.js";
import { getNpmPackageReadme } from "./tools/npm-readme.js";
import type { ValidationError } from "./types/index.js";
import { validateGemPackageParams, validateNpmPackageParams } from "./utils/validation.js";

const server = new Server(
  {
    name: "package-readme-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_npm_readme",
        description:
          "Get README documentation for npm packages to understand usage, installation instructions, API reference, and examples. Useful for learning how to use npm packages in your project.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The npm package name (supports scoped packages like @scope/package)",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_gem_readme",
        description:
          "Get README documentation for Ruby gems to understand usage, installation instructions, API reference, and code examples. Useful for learning how to use Ruby gems in your project.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The gem package name",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_npm_readme": {
      // Validate input parameters
      const validation = validateNpmPackageParams(args);
      if (!validation.success) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid parameters: ${validation.errors.map((e: ValidationError) => e.message).join(", ")}`,
        );
      }

      // Get npm package README
      const result = await getNpmPackageReadme(validation.data);
      if (!result.success) {
        throw new McpError(
          ErrorCode.InternalError,
          `${result.error.message}`,
          result.error.details,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: result.data.readme,
          },
        ],
      };
    }

    case "get_gem_readme": {
      // Validate input parameters
      const validation = validateGemPackageParams(args);
      if (!validation.success) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid parameters: ${validation.errors.map((e: ValidationError) => e.message).join(", ")}`,
        );
      }

      // Get gem package README
      const result = await getGemPackageReadme(validation.data);

      if (!result.success) {
        throw new McpError(
          ErrorCode.InternalError,
          `${result.error.message}`,
          result.error.details,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: result.data.readme,
          },
        ],
      };
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Package README MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
