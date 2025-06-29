import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Read the README.md file from the specified directory
 */
export async function readReadmeFromPath(packagePath: string): Promise<string | undefined> {
  try {
    const readmePath = join(packagePath, "README.md");
    return await readFile(readmePath, "utf-8");
  } catch {
    // If README.md is not found
    return undefined;
  }
}
