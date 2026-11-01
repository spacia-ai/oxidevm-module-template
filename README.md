# my-module

An [OxideVM](https://oxidevm.dev) WebAssembly module (command). A command module runs once per start, like a program: `spawnModule(vm, handle, { args: ["2", "3"] })`.

## Use it

In an OxideVM application:

```sh
oxidevm wasm add github:OWNER/REPO@v0.1.0
```

The command shows what the module declares and asks before installing it.

## Run it from a shell

The module declares the command `my-module`. An application that installed it turns the command on for one Userspace VM, and from then on any program in that VM can run it:

```ts
import { enableModuleCommands } from "@oxidevm/sdk/wasm";
import { myModule } from "./oxidevm.modules.generated";

const commands = await enableModuleCommands(vm, myModule);
// A terminal in the VM now runs `my-module 2 3`, which prints 5.
await commands.disable();
```

A third argument turns on only some of a module's commands (`commands`), sets its `options`, and bounds how many runs may be active at once (`concurrency`, 4 by default).

Turning the command on places a stub at `/usr/local/bin/my-module`. A shell finds it when its `PATH` lists `/usr/local/bin` before `/usr/bin`, and then the command takes the place of an image program with the same name. It runs as the guest user, with the caller's arguments, environment, working directory and standard streams. A shell sees these exit statuses:

| Status | Meaning |
| --- | --- |
| 0-119 | the module's own status |
| 120 | the module could not be launched |
| 122 | a prerequisite is missing |
| 123 | the adapter failed: it threw, or returned an invalid status |
| 125 | the engine failed |
| 126 | the stub ran as an ordinary program: the command is not turned on in this VM, or more runs are active than `concurrency` allows |
| 127 | the command is not on `PATH` |
| 128+n | the process was killed by signal n (130 for Ctrl+C) |

## Develop it

```sh
pnpm install
pnpm run check   # types, lint, and the same checks the build makes
pnpm test        # unit tests of your own code
pnpm run test:conformance   # oxidevm wasm test: the runner's contract, in Chromium
pnpm run build   # writes dist/: module.json, adapter.mjs, your artifacts and SHA256SUMS
```

`module.ts` is the whole definition. `upstream/` holds the WebAssembly files the module wraps.

## Release it

```sh
git tag v0.1.0 && git push origin v0.1.0
```

The tag must name the version in `module.ts`. The `release` workflow builds, drafts a GitHub release with every file in `dist/`, downloads it again to verify its `SHA256SUMS`, and publishes it. `pnpm run release` prints the same steps for doing it by hand.

## License

Apache-2.0 (see `LICENSE`). Change the license in `module.ts` and this repository to match the code you wrap, and keep the notices of anything you bundle.
