#!/bin/bash

set -euo pipefail

# Configuration
PROJECT_ID="sprolo"
SERVICE_NAME="sprolo"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}-app:latest"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_TEMPLATE="${ROOT_DIR}/app.template.yaml"
APP_YAML="${ROOT_DIR}/app.yaml"

yaml_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

collect_env_keys() {
  awk -F= '
    /^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=/ {
      key = $1
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
      if (!seen[key]++) print key
    }
  ' "$@"
}

generate_app_yaml() {
  local env_files=()
  local env_block=""
  local key
  local value
  local tmp_file

  if [[ -f "${ROOT_DIR}/.env" ]]; then
    env_files+=("${ROOT_DIR}/.env")
  fi

  if [[ -f "${ROOT_DIR}/.env.local" ]]; then
    env_files+=("${ROOT_DIR}/.env.local")
  fi

  if [[ ${#env_files[@]} -gt 0 ]]; then
    set -a
    # shellcheck disable=SC1091
    [[ -f "${ROOT_DIR}/.env" ]] && . "${ROOT_DIR}/.env"
    # shellcheck disable=SC1091
    [[ -f "${ROOT_DIR}/.env.local" ]] && . "${ROOT_DIR}/.env.local"
    set +a

    while IFS= read -r key; do
      [[ -z "${key}" ]] && continue
      value="${!key-}"
      env_block+="            - name: ${key}"$'\n'
      env_block+="              value: \"$(yaml_escape "${value}")\""$'\n'
    done < <(collect_env_keys "${env_files[@]}")
  fi

  tmp_file="$(mktemp)"
  awk -v env_block="${env_block}" '
    /__ENV_BLOCK__/ {
      printf "%s", env_block
      next
    }
    { print }
  ' "${APP_TEMPLATE}" > "${tmp_file}"

  mv "${tmp_file}" "${APP_YAML}"
  echo "📝 Generated ${APP_YAML}"
}

echo "🚀 Starting deployment for ${SERVICE_NAME} to Google Cloud Run..."

echo "🧩 Generating app.yaml from template..."
generate_app_yaml

# 1. Build the image using Cloud Build
echo "📦 Building Docker image using Cloud Build..."
gcloud builds submit --tag ${IMAGE_NAME} --project ${PROJECT_ID} .

# 2. Deploy using the app.yaml (Service YAML)
echo "🚀 Deploying service using app.yaml..."
# Correct command for YAML-based deployment is 'gcloud run services replace'
gcloud run services replace app.yaml --region ${REGION} --project ${PROJECT_ID}

# 3. Ensure the service is public (optional, remove if you want it private)
echo "🔓 Making service public..."
gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
    --region ${REGION} \
    --member="allUsers" \
    --role="roles/run.invoker" \
    --project ${PROJECT_ID}

echo "✅ Deployment complete!"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID} --format='value(status.url)'
