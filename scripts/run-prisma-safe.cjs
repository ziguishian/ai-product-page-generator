const { spawn } = require("child_process");
const path = require("path");

const { ensureSafeWorkdir } = require("./safe-workdir.cjs");

const projectRoot = path.resolve(__dirname, "..");
const safeCwd = ensureSafeWorkdir(projectRoot);
const prismaBin = path.join(safeCwd, "node_modules", "prisma", "build", "index.js");

const child = spawn(process.execPath, [prismaBin, ...process.argv.slice(2)], {
  cwd: safeCwd,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
