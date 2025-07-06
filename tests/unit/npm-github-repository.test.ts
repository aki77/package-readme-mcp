import { describe, expect, it } from "vitest";
import { getNpmGitHubRepository } from "../../src/tools/npm-github-repository.js";

describe("getNpmGitHubRepository", () => {
  it("should return repository name for package with string repository", async () => {
    const mockPackageResolver = () => "tests/fixtures/npm/react-18.2.0";
    const result = await getNpmGitHubRepository({ name: "react" }, mockPackageResolver);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("facebook/react");
    }
  });

  it("should return repository name for package with object repository", async () => {
    const mockPackageResolver = () => "tests/fixtures/npm/@types/react-18.2.0";
    const result = await getNpmGitHubRepository({ name: "@types/react" }, mockPackageResolver);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("DefinitelyTyped/DefinitelyTyped");
    }
  });

  it("should return error when package not found", async () => {
    const mockPackageResolver = () => "tests/fixtures/npm/non-existent-package";
    const result = await getNpmGitHubRepository({ name: "non-existent-package" }, mockPackageResolver);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("PACKAGE_NOT_FOUND");
    }
  });

  it("should return error when repository not found", async () => {
    const mockPackageResolver = () => "tests/fixtures/npm/package-without-readme-1.0.0";
    const result = await getNpmGitHubRepository({ name: "package-without-readme" }, mockPackageResolver);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("REPOSITORY_NOT_FOUND");
    }
  });

  it("should return error when repository is not a valid GitHub URL", async () => {
    const mockPackageResolver = () => "tests/fixtures/npm/invalid-package-1.0.0";
    const result = await getNpmGitHubRepository({ name: "invalid-package" }, mockPackageResolver);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("REPOSITORY_INVALID");
    }
  });
});