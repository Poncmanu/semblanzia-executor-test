# Isolated PLANEA TEST publishing

This public repository already hosts an executor-specific TEST page. The new deployment workflow copies static PLANEA TEST assets from a **pinned and independently verified** commit in the private `Poncmanu/semblanzia` repository, without changing the production `main` branch or its custom domain.

## Preconditions before any dispatch

1. Confirm the full `source_sha` is the current approved `test/current` SHA and required checks passed in the source repository.
2. Confirm GitHub Actions can read the private source repository with least-privilege authorization. `GITHUB_TOKEN` from this separate repository may not be sufficient; do **not** add a broad PAT or change repository visibility without owner authorization. If checkout fails, stop and report the blocker.
3. Confirm GitHub Pages in this repository is enabled and its publishing source is the `main` branch root. The Pages setting has not been verified by the available connector.
4. Confirm the public TEST hostname is not the production custom domain, and that public exposure of TEST HTML/JS/assets is acceptable. No customer data or secrets belong in this repository.
5. Run the workflow **once** with the verified source SHA, after prerequisites; it preserves the existing executor test files.
6. Verify `/test-build.json` and `/test/planea/planea.js` on the published site; the operator UI requires authenticated visual confirmation. Only then request TEST acceptance.

**No automatic deploy on PR merge.** Workflow dispatch is intentional to avoid CI-minute spikes and inadvertent public releases. No production approval is implied.
