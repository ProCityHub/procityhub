# GARVIS BODY WITHOUT BRAIN — Code Structure

## Directive: BASE44_001
## Authority: Adrien D. Thomas (ProCityHub)
## Status: DRAFT — awaiting app creation in Base44 builder

---

## Directory Map

```
garvis-body/
├── BUILDER_PROMPT.md          ← Master spec sent to the Base44 builder
├── brainAdapter.js            ← The brain socket (also in src/modules/)
│
├── entities/                  ← Entity schema definitions (reference)
│   ├── utterance.json
│   ├── frame.json
│   ├── brainCall.json
│   ├── actionLog.json
│   ├── deviceState.json
│   └── organStatus.json
│
├── seed/
│   └── organStatus.json       ← Initial 10 organ registry records
│
└── src/
    ├── modules/                ← Custom application modules
    │   ├── brainAdapter.js     ← The ONLY cognition seam (returns NOT_IMPLEMENTED)
    │   ├── actionDispatcher.js ← HAND organ: empty allowlist freeze gate
    │   ├── organService.js      ← OrganStatus seeding + markInvoked helper
    │   └── session.js          ← Session ID + request ID generation
    │
    └── pages/                  ← Three pages per directive §6
        ├── Console.jsx         ← The body's face: mic, camera, transcript, speak, device state
        ├── Organs.jsx          ← Registry table from OrganStatus entity (not hardcoded)
        └── Log.jsx             ← Filterable view across Utterance/Frame/BrainCall/ActionLog
```

## Architecture Summary

### Cognition Path
```
Any organ → think(envelope) → brainAdapter.js → NOT_IMPLEMENTED
                                                    ↓
                                            BrainCall entity record
                                                    ↓
                                            Console displays: "BRAIN: ABSENT — no response generated."
```
There is exactly ONE path. No bypass. No fallback. No second seam.

### Action Path
```
Any action request → actionDispatcher.dispatch(name, params)
                           ↓
                    ACTION_ALLOWLIST.includes(name)?
                     NO                          YES (unreachable)
                      ↓                            ↓
                ActionLog{outcome:"blocked"}   ActionLog{outcome:"executed"}
                reason: "FREEZE_GATE..."        (allowlist is empty)
```

### Entity Relationships
```
Utterance ──── session_id ──→ session
Frame ──────── session_id ──→ session
DeviceState ─── session_id ──→ session
BrainCall ───── request_id ──→ unique per call (no session link by design)
ActionLog ───── standalone (no session link, logs all actions globally)
OrganStatus ─── standalone (registry, 10 fixed organs)
```

### Organ Invocation Flow
1. User wakes the voice gate (awake=true, muted=false)
2. SpeechRecognition starts → final result → Utterance{direction:"heard"} → markInvoked("EAR")
3. Brain envelope constructed → think() called → BrainCall record → markInvoked("BRAIN")
4. Console shows "BRAIN: ABSENT — no response generated."
5. User types in speak field → SpeechSynthesis.speak() → Utterance{direction:"spoken"} → markInvoked("MOUTH")
6. User starts camera → getUserMedia → video preview
7. User captures frame → canvas.toBlob → upload → Frame record → markInvoked("EYE")
8. DeviceState polled every 30s → DeviceState record → markInvoked("PROPRIOCEPTION")

### Acceptance Criteria Checklist
- [ ] Zero InvokeLLM calls in codebase
- [ ] Speaking produces Utterance{direction:"heard"}
- [ ] Speak field produces audible output + Utterance{direction:"spoken"}
- [ ] Camera capture produces Frame with working image_url
- [ ] Reasoning request → BrainCall{status:"NOT_IMPLEMENTED", response.output:null}
- [ ] Action request → ActionLog{outcome:"blocked"}
- [ ] Organs page shows BRAIN/WILL/JUDGMENT as ABSENT
- [ ] App runs on phone browser (mobile-first, responsive)

### Next Steps
1. Create the app at https://app.base44.com (name: "GARVIS Body" or similar)
2. Tell Solene the app name or ID
3. Solene sends the BUILDER_PROMPT.md content to the builder
4. Builder constructs entities, modules, and pages
5. Verify against acceptance criteria
6. If any criterion fails, Solene sends follow-up builder messages
