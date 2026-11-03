import { describe, expect, it } from "vitest";
import definition from "../module.ts";

describe("module definition", () => {
  it("declares what the build and the consumer read", () => {
    expect(definition.manifest.id).toBe("my-module");
    expect(definition.manifest.process.kind).toBe("command");
    expect(definition.manifest.commands).toEqual(["my-module"]);
    // The module's network reach (engine ADR 0029): Rust holds every process of the module to it.
    const host: readonly string[] = definition.manifest.requires.host;
    expect(host.filter(token => token.startsWith("net."))).toEqual([]);
    expect(typeof definition.adapter).toBe("function");
  });
});
