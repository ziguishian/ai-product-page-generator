const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("bananaMallDesktop", {
  runtime: "desktop",
});
