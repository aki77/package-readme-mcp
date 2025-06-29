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
 * package.jsonから情報を読み取る
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
 * node_modulesからパッケージパスを解決する
 */
export function resolvePackagePath(
  packageName: string,
  workingDir: string = process.cwd(),
): string {
  // スコープ付きパッケージの場合（@scope/package）
  if (packageName.startsWith("@")) {
    return path.join(workingDir, "node_modules", packageName);
  }

  // 通常のパッケージの場合
  return path.join(workingDir, "node_modules", packageName);
}

/**
 * node_modules から指定パッケージの情報を取得
 */
export async function getNpmPackageReadme(
  params: NpmPackageParams,
  packagePathResolver: (packageName: string, workingDir?: string) => string = resolvePackagePath,
): Promise<PackageResult<NpmPackageInfo>> {
  const { name } = params;

  try {
    // パッケージのディレクトリパスを解決
    const packagePath = packagePathResolver(name);

    // パッケージディレクトリの存在確認
    try {
      await fs.access(packagePath);
    } catch {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    // package.json から情報を読み取り
    const packageData = await readPackageJson(packagePath);
    if (!packageData) {
      return {
        success: false,
        error: createPackageNotFoundError(name, "npm"),
      };
    }

    // README ファイルを検索
    const readme = await readReadmeFromPath(packagePath);
    if (!readme) {
      return {
        success: false,
        error: createReadmeNotFoundError(name, packageData.version, "npm"),
      };
    }

    // パッケージ情報を構築
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
