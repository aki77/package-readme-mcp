import { describe, expect, it, vi, beforeEach } from "vitest";
import { getGemGitHubRepository } from "../../src/tools/gem-github-repository.js";
import { join } from "node:path";

// Mock the entire child_process module
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

describe("getGemGitHubRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return repository name when found in gemspec", async () => {
    const { exec } = await import("node:child_process");
    const mockExec = vi.mocked(exec);
    const fixtureGemPath = join(process.cwd(), "tests/fixtures/gems/rails-7.0.0");

    // Mock bundle show command to return fixture path
    mockExec.mockImplementation((command, callback) => {
      if (typeof callback === "function") {
        (callback as any)(null, { stdout: fixtureGemPath + "\n", stderr: "" });
      }
      return {} as any;
    });

    const result = await getGemGitHubRepository({ name: "rails" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("rails/rails");
    }
  });

  it("should return error when gem not found", async () => {
    const { exec } = await import("node:child_process");
    const mockExec = vi.mocked(exec);

    // Mock bundle show command to fail
    mockExec.mockImplementation((command, callback) => {
      if (typeof callback === "function") {
        (callback as any)(new Error("Gem not found"), null);
      }
      return {} as any;
    });

    const result = await getGemGitHubRepository({ name: "non-existent-gem-123456" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
    }
  });

  it("should handle validation errors", async () => {
    const { exec } = await import("node:child_process");
    const mockExec = vi.mocked(exec);

    // Mock bundle show command to fail
    mockExec.mockImplementation((command, callback) => {
      if (typeof callback === "function") {
        (callback as any)(new Error("Gem not found"), null);
      }
      return {} as any;
    });

    const result = await getGemGitHubRepository({ name: "non-existent-gem-123456" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
    }
  });

  it("should return error when gemspec has no repository information", async () => {
    const { exec } = await import("node:child_process");
    const mockExec = vi.mocked(exec);
    const fixtureGemPath = join(process.cwd(), "tests/fixtures/gems/no-readme-gem-1.0.0");

    // Mock bundle show command to return fixture path
    mockExec.mockImplementation((command, callback) => {
      if (typeof callback === "function") {
        (callback as any)(null, { stdout: fixtureGemPath + "\n", stderr: "" });
      }
      return {} as any;
    });

    const result = await getGemGitHubRepository({ name: "no-readme-gem" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("REPOSITORY_NOT_FOUND");
      expect(result.error.message).toContain("Repository information not found for gem: no-readme-gem");
    }
  });
});
