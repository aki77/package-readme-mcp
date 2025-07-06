#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getGemPackageReadme } from "./tools/gem-readme.js";
import { getNpmPackageReadme } from "./tools/npm-readme.js";
import { getGemGitHubRepository } from "./tools/gem-github-repository.js";
import { getNpmGitHubRepository } from "./tools/npm-github-repository.js";
import { gemPackageParamsSchema, npmPackageParamsSchema } from "./utils/validation.js";

const server = new McpServer({
  name: "package-readme-mcp",
  version: "1.0.0",
});

// Define output schemas for both tools
const packageReadmeOutputSchema = {
  isError: z.boolean(),
  readme: z.string().optional(),
  error: z.string().optional(),
};

const packageRepositoryOutputSchema = {
  isError: z.boolean(),
  repository: z.string().optional(),
  error: z.string().optional(),
};

// Helper function to create structured output
const createStructuredOutput = () => {
  return {
    success: (readme: string) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ isError: false, readme }),
        },
      ],
      isError: false,
      structuredContent: { isError: false, readme },
    }),
    error: (error: string) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ isError: true, error }),
        },
      ],
      isError: true,
      structuredContent: { isError: true, error },
    }),
  };
};

// Helper function to create structured output for repository
const createRepositoryStructuredOutput = () => {
  return {
    success: (repository: string) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ isError: false, repository }),
        },
      ],
      isError: false,
      structuredContent: { isError: false, repository },
    }),
    error: (error: string) => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ isError: true, error }),
        },
      ],
      isError: true,
      structuredContent: { isError: true, error },
    }),
  };
};

// Register npm readme tool
server.registerTool(
  "get_npm_readme",
  {
    title: "Get NPM Package README",
    description:
      "Get README documentation for npm packages to understand usage, installation instructions, API reference, and examples. Useful for learning how to use npm packages in your project.",
    annotations: {
      openWorldHint: false,
      readOnlyHint: true,
    },
    inputSchema: npmPackageParamsSchema.shape,
    outputSchema: packageReadmeOutputSchema,
  },
  async ({ name }) => {
    const output = createStructuredOutput();

    try {
      const result = await getNpmPackageReadme({ name });

      if (!result.success) {
        return output.error(`${result.error.message}`);
      }

      return output.success(result.data.readme || "No README found");
    } catch (error) {
      return output.error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Register gem readme tool
server.registerTool(
  "get_gem_readme",
  {
    title: "Get Gem Package README",
    description:
      "Get README documentation for Ruby gems to understand usage, installation instructions, API reference, and code examples. Useful for learning how to use Ruby gems in your project.",
    annotations: {
      openWorldHint: false,
      readOnlyHint: true,
    },
    inputSchema: gemPackageParamsSchema.shape,
    outputSchema: packageReadmeOutputSchema,
  },
  async ({ name }) => {
    const output = createStructuredOutput();

    try {
      const result = await getGemPackageReadme({ name });

      if (!result.success) {
        return output.error(`${result.error.message}`);
      }

      return output.success(result.data.readme || "No README found");
    } catch (error) {
      return output.error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Register npm github repository tool
server.registerTool(
  "get_npm_github_repository",
  {
    title: "Get NPM Package GitHub Repository",
    description:
      "Get the GitHub repository name for npm packages in 'owner/repo' format. Useful for finding the source code and development information.",
    annotations: {
      openWorldHint: false,
      readOnlyHint: true,
    },
    inputSchema: npmPackageParamsSchema.shape,
    outputSchema: packageRepositoryOutputSchema,
  },
  async ({ name }) => {
    const output = createRepositoryStructuredOutput();

    try {
      const result = await getNpmGitHubRepository({ name });

      if (!result.success) {
        return output.error(`${result.error.message}`);
      }

      return output.success(result.data);
    } catch (error) {
      return output.error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Register gem github repository tool
server.registerTool(
  "get_gem_github_repository",
  {
    title: "Get Gem Package GitHub Repository",
    description:
      "Get the GitHub repository name for Ruby gems in 'owner/repo' format. Useful for finding the source code and development information.",
    annotations: {
      openWorldHint: false,
      readOnlyHint: true,
    },
    inputSchema: gemPackageParamsSchema.shape,
    outputSchema: packageRepositoryOutputSchema,
  },
  async ({ name }) => {
    const output = createRepositoryStructuredOutput();

    try {
      const result = await getGemGitHubRepository({ name });

      if (!result.success) {
        return output.error(`${result.error.message}`);
      }

      return output.success(result.data);
    } catch (error) {
      return output.error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Package README MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
