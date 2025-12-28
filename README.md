# n8n-core


## n8n Source Control Setup - SSH Deploy Key

This repository is configured for bidirectional synchronization with n8n using SSH Deploy Keys.

### Prerequisites

- n8n instance running (self-hosted)
- SSH access to the n8n server
- Git installed on the n8n server

### Step 1: Generate SSH Key on n8n Server

SSH into your n8n server and execute these commands:

```bash
# Create SSH directory for n8n user
mkdir -p /home/n8n/.ssh
chmod 700 /home/n8n/.ssh

# Generate Ed25519 SSH key (recommended)
ssh-keygen -t ed25519 \
  -f /home/n8n/.ssh/n8n_github_deploy_key \
  -C "n8n-source-control-$(date +%Y%m%d)" \
  -N ""

# Set proper permissions
chmod 600 /home/n8n/.ssh/n8n_github_deploy_key
chmod 644 /home/n8n/.ssh/n8n_github_deploy_key.pub

# Display public key for next step
cat /home/n8n/.ssh/n8n_github_deploy_key.pub
```

### Step 2: Add Public Key to GitHub Deploy Keys

1. Copy the output from the command above (entire public key)
2. Go to: https://github.com/abaranovskydako-tech/n8n-core/settings/keys
3. Click "Add deploy key"
4. Set Title: `n8n-source-control-prod`
5. Paste the public key
6. **Enable**: "Allow write access" (checkbox)
7. Click "Add key"

### Step 3: Configure SSH Config

Add this to `/home/n8n/.ssh/config`:

```bash
cat >> /home/n8n/.ssh/config << 'EOF'

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/n8n_github_deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF

chmod 600 /home/n8n/.ssh/config
```

### Step 4: Test SSH Connection

```bash
# Test the connection
ssh -i /home/n8n/.ssh/n8n_github_deploy_key -T git@github.com

# Expected output:
# Hi abaranovskydako-tech/n8n-core! You've successfully authenticated, but GitHub does not provide shell access.
```

### Step 5: Configure n8n Source Control

1. Log in to n8n as owner/admin
2. Go to **Settings → Environments → Source control**
3. Fill in:
   - **Repository URL**: `git@github.com:abaranovskydako-tech/n8n-core.git`
   - **Authentication Type**: SSH
   - **SSH Key Path**: `/home/n8n/.ssh/n8n_github_deploy_key`
   - **Branch**: `main` (or your preferred branch)
4. Click "Save"
5. Test the connection

### Step 6: Initial Synchronization

```bash
# In n8n UI, go to Source Control and:
# 1. Click "Pull" to sync from GitHub (if needed)
# 2. Click "Push" to export current workflows to GitHub
```

### Bidirectional Sync Workflow

- **Edit in UI n8n** → Save → **Push to GitHub**
- **Edit in GitHub** → PR/Merge → **Pull in n8n**
- **Conflict resolution**: Resolve in GitHub, then pull in n8n

### Troubleshooting

**SSH connection refused**: Ensure deploy key is added to GitHub with write access

**Permission denied**: Check SSH key permissions (should be 600)

**Cannot authenticate**: Verify the SSH config and key path in n8n settings

### Security Notes

- Keep private key (`n8n_github_deploy_key`) secure
- Never commit private keys to Git
- Deploy keys are repository-specific (not global)
- Rotate keys periodically for security
