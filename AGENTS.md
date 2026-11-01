# my-module: instructions for coding agents

This repository is an OxideVM WebAssembly module. `module.ts` holds the whole definition: a literal `manifest` and the `adapter` that runs the WebAssembly inside a Userspace JS process.

- Edit `module.ts`, `src/` and `test/`. Never edit `dist/`; `pnpm run build` writes it.
- Keep the manifest a literal. The build reads it without running code, so it cannot call functions or use variables.
- Declare in `requires.host` only what the adapter uses. The adapter's `host` has exactly those members, and the type checker enforces it.
- Import types from `@oxidevm/sdk/wasm` with `import type`; the only value import is `defineModule`. The adapter ships as one self-contained file.
- No `any`, no `@ts-ignore`, no non-null assertions. Treat everything from outside (arguments, bytes, WebAssembly exports) as `unknown` and check it.
- Artifacts are files in this repository named by `from`. Pin upstream binaries by hash where they come from, and keep their licenses and notices in this repository.
- Verify with `pnpm run check` (types, lint, and `oxidevm wasm build --check`), then `pnpm test`, then `pnpm run test:conformance` (`oxidevm wasm test` in a real browser).
- Release by tag: `pnpm run release` prints the steps.

## Commands that programs in the VM run

Each name in `commands` becomes a program: once an application turns it on for a VM (`enableModuleCommands`), any program there runs the module as `/usr/local/bin/<name>`, in a fresh process with the caller's arguments, environment, directory and standard streams.

- Name the command with `io.invocation.argv0` in usage lines and errors; the caller may have typed a path or a link. `io.args` never contains argv[0].
- Standard input may be a terminal, a pipe, a file or empty. Read it only when the command's interface says so, and until a read returns no bytes.
- Use colour or prompts only when `io.terminals` says that descriptor is a terminal.
- Return 0-119 from `main`, and 2 for a usage error. Never throw for a user's mistake: a throw ends the run with status 123.
- A signal kills the process at once and `close()` does not run, unless the module declares `process.signals`. If you trap a signal, finish quickly, then `untrap()` and `raise()` it, so the caller sees the process killed by that signal and a shell loop stops.
- Write results atomically (a temporary file, then a rename), so an interrupted run never leaves half a file.
- Choose names that do not shadow image programs unless you mean to: `/usr/local/bin` comes before `/usr/bin` on PATH. Adding a name in a later release makes every application consent again.
- Never list your own command (`/usr/local/bin/<name>`) in `requires.guest.executables`, and never start your own command through PATH.
- Keep start-up cheap: every run starts a fresh process, which runs the adapter factory again.
