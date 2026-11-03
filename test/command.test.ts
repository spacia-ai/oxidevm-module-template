import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { testHost, type TestHostInputs } from "@oxidevm/sdk/wasm/testing";
import definition from "../module.ts";

type Invocation = NonNullable<TestHostInputs["invocation"]>;

/** The artifact the release pins, read from this repository. */
const artifacts = { "add.wasm": new Uint8Array(await readFile(new URL("../upstream/add.wasm", import.meta.url))) };

/** Runs the module once through the SDK's runner, as the browser would, and returns what it wrote. */
async function run(args: readonly string[], invocation?: Invocation): Promise<{ status: number; stdout: string; stderr: string }> {
  const { status, stdout, stderr } = await testHost(definition, { args, artifacts, ...(invocation === undefined ? {} : { invocation }) }).run();
  return { status, stdout, stderr };
}

/** How the runner describes a run that a program in the VM started by typing `argv0`. */
const fromVM = (argv0: string): Invocation => ({ kind: "command", name: "my-module", argv0 });

describe("the my-module command", () => {
  it("prints the sum when the application starts the module", async () => {
    expect(await run(["2", "3"])).toEqual({ status: 0, stdout: "5\n", stderr: "" });
  });

  it("prints the sum when a program in the VM runs it", async () => {
    expect(await run(["2", "3"], fromVM("my-module"))).toEqual({ status: 0, stdout: "5\n", stderr: "" });
  });

  it("answers bad input with status 2 and a usage line that names the command as it was typed", async () => {
    expect(await run(["2"], fromVM("my-module"))).toEqual({ status: 2, stdout: "", stderr: "usage: my-module <a> <b>  (two 32-bit integers)\n" });
    expect(await run(["two", "3"], fromVM("/usr/local/bin/my-module"))).toEqual({ status: 2, stdout: "", stderr: "usage: /usr/local/bin/my-module <a> <b>  (two 32-bit integers)\n" });
    expect(await run([])).toEqual({ status: 2, stdout: "", stderr: "usage: my-module <a> <b>  (two 32-bit integers)\n" });
  });
});
