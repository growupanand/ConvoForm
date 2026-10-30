import { describe, expect, it } from "bun:test";
import {
  enforceRatingAnswerConstraints,
  parseRatingAnswerValue,
} from "../src/utils/validateRatingAnswer";

describe("parseRatingAnswerValue", () => {
  it("parses numeric strings", () => {
    expect(parseRatingAnswerValue("5")).toBe(5);
    expect(parseRatingAnswerValue(" 8 ")).toBe(8);
  });

  it("parses English number words", () => {
    expect(parseRatingAnswerValue("four")).toBe(4);
    expect(parseRatingAnswerValue("Ten")).toBe(10);
  });

  it("returns null for unparseable values", () => {
    expect(parseRatingAnswerValue("")).toBeNull();
    expect(parseRatingAnswerValue("excellent")).toBeNull();
    expect(parseRatingAnswerValue("3.5")).toBeNull();
  });
});

describe("enforceRatingAnswerConstraints", () => {
  const baseOutput = {
    confidence: 0.9,
    reasoning: "test",
    isValid: true,
  };

  it('marks "6" invalid when maxRating is 5', () => {
    const result = enforceRatingAnswerConstraints(
      { ...baseOutput, answer: "6" },
      5,
    );
    expect(result.isValid).toBe(false);
    expect(result.answer).toBe("6");
  });

  it('accepts "5" when maxRating is 5', () => {
    const result = enforceRatingAnswerConstraints(
      { ...baseOutput, answer: "5" },
      5,
    );
    expect(result.isValid).toBe(true);
    expect(result.answer).toBe("5");
  });

  it('normalizes "four" to "4" when maxRating is 5', () => {
    const result = enforceRatingAnswerConstraints(
      { ...baseOutput, answer: "four" },
      5,
    );
    expect(result.isValid).toBe(true);
    expect(result.answer).toBe("4");
  });

  it('marks "0" invalid', () => {
    const result = enforceRatingAnswerConstraints(
      { ...baseOutput, answer: "0" },
      5,
    );
    expect(result.isValid).toBe(false);
  });

  it('accepts "8" when maxRating is 10', () => {
    const result = enforceRatingAnswerConstraints(
      { ...baseOutput, answer: "8" },
      10,
    );
    expect(result.isValid).toBe(true);
    expect(result.answer).toBe("8");
  });
});
