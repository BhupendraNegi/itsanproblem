# shellcheck shell=bash
#
# SOPS env loader (ported from the `code` project). Sourced by bin/setup and
# bin/docker. Decrypts the given secrets/*.yml with sops and exports each leaf
# as UPPERCASE_UNDERSCORE_PATH=value into the current shell. Caller-set values
# are preserved (skip-if-set), so an env var is never clobbered by a loader call.
#
# Usage (from another bash script):
#
#   source "$REPO_ROOT/bin/_sops_env.sh"
#   sops_load_into_env "$REPO_ROOT/secrets/development.yml"
#
# Behaviour:
#   - Returns 0 (no-op) if the file is absent, sops/yq are missing,
#     SOPS_AGE_KEY_FILE can't be resolved, or decrypt fails. The caller
#     decides whether that's fatal — most loaders treat it as soft.
#   - Defaults SOPS_AGE_KEY_FILE to ~/.config/sops/age/keys.txt when unset.
#   - Flattens nested yaml: `sops -d | yq -o=props | awk`.

sops_load_into_env() {
  local file="$1"
  [ -f "$file" ] || return 0
  command -v sops >/dev/null 2>&1 || return 0
  command -v yq   >/dev/null 2>&1 || return 0

  if [ -z "${SOPS_AGE_KEY_FILE:-}" ] && [ -r "$HOME/.config/sops/age/keys.txt" ]; then
    export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/keys.txt"
  fi

  local decrypted
  decrypted=$(sops -d "$file" 2>/dev/null) || return 0

  local line key value
  while IFS= read -r line; do
    key="${line%%=*}"
    value="${line#*=}"
    [ -n "${!key:-}" ] && continue
    export "$key"="$value"
  done < <(printf '%s\n' "$decrypted" | yq -o=props \
    | awk -F' = ' '/ = / {n=split($1,a,"."); k=""; for(i=1;i<=n;i++){k=(i==1?toupper(a[i]):k"_"toupper(a[i]))}; print k"="$2}')
}
