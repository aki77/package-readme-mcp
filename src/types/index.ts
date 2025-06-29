/**
 * Package information type definition
 */
export interface PackageInfo {
  name: string;
  version?: string;
  readme?: string;
  description?: string;
  homepage?: string;
}

/**
 * NPM package repository information
 */
export interface NpmRepository {
  type?: string;
  url: string;
  directory?: string;
}

/**
 * NPM package detailed information
 */
export interface NpmPackageInfo extends PackageInfo {
  npmUrl: string;
  repository?: string | NpmRepository;
  license?: string;
}

/**
 * Gem package detailed information
 */
export interface GemPackageInfo extends PackageInfo {
  gemUrl: string;
  authors?: string[];
  license?: string;
}

/**
 * Package error information
 */
export interface PackageError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Package retrieval result
 */
export type PackageResult<T = PackageInfo> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: PackageError;
    };

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  received?: unknown;
}

/**
 * Validation result
 */
export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: ValidationError[];
    };
