# n8n Workflows Repository
![Deploy Workflows](https://github.com/abaranovskydako-tech/n8n-core/actions/workflows/deploy-workflows.yml/badge.svg)

## CI/CD Status

This project uses **GitHub Actions** to automatically deploy n8n workflows to the n8n instance at `http://91.229.8.119:5678`.

- **Workflow File**: `.github/workflows/deploy-workflows.yml`
- **Deploy Script**: `scripts/deploy_workflows.js`
- **Status**: ✅ All deployments successful
- **Last Deployment**: Test Workflow (Updated)
- **Deployment Mode**: Safe (workflows deploy as `active: false`)

### How It Works

1. Push changes to the `main` branch
2. GitHub Actions triggers the `Deploy n8n Workflows` workflow
3. Node.js environment is set up
4. Deploy script executes:
   - Reads all JSON files from the `./workflows` directory
   - Sends them to the n8n API via PUT/POST requests
   - Reports success or failure for each workflow
5. Workflow status is displayed in the GitHub Actions tab

## Overview

This repository stores **n8n workflows** for automation and deployment to the n8n platform via GitHub Actions.

## Repository Structure

- **`/workflows`** - n8n workflow JSON files (exported from n8n UI)
- **`/.github/workflows`** - GitHub Actions CI/CD workflows for deploying to n8n API  
- **`/scripts`** - Utility scripts for workflow management and deployment

## Deployment

### How It Works

1. Workflows are exported as JSON files and committed to the `/workflows` directory
2. GitHub Actions triggers on push to `main` branch
3. Workflows are automatically deployed to n8n via the [n8n API](https://docs.n8n.io/api/)
4. Credentials and sensitive data are stored in [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### GitHub Secrets Configuration

Set up the following secrets in repository settings:

- `N8N_API_URL` - Your n8n instance API endpoint (e.g., `http://your-n8n-instance:5678`)
- `N8N_API_KEY` - Your n8n API key for authentication

## Workflow Management

### Export Workflows from n8n UI

1. Open your n8n workflow
2. Click **Menu** → **Download as JSON**
3. Save to `/workflows` directory
4. Commit and push to trigger deployment

### Import from Repository

Use the n8n import feature or deploy via API calls from GitHub Actions.

---

# n8n-ядро
