# GARVIS Body — System Architecture

## Directive BASE44_001: Body Without Brain

The GARVIS body is a sensory/motor shell with **zero cognition**. The brain is a socket, not an implementation.

## Organ Registry

| Organ | Function | Status |
|---|---|---|
| EAR | Speech-to-text (Web Speech API) | IMPLEMENTED |
| MOUTH | Text-to-speech (SpeechSynthesis) | IMPLEMENTED |
| EYE | Camera capture (getUserMedia) | IMPLEMENTED |
| MEMORY | Persistent log of utterances, frames, events | IMPLEMENTED |
| PROPRIOCEPTION | Device state: battery, online, orientation, permissions | IMPLEMENTED |
| HAND | Action dispatcher with allowlist | IMPLEMENTED (allowlist empty) |
| VOICE_GATE | Wake/sleep toggle, mute, listening indicator | IMPLEMENTED |
| BRAIN | Cognition | **ABSENT** |
| WILL | Goal formation, planning | **ABSENT** |
| JUDGEMENT | Evaluation, preference, selection | **ABSENT** |

## The Brain Socket

```
brainAdapter.js → think(envelope) → { status: "NOT_IMPLEMENTED", brain: "ABSENT" }
```

This is the **only** seam through which cognition is attached. No second path exists.

## The Freeze Gate

The action dispatcher ships with an **empty allowlist**. All action requests are logged with `outcome: "blocked"` and reason `FREEZE_GATE: brain absent, allowlist empty`. Nothing outward executes.

## Data Entities

- **Utterance** — voice in/out logs
- **Frame** — camera captures with image URLs
- **BrainCall** — brain invocation logs (envelope + response)
- **ActionLog** — action dispatch records (all blocked)
- **DeviceState** — battery, connectivity, orientation, permissions
- **OrganStatus** — live organ registry (not hardcoded)

## Pages

1. **Console** — the body's face: mic, camera, transcript, speak-back, device state, brain status
2. **Organs** — registry table from OrganStatus entity
3. **Log** — filterable view across all event entities

## Genesis X Integration Path

When the Genesis X brain is ready to plug in, `brainAdapter.js` is replaced. The `think()` function inspects the envelope's `requested_capability` and routes double-slit evaluation requests to the Genesis X model. All other capabilities remain `NOT_IMPLEMENTED`.

The GARVIS body does not change. Only the brain socket changes.
