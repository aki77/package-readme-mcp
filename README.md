# package-readme-mcp

An MCP (Model Context Protocol) server for retrieving package README files. Supports both NPM packages and Ruby Gems.

## Overview

This MCP server allows you to fetch README files from npm or gem packages installed in your project, making it easy to access documentation such as usage instructions, API references, and code examples.

## Features

- **NPM Packages**: Retrieve the README of installed NPM packages in your project
- **Ruby Gems**: Retrieve the README of installed Ruby gems in your project

## Usage

### As an MCP Client

This server can be used from any client that supports the MCP protocol (such as Claude Code, VS Code, etc.).

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
