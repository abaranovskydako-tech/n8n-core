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

## 🧭 Architecture Overview & CI/CD Visualization

This section visualizes the n8n CI/CD workflow architecture, showing how workflows are deployed from the GitHub repository to the n8n instance via GitHub Actions automation.

### CI/CD Flow Diagram

```mermaid
graph TD
  A[GitHub Repository<br/>workflows/] -->|Push Commit| B[GitHub Actions<br/>Deploy n8n Workflows]
  B -->|Trigger on push| C{Validate<br/>Workflows}
  C -->|Valid JSON| D[Read Workflow Files]
  C -->|Invalid| E[❌ Fail - Invalid JSON]
  D -->|Extract workflow data| F[Authenticate n8n API]
  F -->|Check if workflow exists| G{Workflow<br/>Already Exists?}
  G -->|No| H[🔹 POST /api/v1/workflows<br/>Create New Workflow]
  G -->|Yes| I[🔹 PUT /api/v1/workflows/:id<br/>Update Existing Workflow]
  H -->|Return workflow.id| J[Set active: false]
  I -->|Return workflow.id| J
  J -->|Save to DB| K{Deployment<br/>Result}
  K -->|Success| L[✅ Workflow Deployed]
  K -->|Failure| M[❌ Error - Report to Logs]
  L -->|Update status| N[GitHub Actions Summary]
  M -->|Update status| N
  N -->|Display Results| O[📊 n8n Instance Updated]

  style A fill:#5f9ff5
  style B fill:#f5a623
  style L fill:#7ed321
  style E fill:#d0021b
  style M fill:#d0021b
```

### Architecture Details

The CI/CD pipeline follows a structured flow for deployment:

1. **Trigger**: Changes pushed to the `main` branch
2. **Validation**: Workflow files are validated as proper JSON format
3. **Authentication**: GitHub Actions authenticates with n8n API using secrets
4. **Detection**: System checks if workflow already exists in n8n instance
5. **Deployment**: 
   - **New Workflow**: Creates via `POST /api/v1/workflows`
   - **Existing Workflow**: Updates via `PUT /api/v1/workflows/:id`
6. **Activation State**: Workflows are deployed with `active: false` for safety
7. **Result**: Deployment status reported in GitHub Actions logs

8. ### 🔍 CI/CD Details

| Component | Description | Technology |
|-----------|-------------|------------|
| **Trigger** | Push to main branch | GitHub Events |
| **Pipeline** | Automated workflow execution | GitHub Actions |
| **Workflow Files** | n8n workflow definitions | JSON format |
| **Deployment Script** | Handles API requests | Node.js |
| **API Endpoint** | n8n instance REST API | HTTP/REST |
| **Authentication** | API key-based security | GitHub Secrets |
| **Error Handling** | Failed deployments logged | GitHub Actions Logs |
| **Status Tracking** | Real-time deployment updates | GitHub Actions UI |

### Status & Links

[![Deploy n8n Workflows](https://github.com/abaranovskydako-tech/n8n-core/actions/workflows/deploy-workflows.yml/badge.svg)](https://github.com/abaranovskydako-tech/n8n-core/actions/workflows/deploy-workflows.yml)

- **Repository**: [n8n-core on GitHub](https://github.com/abaranovskydako-tech/n8n-core)
- **Deployment Script**: [deploy_workflows.js](/scripts/deploy_workflows.js)
- **GitHub Actions Workflow**: [deploy-workflows.yml](/.github/workflows/deploy-workflows.yml)
- **n8n Instance**: [http://91.229.8.119:5678](http://91.229.8.119:5678)
- 
## 🚀 CI/CD ПОЛНОСТЬЮ ФУНКЦИОНИРУЕТ И ГОТОВ К ИСПОЛЬЗОВАНИЮ

Этот проект использует автоматизированный CI/CD-процесс для развёртывания рабочих процессов n8n напрямую из GitHub.
Каждое изменение в `/workflows/*.json` автоматически запускает GitHub Actions,
который обновляет или создаёт workflow в экземпляре n8n через REST API.

```mermaid
flowchart TD
    A[💻 Разработчик фиксит изменения<br/>в workflows/*.json] -->|Push to main| B[⚙️ GitHub Actions<br/>deploy-workflows.yml]
    B --> C[🚟 Node.js Script<br/>scripts/deploy_workflows.js]
    C --> D[🌐 Сервер API n8n<br/>http://91.229.8.119:5678]
    D -->|POST / PUT| E[📆 Развернутый workflow<br/>(неактивный, безопасный режим)]

    classDef node fill:#e9f5ff,stroke:#007aff,stroke-width:2px;
    classDef success fill:#dfffd8,stroke:#3cb043,stroke-width:2px;
    class A,B,C,D,E node;
```

### 🔍 CI/CD Details

| Этап | Файл / Компонент | Назначение |
|----|----|---------|
| 🚟 Триггер workflow | `.github/workflows/deploy-workflows.yml` | Запускает деплой при изменениях в `/workflows/*.json` |
| 🚫 Скрипт деплоя | `scripts/deploy_workflows.js` | Отправляет POST/PUT запросы в n8n API |
| 🔐 Секреты | `N8N_HOST, N8N_API_KEY` | Используются для аутентификации |
| 📆 Рабочие процессы | `workflows/*.json` | JSON-описания рабочих процессов n8n |
| 🌐 Сервер API | `[http://91.229.8.119:5678](http://91.229.8.119:5678)` | Экземпляр n8n, принимающий деплой |
| 🚧 Active Mode | `active: false` | Все workflowовы деплоятся в безопасным режиме |
| 📈 GitHub Actions Logs | `Отображение графиков` | Проверка CI/CD выполнения |

### Последний запуск

**Последний запуск:** ✅ УСПЕХ  
**Обновлённый workflow:** Test Workflow  
**Время выполнения:** ~9 секунд  
**Ошибок:** 0  
**Статус:** 🚟 Всё успешно.

---

# n8n-ядро
