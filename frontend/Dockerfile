# syntax=docker/dockerfile:1
#
# Development image for the itsanproblem React + Vite SPA.
#
# Used by the `docker compose` dev stack: the working tree is bind-mounted over
# /app, while node_modules stays in the image (an anonymous volume in compose
# shadows the host path) so installed deps survive the bind-mount.
#
# Keep the Node version in sync with mise.toml.
FROM node:20-bookworm-slim

WORKDIR /app

# Install deps first for layer caching. `npm ci` is reproducible from the lock.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Vite dev server, reachable from the host (and the backend container).
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
