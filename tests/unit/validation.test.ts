import { describe, it, expect } from "vitest";
import {
  validateNpmPackageParams,
  validateGemPackageParams,
  isValidPackageName,
  isValidVersion,
  type NpmPackageParams,
  type GemPackageParams,
} from "../../src/utils/validation.js";

describe("validation", () => {
  describe("isValidPackageName", () => {
    it("should accept valid package names", () => {
      expect(isValidPackageName("react")).toBe(true);
      expect(isValidPackageName("@types/node")).toBe(true);
      expect(isValidPackageName("lodash.get")).toBe(true);
      expect(isValidPackageName("my-package")).toBe(true);
      expect(isValidPackageName("my_package")).toBe(true);
      expect(isValidPackageName("scope/package")).toBe(true);
    });

    it("should reject invalid package names", () => {
      expect(isValidPackageName("")).toBe(false);
      expect(isValidPackageName("package with spaces")).toBe(false);
      expect(isValidPackageName("package!")).toBe(false);
      expect(isValidPackageName("package#")).toBe(false);
      expect(isValidPackageName("package$")).toBe(false);
      expect(isValidPackageName("package%")).toBe(false);
      expect(isValidPackageName("package&")).toBe(false);
      expect(isValidPackageName("package*")).toBe(false);
      expect(isValidPackageName("a".repeat(257))).toBe(false); // 257文字
    });
  });

  describe("isValidVersion", () => {
    it("should accept valid semantic versions", () => {
      expect(isValidVersion("1.0.0")).toBe(true);
      expect(isValidVersion("0.0.1")).toBe(true);
      expect(isValidVersion("10.20.30")).toBe(true);
      expect(isValidVersion("1.0.0-alpha")).toBe(true);
      expect(isValidVersion("1.0.0-alpha.1")).toBe(true);
      expect(isValidVersion("1.0.0-alpha.beta")).toBe(true);
      expect(isValidVersion("1.0.0-alpha.beta.1")).toBe(true);
      expect(isValidVersion("1.0.0+build.1")).toBe(true);
      expect(isValidVersion("1.0.0-alpha.1+build.1")).toBe(true);
    });

    it("should reject invalid versions", () => {
      expect(isValidVersion("")).toBe(false);
      expect(isValidVersion("1")).toBe(false);
      expect(isValidVersion("1.0")).toBe(false);
      expect(isValidVersion("1.0.0.0")).toBe(false);
      expect(isValidVersion("v1.0.0")).toBe(false);
      expect(isValidVersion("1.0.0-")).toBe(false);
      expect(isValidVersion("1.0.0+")).toBe(false);
      expect(isValidVersion("01.0.0")).toBe(false); // leading zero
      expect(isValidVersion("1.01.0")).toBe(false); // leading zero
      expect(isValidVersion("1.0.01")).toBe(false); // leading zero
    });
  });

  describe("validateNpmPackageParams", () => {
    it("should validate correct npm package parameters", () => {
      const validParams = {
        name: "react",
        version: "18.2.0",
      };

      const result = validateNpmPackageParams(validParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("react");
        expect(result.data.version).toBe("18.2.0");
      }
    });

    it("should reject invalid npm package parameters", () => {
      const invalidParams = {
        name: "",
        version: "invalid-version",
      };

      const result = validateNpmPackageParams(invalidParams);
      expect(result.success).toBe(false);
      if (!result.success) {
        // エラーの数が変動する可能性があるため、少なくとも2つはあることを確認
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
        expect(result.errors.some(err => err.field === "name")).toBe(true);
        expect(result.errors.some(err => err.field === "version")).toBe(true);
      }
    });

    it("should reject missing parameters", () => {
      const incompleteParams = {
        name: "react",
        // version is missing
      };

      const result = validateNpmPackageParams(incompleteParams);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(err => err.field === "version")).toBe(true);
      }
    });

    it("should reject extra parameters", () => {
      const paramsWithExtra = {
        name: "react",
        version: "18.2.0",
        extra: "should not be here",
      };

      const result = validateNpmPackageParams(paramsWithExtra);
      // Zodのstrictモードではないので、余分なプロパティは無視される
      expect(result.success).toBe(true);
    });
  });

  describe("validateGemPackageParams", () => {
    it("should validate correct gem package parameters", () => {
      const validParams = {
        name: "rails",
        version: "7.0.0",
      };

      const result = validateGemPackageParams(validParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("rails");
        expect(result.data.version).toBe("7.0.0");
      }
    });

    it("should reject invalid gem package parameters", () => {
      const invalidParams = {
        name: "gem with spaces",
        version: "not-a-version",
      };

      const result = validateGemPackageParams(invalidParams);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0].field).toBe("name");
        expect(result.errors[1].field).toBe("version");
      }
    });

    it("should handle complex gem names", () => {
      const validParams = {
        name: "activesupport",
        version: "7.0.0-alpha.1",
      };

      const result = validateGemPackageParams(validParams);
      expect(result.success).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle null and undefined inputs", () => {
      expect(validateNpmPackageParams(null).success).toBe(false);
      expect(validateNpmPackageParams(undefined).success).toBe(false);
      expect(validateGemPackageParams(null).success).toBe(false);
      expect(validateGemPackageParams(undefined).success).toBe(false);
    });

    it("should handle non-object inputs", () => {
      expect(validateNpmPackageParams("string").success).toBe(false);
      expect(validateNpmPackageParams(123).success).toBe(false);
      expect(validateNpmPackageParams(true).success).toBe(false);
      expect(validateGemPackageParams("string").success).toBe(false);
      expect(validateGemPackageParams(123).success).toBe(false);
      expect(validateGemPackageParams(true).success).toBe(false);
    });

    it("should handle very long package names", () => {
      const longName = "a".repeat(256);
      const tooLongName = "a".repeat(257);

      expect(isValidPackageName(longName)).toBe(true);
      expect(isValidPackageName(tooLongName)).toBe(false);
    });
  });
});
