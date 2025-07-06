# package-readme-mcp

An MCP (Model Context Protocol) server for retrieving package README files and GitHub repository information. Supports both NPM packages and Ruby Gems.

## Overview

This MCP server allows you to fetch README files and GitHub repository names from npm or gem packages installed in your project, making it easy to access documentation such as usage instructions, API references, and code examples. When combined with [deepwiki MCP](https://mcp.deepwiki.com/), you can obtain even more detailed information from the GitHub repositories.

## Features

- **NPM Packages**: Retrieve the README and GitHub repository name of installed NPM packages in your project
- **Ruby Gems**: Retrieve the README and GitHub repository name of installed Ruby gems in your project
- **GitHub Integration**: Get repository names in `owner/repo` format for further analysis with tools like [deepwiki MCP](https://mcp.deepwiki.com/)

## Usage

### As an MCP Client

This server can be used from any client that supports the MCP protocol (such as Claude Code, VS Code, etc.).

#### Claude Code

```shell
claude mcp add -s user package-readme -- npx -y @aki77/package-readme-mcp
```

#### VSCode Configuration

Add the following to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "package-readme": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@aki77/package-readme-mcp"]
    }
  }
}
```

## Available Tools

### get_npm_readme

Retrieves the README for an NPM package.

**Parameters:**
- `name` (required): NPM package name (supports scoped packages like `@scope/package`)

**Examples:**
```
get_npm_readme
name: react
```

```
get_npm_readme
name: @types/react
```

### get_gem_readme

Retrieves the README for a Ruby Gem.

**Parameters:**
- `name` (required): Gem package name

**Example:**
```
get_gem_readme
name: rails
```

### get_npm_github_repository

Retrieves the GitHub repository name for an NPM package in `owner/repo` format.

**Parameters:**
- `name` (required): NPM package name (supports scoped packages like `@scope/package`)

**Examples:**
```
get_npm_github_repository
name: react
```
Returns: `facebook/react`

```
get_npm_github_repository
name: @types/react
```
Returns: `DefinitelyTyped/DefinitelyTyped`

### get_gem_github_repository

Retrieves the GitHub repository name for a Ruby Gem in `owner/repo` format.

**Parameters:**
- `name` (required): Gem package name

**Example:**
```
get_gem_github_repository
name: rails
```
Returns: `rails/rails`
