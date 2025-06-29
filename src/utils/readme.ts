import { readFile } from "fs/promises";
import { join } from "path";

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
