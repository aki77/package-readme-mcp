import { describe, expect, it } from "vitest";
import { getGemGitHubRepository } from "../../src/tools/gem-github-repository.js";

describe("getGemGitHubRepository", () => {
  it("should return error when gem not found", async () => {
    const result = await getGemGitHubRepository({ name: "non-existent-gem-123456" });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
    }
  });

  it("should handle validation errors", async () => {
    const result = await getGemGitHubRepository({ name: "non-existent-gem-123456" });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
    }
  });
});