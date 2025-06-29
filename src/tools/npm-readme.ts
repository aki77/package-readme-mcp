import { promises as fs } from "node:fs";
import path from "node:path";
import type { NpmPackageInfo, PackageResult } from "../types/index.js";
import {
  createInternalError,
  createPackageNotFoundError,
  createReadmeNotFoundError,
} from "../utils/errors.js";
import { readReadmeFromPath } from "../utils/readme.js";
import type { NpmPackageParams } from "../utils/validation.js";

/**
 * Read information from package.json
 */
async function readPackageJson(packagePath: string): Promise<NpmPackageInfo | null> {
  try {
    const packageJsonPath = path.join(packagePath, "package.json");
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
    return JSON.parse(packageJsonContent);
  } catch {
    return null;
  }
}

/**
 * Resolve package path from node_modules
 */
export function resolvePackagePath(
  packageName: string,
  workingDir: string = process.cwd(),
): string {
  // For scoped packages (@scope/package)
  if (packageName.startsWith("@")) {
    return path.join(workingDir, "node_modules", packageName);
  }

  // For regular packages
  return path.join(workingDir, "node_modules", packageName);
}

/**
 * Get package information from node_modules for the specified package
 */
export async function getNpmPackageReadme(
  params: NpmPackageParams,
  packagePathResolver: (packageName: string, workingDir?: string) => string = resolvePackagePath,
): Promise<PackageResult<NpmPackageInfo>> {
  const { name } = params;

  try {
    // Resolve package directory path
    const packagePath = packagePathResolver(name);

    // Check if package directory exists
    try {
      await fs.access(packagePath);
    } catch {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    // Read information from package.json
    const packageData = await readPackageJson(packagePath);
    if (!packageData) {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    // Search for README file
    const readme = await readReadmeFromPath(packagePath);
    if (!readme) {
      return {
        success: false,
        error: createReadmeNotFoundError(name, packageData.version, "npm"),
      };
    }

    // Build package information
    const npmPackageInfo: NpmPackageInfo = {
      name: packageData.name || name,
      version: packageData.version,
      readme: readme,
      description: packageData.description,
      homepage: packageData.homepage,
      npmUrl: `https://www.npmjs.com/package/${encodeURIComponent(name)}`,
      repository:
        typeof packageData.repository === "object"
          ? packageData.repository?.url
          : packageData.repository,
      license: packageData.license,
    };

    return {
      success: true,
      data: npmPackageInfo,
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
