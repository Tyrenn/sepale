# 0016 — Changesets version the packages

Status: accepted (2026-11-12)

Supersedes, in [0014](./0014-two-packages.md), the rejected option "a workspace"
and the first consequence (the version comes from the root `package.json`).

## Context

0014 versioned the two packages from the root manifest: `scripts/package.mjs`
copied its version into both, and a release was a hand bump followed by two
`pnpm publish`. It worked, but kept no changelog, and nothing recorded *why* a
version moved. The site is about to go public with `0.1.0`, and further packages
are expected.

## Decision

[Changesets](https://github.com/changesets/changesets) version and publish the
packages.

- `pnpm-workspace.yaml` lists `packages/*`, so changesets finds them. The site
  still imports `src/lib` directly; the workspace only serves the release.
- `.changeset/config.json` puts `@sepale/style` and `@sepale/components` in one
  `fixed` group: they always share a version, which is what keeps the peer range
  `@sepale/style: ^<version>` at a stylesheet whose classes the types were read
  from (0014, 0015). `access` is `public`.
- Each package's own manifest holds its version. The root package is private and
  carries none. `package.mjs` no longer writes versions: it **refuses** to build
  when the two disagree or the peer range does not match.
- `@sepale/components` declares `@sepale/style: workspace:^` as a devDependency.
  Without it, pnpm's automatic peer install fetches `@sepale/style` from the
  registry, where it may not exist yet; with it, the peer is linked from the
  workspace. `pnpm publish` rewrites `workspace:^` to a real range, and users
  never install devDependencies anyway.
- The bundle stamps `theme.css` with `@sepale/style`'s version.

## Releasing

1. With each change worth releasing: `pnpm changeset`, pick the bump, describe it.
   Commit the file in `.changeset/` with the change.
2. To release: `pnpm version-packages` bumps both manifests, the peer range and
   writes each `CHANGELOG.md`. Commit.
3. `pnpm release` (`changeset publish`) publishes what npm does not have yet,
   `@sepale/style` first since the components depend on it, and tags the commit.
   Each package's `prepublishOnly` runs `pnpm run package` first.

Semver as in [0012](./0012-a-package-alongside-the-bundle.md): removing or
renaming a class, a variant or a prop is a major, adding is a minor. Under `0.x`,
a minor may break.

## Considered options

- **Keep the root bump**: no new tool, but no changelog, and adding a package
  means editing `package.mjs`.
- **`linked` instead of `fixed`**: lets a package skip a release. Rejected: a
  `@sepale/components` without its matching `@sepale/style` breaks the peer range.
