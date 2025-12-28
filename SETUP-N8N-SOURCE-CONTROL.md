# n8n Source Control Setup - Complete Server Integration Guide

## Prerequisites

- n8n installed and running on server (systemd service)
- SSH access to server as root or n8n user
- SSH key pair already generated:
  - Private key: `/root/.ssh/n8n_github_deploy_key`
  - Public key: `/root/.ssh/n8n_github_deploy_key.pub`
- GitHub repository: `https://github.com/abaranovskydako-tech/n8n-core`
- Deploy Key added to GitHub with read-only access

---

## STEP 1: Verify SSH Key Permissions

```bash
# SSH to your n8n server
ssh root@your-server-ip

# Check SSH key permissions (should be 600)
ls -l /root/.ssh/n8n_github_deploy_key
ls -l /root/.ssh/n8n_github_deploy_key.pub

# Fix permissions if needed
chmod 600 /root/.ssh/n8n_github_deploy_key
chmod 644 /root/.ssh/n8n_github_deploy_key.pub
```

---

## STEP 2: Test SSH Connection to GitHub

```bash
# Test SSH access with the deploy key
ssh -i /root/.ssh/n8n_github_deploy_key -T git@github.com

# Expected output:
# Hi abaranovskydako-tech/n8n-core! You've successfully authenticated, but GitHub does not provide shell access.

# If you see this message, SSH access is working!
```

---

## STEP 3: Configure SSH Config (Optional but Recommended)

```bash
# Edit or create SSH config
vim /root/.ssh/config

# Add the following configuration:
```

```
Host github.com-n8n
    HostName github.com
    User git
    IdentityFile /root/.ssh/n8n_github_deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
```

```bash
# Set correct permissions
chmod 600 /root/.ssh/config
```

---

## STEP 4: Find n8n Installation and User

```bash
# Find where n8n is installed
which n8n

# Check n8n systemd service
sudo systemctl cat n8n

# Determine n8n user (likely 'n8n' or 'root')
ps aux | grep n8n

# n8n data typically stored in:
# - /home/n8n/.n8n/
# - /root/.n8n/ (if running as root)
# - $HOME/.n8n/ (user home directory)
```

---

## STEP 5: Connect Source Control in n8n UI

1. **Open n8n Web Interface:**
   - Navigate to: `https://your-n8n-domain:5678` or `http://localhost:5678`
   - Log in as owner/admin user

2. **Navigate to Source Control Settings:**
   - Click on **Settings** (gear icon, bottom left)
   - Select **Source Control** tab

3. **Configure Git Repository:**
   - Click **"Connect Repository"**
   - Select **Git** as version control system
   - Choose **Authentication: SSH**

4. **Enter Repository Details:**
   - **Repository URL:** `git@github.com:abaranovskydako-tech/n8n-core.git`
   - **SSH Key Path:** `/root/.ssh/n8n_github_deploy_key`
   - **Branch:** `main` (or your preferred branch)
   - **Synchronize Credentials:** Enable if you want credentials synced

5. **Test Connection:**
   - Click **"Test Connection"**
   - Verify successful connection message

6. **Save Configuration:**
   - Click **"Save"** and wait for confirmation

---

## STEP 6: Initial Repository Sync

```bash
# In n8n UI, go to Source Control

# Option A: Pull existing workflows from GitHub
- Click "Pull from Git"
- Wait for sync to complete
- Check for any merge conflicts

# Option B: Push current workflows to GitHub
- Click "Push to Git"
- Enter commit message (e.g., "Initial n8n workflow commit")
- Workflows will be exported to GitHub
```

---

## STEP 7: Verify Setup

### On GitHub:
```bash
# Visit your GitHub repo to verify workflows were pushed
https://github.com/abaranovskydako-tech/n8n-core

# Check that a new commit appeared with your workflows
# Directory structure should look like:
# workflows/
# credentials/
# .gitignore
```

### In n8n:
- No Source Control errors in Settings
- Last sync timestamp should be recent
- Workflows should be readable and functional

---

## Troubleshooting

### SSH Connection Refused
```bash
# Check GitHub Deploy Key is added with read access
# Verify SSH key permissions: chmod 600 /root/.ssh/n8n_github_deploy_key
# Test SSH: ssh -i /root/.ssh/n8n_github_deploy_key -T git@github.com
```

### Permission Denied (publickey)
```bash
# Ensure deploy key is added to GitHub
# Verify SSH key path in n8n settings
# Check that SSH key file exists and is readable
```

### n8n Source Control Not Available
```bash
# Ensure n8n version >= 0.185.0 (Source Control feature)
# Check n8n error logs:
sudo journalctl -u n8n -n 100 -f

# Restart n8n service:
sudo systemctl restart n8n
```

### Workflows Not Syncing
```bash
# Check n8n logs for errors
sudo journalctl -u n8n -f

# Verify GitHub Deploy Key has correct permissions (read-only)
# Try manual pull: Settings → Source Control → Pull from Git
```

---

## Best Practices

1. **Key Management:**
   - Keep private key secure (never commit to Git)
   - Use read-only Deploy Keys for n8n
   - Rotate keys periodically

2. **Workflow Management:**
   - Push before making major changes
   - Pull before starting work
   - Use meaningful commit messages

3. **Branching Strategy:**
   - Use `main` for production workflows
   - Use `develop` for testing
   - Create feature branches for new workflows

4. **Monitoring:**
   - Check Source Control status regularly
   - Monitor Git logs for changes
   - Set up notifications for repository updates

---

## Security Considerations

- **SSH Key Protection:**
  - Never share private key
  - Ensure file permissions are 600
  - Use SSH agent for key management

- **Deploy Key Permissions:**
  - Use read-only keys for safer deployments
  - Use read-write only for trusted automation
  - Audit GitHub Deploy Keys regularly

- **Credential Sync:**
  - Review credentials before syncing
  - Ensure sensitive data is not exposed
  - Use n8n's encryption for stored credentials

---

## Contact & Support

For issues or questions:
- Check n8n documentation: https://docs.n8n.io/
- Review GitHub Deploy Keys: https://docs.github.com/en/developers/overview/managing-deploy-keys
- Check n8n community: https://community.n8n.io/
