import type { ApiError } from "../types/index.js";

/**
 * エラーコード定数
 */
export const ERROR_CODES = {
  // パッケージ関連エラー
  PACKAGE_NOT_FOUND: "PACKAGE_NOT_FOUND",
  README_NOT_FOUND: "README_NOT_FOUND",

  // サーバー関連エラー
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * エラーオブジェクトを作成する
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
 * パッケージが見つからないエラーを作成
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
 * READMEが見つからないエラーを作成
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
 * 内部エラーを作成
 */
export function createInternalError(message: string, originalError?: Error): ApiError {
  return createError(ERROR_CODES.INTERNAL_ERROR, `Internal error: ${message}`, {
    originalError: originalError?.message,
  });
}
