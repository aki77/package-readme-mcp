import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import type { PackageResult } from "../types/index.js";
import {
  createInternalError,
  createPackageNotFoundError,
} from "../utils/errors.js";
import type { GemPackageParams } from "../utils/validation.js";

const execAsync = promisify(exec);

async function getGemPath(gemName: string): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync(`bundle show ${gemName}`);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

function extractRepositoryName(url: string): string | null {
  const githubMatch = url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?(?:[/#].*)?$/);
  return githubMatch ? githubMatch[1] : null;
}

async function getRepositoryFromGemspec(gemPath: string): Promise<string | null> {
  try {
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(gemPath);
    const gemspecFile = files.find((file) => file.endsWith(".gemspec"));

    if (!gemspecFile) {
      return null;
    }

    const gemspecPath = join(gemPath, gemspecFile);
    const content = await readFile(gemspecPath, "utf-8");

    const homepageMatch = content.match(/\.homepage\s*=\s*["'`]([^"'`]+)["'`]/);
    if (homepageMatch?.[1]) {
      const repositoryName = extractRepositoryName(homepageMatch[1]);
      if (repositoryName) {
        return repositoryName;
      }
    }

    const metadataMatch = content.match(/\.metadata\s*=\s*{[^}]*["'`]source_code_uri["'`]\s*=>\s*["'`]([^"'`]+)["'`]/);
    if (metadataMatch?.[1]) {
      const repositoryName = extractRepositoryName(metadataMatch[1]);
      if (repositoryName) {
        return repositoryName;
      }
    }

    const metadataSourceMatch = content.match(/\.metadata\s*=\s*{[^}]*["'`]homepage_uri["'`]\s*=>\s*["'`]([^"'`]+)["'`]/);
    if (metadataSourceMatch?.[1]) {
      const repositoryName = extractRepositoryName(metadataSourceMatch[1]);
      if (repositoryName) {
        return repositoryName;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getGemGitHubRepository(
  params: GemPackageParams,
): Promise<PackageResult<string>> {
  const { name } = params;

  try {
    const gemPath = await getGemPath(name);

    if (!gemPath) {
      return {
        success: false,
        error: createPackageNotFoundError(name, "gem"),
      };
    }

    const repositoryName = await getRepositoryFromGemspec(gemPath);
    if (!repositoryName) {
      return {
        success: false,
        error: {
          code: "REPOSITORY_NOT_FOUND",
          message: `Repository information not found for gem: ${name}`,
        },
      };
    }

    return {
      success: true,
      data: repositoryName,
    };
  } catch (error) {
    return {
      success: false,
      error: createInternalError(
        "Unexpected error occurred",
        error instanceof Error ? error : undefined,
      ),
    };
  }
}