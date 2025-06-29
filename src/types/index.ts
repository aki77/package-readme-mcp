/**
 * パッケージ情報の型定義
 */
export interface PackageInfo {
  name: string;
  version: string;
  readme?: string;
  description?: string;
  homepage?: string;
}

/**
 * NPMパッケージの詳細情報
 */
export interface NpmPackageInfo extends PackageInfo {
  npmUrl: string;
  repository?: string;
  license?: string;
}

/**
 * Gemパッケージの詳細情報
 */
export interface GemPackageInfo extends PackageInfo {
  gemUrl: string;
  authors?: string[];
  license?: string;
}

/**
 * API エラー情報
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * パッケージ取得結果
 */
export type PackageResult<T = PackageInfo> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

/**
 * バリデーションエラー
 */
export interface ValidationError {
  field: string;
  message: string;
  received?: unknown;
}

/**
 * バリデーション結果
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: ValidationError[];
};
