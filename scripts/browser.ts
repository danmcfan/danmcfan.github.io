import { execFileSync } from "node:child_process";

/** Keep in step with @playwright/test in package.json: client and server must match exactly. */
const IMAGE = "mcr.microsoft.com/playwright:v1.64.0-noble";
const CONTAINER = "danmcfan-playwright";
const PORT = 3555;

export const BROWSER_ENDPOINT = process.env.PW_WS_ENDPOINT ?? `ws://127.0.0.1:${PORT}/`;

function docker(...args: string[]) {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

async function reachable() {
  try {
    await fetch(`http://127.0.0.1:${PORT}/`);
    return true;
  } catch {
    return false;
  }
}

/** Start the Linux browser server in Docker unless one is already listening. */
export default async function startBrowser() {
  if (process.env.PW_WS_ENDPOINT || (await reachable())) return;

  if (!docker("ps", "-aq", "--filter", `name=^${CONTAINER}$`)) {
    const version = IMAGE.split(":v")[1]?.split("-")[0];
    docker(
      "run",
      ...["-d", "--rm", "--init", "--ipc=host", "--name", CONTAINER, "-p", `127.0.0.1:${PORT}:${PORT}`],
      ...["--user", "pwuser", "--workdir", "/home/pwuser", IMAGE],
      ...["npx", "-y", `playwright@${version}`, "run-server", "--port", String(PORT), "--host", "0.0.0.0"],
    );
  }

  for (let attempt = 0; attempt < 120; attempt++) {
    if (await reachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Playwright browser server did not start; check \`docker logs ${CONTAINER}\``);
}
