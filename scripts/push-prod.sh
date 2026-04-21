#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# push-prod.sh  ·  Production deploy for BeyondPath
# ------------------------------------------------------------------------------
# 把 local app.html + index.html 推到 production。
# 預設路徑 B (GitHub Pages)，即 beyondspec.tw/path/。
# 備用路徑 A (Vercel prod)，用 USE_VERCEL_PROD=1 觸發。
#
# 守門：必須先跑 scripts/preview-deploy.sh 拿 preview URL，讓愛德華審過，
# 主對話蘇菲才 set PREVIEW_APPROVED=1 執行此 script。
#
# 使用範例：
#   PREVIEW_APPROVED=1 bash scripts/push-prod.sh
#   PREVIEW_APPROVED=1 USE_VERCEL_PROD=1 bash scripts/push-prod.sh
#   PREVIEW_APPROVED=1 VERSION=v1.0.9 bash scripts/push-prod.sh
#
# 環境變數：
#   PREVIEW_APPROVED   必填。=1 表示愛德華已審過 preview URL
#   USE_VERCEL_PROD    選填。=1 走 Vercel prod，否則走 GitHub Pages
#   GITHUB_PAT         GitHub Pages 路徑必填
#   VERSION            選填。commit message 的版號
#   COMMIT_MSG         選填。自訂 commit message
# ------------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/deploy/beyondpath-app"
APP_SRC="$REPO_ROOT/app.html"
LANDING_SRC="$REPO_ROOT/index.html"
LAST_URL_FILE="$REPO_ROOT/scripts/.last-preview-url"

if [ "${PREVIEW_APPROVED:-0}" != "1" ]; then
  echo "" >&2
  echo "ERROR · PREVIEW_APPROVED 未設為 1。" >&2
  echo "" >&2
  echo "此 script 的設計流程：" >&2
  echo "  1. 主對話蘇菲先跑 scripts/preview-deploy.sh" >&2
  echo "  2. 把 preview URL 交給愛德華實機審" >&2
  echo "  3. 愛德華口頭確認 OK" >&2
  echo "  4. 主對話蘇菲才能執行：" >&2
  echo "       PREVIEW_APPROVED=1 bash scripts/push-prod.sh" >&2
  echo "" >&2
  echo "不接受未審就 push prod。若真的要跳過 (緊急 hotfix)，" >&2
  echo "主對話蘇菲要在回應中明確寫清楚跳過理由，再手動 set PREVIEW_APPROVED=1。" >&2
  echo "" >&2
  exit 2
fi

echo ""
echo "================================================================"
echo " BeyondPath · Production Deploy"
echo "================================================================"
echo " Repo root   : $REPO_ROOT"
if [ "${USE_VERCEL_PROD:-0}" = "1" ]; then
  echo " 路徑選擇    : A. Vercel prod"
else
  echo " 路徑選擇    : B. GitHub Pages (default)"
fi
if [ -f "$LAST_URL_FILE" ]; then
  echo " 上次 preview: $(cat "$LAST_URL_FILE")"
fi
echo "----------------------------------------------------------------"

if [ ! -f "$APP_SRC" ]; then
  echo "ERROR · app.html 不存在：$APP_SRC"
  exit 1
fi

if [ -z "${VERSION:-}" ]; then
  VERSION=$(grep -oE "sidebar-version[^>]*>[^<]*v[0-9]+\.[0-9]+\.[0-9]+" "$APP_SRC" | grep -oE "v[0-9]+\.[0-9]+\.[0-9]+" | head -1 || true)
  if [ -z "$VERSION" ]; then
    VERSION="vUNKNOWN"
    echo "WARN · 無法從 app.html sidebar-version 偵測版號"
  fi
fi
COMMIT_MSG="${COMMIT_MSG:-${VERSION}: production deploy}"
echo " 版號        : $VERSION"
echo " Commit msg  : $COMMIT_MSG"
echo "----------------------------------------------------------------"

