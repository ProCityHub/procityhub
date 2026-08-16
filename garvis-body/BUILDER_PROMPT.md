# BUILDER PROMPT — GARVIS BODY WITHOUT BRAIN (BASE44_001)

## CRITICAL CONSTRAINTS — READ BEFORE WRITING ANY CODE

1. **NEVER** call `base44.integrations.Core.InvokeLLM` — not in pages, not in components, not in backend functions. Zero LLM calls. Zero exceptions.
2. **NEVER** write hardcoded canned/template responses that simulate reasoning. A fixed reply table is a fake brain.
3. If something appears to need cognition, return `NOT_IMPLEMENTED`. No workarounds.
4. **NO** UI language claiming intelligence, understanding, awareness, or assistance. The console says what the body DID, not what the body KNOWS.
5. The `brainAdapter.js` module is the ONLY seam for cognition. No second path.

---

## PART 1 — ENTITIES

Create these 6 entities with EXACTLY these field names and types:

### Utterance
- `timestamp` — string (ISO 8601 datetime)
- `direction` — string, enum: ["heard", "spoken"]
- `text` — string
- `confidence` — number
- `session_id` — string

### Frame
- `timestamp` — string (ISO 8601 datetime)
- `image_url` — string (url)
- `source` — string, enum: ["front", "rear", "upload"]
- `session_id` — string
- `notes` — string

### BrainCall
- `request_id` — string
- `timestamp` — string (ISO 8601 datetime)
- `envelope` — object (json)
- `response` — object (json)
- `status` — string, enum: ["NOT_IMPLEMENTED", "OK", "REFUSED"]

### ActionLog
- `timestamp` — string (ISO 8601 datetime)
- `action_name` — string
- `params` — object (json)
- `outcome` — string, enum: ["executed", "blocked", "not_implemented"]
- `blocked_reason` — string

### DeviceState
- `timestamp` — string (ISO 8601 datetime)
- `battery` — number
- `online` — boolean
- `permissions` — object (json)
- `session_id` — string

### OrganStatus
- `organ` — string
- `status` — string, enum: ["IMPLEMENTED", "STUB", "ABSENT"]
- `last_invoked` — string (ISO 8601 datetime)
- `notes` — string

---

## PART 2 — BRAIN ADAPTER MODULE

Create `src/modules/brainAdapter.js` with EXACTLY this content:

```js
/**
 * brainAdapter.js — THE BRAIN SOCKET
 * 
 * This is the ONLY seam through which cognition is attached.
 * It exports exactly one function: think(envelope)
 * 
 * Currently: ABSENT by design. Returns NOT_IMPLEMENTED for all requests.
 * 
 * When a brain is installed later, this module is replaced.
 * No other code path to cognition may exist.
 */

export async function think(envelope) {
  return {
    status: "NOT_IMPLEMENTED",
    brain: "ABSENT",
    request_id: envelope.request_id,
    output: null,
    reason: "No cognition layer is installed. Body only."
  };
}
```

---

## PART 3 — ACTION DISPATCHER MODULE

Create `src/modules/actionDispatcher.js`:

```js
import { ActionLog } from '@/api/entities';

// The allowlist is EMPTY by directive. Adding entries is a separate directive.
// Do not pre-populate. Do not add a UI control to edit this.
const ACTION_ALLOWLIST = [];

export async function dispatch(actionName, params = {}) {
  const allowed = ACTION_ALLOWLIST.includes(actionName);
  
  if (!allowed) {
    await ActionLog.create({
      timestamp: new Date().toISOString(),
      action_name: actionName,
      params: params,
      outcome: "blocked",
      blocked_reason: "FREEZE_GATE: brain absent, allowlist empty"
    });
    return { outcome: "blocked", reason: "FREEZE_GATE: brain absent, allowlist empty" };
  }
  
  // If we ever get here, the action would execute — but allowlist is empty so we never will.
  await ActionLog.create({
    timestamp: new Date().toISOString(),
    action_name: actionName,
    params: params,
    outcome: "executed",
    blocked_reason: ""
  });
  return { outcome: "executed" };
}

export function getAllowlist() {
  return [...ACTION_ALLOWLIST];
}
```

---

## PART 4 — ORGAN SERVICE MODULE

Create `src/modules/organService.js`:

