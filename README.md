# a11y @v0 consumer smoke

[![smoke](https://github.com/Binclusive/a11y-v0-smoke/actions/workflows/smoke.yml/badge.svg)](https://github.com/Binclusive/a11y-v0-smoke/actions/workflows/smoke.yml)

**Standing consumer-smoke** for the published `Binclusive/a11y` action/image. It runs the
PUBLISHED action exactly the way a real consumer would — resolving `@v0`, pulling the
`:0` / `:0-browser` ghcr images, running the engine, and asserting valid SARIF — so a broken
publish is caught even when the build/publish exit codes are green.

This repo is **kept, not deleted**: it is the concrete artifact-verification guard for the
action/image publish surface called for by epic
[#2644](https://github.com/Binclusive/monorepo/issues/2644) (assert the consumer artifact
pulls/runs, not the exit code). It has already caught three consumer-facing false-greens the
build/publish steps missed: a private ghcr package (#2636), an unwritable browser runner mount
(#2659), and an absolute container path that broke `upload-sarif` consumers (#2678).

## What it asserts

- **Static** — `uses: Binclusive/a11y@v0` on the seeded `img`-no-alt violation in `src/Logo.tsx`
  at `fail-on: warn`: the gate must FAIL (real teeth) and emit valid SARIF with at least one
  result.
- **URL** — `uses: Binclusive/a11y/action-url@v0` renders a URL in the `:0-browser` image: it
  must emit host-resolvable SARIF, proven by a real `upload-artifact` consumer step (the
  container-path regression class, #2678).

## When it runs

- **On republish** — the monorepo `release-image.yml` / `release-image-browser.yml` workflows
  emit a `repository_dispatch` (`image-published`) after each successful image publish, so any
  image/action change auto-runs this smoke with no human trigger. `image-published` is the wire
  contract between the two halves — the monorepo emitter is
  [monorepo#2895](https://github.com/Binclusive/monorepo/issues/2895); this repo is the listener.
- **Daily schedule** — a cron run is the standing safety net that catches a regression within a
  day even if the cross-repo dispatch token is not configured on the monorepo.
- **Manual / on edit** — `workflow_dispatch` from the Actions tab; `push` re-runs when the
  seeded fixture changes.

## Reading a red run

The status **badge** above is the visible signal: red means the PUBLISHED action just regressed
for real consumers — treat it as a release-blocking incident, not repo flake, because every trigger
runs the *published* `@v0`, not repo code.

1. Open the failing run from the badge and find which job reddened:
   - **static @v0** red → the static publish is broken. `Assert the gate FAILED (teeth)` failing
     means `@v0` no longer flags the seeded `img`-no-alt (a manifest/engine regression); the SARIF
     assert failing means it ran but emitted no / invalid / empty SARIF (the #2678 class).
   - **browser action-url @v0** red → the `:0-browser` variant is broken. A missing SARIF file
     points at an image-pull or render failure (private ghcr #2636, unwritable mount #2659); the
     `Consumer proof` upload-artifact step failing means the emitted path is container-internal and
     unresolvable by a real host consumer (#2678).
2. The fix lives in the **monorepo** (the action manifests / image build), not here — this repo only
   *observes*. Re-run this smoke (`workflow_dispatch`) after the republish to confirm green.
