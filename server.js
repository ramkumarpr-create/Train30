"use strict";
/* ---------------------------------------------------------------------------
   Azutva — Express server.
   Serves the frontend and the /api/* REST backend.
--------------------------------------------------------------------------- */
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const { load, ROOT } = require("./src/store");
const { seedIfEmpty } = require("./src/seed");
const { registerRoutes } = require("./src/routes");

load();
const seeded = seedIfEmpty();

const app = express();
app.disable("x-powered-by");
// Register modern image formats so .avif/.webp are served with the right MIME type.
express.static.mime.define({ "image/avif": ["avif"], "image/webp": ["webp"] });
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

/* ---------------- API ---------------- */
registerRoutes(app);
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

/* ---------------- Static frontend ---------------- */
app.use("/css", express.static(path.join(ROOT, "css")));
app.use("/js", express.static(path.join(ROOT, "js")));
app.use("/assets", express.static(path.join(ROOT, "assets")));

const pages = [
  "index.html",
  "3d-printing-services.html",
  "cnc-machining.html",
  "materials.html",
  "about.html",
  "faq.html",
  "contact.html",
  "admin.html"
];
app.get("/", (_req, res) => res.sendFile(path.join(ROOT, "index.html")));
pages.forEach((p) => {
  app.get("/" + p, (_req, res) => res.sendFile(path.join(ROOT, p)));
});

/* ---------------- Error handling ---------------- */
app.use((err, _req, res, _next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  if (err && (err.name === "MulterError" || (err.code && String(err.code).startsWith("LIMIT_")))) {
    return res.status(400).json({ error: "Upload error: " + (err.message || err.code) });
  }
  if (err && err.status) {
    return res.status(err.status).json({ error: err.message || "Error" });
  }
  console.error("[server]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
  console.log("Azutva listening on http://localhost:" + PORT);
  console.log("  Store:  " + seeded.products + " products, " + seeded.users + " user(s)");
  console.log("  Admin:  http://localhost:" + PORT + "/admin.html  (admin@azutva.com / admin123)");
});
