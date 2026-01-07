# GeoTechieX — Live GeoDeveloper Tools (TikTok Open Build)

> Live-building interactive geospatial developer tools on TikTok. This repository hosts the GeoTechieX website and a set of small tools we'll create and iterate on during live streams.

## Vision

- Build helpful, open-source geospatial web tools while streaming development on TikTok.
- Invite the audience to contribute features, report bugs, and vote on the next tool.

## What to Expect in a Live Build

- Short intro (30–60s): what we’ll build and why.
- Live coding (10–30 minutes): implement one focused feature.
- Q&A and audience requests (5–10 minutes).
- Wrap-up: deploy, show how to test, and request contributions.

## Interactive Audience Hooks

- Live polls for feature choices (comment or use TikTok poll).
- Small “viewer tasks”: find a bug, suggest UI copy, propose edge-cases.
- Community contributions: open issues, submit PRs, or suggest mini-tasks.

## Roadmap (short-term)

1. Make local site robust to missing files and broken links (this README + link checker).
2. Rebuild core tools: `Polygon` creator, `coordTrans`, `compass`, `checkPoint`.
3. Add test cases and simple CI for tools.
4. Iterative UX improvements informed by live viewers.

## How to Run Locally (quick)

1. Serve the folder with a simple static server, e.g.:

```bash
# Python 3
python3 -m http.server 8000

# or npm
npx http-server -p 8000
```

2. Open `http://localhost:8000` in your browser.

Notes: serving over HTTP ensures link checking and fetch requests work reliably.

## Contribution Guide

- Issues: open an issue describing the feature or bug.
- Pull Requests: small, focused PRs are easiest to review. Include screenshots if UI changes.
- Code style: follow existing project patterns (plain HTML/CSS/JS). Keep changes minimal and test locally.

## Live-Stream Checklist (for the streamer)

- Announce the build goal and expected outcome.
- Ensure local server is running and the repo is up-to-date.
- Keep edits small and explain intent to the audience.
- Invite viewers to open issues or PRs after stream.

## How Viewers Can Help

- Comment features during the stream.
- Open issues describing use-cases or bugs.
- Create PRs implementing small features (label: `help wanted`).

## Code of Conduct

Be respectful. Treat contributors and viewers kindly. Abuse and harassment are not tolerated.

---

For developer notes and a short plan, see the `todo` list in the repo (maintained by the development workflow). Start by running a local server and using this README as the canonical guide when viewers ask how to reproduce builds.
