import app from "./.output/server/index.mjs";
import { join } from "path";
import { existsSync, statSync } from "fs";

const PORT = Number(process.env.PORT) || 8080;
const PUBLIC_DIR = join(process.cwd(), ".output/public");

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const decodedPath = decodeURIComponent(url.pathname);
    const filePath = join(PUBLIC_DIR, decodedPath);

    // Serve static file if it exists in .output/public
    if (decodedPath !== "/" && existsSync(filePath)) {
      try {
        if (statSync(filePath).isFile()) {
          return new Response(Bun.file(filePath));
        }
      } catch {}
    }

    // SSR request handler with Cloudflare ASSETS shim for Nitro
    return app.fetch(req, {
      ASSETS: {
        fetch: async (r) => {
          const u = new URL(r.url);
          const f = join(PUBLIC_DIR, decodeURIComponent(u.pathname));
          if (existsSync(f) && statSync(f).isFile()) {
            return new Response(Bun.file(f));
          }
          return new Response("Not found", { status: 404 });
        }
      }
    });
  }
});

console.log(`Radar do Rolê production server running on http://0.0.0.0:${PORT}`);
