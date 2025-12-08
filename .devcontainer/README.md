# Dev container for react-amphi

This devcontainer is configured for:

- Node 24.x (official devcontainer base)
- bun pinned to the monorepo `packageManager`
- system build tools required by node-gyp (python3, build-essential)

Usage

1. Open this repository in VS Code.
2. Click the green bottom-left "><" (Remote) icon → "Reopen in Container".
3. After the container builds, the post-create hook installs Playwright's Chromium browser. Dependencies are installed at image build time so native modules are compiled for the container OS.
The devcontainer now also installs necessary OS libraries for Playwright and automatically downloads Playwright browser engines so end-to-end tests can run without requiring sudo inside the container. If you're rebuilding an older container you should rebuild the image so these libraries are available.

Quick checks inside the container

```bash
node --version    # should be v24.x
bun --version    # should be 1.x
python --version  # should be Python 3.x
bun install      # quick reproducible install
```

If you hit node-gyp / building errors, the container includes the typical system packages (python3, build-essential). If something is missing, tell me the failing logs and I'll adjust the Dockerfile.

Troubleshooting container image pulls

- If VS Code reports a missing manifest for `mcr.microsoft.com/devcontainers/javascript-node:0-24` (or similar), the registry tag used may not exist for that format.
- This devcontainer uses build arg `VARIANT=24` and the Dockerfile base image is `mcr.microsoft.com/devcontainers/javascript-node:24`. If you prefer a different variant (e.g. `24-bullseye`), edit `.devcontainer/devcontainer.json` build args or change `FROM` in the Dockerfile.
- To force a rebuild from VS Code: Command Palette → "Dev Containers: Rebuild Container" or use the CLI to rebuild.

If you're creating the container for the first time (or after this change) and want Playwright browsers available automatically, rebuild the container — the `postCreateCommand` now installs only Chromium (it sets PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD during install and runs `playwright install chromium`).

If you still see Playwright host validation warnings about missing libraries (e.g. libXcursor, libgtk-3, libgdk-3) after the rebuild, please rebuild the container with a full image rebuild (not just 'reopen'). The Dockerfile now includes GTK / UI packages required for headful or headless browser runs.

Manual rebuild using devcontainers CLI / Docker (macOS example):

```bash
# rebuild via VS Code CLI (devcontainers)
npx @devcontainers/cli up --workspace-folder . --build

# OR with docker directly (simple):
docker build -t react-amphi-dev -f .devcontainer/Dockerfile ..

# then run the image (for quick manual verification)
docker run --rm -it -v "$PWD":/workspaces/react-amphi -w /workspaces/react-amphi react-amphi-dev bash
```
