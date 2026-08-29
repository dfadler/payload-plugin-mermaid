# Contributing

Requires Node 22+ and pnpm (this repo pins `packageManager` in `package.json`;
`corepack enable` will pick that up automatically).

```bash
pnpm install
```

## Malware protection for installs (Aikido Safe Chain)

[Aikido Safe Chain](https://github.com/AikidoSec/safe-chain) is a free, tokenless CLI
that wraps `npm`/`npx`/`pnpm`/`pnpm dlx`/`yarn`/etc. and blocks installs of packages
flagged as malware or published in the last 48 hours (a common window for
supply-chain attacks). CI already runs a Safe Chain scan on every PR and push to
`main` (see `.github/workflows/supply-chain.yml`), but that only protects the CI
install — it can't reach into your own shell. Installing it locally is optional but
recommended so the same protection covers `pnpm install` on your machine too:

```bash
curl -fsSL https://github.com/AikidoSec/safe-chain/releases/download/1.5.15/install-safe-chain.sh -o /tmp/install-safe-chain.sh \
  && echo "de0565e3d6346407a604e84e639e95fea8758748063da2216bbfdca5feda5dd2  /tmp/install-safe-chain.sh" | sha256sum -c - \
  && sh /tmp/install-safe-chain.sh \
  && rm /tmp/install-safe-chain.sh
```

Restart your terminal afterward, then verify it's active with `pnpm safe-chain-verify`
(or `npm safe-chain-verify`). Once installed, it transparently wraps your normal
`pnpm install` — no change to your workflow. See the
[Safe Chain README](https://github.com/AikidoSec/safe-chain#readme) for Windows
instructions, uninstalling, and configuration (logging, minimum package age, etc.).

## Useful scripts

See `package.json` for the full list.

- `pnpm test` — run the test suite once (Vitest)
- `pnpm run test:watch` — Vitest in watch mode
- `pnpm run test:coverage` — Vitest with coverage
- `pnpm run lint` — ESLint
- `pnpm run build` — build the publishable package with tsup
- `pnpm run typecheck` — type-check source
- `pnpm run format` — format the codebase with Prettier
- `pnpm run format:check` — check formatting without writing changes

## Before opening a PR

- CI requires: tests + coverage gate, lint, type check, format check, build, a
  Semgrep scan, a changeset (via `pnpm changeset`), actionlint, a production
  dependency audit, the Safe Chain malware scan, and a markdown link check — see
  `.github/workflows/` for details.
- Add a changeset for any user-facing change: `pnpm changeset`.
