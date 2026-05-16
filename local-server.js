const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = __dirname;
const preferredPort = Number(process.env.PORT || 5173);
const shouldOpen = process.argv.includes("--open") && !process.argv.includes("--no-open");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function getLocalPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const requestedPath = path.normalize(path.join(root, cleanPath));

  if (!requestedPath.startsWith(root)) {
    return null;
  }

  return requestedPath;
}

function serveFile(res, filePath) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function openBrowser(url) {
  const command =
    process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.unref();
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const requestedPath = getLocalPath(req.url || "/");

    if (!requestedPath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    fs.stat(requestedPath, (statError, stats) => {
      if (!statError && stats.isDirectory()) {
        serveFile(res, path.join(requestedPath, "index.html"));
        return;
      }

      serveFile(res, requestedPath);
    });
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < preferredPort + 20) {
      startServer(port + 1);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`Local site running at ${url}`);
    console.log("Press Ctrl+C to stop.");

    if (shouldOpen) {
      openBrowser(url);
    }
  });
}

startServer(preferredPort);
