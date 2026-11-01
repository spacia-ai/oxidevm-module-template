import { describe, expect, it } from "vitest";
import definition from "../module.ts";

describe("module definition", () => {
  it("declares what the build and the consumer read", () => {
    expect(definition.manifest.id).toBe("my-module");
    expect(definition.manifest.process.kind).toBe("command");
    expect(definition.manifest.commands).toEqual(["my-module"]);
    expect(typeof definition.adapter).toBe("function");
  });
});
