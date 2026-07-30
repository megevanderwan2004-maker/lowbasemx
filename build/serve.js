#!/usr/bin/env node
/* Serveur statique de prévisualisation pour deploy/.
   Reproduit `cleanUrls: true` de vercel.json : /productos/cirqa sert
   cirqa.html. Sans cette règle, la prévisu locale renvoie 404 sur
   exactement les liens qui fonctionnent en production. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "deploy");
const PORT = Number(process.argv[2]) || 4175;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\.\./g, "");
  let file = path.join(ROOT, clean);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html";
  return file;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url);
    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 " + req.url);
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(buf);
    });
  })
  .listen(PORT, "127.0.0.1", () => console.log("serving " + ROOT + " on http://127.0.0.1:" + PORT));
