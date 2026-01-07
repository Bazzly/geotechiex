# Contributing to GeoTechieX

Thanks for helping build GeoTechieX — we create small, focused geospatial web tools live on TikTok. This file explains how viewers and contributors can help quickly and effectively.

## Quick start (for viewers)

1. Fork the repo and clone it locally.
2. Run a simple static server in the project root:

```bash
python3 -m http.server 8000
# or
npx http-server -p 8000
```

3. Open http://localhost:8000 and follow the live stream edits.

## Filing issues

- Use the provided issue templates (`bug report` and `feature request`) to give us actionable information.
- For bugs: include steps to reproduce, expected vs actual behavior, and a screenshot if relevant.
- For feature requests: explain the user problem, example usage, and any simple UI mockup or expected input/output.

## Pull requests

- Keep PRs small and focused (one change per PR).
- Use the PR template when creating a pull request.
- Include screenshots or short GIFs for UI changes.
- If the PR fixes an issue, reference it using `Closes #ISSUE_NUMBER`.

## Code style & scope

- This project uses plain HTML, CSS, and vanilla JavaScript. Follow existing patterns when adding files.
- Avoid large refactors during a live build — prefer incremental, testable changes.

## Review process

- PRs will be reviewed when time permits; maintainers may ask for small adjustments.
- Label your PR appropriately (`feature`, `bug`, `docs`).

## Live-stream etiquette for contributors

- If you're joining a live session, open issues or PRs before or after the stream — avoid submitting large in-stream PRs that block progress.
- Be responsive to reviewer comments and keep changes small.

## Where to ask questions

- Open an issue and tag it `question`, or join the comment section in the streaming platform (TikTok) for quick suggestions.

Thanks again — your contributions make the live builds better for everyone!
