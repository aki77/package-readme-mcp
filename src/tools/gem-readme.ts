import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import type { GemPackageInfo, PackageResult } from "../types/index.js";
import {
  createInternalError,
  createPackageNotFoundError,
  createReadmeNotFoundError,
} from "../utils/errors.js";
import { readReadmeFromPath } from "../utils/readme.js";
import type { GemPackageParams } from "../utils/validation.js";

/**
 * Get README from a locally installed gem
 */
export async function getGemPackageReadme(
  params: GemPackageParams,
): Promise<PackageResult<GemPackageInfo>> {
  const { name } = params;

  try {
    const gemPath = await getGemPath(name);

    if (!gemPath) {
      return {
        success: false,
        error: createPackageNotFoundError(name, "gem"),
      };
    }

    const readme = await readReadmeFromPath(gemPath);
    if (!readme) {
      return await createGemPackageInfoFromGemspec(name, undefined, gemPath);
    }

    return {
      success: true,
      data: createGemPackageInfo(name, undefined, readme),
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

const execAsync = promisify(exec);

/**
 * Create a GemPackageInfo by getting description from gemspec if README is not found
 */
async function createGemPackageInfoFromGemspec(
  name: string,
  version: string | undefined,
  gemPath: string,
): Promise<PackageResult<GemPackageInfo>> {
  const gemspecDescription = await getDescriptionFromGemspec(gemPath);
  if (!gemspecDescription) {
    return {
      success: false,
      error: createReadmeNotFoundError(name, version || "latest", "gem"),
    };
  }

  const gemPackageInfo = createGemPackageInfo(name, version, `# ${name}\n\n${gemspecDescription}`);

  return {
    success: true,
    data: gemPackageInfo,
  };
}

/**
 * Create a GemPackageInfo object
 */
function createGemPackageInfo(
  name: string,
  version: string | undefined,
  readme: string,
): GemPackageInfo {
  return {
    name: name,
    version: version,
    readme: readme,
    gemUrl: `https://rubygems.org/gems/${encodeURIComponent(name)}${version ? `/versions/${encodeURIComponent(version)}` : ""}`,
  };
}

/**
 * Get gem path using bundle show command
 */
async function getGemPath(gemName: string): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync(`bundle show ${gemName}`);
    return stdout.trim();
  } catch {
    return undefined;
  }
}

/**
 * Get description from gemspec file
 */
async function getDescriptionFromGemspec(gemPath: string): Promise<string | undefined> {
  try {
    // Find the first .gemspec file in the directory
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(gemPath);
    const gemspecFile = files.find((file) => file.endsWith(".gemspec"));

    if (!gemspecFile) {
      return undefined;
    }

    const gemspecPath = join(gemPath, gemspecFile);
    const content = await readFile(gemspecPath, "utf-8");

    // Extract description from gemspec file
    const descriptionMatch = content.match(/\.description\s*=\s*["'`]([^"'`]+)["'`]/);
    if (descriptionMatch?.[1]) {
      return descriptionMatch[1].trim();
    }

    // Try summary as well
    const summaryMatch = content.match(/\.summary\s*=\s*["'`]([^"'`]+)["'`]/);
    if (summaryMatch?.[1]) {
      return summaryMatch[1].trim();
    }

    return undefined;
  } catch {
    return undefined;
  }
}
