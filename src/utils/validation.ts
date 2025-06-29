import { z } from "zod";
import type { ValidationError, ValidationResult } from "../types/index.js";

/**
 * Zod schema for package name
 * - Only allows alphanumeric characters, hyphens, underscores, slashes, periods, and @ symbols
 * - Maximum 256 characters limit
 * - Empty string not allowed
 */
const packageNameSchema = z
  .string()
  .min(1, "Package name cannot be empty")
  .max(256, "Package name must be 256 characters or less")
  .regex(
    /^[@a-zA-Z0-9._/-]+$/,
    "Package name can only contain letters, numbers, hyphens, underscores, periods, slashes, and @ symbols",
  );

/**
 * Zod schema for semantic versioning (semver) format
 * - Basic format: X.Y.Z
 * - Prerelease: X.Y.Z-alpha.1
 * - Build metadata: X.Y.Z+build.1
 * - Combined: X.Y.Z-alpha.1+build.1
 */
const versionSchema = z
  .string()
  .min(1, "Version cannot be empty")
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    "Version must be in semantic versioning format (e.g., 1.0.0, 1.0.0-alpha.1)",
  );

/**
 * NPM package parameter schema
 */
export const npmPackageParamsSchema = z.object({
  name: packageNameSchema,
});

/**
 * Gem package parameter schema
 */
export const gemPackageParamsSchema = z.object({
  name: packageNameSchema,
});

/**
 * NPM package parameter type
 */
export type NpmPackageParams = z.infer<typeof npmPackageParamsSchema>;

/**
 * Gem package parameter type
 */
export type GemPackageParams = z.infer<typeof gemPackageParamsSchema>;

/**
 * Convert Zod error to ValidationError array
 */
function zodErrorToValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    received: err.code === "invalid_type" ? err.received : undefined,
  }));
}

/**
 * Validate NPM package parameters
 */
export function validateNpmPackageParams(params: unknown): ValidationResult<NpmPackageParams> {
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
 * Validate Gem package parameters
 */
export function validateGemPackageParams(params: unknown): ValidationResult<GemPackageParams> {
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
 * Validate package name format (generic)
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
 * Validate version number format (generic)
 */
export function isValidVersion(version: string): boolean {
  try {
    versionSchema.parse(version);
    return true;
  } catch {
    return false;
  }
}
