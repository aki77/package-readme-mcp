import { promises as fs } from "node:fs";
import path from "node:path";
import type { PackageResult } from "../types/index.js";
import {
  createInternalError,
  createPackageNotFoundError,
} from "../utils/errors.js";
import { extractRepositoryName, getRepositoryNameFromText } from "../utils/github-url.js";
import type { NpmPackageParams } from "../utils/validation.js";
import { resolvePackagePath } from "./npm-readme.js";

async function readPackageJson(packagePath: string): Promise<any | null> {
  try {
    const packageJsonPath = path.join(packagePath, "package.json");
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
    return JSON.parse(packageJsonContent);
  } catch {
    return null;
  }
}

function extractRepositoryNameFromNpmField(repository: string | { url: string }): string | null {
  let url: string;
  
  if (typeof repository === "object" && repository.url) {
    url = repository.url;
  } else if (typeof repository === "string") {
    url = repository;
  } else {
    return null;
  }

  return extractRepositoryName(url);
}

export async function getNpmGitHubRepository(
  params: NpmPackageParams,
  packagePathResolver: (packageName: string, workingDir?: string) => string = resolvePackagePath,
): Promise<PackageResult<string>> {
  const { name } = params;

  try {
    const packagePath = packagePathResolver(name);

    try {
      await fs.access(packagePath);
    } catch {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    const packageData = await readPackageJson(packagePath);
    if (!packageData) {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    let repositoryName: string | null = null;

    if (packageData.repository) {
      repositoryName = extractRepositoryNameFromNpmField(packageData.repository);
      if (!repositoryName) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_INVALID",
            message: `Invalid or non-GitHub repository for package: ${name}`,
          },
        };
      }
    } else {
      const content = JSON.stringify(packageData, null, 2);
      repositoryName = getRepositoryNameFromText(content);
      if (!repositoryName) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_NOT_FOUND",
            message: `Repository information not found for package: ${name}`,
          },
        };
      }
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