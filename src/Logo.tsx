// Seeded accessibility violation for the @v0 action smoke: an <img> with no
// alt text. The static engine must flag this (jsx-a11y img-has-alt class) and
// the gate must FAIL on it — that's the teeth proof.
export function Logo() {
  return <img src="/logo.png" />;
}