deploy_vercel_prod() {
  echo "[Vercel prod] 檢查 CLI..."
  if ! command -v vercel >/dev/null 2>&1; then
    echo "ERROR · vercel CLI 未安裝"
    exit 127
  fi

  if [ ! -d "$DEPLOY_DIR" ] || [ ! -f "$DEPLOY_DIR/.vercel/project.json" ]; then
    echo "ERROR · $DEPLOY_DIR 未連接 Vercel project"
    exit 1
  fi

  mkdir -p "$DEPLOY_DIR/path/app"

  # v1.3.19 deploy guards (同 GitHub Pages)
  if ! grep -q 'class="sidebar-version"' "$APP_SRC"; then
    echo "ERROR · APP_SRC 不像 app.html。拒絕部署。" >&2; exit 10
  fi
  APP_SIZE=$(wc -c < "$APP_SRC")
  if [ "$APP_SIZE" -lt 500000 ]; then
    echo "ERROR · APP_SRC 異常小（${APP_SIZE} bytes）。拒絕部署。" >&2; exit 11
  fi
  cp -f "$APP_SRC" "$DEPLOY_DIR/path/app/index.html"
  echo "[Vercel prod] app.html -> path/app/index.html ($(wc -c < "$DEPLOY_DIR/path/app/index.html") bytes)"

  if [ -f "$LANDING_SRC" ]; then
    LANDING_SIZE=$(wc -c < "$LANDING_SRC")
    if ! grep -q 'screen-welcome\|welcome-screen\|bpSubmitApply' "$LANDING_SRC"; then
      echo "ERROR · LANDING_SRC 不像 landing。拒絕部署 path/index.html。" >&2; exit 12
    fi
    if [ "$LANDING_SIZE" -gt 102400 ]; then
      echo "ERROR · LANDING_SRC 超過 100KB（疑似被 app.html 覆蓋）。拒絕部署。" >&2; exit 13
    fi
    cp -f "$LANDING_SRC" "$DEPLOY_DIR/path/index.html"
    echo "[Vercel prod] index.html -> path/index.html (${LANDING_SIZE} bytes)"
  fi

  # Post-deploy sanity
  FINAL_LANDING_SIZE=$(wc -c < "$DEPLOY_DIR/path/index.html" 2>/dev/null || echo 0)
  if [ "$FINAL_LANDING_SIZE" -gt 204800 ]; then
    echo "FATAL · path/index.html 部署後超過 200KB。abort push。" >&2; exit 14
  fi

  cd "$DEPLOY_DIR"
  echo "[Vercel prod] vercel --prod --yes ..."
  VERCEL_OUT=$(mktemp)
  vercel --prod --yes 2>&1 | tee "$VERCEL_OUT"
  PROD_URL=$(grep -oE "https://[a-zA-Z0-9.-]+\.vercel\.app" "$VERCEL_OUT" | tail -1 || true)
  rm -f "$VERCEL_OUT"

  echo ""
  echo "================================================================"
  if [ -n "$PROD_URL" ]; then
    echo " Vercel prod URL: $PROD_URL"
  else
    echo " Vercel prod URL: <see log above>"
  fi
  echo "================================================================"
}

