import { defineModule } from "@oxidevm/sdk/wasm";
import { addCommand } from "./src/command.ts";

export default defineModule({
  manifest: {
    id: "my-module",
    version: "0.1.0",
    abi: "raw",
    artifacts: [{ name: "add.wasm", from: "upstream/add.wasm" }],
    process: { kind: "command" },
    commands: ["my-module"],
    requires: { host: ["files.sync"] },
    license: { spdx: "Apache-2.0" },
  },
  adapter: async host => {
    const instance = await WebAssembly.instantiate(await host.artifacts.compile("add.wasm"));
    const exported = instance.exports["add"];
    if (typeof exported !== "function") throw new Error("add.wasm does not export add");
    // WebAssembly hands back an untyped function; the command calls it with two 32-bit integers.
    const add = (left: number, right: number): unknown => Reflect.apply(exported, undefined, [left, right]);
    return addCommand(host, add);
  },
});
