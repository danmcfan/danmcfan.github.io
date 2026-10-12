import tailwindcss from "@tailwindcss/vite";
import devtools from "solid-devtools/vite";
import { createLogger, defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// A build that warns fails: CI and `bun run check` treat warnings as errors.
const logger = createLogger();
const warn = logger.warn;
logger.warn = (message, options) => {
  warn(message, options);
  if (process.argv.includes("build")) process.exitCode = 1;
};

export default defineConfig({
  customLogger: logger,
  plugins: [devtools(), solidPlugin(), tailwindcss()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    // three.js and cannon-es live in a lazily loaded dice chunk (~160 kB gzip).
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      onwarn(warning) {
        throw new Error(`Rollup warning: ${warning.message}`);
      },
    },
  },
});
