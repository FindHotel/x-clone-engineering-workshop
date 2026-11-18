#!/usr/bin/env node
// PreToolUse hook: keeps Claude out of secret env files (.env, .env.local, .env.production, ...)
// while still allowing the committed template, .env.example.
//
// Reads the hook payload from stdin and, for a secret file, prints a "deny" decision with a
// reason Claude sees. Fails closed: if the payload can't be read, it exits 2 (block).
// Plain Node, no dependencies, so it runs the same on macOS, Linux and Windows.

const ALLOWED = new Set([".env.example"]);

const REASON =
  "Blocked by .claude/hooks/block-env-files.mjs: .env files (.env, .env.local, " +
  ".env.production, ...) hold secrets and must not be read or changed by Claude. " +
  "Use .env.example for the list of variables, or ask the user for the value you need.";

// ".env" or ".env.<anything>", except the allowed templates.
function isSecretName(name) {
  return /^\.env(\..+)?$/i.test(name) && !ALLOWED.has(name.toLowerCase());
}

// Last segment of a path, with either separator (Windows paths arrive with backslashes).
function basename(p) {
  return String(p).replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? "";
}

function isSecretPath(p) {
  return Boolean(p) && isSecretName(basename(p));
}

// A Grep glob such as ".env*" or "**/.env.local" that could match a secret file.
function isSecretGlob(glob) {
  if (!glob) return false;
  return String(glob)
    .split(/[\s,{}]+/)
    .some((part) => {
      const name = basename(part);
      if (!/^\.env/i.test(name)) return false;
      if (ALLOWED.has(name.toLowerCase())) return false;
      return true; // ".env", ".env.local", ".env*", ".env.*" ...
    });
}

// Any .env-style token in a shell command, e.g. `cat .env`, `less "src/frontend/.env.local"`,
// `grep KEY ./.env.production`, `cp .env /tmp`.
function commandTouchesSecret(command) {
  const tokens = String(command).match(/[^\s'"`;|&<>()=]*\.env[^\s'"`;|&<>()]*/gi) ?? [];
  return tokens.some((token) => {
    const name = basename(token);
    if (!/^\.env/i.test(name)) return false; // e.g. "process.env" or "my.envelope"
    if (ALLOWED.has(name.toLowerCase())) return false;
    return /^\.env([.*?[].*)?$/i.test(name); // ".env", ".env.local", ".env*"
  });
}

function check(toolName, input) {
  switch (toolName) {
    case "Read":
    case "Edit":
    case "Write":
    case "NotebookEdit":
      return isSecretPath(input.file_path ?? input.notebook_path);
    case "Grep":
      return isSecretPath(input.path) || isSecretGlob(input.glob);
    case "Bash":
    case "PowerShell":
      return commandTouchesSecret(input.command ?? "");
    default:
      return false;
  }
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.stderr.write("block-env-files: could not parse the hook input; blocking to be safe.\n");
    process.exit(2);
  }

  if (check(payload.tool_name, payload.tool_input ?? {})) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: REASON,
        },
      }),
    );
  }
  process.exit(0);
});
