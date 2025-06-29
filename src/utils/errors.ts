import type { ApiError } from "../types/index.js";

/**
 * Error code constants
 */
export const ERROR_CODES = {
  // Package related errors
  PACKAGE_NOT_FOUND: "PACKAGE_NOT_FOUND",
  README_NOT_FOUND: "README_NOT_FOUND",

  // Server related errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Create an error object
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Create a package not found error
 */
export function createPackageNotFoundError(
  packageName: string,
  packageType: "npm" | "gem",
): ApiError {
  return createError(
    ERROR_CODES.PACKAGE_NOT_FOUND,
    `${packageType} package '${packageName}' not found`,
    { packageName, packageType },
  );
}

/**
 * Create a README not found error
 */
export function createReadmeNotFoundError(
  packageName: string,
  version: string | undefined,
  packageType: "npm" | "gem",
): ApiError {
  return createError(
    ERROR_CODES.README_NOT_FOUND,
    `README not found for ${packageType} package '${packageName}' version '${version}'`,
    { packageName, version, packageType },
  );
}

/**
 * Create an internal error
 */
export function createInternalError(message: string, originalError?: Error): ApiError {
  return createError(ERROR_CODES.INTERNAL_ERROR, `Internal error: ${message}`, {
    originalError: originalError?.message,
  });
}
