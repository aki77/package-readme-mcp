import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGemPackageReadme } from "../../src/tools/gem-readme.js";
import type { GemPackageParams } from "../../src/utils/validation.js";

// child_processとutilのモック
vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

vi.mock("util", () => ({
  promisify: vi.fn((fn) => {
    return vi.fn((...args) => {
      return new Promise((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: test
        fn(...args, (error: any, stdout: string, stderr: string) => {
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        });
      });
    });
  }),
}));

const mockExec = vi.mocked(exec);

// テストフィクスチャのパス
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_PATH = path.join(__dirname, "../fixtures/gems");

describe("gem-readme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getGemPackageReadme", () => {
    it("should return gem info with README for locally installed gem", async () => {
      const params: GemPackageParams = {
        name: "rails",
      };

      const gemPath = path.join(FIXTURES_PATH, "rails-7.0.0");

      // Mock exec to return gem path
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          cb(null, `${gemPath}\n`, "");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("rails");
        expect(result.data.version).toBeUndefined();
        expect(result.data.readme).toBe("# Rails\n\nRuby on Rails framework\n");
        expect(result.data.gemUrl).toBe("https://rubygems.org/gems/rails");
      }

      expect(mockExec).toHaveBeenCalledWith("bundle show rails", expect.any(Function));
    });

    it("should handle gem not installed error", async () => {
      const params: GemPackageParams = {
        name: "non-existent-gem",
      };

      // Mock exec to return error
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          const error = new Error("Could not find gem 'non-existent-gem'") as Error & {
            code: number;
          };
          error.code = 1;
          cb(error, "", "Could not find gem 'non-existent-gem'\n");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
        expect(result.error.message).toContain("non-existent-gem");
      }
    });

    it("should handle README.md not found and fallback to gemspec", async () => {
      const params: GemPackageParams = {
        name: "test-gem",
      };

      const gemPath = path.join(FIXTURES_PATH, "test-gem-1.0.0");

      // Mock exec to return gem path
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          cb(null, `${gemPath}\n`, "");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readme).toBe("# test-gem\n\nTest gem description from gemspec");
      }
    });

    it("should return error when no README.md found and no gemspec", async () => {
      const params: GemPackageParams = {
        name: "no-readme-gem",
      };

      const gemPath = path.join(FIXTURES_PATH, "no-readme-gem-1.0.0");

      // Mock exec to return gem path
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          cb(null, `${gemPath}\n`, "");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("README_NOT_FOUND");
        expect(result.error.message).toContain("no-readme-gem");
      }
    });

    it("should handle bundle command error", async () => {
      const params: GemPackageParams = {
        name: "test-gem",
      };

      // Mock exec to simulate command error
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          const error = new Error("bundle command not found");
          cb(error, "", "");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
      }
    });

    it("should fallback to gemspec description when README not found", async () => {
      const params: GemPackageParams = {
        name: "minimal-gem",
      };

      const gemPath = path.join(FIXTURES_PATH, "minimal-gem-1.0.0");

      // Mock exec to return gem path
      mockExec.mockImplementation((_command, options, callback) => {
        let cb = callback;
        if (typeof options === "function") {
          cb = options;
        }
        if (cb) {
          cb(null, `${gemPath}\n`, "");
        }
        return {} as ReturnType<typeof exec>;
      });

      const result = await getGemPackageReadme(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readme).toBe(
          "# minimal-gem\n\nThis is a minimal gem for testing purposes",
        );
      }
    });
  });
});
