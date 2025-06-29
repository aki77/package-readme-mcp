import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getNpmPackageReadme } from "../../src/tools/npm-readme.js";
import type { NpmPackageParams } from "../../src/utils/validation.js";
import path from "path";
import { fileURLToPath } from "url";

// テストフィクスチャのパス
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_PATH = path.join(__dirname, "../fixtures/npm");

describe("npm-readme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getNpmPackageReadme", () => {
    it("should return package info with README for valid package", async () => {
      const params: NpmPackageParams = {
        name: "react",
        version: "18.2.0",
      };

      // カスタムのpackagePathResolverを使用してfixtureパスを返す
      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "react-18.2.0");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("react");
        expect(result.data.version).toBe("18.2.0");
        expect(result.data.readme).toBe("# React\n\nA JavaScript library for building user interfaces.\n");
        expect(result.data.description).toBe("React is a JavaScript library for building user interfaces.");
        expect(result.data.homepage).toBe("https://reactjs.org/");
        expect(result.data.npmUrl).toBe("https://www.npmjs.com/package/react/v/18.2.0");
        expect(result.data.repository).toBe("https://github.com/facebook/react.git");
        expect(result.data.license).toBe("MIT");
      }
    });

    it("should handle package not found error", async () => {
      const params: NpmPackageParams = {
        name: "non-existent-package",
        version: "1.0.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "non-existent-package");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
        expect(result.error.message).toContain("non-existent-package");
      }
    });

    it("should handle version not found error", async () => {
      const params: NpmPackageParams = {
        name: "react",
        version: "999.0.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "react-different-version");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VERSION_NOT_FOUND");
        expect(result.error.message).toContain("999.0.0");
        expect(result.error.message).toContain("react");
      }
    });

    it("should handle README not found error", async () => {
      const params: NpmPackageParams = {
        name: "package-without-readme",
        version: "1.0.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "package-without-readme-1.0.0");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("README_NOT_FOUND");
        expect(result.error.message).toContain("package-without-readme");
      }
    });

    it("should handle package.json not found error", async () => {
      const params: NpmPackageParams = {
        name: "invalid-package",
        version: "1.0.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "invalid-package-1.0.0");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
        expect(result.error.message).toContain("invalid-package");
      }
    });

    it("should handle scoped packages", async () => {
      const params: NpmPackageParams = {
        name: "@types/react",
        version: "18.2.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "@types/react-18.2.0");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("@types/react");
        expect(result.data.npmUrl).toBe("https://www.npmjs.com/package/%40types%2Freact/v/18.2.0");
      }
    });

    it("should handle repository as string", async () => {
      const params: NpmPackageParams = {
        name: "test-package",
        version: "1.0.0",
      };

      const mockResolver = (packageName: string) => {
        return path.join(FIXTURES_PATH, "test-package-1.0.0");
      };

      const result = await getNpmPackageReadme(params, mockResolver);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.repository).toBe("https://github.com/test/test-package.git");
      }
    });
  });
});
