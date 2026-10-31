import { describe, expect, it } from "vitest";
import { parseOperands } from "../src/operands.ts";

describe("parseOperands", () => {
  it("reads two 32-bit integers", () => {
    expect(parseOperands(["2", "-3"])).toEqual([2, -3]);
    expect(parseOperands(["2147483647", "-2147483648"])).toEqual([2147483647, -2147483648]);
  });

  it("refuses anything else", () => {
    for (const args of [[], ["1"], ["1", "2", "3"], ["1", "x"], ["1.5", "2"], ["2147483648", "1"], ["", "1"], ["1e3", "1"]]) {
      expect(parseOperands(args)).toBeUndefined();
    }
  });
});
