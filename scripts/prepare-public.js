#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const dirs = ["assets", "data", "tools", "icons"];
const files = ["manifest.webmanifest", "CNAME"];

if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });

dirs.forEach((d) => {
  const src = path.join(ROOT, d);
  const dest = path.join(PUBLIC, d);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log("Copied:", d);
  }
});

files.forEach((f) => {
  const src = path.join(ROOT, f);
  const dest = path.join(PUBLIC, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Copied:", f);
  }
});
