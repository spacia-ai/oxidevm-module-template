import { defineModule } from "@oxidevm/sdk/wasm";
import { parseOperands } from "./src/operands.ts";

export default defineModule({
  manifest: {
    id: "my-module",
    version: "0.1.0",
    abi: "raw",
    artifacts: [{ name: "add.wasm", from: "upstream/add.wasm" }],
    process: { kind: "command" },
    requires: { host: ["files.sync"] },
    license: { spdx: "Apache-2.0" },
  },
  adapter: async host => {
    const instance = await WebAssembly.instantiate(await host.artifacts.compile("add.wasm"));
    const add = instance.exports["add"];
    if (typeof add !== "function") throw new Error("add.wasm does not export add");
    return {
      main(io) {
        const operands = parseOperands(io.args);
        if (operands === undefined) return host.fail(2, "usage: my-module <a> <b>  (two 32-bit integers)");
        const sum: unknown = Reflect.apply(add, undefined, operands);
        host.fs.write(io.stdout, new TextEncoder().encode(`${String(sum)}\n`));
        return 0;
      },
    };
  },
});
