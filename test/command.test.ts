import { describe, expect, it } from "vitest";
import type { CommandIO } from "@oxidevm/sdk/wasm";
import { addCommand } from "../src/command.ts";
import type { AddHost } from "../src/command.ts";

type IO = CommandIO<"my-module">;

/** Descriptors are branded numbers; this check makes one from a test's number without a cast. */
function isDescriptor(value: number): value is IO["stdout"] {
  return Number.isSafeInteger(value) && value >= 0;
}
function descriptor(value: number): IO["stdout"] {
  if (!isDescriptor(value)) throw new RangeError(`${String(value)} is not a descriptor`);
  return value;
}

/** Runs main once with a stand-in for the host members the command uses, and returns what it wrote and failed with. */
async function run(args: readonly string[], invocation: IO["invocation"]): Promise<{ status: number; stdout: string; failures: string[] }> {
  const stdout = descriptor(1);
  let written = "";
  const failures: string[] = [];
  const host: AddHost = {
    fs: { writeAll: (fd, bytes) => { expect(fd).toBe(stdout); written += new TextDecoder().decode(bytes); } },
    fail: (status, message) => { failures.push(message); return status; },
  };
  const io: IO = { args, env: {}, cwd: "/workspace", stdin: descriptor(0), stdout, stderr: descriptor(2), invocation, terminals: { stdin: false, stdout: false, stderr: false } };
  const status = await addCommand(host, (left, right) => left + right).main(io);
  return { status, stdout: written, failures };
}

/** How the runner describes a run that a program in the VM started by typing `argv0`. */
const fromVM = (argv0: string): IO["invocation"] => ({ kind: "command", name: "my-module", path: "/usr/local/bin/my-module", argv0 });

describe("the my-module command", () => {
  it("prints the sum when the application starts the module", async () => {
    expect(await run(["2", "3"], { kind: "host" })).toEqual({ status: 0, stdout: "5\n", failures: [] });
  });

  it("prints the sum when a program in the VM runs it", async () => {
    expect(await run(["2", "3"], fromVM("my-module"))).toEqual({ status: 0, stdout: "5\n", failures: [] });
  });

  it("answers bad input with status 2 and a usage line that names the command as it was typed", async () => {
    expect(await run(["2"], fromVM("my-module"))).toEqual({ status: 2, stdout: "", failures: ["usage: my-module <a> <b>  (two 32-bit integers)"] });
    expect(await run(["two", "3"], fromVM("/usr/local/bin/my-module"))).toEqual({ status: 2, stdout: "", failures: ["usage: /usr/local/bin/my-module <a> <b>  (two 32-bit integers)"] });
    expect(await run([], { kind: "host" })).toEqual({ status: 2, stdout: "", failures: ["usage: my-module <a> <b>  (two 32-bit integers)"] });
  });
});
