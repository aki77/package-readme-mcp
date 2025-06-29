import type { ApiError } from "../types/index.js";

/**
 * エラーコード定数
 */
export const ERROR_CODES = {
  // パッケージ関連エラー
  PACKAGE_NOT_FOUND: "PACKAGE_NOT_FOUND",
  VERSION_NOT_FOUND: "VERSION_NOT_FOUND",
  README_NOT_FOUND: "README_NOT_FOUND",

  // ネットワーク関連エラー
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",

  // バリデーション関連エラー
  INVALID_PACKAGE_NAME: "INVALID_PACKAGE_NAME",
  INVALID_VERSION: "INVALID_VERSION",
  INVALID_PARAMETERS: "INVALID_PARAMETERS",

  // サーバー関連エラー
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // API関連エラー
  API_ERROR: "API_ERROR",
  PARSE_ERROR: "PARSE_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * API エラーを作成する
 */
export function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
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
  packageType: "npm" | "gem"
): ApiError {
  return createApiError(
    ERROR_CODES.PACKAGE_NOT_FOUND,
    `${packageType} package '${packageName}' not found`,
    { packageName, packageType }
  );
}

/**
 * バージョンが見つからないエラーを作成
 */
export function createVersionNotFoundError(
  packageName: string,
  version: string,
  packageType: "npm" | "gem"
): ApiError {
  return createApiError(
    ERROR_CODES.VERSION_NOT_FOUND,
    `Version '${version}' not found for ${packageType} package '${packageName}'`,
    { packageName, version, packageType }
  );
}

/**
 * READMEが見つからないエラーを作成
 */
export function createReadmeNotFoundError(
  packageName: string,
  version: string,
  packageType: "npm" | "gem"
): ApiError {
  return createApiError(
    ERROR_CODES.README_NOT_FOUND,
    `README not found for ${packageType} package '${packageName}' version '${version}'`,
    { packageName, version, packageType }
  );
}

/**
 * ネットワークエラーを作成
 */
export function createNetworkError(
  originalError: Error,
  url?: string
): ApiError {
  return createApiError(
    ERROR_CODES.NETWORK_ERROR,
    `Network error: ${originalError.message}`,
    { originalError: originalError.message, url }
  );
}

/**
 * レート制限エラーを作成
 */
export function createRateLimitError(
  retryAfter?: number
): ApiError {
  return createApiError(
    ERROR_CODES.RATE_LIMIT_ERROR,
    "Rate limit exceeded",
    { retryAfter }
  );
}

/**
 * バリデーションエラーを作成
 */
export function createValidationError(
  field: string,
  message: string,
  received?: unknown
): ApiError {
  return createApiError(
    ERROR_CODES.INVALID_PARAMETERS,
    `Validation error for field '${field}': ${message}`,
    { field, received }
  );
}

/**
 * 内部エラーを作成
 */
export function createInternalError(
  message: string,
  originalError?: Error
): ApiError {
  return createApiError(
    ERROR_CODES.INTERNAL_ERROR,
    `Internal error: ${message}`,
    { originalError: originalError?.message }
  );
}

/**
 * HTTP ステータスコードからエラーを作成
 */
export function createHttpError(
  status: number,
  statusText: string,
  url: string
): ApiError {
  let code: ErrorCode;
  let message: string;

  switch (status) {
    case 404:
      code = ERROR_CODES.PACKAGE_NOT_FOUND;
      message = "Resource not found";
      break;
    case 429:
      code = ERROR_CODES.RATE_LIMIT_ERROR;
      message = "Rate limit exceeded";
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      code = ERROR_CODES.SERVICE_UNAVAILABLE;
      message = "Service temporarily unavailable";
      break;
    default:
      code = ERROR_CODES.API_ERROR;
      message = `HTTP error ${status}: ${statusText}`;
  }

  return createApiError(code, message, { status, statusText, url });
}

/**
 * エラーがタイムアウトエラーかどうかを判定
 */
export function isTimeoutError(error: Error): boolean {
  return error.name === "TimeoutError" ||
         error.message.includes("timeout") ||
         error.message.includes("ETIMEDOUT");
}

/**
 * エラーがネットワークエラーかどうかを判定
 */
export function isNetworkError(error: Error): boolean {
  return error.name === "TypeError" && error.message.includes("fetch") ||
         error.message.includes("ECONNREFUSED") ||
         error.message.includes("ENOTFOUND") ||
         error.message.includes("ECONNRESET");
}
