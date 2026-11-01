import type { BaseHost, CommandHooks, Host } from "@oxidevm/sdk/wasm";
import { parseOperands } from "./operands.ts";

/**
 * The host members the command uses. Asking for only these keeps it testable with a small stand-in instead of a whole
 * host, whose members grow with the SDK.
 */
export type AddHost = Pick<BaseHost, "fail"> & { readonly fs: Pick<Host<"files.sync">["fs"], "writeAll"> };

/**
 * `my-module <a> <b>` prints the sum of two 32-bit integers.
 *
 * The application starts it with `spawnModule`, and once it turns the module's commands on, any program in the VM runs
 * it as `/usr/local/bin/my-module`.
 */
export function addCommand(host: AddHost, add: (left: number, right: number) => unknown): CommandHooks<"my-module"> {
  return {
    main(io) {
      // Name the command as the caller typed it (perhaps a path, or a link to it); io.args never holds argv[0].
      const name = io.invocation.kind === "command" ? io.invocation.argv0 : "my-module";
      const operands = parseOperands(io.args);
      if (operands === undefined) return host.fail(2, `usage: ${name} <a> <b>  (two 32-bit integers)`);
      // writeAll writes every byte: a pipe may take only part of one write.
      host.fs.writeAll(io.stdout, new TextEncoder().encode(`${String(add(...operands))}\n`));
      return 0;
    },
  };
}
