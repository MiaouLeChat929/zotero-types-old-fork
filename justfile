# zbr-types-monorepo/packages/types/justfile
# Task runner for the zotero-types fork. Single source of truth for
# verification, build, publish.
#
# `just` (no args) lists recipes. `just <recipe>` runs one.
# Recipes are designed to be composable: `just check` is the gate
# before commit, `just verify` is the gate before push.

set shell := ["bash", "-uc"]

# Default bridge URL for tests. Override with `BRIDGE_URL=... just test`.
export BRIDGE_URL := env_var_or_default("BRIDGE_URL", "http://localhost:23124")

# ----- info -----

# List all available recipes.
default:
    @just --list

# Show the current fork divergence from upstream.
diff:
    @echo "## fork commits ahead of upstream:"
    @git log --oneline upstream/master..HEAD 2>/dev/null || echo "  (upstream not fetched — run `just sync` first)"
    @echo
    @echo "## fork-specific files:"
    @git ls-files | grep -E '\.(d\.ts)$' | xargs -I {} bash -c 'grep -l "Fork addition" {} 2>/dev/null' || true

# ----- verify (gate before commit) -----

# Run the introspection test suite (EBM verification).
# Fails if any fork type lies about the live Zotero runtime.
test:
    bun test ./tests/introspect-check.ts ./tests/translate-check.ts

# Same as `test` but with the backlog report (default).
test-verbose:
    bun test ./tests/ --reporter=verbose

# Just the ItemFields introspect check (most common one).
test-itemfields:
    bun test ./tests/introspect-check.ts

# Just the Translate class-typed check (raw-exec probe).
test-translate:
    bun test ./tests/translate-check.ts

# Full verification: introspect + live bridge roundtrip.
verify: test
    @echo
    @echo "✓ fork types match live Zotero $(curl -s $BRIDGE_URL/zbr/health | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"]["version"])' 2>/dev/null)"

# ----- check upstream -----

# Show what upstream has done since the last fork sync.
upstream-since:
    git fetch upstream 2>&1 | tail -1
    @echo "## upstream commits since last sync:"
    @git log --oneline HEAD..upstream/master 2>/dev/null | head -20

# ----- sync (gate before push to fork remote) -----

# Dry-run: show what a rebase would do. NEVER touches the tree.
sync-dry:
    node ../monorepo/scripts/sync-upstream.mjs

# Apply: actually rebase onto upstream/master.
sync:
    node ../monorepo/scripts/sync-upstream.mjs --apply

# ----- enrich (EBM) -----

# Probe the live runtime for an entire namespace, list methods not yet
# typed in the fork. Output is a TODO list to drive the next enrichment
# PR.
backlog:
    @echo "## runtime methods not yet typed (backlog)"
    @echo
    @node ../monorepo/scripts/gen-from-runtime.mjs --out=./.backlog/ 2>&1 | tail -5
    @ls -la ./.backlog/ 2>/dev/null

# Probe a specific namespace end-to-end. Example: `just probe ItemFields`.
probe namespace:
    @echo "## {{namespace}} runtime surface"
    @curl -s "$BRIDGE_URL/zbr/signatures" > .probe.json
    @python3 -c "import json; d=json.load(open('.probe.json')); s=d['result']['signatures'].get('{{namespace}}', {}); print(f'  {len(s)} methods'); [print(f'  {n}({\", \".join(i[\"params\"])}) -> {i[\"returnHint\"]}') for n,i in sorted(s.items())]"
    @rm -f .probe.json

# ----- publish (gate before /zbr-types release tag) -----

# Bump the fork version, commit, push. Run only after verify passes.
release version:
    @echo "## pre-flight"
    @just verify
    @echo
    @echo "## bumping to {{version}}"
    @sed -i 's/"version": ".*"/"version": "{{version}}"/' package.json
    git add package.json
    git commit -m "chore(release): bump to {{version}}"
    git push origin master
    @echo
    @echo "## published to origin/master"
