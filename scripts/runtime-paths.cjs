const path = require("path");

function normalizeWindowsPath(inputPath) {
  return inputPath.replace(/\\/g, "/");
}

function isWindowsAbsolutePath(targetPath) {
  return /^[A-Za-z]:[\\/]/.test(targetPath);
}

function stripFilePrefix(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Only sqlite file URLs are supported. Received: ${databaseUrl}`);
  }

  let rawPath = databaseUrl.slice("file:".length);
  if (/^\/[A-Za-z]:\//.test(rawPath)) {
    rawPath = rawPath.slice(1);
  }
  return rawPath;
}

function resolveSqliteDatabasePath(databaseUrl, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const defaultBaseDir = options.defaultBaseDir ?? path.resolve(cwd, "prisma");
  const rawPath = stripFilePrefix(databaseUrl);

  if (path.isAbsolute(rawPath) || isWindowsAbsolutePath(rawPath)) {
    return path.resolve(rawPath);
  }

  return path.resolve(defaultBaseDir, rawPath);
}

function toSqliteFileUrl(databasePath) {
  const absolutePath = path.resolve(databasePath);
  return `file:${normalizeWindowsPath(absolutePath)}`;
}

module.exports = {
  resolveSqliteDatabasePath,
  toSqliteFileUrl,
};
