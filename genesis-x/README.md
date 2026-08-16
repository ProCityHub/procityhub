# Genesis X — Double-Slit OAB Falsification Brain

A falsification-oriented test harness comparing standard quantum mechanical visibility against the Genesis X / Canonical Lattice interference-discriminator hypothesis.

## Installation

```bash
pip install -e .
```

## Usage

### Self-test

```bash
python brain.py
```

### Evaluate CSV data

```bash
python brain.py examples/sample_data.csv
```

### As a library

```python
from brain import DoubleSlitBrain, DoubleSlitObservation

brain = DoubleSlitBrain()
brain.observe(DoubleSlitObservation(
    A=1.0, B=0.3, O=0.9, delta_theta=0.5,
    measured_intensity=2.1, label="test-1"
))
score = brain.score()
print(score.status)  # DIRECTIONAL_SUPPORT_QM or DIRECTIONAL_SUPPORT_PHI
```

## Run tests

```bash
pip install pytest
pytest tests/ -v
```

## Epistemic Boundary

| Claim | Status |
|---|---|
| Canonical Lattice Law | HYPOTHESIS UNDER TEST |
| Interference Discriminator | HYPOTHESIS UNDER TEST |
| AGI | NOT ESTABLISHED |
| Consciousness | NOT ESTABLISHED |
| New Physics | NOT ESTABLISHED |

> Mathematical consistency and software PASS do not establish physical truth.

## Credits

Creator / Conceptual Architect: Adrien D. Thomas / ProCityHub