```js
import { OrganStatus } from '@/api/entities';

// Map of organ names to their canonical status as defined in directive BASE44_001 §4
const ORGAN_REGISTRY = [
  { organ: "EAR",             status: "IMPLEMENTED", notes: "Speech-to-text capture via Web Speech API" },
  { organ: "MOUTH",           status: "IMPLEMENTED", notes: "Text-to-speech output via SpeechSynthesis API" },
  { organ: "EYE",             status: "IMPLEMENTED", notes: "Camera frame capture via getUserMedia, still-frame grab, upload" },
  { organ: "MEMORY",          status: "IMPLEMENTED", notes: "Persistent log of utterances, frames, events" },
  { organ: "PROPRIOCEPTION",  status: "IMPLEMENTED", notes: "Device state: battery, online, orientation, permissions" },
  { organ: "HAND",            status: "IMPLEMENTED", notes: "Action dispatcher with allowlist (allowlist empty)" },
  { organ: "VOICE_GATE",      status: "IMPLEMENTED", notes: "Wake/sleep toggle, mute, listening indicator" },
  { organ: "BRAIN",           status: "ABSENT",      notes: "Cognition — not installed" },
  { organ: "WILL",            status: "ABSENT",      notes: "Goal formation, planning — not installed" },
  { organ: "JUDGMENT",        status: "ABSENT",      notes: "Evaluation, preference, selection — not installed" }
];

// Seed the OrganStatus table if empty
export async function seedOrgansIfEmpty() {
  const existing = await OrganStatus.list();
  if (!existing || existing.length === 0) {
    for (const organ of ORGAN_REGISTRY) {
      await OrganStatus.create({
        organ: organ.organ,
        status: organ.status,
        last_invoked: null,
        notes: organ.notes
      });
    }
  }
}

// Update last_invoked timestamp for an organ
export async function markInvoked(organName) {
  const organs = await OrganStatus.filter({ organ: organName });
  if (organs && organs.length > 0) {
    await OrganStatus.update(organs[0].id, {
      last_invoked: new Date().toISOString()
    });
  }
}
```

---

## PART 5 — CONSOLE PAGE

Create `src/pages/Console.jsx` — this is the body's face.

### Layout (top to bottom):

1. **Header bar**: "GARVIS — BODY CONSOLE" title. No claims of intelligence.
2. **Voice Gate Controls** row:
   - Wake/Sleep toggle button (toggles `awake` state)
   - Mute toggle button (toggles `muted` state)
   - Listening indicator (green dot when actively listening, gray when idle, red when muted)
3. **Camera section**:
   - Live `<video>` preview using `getUserMedia({ video: true })`
   - "Capture Frame" button — grabs a still from the video stream, uploads to storage, creates a `Frame` record
   - "Start Camera" / "Stop Camera" button
4. **Device State Strip** (horizontal row of stat chips):
   - Battery level (from `navigator.getBattery()`)
   - Online/offline status (from `navigator.onLine`)
   - Device orientation (from `DeviceOrientationEvent`)
   - Permissions status (microphone, camera granted/denied)
5. **Running Transcript**:
   - Scrollable list of `Utterance` records for the current session
   - Each entry shows direction icon (← heard, → spoken), text, timestamp, confidence
   - Newest at bottom, auto-scroll
6. **Speak-Back Field**:
   - Text input + "Speak" button
   - On submit: calls `speechSynthesis.speak(new SpeechSynthesisUtterance(text))` (if not muted)
   - Creates `Utterance` record with `direction: "spoken"`
7. **Brain Status Area**:
   - When any organ calls `think()`, the result is displayed here
   - Shows: `BRAIN: ABSENT — no response generated.` (plainly, not apologetically)
   - Shows the `request_id` and `reason` from the brain response

### Behavior:

#### Voice Capture (EAR organ):
- When `awake` is true and `muted` is false, start `SpeechRecognition` (or `webkitSpeechRecognition`)
- Configure: `continuous = true`, `interimResults = true`
- On result: extract transcript + confidence, create `Utterance` record with `direction: "heard"`
- When a result is final, also call `think()` to demonstrate the brain socket (which will return NOT_IMPLEMENTED)
- Mark EAR organ as invoked in `OrganStatus`
- When `awake` is false, stop recognition

#### Speak-Back (MOUTH organ):
- Text input → `SpeechSynthesisUtterance` → `speechSynthesis.speak()`
- Create `Utterance` record with `direction: "spoken"`, `confidence: 1.0`
- Mark MOUTH organ as invoked in `OrganStatus`

#### Camera (EYE organ):
- `getUserMedia({ video: { facingMode: 'user' } })` → attach to `<video>` element
- Capture: draw current video frame to `<canvas>`, convert to blob, upload via Base44 file upload, create `Frame` record with `image_url`
- Mark EYE organ as invoked

