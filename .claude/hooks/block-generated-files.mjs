#!/usr/bin/env node
// PreToolUse hook: keeps Claude from editing lockfiles and generated files by hand.
//   - Lockfiles (pnpm-lock.yaml, package-lock.json, ...) are written by the package manager.
//   - Generated files (src/frontend/src/routeTree.gen.ts, anything *.gen.*) are rewritten by
//     their generator, so a hand edit is either lost or breaks the build.
//
// Reads the hook payload from stdin and, for such a file, prints a "deny" decision with a
// reason Claude sees. Fails closed: if the payload can't be read, it exits 2 (block).
// Plain Node, no dependencies, so it runs the same on macOS, Linux and Windows.

const LOCKFILES = new Set([
  "pnpm-lock.yaml",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
]);

// routeTree.gen.ts, foo.gen.js, ...
const GENERATED = /\.gen\.[cm]?[jt]sx?$/i;

// Last segment of a path, with either separator (Windows paths arrive with backslashes).
function basename(p) {
  return String(p).replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? "";
}

function reasonFor(filePath) {
  if (!filePath) return null;
  const name = basename(filePath);
  if (LOCKFILES.has(name.toLowerCase())) {
    return (
      `Blocked by .claude/hooks/block-generated-files.mjs: ${name} is a lockfile, written by ` +
      "the package manager. Don't edit it by hand: change package.json and run `pnpm install` " +
      "(from src/frontend/) to update it."
    );
  }
  if (GENERATED.test(name)) {
    return (
      `Blocked by .claude/hooks/block-generated-files.mjs: ${name} is a generated file and ` +
      "is overwritten by its generator. Edit the source instead; for routeTree.gen.ts, add or " +
      "change files under src/frontend/src/routes/ and it regenerates on `pnpm dev`/`pnpm build`."
    );
  }
  return null;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write("block-generated-files: could not parse the hook input; blocking to be safe.\n");
    process.exit(2);
  }

  const input = payload.tool_input ?? {};
  const reason = reasonFor(input.file_path ?? input.notebook_path);
  if (reason) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      }),
    );
  }
  process.exit(0);
});