deploy_github_pages() {
  echo "[GitHub Pages] 檢查 git 與 PAT..."

  if ! command -v git >/dev/null 2>&1; then
    echo "ERROR · git 未安裝"
    exit 127
  fi

  if [ -z "${GITHUB_PAT:-}" ]; then
    echo "" >&2
    echo "ERROR · GITHUB_PAT 環境變數未設。" >&2
    echo "" >&2
    echo "此 script 不在原始碼內硬寫 PAT。請主對話蘇菲從 project-level CLAUDE.md" >&2
    echo "部署 SOP 段讀取愛德華的 PAT，然後用：" >&2
    echo "" >&2
    echo "   GITHUB_PAT=ghp_xxxxxxxx \\" >&2
    echo "   PREVIEW_APPROVED=1 bash scripts/push-prod.sh" >&2
    echo "" >&2
    echo "或愛德華親自 export GITHUB_PAT=... 再呼叫 script。" >&2
    echo "" >&2
    exit 3
  fi

  WORK_DIR="/tmp/beyondspec-deploy-$$"
  trap "rm -rf $WORK_DIR" EXIT

  echo "[GitHub Pages] clone repo to $WORK_DIR ..."
  git clone "https://${GITHUB_PAT}@github.com/EdwardTseng33/beyondspec.git" "$WORK_DIR" 2>&1 | sed "s|${GITHUB_PAT}|***PAT***|g"

  cd "$WORK_DIR"

  echo "[GitHub Pages] git fetch origin main 確認無 race..."
  git fetch origin main
  LOCAL_HEAD=$(git rev-parse HEAD)
  REMOTE_HEAD=$(git rev-parse origin/main)
  if [ "$LOCAL_HEAD" != "$REMOTE_HEAD" ]; then
    echo "[GitHub Pages] local behind remote, aligning to origin/main..."
    git reset --hard origin/main
  fi

  mkdir -p path/app

  # ── v1.3.19 deploy guard: app.html 必須是 app（含 sidebar-version），目的地必須是 path/app/ ──
  if ! grep -q 'class="sidebar-version"' "$APP_SRC"; then
    echo "ERROR · APP_SRC 不像是 app.html（找不到 sidebar-version class）。拒絕部署以防誤覆蓋。" >&2
    exit 10
  fi
  APP_SIZE=$(wc -c < "$APP_SRC")
  if [ "$APP_SIZE" -lt 500000 ]; then
    echo "ERROR · APP_SRC 異常小（${APP_SIZE} bytes，預期 >500KB）。可能被 calcifer agent 截斷。拒絕部署。" >&2
    exit 11
  fi
  cp -f "$APP_SRC" path/app/index.html
  echo "[GitHub Pages] app.html -> path/app/index.html ($(wc -c < path/app/index.html) bytes)"

  # ── v1.3.19 landing guard: 絕不允許 >100KB 檔案寫入 path/index.html ──
  if [ -f "$LANDING_SRC" ]; then
    LANDING_SIZE=$(wc -c < "$LANDING_SRC")
    # 正向檢查：landing 必須含 screen-welcome（landing 獨有 class），防止 app.html 被誤認
    if ! grep -q 'screen-welcome\|welcome-screen\|bpSubmitApply' "$LANDING_SRC"; then
      echo "ERROR · LANDING_SRC 不像 landing（找不到 screen-welcome / bpSubmitApply）。拒絕部署 path/index.html。" >&2
      exit 12
    fi
    # 大小 guard：landing 本體約 50-80KB，硬上限 100KB 防 app.html 污染
    if [ "$LANDING_SIZE" -gt 102400 ]; then
      echo "ERROR · LANDING_SRC 超過 100KB（${LANDING_SIZE} bytes）。landing 應為 50-80KB；疑似被 app.html 覆蓋。拒絕部署。" >&2
      exit 13
    fi
    cp -f "$LANDING_SRC" path/index.html
    echo "[GitHub Pages] index.html -> path/index.html (${LANDING_SIZE} bytes)"
  else
    echo "WARN · LANDING_SRC 不存在，跳過 path/index.html 更新"
  fi

  # ── v1.3.19 post-deploy sanity: 確認 path/index.html 不是 app.html（最後防線）──
  FINAL_LANDING_SIZE=$(wc -c < path/index.html)
  if [ "$FINAL_LANDING_SIZE" -gt 204800 ]; then
    echo "FATAL · path/index.html 部署後超過 200KB（${FINAL_LANDING_SIZE} bytes）。極可能被 app.html 污染，立即 abort push。" >&2
    git reset HEAD path/ 2>/dev/null || true
    exit 14
  fi

  for asset in favicon.png favicon.ico apple-touch-icon.png og-image.png screenshot-dashboard.png screenshot-diagnose.png screenshot-dims.png screenshot-radar.png screenshot-score.png; do
    SRC="$REPO_ROOT/$asset"
    DST="path/$asset"
    if [ -f "$SRC" ]; then
      if [ ! -f "$DST" ] || [ "$SRC" -nt "$DST" ]; then
        cp -f "$SRC" "$DST"
        echo "[GitHub Pages] asset sync: $asset"
      fi
    fi
  done

  git config user.email "edwardt0303@gmail.com"
  git config user.name "Edward Tseng"

  if git diff --quiet && git diff --cached --quiet; then
    echo "[GitHub Pages] 無變更，不需 commit"
  else
    git add path/
    COMMIT_BODY="$COMMIT_MSG

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
    git commit -m "$COMMIT_BODY"
    echo "[GitHub Pages] push origin main..."
    git push origin main 2>&1 | sed "s|${GITHUB_PAT}|***PAT***|g"
    echo ""
    echo "================================================================"
    echo " Prod 已更新: https://beyondspec.tw/path/"
    echo "             https://beyondspec.tw/path/app/"
    echo "================================================================"
  fi
}

if [ "${USE_VERCEL_PROD:-0}" = "1" ]; then
  deploy_vercel_prod
else
  deploy_github_pages
fi

echo ""
echo "Prod deploy 完成。"
echo ""
