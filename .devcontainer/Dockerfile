FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Make build args available inside the build stage (so RUN can reference them)
ARG USERNAME="vscode"
ARG USER_UID=1000
ARG USER_GID=1000
ARG PLAYWRIGHT_VERSION=1.57.0

# Install OS packages required for building native modules and node-gyp on Linux
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  build-essential \
  python3 \
  python3-dev \
  python3-pip \
  pkg-config \
  ca-certificates \
  git \
  # Playwright browsers require several OS libraries. Install them here so the container
  # doesn't need manual sudo steps at runtime.
  libnspr4 \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxkbcommon0 \
  libatspi2.0-0 \
  # GTK / UI libs required by Playwright browsers
  libxcursor1 \
  libgtk-3-0 \
  # Debian/Ubuntu recently replaced libgdk-pixbuf2.0-0 with libgdk-pixbuf-xlib-2.0-0
  # Use the newer package name which is available on recent distributions
  libgdk-pixbuf-xlib-2.0-0 \
  libxss1 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Make sure `python` resolves so tools that expect `python` (node-gyp, etc.) find it
RUN if [ ! -e /usr/bin/python ]; then ln -s /usr/bin/python3 /usr/bin/python; fi

# Use corepack to install pnpm
RUN corepack enable

WORKDIR /workspaces/react-amphi

ENV PNPM_HOME="/home/${USERNAME}/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PLAYWRIGHT_BROWSERS_PATH="/home/${USERNAME}/.cache/ms-playwright"

# Ensure the '${USERNAME}' user exists in the final image. Some base images may not
# include the account; the devcontainer tooling expects this user to be present
# so it can set up the environment and UID mapping correctly.
RUN set -euo pipefail \
  && if ! id -u "$USERNAME" >/dev/null 2>&1; then \
  # Try to create the group if it doesn't exist (allow existing group)
  if ! getent group "$USER_GID" >/dev/null 2>&1; then \
  groupadd --gid "$USER_GID" "$USERNAME" 2>/dev/null || true; \
  fi; \
  # Try to create user with specific UID/GID; if that fails (e.g. UID already taken),
  # fall back to a normal useradd so a user account exists.
  if ! useradd --uid "$USER_UID" --gid "$USER_GID" -m -s /bin/bash "$USERNAME" 2>/dev/null; then \
  useradd -m -s /bin/bash "$USERNAME" 2>/dev/null || true; \
  fi; \
  fi \
  && mkdir -p "/home/$USERNAME/.local/share/pnpm" \
  # Only chown if the user now exists (protect against run-time failures)
  && if id -u "$USERNAME" >/dev/null 2>&1; then chown -R "$USERNAME:$USERNAME" "/home/$USERNAME" || true; fi

# Install Playwright system dependencies and only the Chromium browser during image build
# We pin Playwright to the version used by the workspace tests so install steps are deterministic.
# This avoids running the full `playwright install` for all browsers at container start.
RUN set -euo pipefail \
  # Install Playwright using pnpm (corepack enabled above) so we avoid using npm in the container
  && pnpm add -g playwright@${PLAYWRIGHT_VERSION} >/dev/null 2>&1 || true \
  # Run the Playwright installer binary (available on PATH via PNPM_HOME) to install Chromium and deps
  && playwright install --with-deps chromium || true \
  # Copy Playwright browser cache from root (build-time) to the user's cache
  && if [ -d "/root/.cache/ms-playwright" ]; then mkdir -p /home/${USERNAME}/.cache/ms-playwright && cp -a /root/.cache/ms-playwright/. /home/${USERNAME}/.cache/ms-playwright || true; fi \
  && if id -u "${USERNAME}" >/dev/null 2>&1; then chown -R "${USERNAME}:${USERNAME}" /home/${USERNAME}/.cache/ms-playwright || true; fi

RUN set -euo pipefail \
  # Ensure the user's runtime cache folders exist and are writable so
  # runtime commands (postCreateCommand) that run as the given user won't hit EACCES.
  && mkdir -p /home/${USERNAME}/.cache/node /home/${USERNAME}/.cache/ms-playwright /home/${USERNAME}/.local/share/pnpm \
  && chown -R "${USERNAME}:${USERNAME}" /home/${USERNAME}/.cache /home/${USERNAME}/.local || true
