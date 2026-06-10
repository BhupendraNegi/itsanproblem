# syntax=docker/dockerfile:1
#
# Development image for the itsanproblem Rails API.
#
# This image is built for the `docker compose` dev stack: the working tree is
# bind-mounted over /rails at runtime, while gems live in the image at
# /usr/local/bundle (not overmounted), so `bundle install` is cached across
# code edits. Production deploys go through Kamal with Rails' own prod
# Dockerfile — this file is intentionally dev-shaped, not slimmed for prod.
#
# Keep RUBY_VERSION in sync with backend/.ruby-version.
ARG RUBY_VERSION=4.0.3
FROM docker.io/library/ruby:${RUBY_VERSION}-slim

WORKDIR /rails

# OS packages:
#   build-essential / pkg-config / libyaml-dev  → native gem builds
#   libpq-dev                                   → pg (PostgreSQL client)
#   sqlite3                                      → local SQLite tooling / tests
#   git, curl                                    → bundler git gems, healthchecks
#   libjemalloc2                                 → enabled by bin/docker-entrypoint
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git curl pkg-config \
      libpq-dev libyaml-dev sqlite3 libjemalloc2 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV BUNDLE_PATH=/usr/local/bundle

# Install gems first so a source-only change doesn't bust the bundle layer.
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy the rest of the app (overlaid by the compose bind-mount in dev).
COPY . .

EXPOSE 3000

# docker-entrypoint enables jemalloc; the compose `command` runs db:prepare
# before booting the server.
ENTRYPOINT ["./bin/docker-entrypoint"]
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
