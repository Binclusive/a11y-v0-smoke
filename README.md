# a11y @v0 consumer smoke

Throwaway repo — live end-to-end proof that `Binclusive/a11y@v0` (static) and
`Binclusive/a11y/action-url@v0` (browser) resolve, pull the published
`:0`/`:0-browser` ghcr images, run the engine, and emit valid SARIF. `src/Logo.tsx`
seeds a known `img`-no-alt violation so the static gate's teeth are proven.

Delete after the smoke passes.
