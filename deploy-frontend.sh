#!/bin/bash
#
# deploy-frontend.sh — Build & deploy the Afya Yako React frontend correctly.
#
# Why this exists: the frontend used to be copied by hand, which flattened the
# Vite `assets/` folder and left index.html pointing at JS/CSS files that did
# not exist -> blank page. This script copies the build output as a whole tree
# and then VERIFIES every asset index.html references actually exists, aborting
# loudly if anything is missing. That verification is what makes it safe.
#
# Staging-first workflow:
#   ./deploy-frontend.sh staging              # build + deploy to staging, test it
#   ./deploy-frontend.sh production --no-build # promote the SAME build to live
#
# Usage:
#   ./deploy-frontend.sh [staging|production] [--no-build]
#     target defaults to "production"
#     --no-build deploys the existing dist/ as-is (use it to promote staging->prod)
#
set -euo pipefail

# ---- target selection ------------------------------------------------------
TARGET="production"
NOBUILD=0
for arg in "$@"; do
  case "$arg" in
    staging|production) TARGET="$arg" ;;
    --no-build)         NOBUILD=1 ;;
    *) echo "Unknown argument: $arg" >&2
       echo "Usage: $0 [staging|production] [--no-build]" >&2; exit 2 ;;
  esac
done

case "$TARGET" in
  staging)    DEST="/home/qnztnquh/staging.afyayako.co.ke"; URL="https://staging.afyayako.co.ke/" ;;
  production) DEST="/home/qnztnquh/public_html";            URL="https://afyayako.co.ke/" ;;
esac

# ---- paths -----------------------------------------------------------------
FRONTEND_DIR="/home/qnztnquh/fe_build/frontend"
DIST_DIR="$FRONTEND_DIR/dist"
NODE_BIN="/opt/alt/alt-nodejs20/root/usr/bin"
STAMP="$(date +%Y%m%d-%H%M%S)"

# Files in dist/ that must NOT overwrite their production counterparts.
# The production .htaccess handles /api routing + SPA fallback; the one Vite
# ships from public/ is a stripped-down placeholder.
PRESERVE=(".htaccess")

log() { printf '  %s\n' "$*"; }
die() { printf '\n[ABORT] %s\n' "$*" >&2; exit 1; }

echo "════════════════════════════════════════════════════"
echo "  Afya Yako frontend deploy -> $TARGET  ($STAMP)"
echo "  dest: $DEST"
echo "════════════════════════════════════════════════════"
[ -d "$DEST" ] || die "target docroot not found: $DEST"

# ---- 1. build --------------------------------------------------------------
if [ "$NOBUILD" != "1" ]; then
  echo
  echo "Step 1: Building frontend (vite)..."
  export PATH="$NODE_BIN:$PATH"
  # Thread-limiting matters on this CloudLinux/CageFS host: the LVE caps
  # processes/threads, and esbuild dies with "failed to create new OS thread"
  # if it spawns too many. GOMAXPROCS + UV_THREADPOOL_SIZE keep it under the cap.
  # --minify false avoids the memory-hungry minifier. Do NOT pkill esbuild here:
  # it kills the running build's own esbuild service.
  export GOMAXPROCS=1 UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=1536"
  cd "$FRONTEND_DIR"

  built=0
  for i in $(seq 1 6); do
    rm -rf "$DIST_DIR"
    if timeout 240 npx vite build --minify false >/home/qnztnquh/fe_build/build.log 2>&1 && [ -f "$DIST_DIR/index.html" ]; then
      log "build succeeded on attempt $i"
      built=1
      break
    fi
    log "build attempt $i failed, retrying..."
    sleep 3
  done
  [ "$built" = "1" ] || die "vite build failed after 6 attempts (see fe_build/build.log)"
else
  echo
  echo "Step 1: Skipping build (--no-build); using existing dist/"
fi

# ---- 2. validate the build output ------------------------------------------
echo
echo "Step 2: Validating build output..."
[ -d "$DIST_DIR" ]            || die "dist/ not found: $DIST_DIR"
[ -f "$DIST_DIR/index.html" ] || die "dist/index.html missing"
[ -d "$DIST_DIR/assets" ]     || die "dist/assets/ missing — build is incomplete"

# Every local asset that the freshly-built index.html references must exist
# inside dist/ BEFORE we deploy. Catches a broken/partial build early.
REFS_FILE="$(mktemp)"
trap 'rm -f "$REFS_FILE" "${LIVE_FILE:-}"' EXIT
grep -oE '"/[^"]+\.(js|css|png|svg|jpe?g|json|ico|webmanifest)"' "$DIST_DIR/index.html" | tr -d '"' | sort -u > "$REFS_FILE"
[ -s "$REFS_FILE" ] || die "index.html references no local assets — something is wrong"
count=0
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  [ -f "$DIST_DIR$ref" ] || die "build references $ref but it is missing from dist/"
  count=$((count+1))
done < "$REFS_FILE"
log "build references $count local asset(s), all present in dist/"

# ---- 3. back up current frontend (for rollback) ----------------------------
echo
echo "Step 3: Backing up current frontend..."
BACKUP="/home/qnztnquh/.fe-backups/$TARGET-$STAMP"
mkdir -p "$BACKUP"
[ -f "$DEST/index.html" ] && cp -a "$DEST/index.html" "$BACKUP/" || true
[ -d "$DEST/assets" ]     && cp -a "$DEST/assets" "$BACKUP/"     || true
log "backup at $BACKUP"

# ---- 4. deploy -------------------------------------------------------------
echo
echo "Step 4: Deploying dist/ -> public_html/ ..."

# assets/ is fully hashed -> replace wholesale so stale bundles never linger.
rm -rf "$DEST/assets"
cp -a "$DIST_DIR/assets" "$DEST/assets"
log "replaced assets/"

# Copy every other top-level item from dist/, preserving protected files.
shopt -s dotglob nullglob
for item in "$DIST_DIR"/*; do
  name="$(basename "$item")"
  [ "$name" = "assets" ] && continue
  skip=0
  for keep in "${PRESERVE[@]}"; do [ "$name" = "$keep" ] && skip=1; done
  if [ "$skip" = "1" ]; then
    log "preserved existing: $name"
    continue
  fi
  cp -a "$item" "$DEST/"
  log "copied: $name"
done
shopt -u dotglob nullglob

# ---- 5. post-deploy verification (the safety net) --------------------------
echo
echo "Step 5: Verifying deployed assets resolve on disk..."
LIVE_FILE="$(mktemp)"
grep -oE '"/[^"]+\.(js|css|png|svg|jpe?g|json|ico|webmanifest)"' "$DEST/index.html" | tr -d '"' | sort -u > "$LIVE_FILE"
missing=0
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  if [ -f "$DEST$ref" ]; then
    log "OK   $ref"
  else
    log "MISS $ref"
    missing=$((missing+1))
  fi
done < "$LIVE_FILE"

if [ "$missing" -gt 0 ]; then
  echo
  echo "Rolling back frontend from backup..."
  [ -f "$BACKUP/index.html" ] && cp -a "$BACKUP/index.html" "$DEST/index.html"
  [ -d "$BACKUP/assets" ] && { rm -rf "$DEST/assets"; cp -a "$BACKUP/assets" "$DEST/assets"; }
  die "$missing asset(s) missing after deploy — rolled back. Site left as it was."
fi

echo
echo "════════════════════════════════════════════════════"
echo "  ✅ Frontend deployed to $TARGET and verified"
echo "  URL: $URL"
echo "  Backup: $BACKUP"
echo "════════════════════════════════════════════════════"
