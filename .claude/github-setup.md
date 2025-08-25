# GitHub MCP Configuration Guide

## 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: "TrueCheckIA MCP"
3. Select scopes:
   - ✅ repo (Full control of private repositories)
   - ✅ workflow (Update GitHub Action workflows)
   - ✅ write:packages (Upload packages to GitHub Package Registry)
   - ✅ delete:packages (Delete packages from GitHub Package Registry)
   - ✅ admin:org (Full control of orgs and teams, read and write org projects)
   - ✅ write:discussion (Read and write team discussions)
   - ✅ read:user (Read user profile data)

4. Click "Generate token"
5. Copy the token (starts with `ghp_`)

## 2. Set Environment Variable

### Option A: Temporary (current session only)
```bash
export GITHUB_TOKEN='ghp_your_token_here'
```

### Option B: Permanent (add to ~/.zshrc or ~/.bashrc)
```bash
echo "export GITHUB_TOKEN='ghp_your_token_here'" >> ~/.zshrc
source ~/.zshrc
```

### Option C: Use .env.local (for this project only)
```bash
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env.local
```

## 3. Test GitHub MCP

```bash
# Test if token is set
echo $GITHUB_TOKEN

# Test GitHub API access
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## 4. Update MCP Config

Edit `.claude/mcp_config.json` and replace:
```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
```

With your actual token:
```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_actual_token_here"
```

## 5. Common GitHub MCP Commands

Once configured, Claude can:

- Create pull requests
- Review code changes
- Create/update issues
- Manage releases
- Update workflows
- Analyze repository stats

## Security Notes

⚠️ **NEVER commit your GitHub token to the repository**
- Add `.claude/` to `.gitignore`
- Use environment variables
- Rotate tokens regularly
- Use fine-grained tokens when possible