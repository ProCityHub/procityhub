# ProCityHub

**Genesis X — Canonical Lattice Framework & GARVIS Body Architecture**

Creator & Conceptual Architect: **Adrien D. Thomas**
Organization: **ProCityHub**
System: **GARVIS / Genesis X**

---

## What This Is

ProCityHub is the research and engineering home for two interconnected projects:

### 1. Genesis X — Double-Slit Interference Discriminator

A falsification-oriented test harness comparing standard quantum mechanical visibility against a golden-ratio-based interference discriminator hypothesis.

**The Canonical Lattice Law:**

```
C = O¹ · A^(1/φ) · B^(1/φ²)
```

**The Interference Discriminator Hypothesis:**

```
V_φ = O · (A^α · B^β + A^β · B^α) / (A + B)
```

where φ = (1+√5)/2, α = 1/φ, β = 1/φ², and α + β = 1.

**Standard QM Baseline:**

```
V_QM = 2 · O · √(A·B) / (A + B)
```

The key insight: for symmetric paths (A = B), both models are identical. For asymmetric paths (A ≠ B), they diverge — and only real experimental data can adjudicate.

### 2. GARVIS Body — Sensory/Motor Shell

A GARVIS-class assistant architecture built on Base44. The body (voice, vision, memory, action dispatch) is fully implemented. The brain is a socket — currently returning `NOT_IMPLEMENTED` by design. The Genesis X model is the first candidate brain to plug into that socket.

---

## Repository Structure

```
procityhub/
├── README.md                          ← You are here
├── LICENSE                            ← MIT
├── CONTRIBUTING.md
│
├── genesis-x/                         ← Python package
│   ├── __init__.py                    ← Exports
│   ├── brain.py                       ← The full falsification model
│   ├── setup.py                       ← pip install
│   ├── README.md                      ← Package docs
│   ├── tests/
│   │   └── test_brain.py              ← pytest suite
│   └── examples/
│       └── sample_data.csv            ← Asymmetric test data
│
├── visualizations/
│   └── index.html                     ← Interactive double-slit viz
│
├── garvis-body/                       ← GARVIS shell architecture
│   ├── brainAdapter.js                ← The brain socket (NOT_IMPLEMENTED)
│   ├── actionDispatcher.js            ← Action dispatcher (empty allowlist)
│   ├── organService.js                ← Organ registry seeding
│   ├── session.js                     ← Session management
│   ├── entities/                      ← 6 entity schemas
│   ├── pages/                         ← Console, Organs, Log pages
│   └── BUILDER_PROMPT.md              ← Base44 builder spec
│
└── docs/
    ├── genesis-x/
    │   ├── CANONICAL_LATTICE.md        ← Math framework
    │   └── EPISTEMIC_BOUNDARY.md       ← What this is and isn't
    └── garvis/
        └── ARCHITECTURE.md            ← System design
```

---

## Quick Start

### Run the Genesis X Brain

```bash
cd genesis-x
python brain.py
```

Output: self-test results including φ, α, β, α+β identity, and PASS status.

### Evaluate CSV Data

```bash
python brain.py examples/sample_data.csv
```

### Run Tests

```bash
pip install pytest
pytest tests/
```

### Interactive Visualization

Open `visualizations/index.html` in any browser. Adjust the A, B, and O sliders to see how V_QM and V_φ diverge for asymmetric paths.

---

## Epistemic Boundary

This software is explicitly honest about what it does and does not establish:

| Claim | Status |
|---|---|
| Canonical Lattice Law | **HYPOTHESIS UNDER TEST** |
| Interference Discriminator | **HYPOTHESIS UNDER TEST** |
| Empirical status | **NOT_EVALUATED** (pending real asymmetric data) |
| AGI | **NOT_ESTABLISHED** |
| Consciousness | **NOT_ESTABLISHED** |
| New physics | **NOT_ESTABLISHED** |

> Mathematical consistency and software PASS do not establish physical truth.
> A model that fits synthetic data generated from itself is expected to win — that is a software validation, not an empirical result.
> The discriminator's empirical status is **NOT_EVALUATED** until authentic asymmetric-path experimental data are tested. Until then, the hypothesis remains open.
>
> The OAB (Observer, Actor, Bridge) and Identity Cylinder constructs are **engineering representations** for organizing prediction → observation → error. They are not physical claims about the double-slit apparatus or about the nature of observation.
>
> — Full text: [`docs/genesis-x/EPISTEMIC_BOUNDARY.md`](docs/genesis-x/EPISTEMIC_BOUNDARY.md)

---

## License

MIT — See [LICENSE](LICENSE).

## Credits

- **Creator / Conceptual Architect:** Adrien D. Thomas
- **Organization:** ProCityHub
- **System:** GARVIS / Genesis X
