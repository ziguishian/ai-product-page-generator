const fs = require("fs");
const os = require("os");
const path = require("path");

function getSafeAliasPath() {
  return path.join(os.tmpdir(), "banana-mall-safe-workdir");
}

function ensureSafeWorkdir(targetDir) {
  const aliasPath = getSafeAliasPath();

  if (fs.existsSync(aliasPath)) {
    try {
      const stats = fs.lstatSync(aliasPath);
      if (stats.isSymbolicLink()) {
        const currentTarget = fs.readlinkSync(aliasPath);
        const resolved = path.resolve(path.dirname(aliasPath), currentTarget);
        if (resolved === targetDir) {
          return aliasPath;
        }
      }
      fs.rmSync(aliasPath, { recursive: true, force: true });
    } catch {
      fs.rmSync(aliasPath, { recursive: true, force: true });
    }
  }

  fs.symlinkSync(targetDir, aliasPath, "junction");
  return aliasPath;
}

module.exports = {
  ensureSafeWorkdir,
};
