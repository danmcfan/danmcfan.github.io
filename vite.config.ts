import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { createLogger, defineConfig, type Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";

// A build that warns fails: CI and `bun run check` treat warnings as errors.
const logger = createLogger();
const warn = logger.warn;
logger.warn = (message, options) => {
  warn(message, options);
  if (process.argv.includes("build")) process.exitCode = 1;
};

/** Routes in `src/App.tsx` that are linked to directly. Each gets its own copy of the page. */
const ROUTES = ["projects", "blog", "about"];

/** GitHub Pages 404s a path without a file and bounces it through 404.html; a copy per route serves it straight away. */
function routePages(): Plugin {
  let outDir = "";
  return {
    name: "route-pages",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      for (const route of ROUTES) {
        await mkdir(join(outDir, route), { recursive: true });
        await copyFile(join(outDir, "index.html"), join(outDir, route, "index.html"));
      }
    },
  };
}

/** Fonts the header and body text paint with. Preloading them starts the download with the HTML instead of after the app renders. */
const PRELOAD_FONTS = [
  /im-fell-english-sc-latin-400-normal-.*\.woff2$/,
  /jetbrains-mono-latin-400-normal-.*\.woff2$/,
  /source-sans-3-latin-400-normal-.*\.woff2$/,
];

function preloadFonts(): Plugin {
  return {
    name: "preload-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_, ctx) {
        return Object.keys(ctx.bundle ?? {})
          .filter((file) => PRELOAD_FONTS.some((font) => font.test(file)))
          .map((file) => ({
            tag: "link",
            attrs: { rel: "preload", href: `/${file}`, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head",
          }));
      },
    },
  };
}

export default defineConfig({
  customLogger: logger,
  plugins: [devtools(), solidPlugin(), tailwindcss(), routePages(), preloadFonts()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    sourcemap: true,
    // three.js and cannon-es live in a lazily loaded dice chunk (~160 kB gzip).
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      onwarn(warning) {
        throw new Error(`Rollup warning: ${warning.message}`);
      },
    },
  },
});