#### Device State (PROPRIOCEPTION organ):
- Poll battery via `navigator.getBattery()` every 30 seconds
- Listen to `online`/`offline` events
- Listen to `deviceorientation` event
- Check permissions via `navigator.permissions.query({ name: 'microphone' })` and `{ name: 'camera' }`
- Store to `DeviceState` entity every 30 seconds or on significant change
- Mark PROPRIOCEPTION organ as invoked

#### Brain Call (BRAIN organ — ABSENT):
- When speech input arrives, construct the envelope per §3 of the directive
- Call `think(envelope)` from brainAdapter.js
- Store the result in `BrainCall` entity
- Display the NOT_IMPLEMENTED status in the console
- Mark BRAIN organ as invoked (even though it's ABSENT — it was invoked and returned NOT_IMPLEMENTED)

#### Session ID:
- Generate once on page load: `const sessionId = crypto.randomUUID()`

### Important:
- Use Lucide icons (Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Brain, Battery, Wifi, WifiOff, Activity)
- Use shadcn/ui components (Button, Card, Input, ScrollArea, Badge, Switch)
- Use Tailwind for layout
- The page must work on mobile browsers (responsive, touch-friendly)
- On page mount, call `seedOrgansIfEmpty()` to populate the OrganStatus table

---

## PART 6 — ORGANS PAGE

Create `src/pages/Organs.jsx`:

- Full-width table rendering from `OrganStatus` entity records
- Columns: Organ, Status, Last Invoked, Notes
- Status column shows color-coded badge:
  - IMPLEMENTED = green/blue badge
  - ABSENT = red/gray badge
- The table is populated by reading `OrganStatus.list()` — NOT from a hardcoded array
- On page mount, call `seedOrgansIfEmpty()` to ensure the table exists
- Include a refresh button to re-fetch
- Shows BRAIN, WILL, and JUDGMENT as ABSENT

---

## PART 7 — LOG PAGE

Create `src/pages/Log.jsx`:

- Filterable, tabbed view across four entity types:
  - **Utterance** tab: timestamp, direction, text, confidence, session_id
  - **Frame** tab: timestamp, image_url (as thumbnail), source, session_id, notes
  - **BrainCall** tab: request_id, timestamp, status, envelope (expandable JSON), response (expandable JSON)
  - **ActionLog** tab: timestamp, action_name, outcome (badge), blocked_reason, params (expandable JSON)
- Each tab loads its entity records with pagination (limit 50, load more on scroll)
- Default sort: newest first
- A search/filter input on each tab for text search within that entity's fields

---

## PART 8 — SEED DATA

On first load of Console or Organs page, call `seedOrgansIfEmpty()` to create these `OrganStatus` records:

| organ | status | notes |
|---|---|---|
| EAR | IMPLEMENTED | Speech-to-text capture via Web Speech API |
| MOUTH | IMPLEMENTED | Text-to-speech output via SpeechSynthesis API |
| EYE | IMPLEMENTED | Camera frame capture via getUserMedia, still-frame grab, upload |
| MEMORY | IMPLEMENTED | Persistent log of utterances, frames, events |
| PROPRIOCEPTION | IMPLEMENTED | Device state: battery, online, orientation, permissions |
| HAND | IMPLEMENTED | Action dispatcher with allowlist (allowlist empty) |
| VOICE_GATE | IMPLEMENTED | Wake/sleep toggle, mute, listening indicator |
| BRAIN | ABSENT | Cognition — not installed |
| WILL | ABSENT | Goal formation, planning — not installed |
| JUDGMENT | ABSENT | Evaluation, preference, selection — not installed |

All `last_invoked` fields start as null/empty.

---

## PART 9 — NAVIGATION

The app should have a bottom navigation bar (mobile-friendly) or sidebar with three items:
- Console (home / icon: Terminal)
- Organs (icon: Activity or Cpu)
- Log (icon: ScrollText or List)

---

## REMINDER — ACCEPTANCE CRITERIA FROM DIRECTIVE

1. Zero `InvokeLLM` calls in entire codebase
2. Speaking produces stored `Utterance` with `direction: "heard"`
3. Typing in speak field produces audible output + stored `Utterance` with `direction: "spoken"`
4. Camera capture produces stored `Frame` with working `image_url`
5. Reasoning requests produce `BrainCall` with `status: "NOT_IMPLEMENTED"` and `response.output: null`
6. Action requests produce `ActionLog` with `outcome: "blocked"`
7. Organs page shows BRAIN, WILL, JUDGMENT as ABSENT
8. App runs on a phone browser with no desktop dependency
