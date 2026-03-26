const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const { app, BrowserWindow, dialog } = require("electron");

const { toSqliteFileUrl } = require("../scripts/runtime-paths.cjs");

let mainWindow = null;
let serverProcess = null;
let serverUrl = null;
let isQuitting = false;

function getStandaloneRoot() {
  return path.resolve(__dirname, "..", ".next", "standalone");
}

function getServerEntry() {
  return path.join(getStandaloneRoot(), "server.js");
}

function getMigrationScript() {
  return path.join(getStandaloneRoot(), "scripts", "apply-prisma-migrations.cjs");
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  try {
    return JSON.parse(await fsp.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function ensureDesktopRuntimeConfig() {
  const userDataDir = app.getPath("userData");
  const prismaDir = path.join(userDataDir, "prisma");
  const storageDir = path.join(userDataDir, "storage");
  const configPath = path.join(userDataDir, "config", "runtime.json");

  await Promise.all([ensureDir(userDataDir), ensureDir(prismaDir), ensureDir(storageDir)]);

  const currentConfig = (await readJson(configPath)) ?? {};
  const appSecret =
    typeof currentConfig.appSecret === "string" && currentConfig.appSecret.length >= 12
      ? currentConfig.appSecret
      : crypto.randomBytes(32).toString("hex");

  const nextConfig = {
    appSecret,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(configPath, nextConfig);

  return {
    userDataDir,
    prismaDir,
    storageDir,
    databasePath: path.join(prismaDir, "dev.db"),
    appSecret,
  };
}

function getRuntimeEnv(runtime, port) {
  return {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    APP_RUNTIME: "desktop",
    APP_USER_DATA_DIR: runtime.userDataDir,
    DATABASE_URL: toSqliteFileUrl(runtime.databasePath),
    STORAGE_ROOT: runtime.storageDir,
    APP_SECRET: runtime.appSecret,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "banana-mall",
  };
}

function spawnNodeScript(scriptPath, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: getStandaloneRoot(),
      env: {
        ...env,
        ELECTRON_RUN_AS_NODE: "1",
      },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    let stdout = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || stdout || `Script failed with exit code ${code}`));
      }
    });
  });
}

function findAvailablePort(preferredPort = 3000, maxAttempts = 20) {
  const tryPort = (port, remaining) =>
    new Promise((resolve, reject) => {
      const tester = net.createServer();

      tester.once("error", (error) => {
        tester.close();
        if (remaining <= 0) {
          reject(error);
          return;
        }
        resolve(tryPort(port + 1, remaining - 1));
      });

      tester.once("listening", () => {
        const address = tester.address();
        tester.close(() => {
          if (typeof address === "object" && address && typeof address.port === "number") {
            resolve(address.port);
            return;
          }
          resolve(port);
        });
      });

      tester.listen(port, "127.0.0.1");
    });

  return tryPort(preferredPort, maxAttempts);
}

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if ((response.statusCode ?? 500) < 500) {
          resolve(true);
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Server health check failed with status ${response.statusCode}`));
          return;
        }

        setTimeout(attempt, 500);
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Timed out waiting for local desktop server to start."));
          return;
        }
        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

async function startNextServer(runtime) {
  const serverEntry = getServerEntry();
  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Missing Next standalone server entry: ${serverEntry}`);
  }

  const port = await findAvailablePort(3000);
  const env = getRuntimeEnv(runtime, port);

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: getStandaloneRoot(),
    env: {
      ...env,
      ELECTRON_RUN_AS_NODE: "1",
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverErrors = "";

  serverProcess.stderr.on("data", (chunk) => {
    serverErrors += chunk.toString();
  });

  serverProcess.on("exit", (code) => {
    if (!isQuitting && code !== 0) {
      dialog.showErrorBox(
        "banana-mall 启动失败",
        serverErrors || `内置服务异常退出，退出码：${code}`,
      );
      app.quit();
    }
  });

  serverUrl = `http://127.0.0.1:${port}`;
  await waitForServer(serverUrl);
  return serverUrl;
}

function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1520,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f5f5f5",
    title: "banana-mall",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow.loadURL(url);
}

async function shutdownServerProcess() {
  if (!serverProcess || serverProcess.killed) {
    return;
  }

  await new Promise((resolve) => {
    const currentProcess = serverProcess;
    currentProcess.once("exit", () => resolve(null));
    currentProcess.kill();
    setTimeout(() => {
      if (!currentProcess.killed) {
        currentProcess.kill("SIGKILL");
      }
      resolve(null);
    }, 3000);
  });
}

async function bootstrapDesktopApp() {
  const runtime = await ensureDesktopRuntimeConfig();
  await spawnNodeScript(getMigrationScript(), getRuntimeEnv(runtime, 3000));
  const url = await startNextServer(runtime);
  await createMainWindow(url);
}

app.on("before-quit", async () => {
  isQuitting = true;
  await shutdownServerProcess();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (!mainWindow && serverUrl) {
    await createMainWindow(serverUrl);
  }
});

app.whenReady().then(() => {
  bootstrapDesktopApp().catch((error) => {
    dialog.showErrorBox(
      "banana-mall 启动失败",
      error instanceof Error ? error.message : "未知错误",
    );
    app.quit();
  });
});
