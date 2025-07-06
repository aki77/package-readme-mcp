import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PackageResult } from "../types/index.js";
import {
  createInternalError,
  createPackageNotFoundError,
} from "../utils/errors.js";
import { getGemPath } from "../utils/gem.js";
import { getRepositoryNameFromText } from "../utils/github-url.js";
import type { GemPackageParams } from "../utils/validation.js";

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

    return getRepositoryNameFromText(content);
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
