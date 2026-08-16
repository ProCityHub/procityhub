# ProCityHub — Visitor Guide

> **You've arrived at ProCityHub.** Here's what this place is.

---

## What is ProCityHub?

ProCityHub is the research and engineering home for **GARVIS** (Genesis X) — a project with two parts:

1. **Genesis X Brain** — a double-slit interference discriminator. It compares standard quantum mechanics (V_QM) against a golden-ratio-based alternative (V_φ) and reports which model fits observed data better. It is a falsification harness, not a claim of truth.

2. **GARVIS Body** — a complete sensory/motor shell: voice in/out, camera vision, memory, device state, action dispatch, console UI. It has **zero cognition**. The brain is a socket, not an implementation.

---

## What GARVIS Is

- ✅ A physics falsification harness
- ✅ A sensory/motor shell architecture
- ✅ A research project by Adrien D. Thomas
- ✅ Open source (MIT license)

## What GARVIS Is NOT

- ❌ Not an AI assistant
- ❌ Not conscious or self-aware
- ❌ Not capable of reasoning, planning, or judgment
- ❌ Not making claims about new physics
- ❌ Not using any LLM anywhere in the body

---

## Epistemic Boundary

| Claim | Status |
|---|---|
| AGI | NOT_ESTABLISHED |
| Consciousness | NOT_ESTABLISHED |
| New physics | NOT_ESTABLISHED |
| Canonical lattice law | HYPOTHESIS_UNDER_TEST |
| Interference discriminator | HYPOTHESIS_UNDER_TEST |

> Mathematical consistency and software PASS do not establish physical truth.

---

## Quick Links

- 📖 [README](README.md) — full project overview
- 🧠 [Genesis X Brain](genesis-x/) — the falsification model
- 🤖 [GARVIS Body](garvis-body/) — the sensory/motor shell architecture
- 📐 [Canonical Lattice](docs/genesis-x/CANONICAL_LATTICE.md) — the math framework
- 🚧 [Epistemic Boundary](docs/genesis-x/EPISTEMIC_BOUNDARY.md) — what this is and isn't
- 📊 [Interactive Visualization](visualizations/index.html) — live double-slit explorer
- 🤝 [Contributing](CONTRIBUTING.md) — how to help

---

## Quick Start

```bash
git clone https://github.com/ProCityHub/procityhub.git
cd procityhub/genesis-x
pip install -e .
python brain.py          # Self-test
pytest tests/ -v         # Full test suite
```

For the visualization, just open `visualizations/index.html` in any browser.

---

## GARVIS Agents

ProCityHub runs 8 automated GitHub Actions agents:

| Agent | What it does |
|---|---|
| Test Agent | CI tests on push/PR (Python 3.9-3.12) |
| Falsification Agent | Daily brain evaluation against synthetic datasets |
| Numerical Stability Agent | Edge case probing on brain.py changes |
| Code Quality Agent | Linting + directive compliance enforcement |
| Nightly Self-Test Agent | Full system check, auto-creates issues on failure |
| Release Agent | Builds and publishes releases on version tags |
| Greeting Agent | Welcomes new visitors on issues/PRs/discussions |
| FAQ Agent | Answers common questions about ProCityHub |

All agents are non-cognitive — keyword matching and fixed scripts, not LLMs.

---

## Questions?

Open an issue and ask. The FAQ Agent will respond to common questions automatically. For everything else, a human will get back to you.

---

_This guide is maintained by the GARVIS Greeting Agent — a safe, non-cognitive welcome system. It does not think. It does not reason. It says hello and points you to the right place._
