---
name: actions-up
description: Update and pin GitHub Actions to latest versions with SHA references. Prevents security vulnerabilities and maintains dependency freshness in GitHub Actions workflows.
metadata:
    scope: GitHub Actions maintenance
    cli-tool: https://github.com/azat-io/actions-up
---

# actions-up: Update GitHub Actions with SHA Pinning

Quick reference for keeping GitHub Actions updated and pinned to specific commit SHAs for security and reproducibility.

## When to Use

- 🔄 **Regular maintenance**: Quarterly or after security advisories
- 🔐 **Security updates**: When GitHub notifies about action deprecations
- 🎯 **Policy compliance**: Ensure all actions are pinned to specific SHAs (not floating tags)
- 📌 **Reproducibility**: Guarantee consistent runs across all CI/CD pipelines

## Prerequisites

### Installation

```bash
# actions-up is npm-based, no global installation needed
# Use npx to run it directly
npx actions-up --version

# OR install locally for repeated use
npm install --save-dev actions-up
```

### Authentication

```bash
# Ensure GitHub CLI is authenticated (required for API calls)
gh auth login

# Verify authentication
gh auth status
```

## Quick Checklist: Update Actions

### Step 1: Analyze Current Workflow

```bash
# Get JSON output of all outdated actions and recommendations
npx actions-up --json
```

**Output format:**
```json
[
  {
    "workflow": ".github/workflows/deploy.yml",
    "action": "actions/checkout",
    "from": "v4",
    "to": "v6.0.2",
    "sha": "de0fac2e4500dabe0009e67214ff5f5447ce83dd"
  }
]
```

### Step 2: Review Changes

- ✅ Verify all recommended versions are stable (avoid pre-releases unless needed)
- ✅ Check breaking changes in action release notes
- ✅ Confirm SHA matches official GitHub release

### Step 3: Update and Pin

```bash
# Apply updates and pin with SHA (interactive mode)
npx actions-up

# Or use direct JSON output to script automated updates
npx actions-up --json | jq '.[] | "\(.workflow) -> \(.action)@\(.sha)"'
```

### Step 4: Verify Results

```bash
# Check the updated workflow.yml files
cat .github/workflows/deploy.yml | grep "uses:"

# Confirm all actions have SHA format: action@sha # tag
# Example: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

### Step 5: Test and Commit

```bash
# Run workflow tests locally
npm run test
npm run build

# Commit the changes
git add .github/workflows/
git commit -m "chore: update GitHub Actions with latest versions and SHA pinning"

# Push to trigger the updated workflow
git push
```

## Troubleshooting

### Issue: "No updates found" or unexpected versions

**Solution:**
```bash
# Clear cache and retry
rm -rf node_modules/.cache
npx actions-up --json
```

### Issue: SHA doesn't match official release

**Solution:**
1. Verify the tag/version on GitHub Actions Marketplace
2. Check the commit history for the specific tag
3. Manually pin to the known-good SHA from the release

## Integration with CI/CD

This skill integrates with:
- **.github/workflows/deploy.yml** — Main deployment workflow
- **GitHub Pages deployment** — Via JamesIves action
- **Node.js runtime** — Pinned to v24

## Best Practices

✅ **DO:**
- Update actions quarterly or after security advisories
- Always pin to SHA for reproducibility
- Test workflow after updates
- Review action release notes for breaking changes
- Commit updates with clear messages

❌ **DON'T:**
- Use floating tags (e.g., `@main`, `@latest`) in production workflows
- Update actions without testing
- Ignore deprecation warnings from GitHub
- Mix pinned SHAs with unpinned actions

## References

- [actions-up on GitHub](https://github.com/azat-io/actions-up)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
