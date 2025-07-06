import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function getGemPath(gemName: string): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync(`bundle show ${gemName}`);
    return stdout.trim();
  } catch {
    return undefined;
  }
}