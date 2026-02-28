# Releasing BuildLore

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Repository secrets configured:
  - `VSCE_PAT` — VS Code Marketplace token (from https://dev.azure.com → Personal access tokens)
  - `OVSX_PAT` — Open VSX token (from https://open-vsx.org → Access Tokens)

## Release Steps

1. **Bump the version** in `package.json`:
   ```bash
   # For a patch release (0.1.0 → 0.1.1):
   npm version patch

   # For a minor release (0.1.0 → 0.2.0):
   npm version minor

   # For a major release (0.1.0 → 1.0.0):
   npm version major
   ```
   This updates `package.json` and creates a git commit + tag automatically.

2. **Push the commit and tag**:
   ```bash
   git push && git push --tags
   ```

3. **Create a GitHub release** from the tag:
   ```bash
   gh release create v<version> --generate-notes
   ```
   Example: `gh release create v0.1.1 --generate-notes`

4. **Verify** — The GitHub Actions workflow (`.github/workflows/publish.yml`) will
   automatically publish to both:
   - [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=buildlore.buildlore-vscode)
   - [Open VSX Registry](https://open-vsx.org/extension/buildlore/buildlore-vscode)

   Check the workflow run:
   ```bash
   gh run list --limit 1
   gh run view <run-id>
   ```

## Token Renewal

- **VSCE_PAT**: Expires after 1 year max. Regenerate at https://dev.azure.com → Personal access tokens, then update with `gh secret set VSCE_PAT`.
- **OVSX_PAT**: Check expiration at https://open-vsx.org. Update with `gh secret set OVSX_PAT`.
