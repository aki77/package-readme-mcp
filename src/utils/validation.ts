import { z } from "zod";
import type { ValidationResult, ValidationError } from "../types/index.js";

/**
 * パッケージ名のZodスキーマ
 * - 英数字、ハイフン、アンダースコア、スラッシュ、ピリオド、アットマークのみ許可
 * - 最大256文字の制限
 * - 空文字列は不可
 */
const packageNameSchema = z
  .string()
  .min(1, "Package name cannot be empty")
  .max(256, "Package name must be 256 characters or less")
  .regex(
    /^[@a-zA-Z0-9._/-]+$/,
    "Package name can only contain letters, numbers, hyphens, underscores, periods, slashes, and @ symbols"
  );

/**
 * セマンティックバージョニング（semver）形式のZodスキーマ
 * - 基本形式: X.Y.Z
 * - プレリリース: X.Y.Z-alpha.1
 * - ビルドメタデータ: X.Y.Z+build.1
 * - 複合: X.Y.Z-alpha.1+build.1
 */
const versionSchema = z
  .string()
  .min(1, "Version cannot be empty")
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    "Version must be in semantic versioning format (e.g., 1.0.0, 1.0.0-alpha.1)"
  );

/**
 * NPMパッケージのパラメータスキーマ
 */
export const npmPackageParamsSchema = z.object({
  name: packageNameSchema,
  version: versionSchema,
});

/**
 * Gemパッケージのパラメータスキーマ
 */
export const gemPackageParamsSchema = z.object({
  name: packageNameSchema,
  version: versionSchema,
});

/**
 * NPMパッケージのパラメータ型
 */
export type NpmPackageParams = z.infer<typeof npmPackageParamsSchema>;

/**
 * Gemパッケージのパラメータ型
 */
export type GemPackageParams = z.infer<typeof gemPackageParamsSchema>;

/**
 * Zodのエラーを ValidationError の配列に変換
 */
function zodErrorToValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    received: err.code === "invalid_type" ? (err as any).received : undefined,
  }));
}

/**
 * NPMパッケージのパラメータを検証
 */
export function validateNpmPackageParams(
  params: unknown
): ValidationResult<NpmPackageParams> {
  try {
    const validatedData = npmPackageParamsSchema.parse(params);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: zodErrorToValidationErrors(error),
      };
    }
    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "Unexpected validation error",
        },
      ],
    };
  }
}

/**
 * Gemパッケージのパラメータを検証
 */
export function validateGemPackageParams(
  params: unknown
): ValidationResult<GemPackageParams> {
  try {
    const validatedData = gemPackageParamsSchema.parse(params);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: zodErrorToValidationErrors(error),
      };
    }
    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "Unexpected validation error",
        },
      ],
    };
  }
}

/**
 * パッケージ名の形式を検証（汎用）
 */
export function isValidPackageName(name: string): boolean {
  try {
    packageNameSchema.parse(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * バージョン番号の形式を検証（汎用）
 */
export function isValidVersion(version: string): boolean {
  try {
    versionSchema.parse(version);
    return true;
  } catch {
    return false;
  }
}
