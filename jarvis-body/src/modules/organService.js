import { OrganStatus } from '@/api/entities';

// Canonical organ registry per directive BASE44_001 §4
const ORGAN_REGISTRY = [
  { organ: "EAR",            status: "IMPLEMENTED", notes: "Speech-to-text capture via Web Speech API" },
  { organ: "MOUTH",          status: "IMPLEMENTED", notes: "Text-to-speech output via SpeechSynthesis API" },
  { organ: "EYE",            status: "IMPLEMENTED", notes: "Camera frame capture via getUserMedia, still-frame grab, upload" },
  { organ: "MEMORY",         status: "IMPLEMENTED", notes: "Persistent log of utterances, frames, events" },
  { organ: "PROPRIOCEPTION", status: "IMPLEMENTED", notes: "Device state: battery, online, orientation, permissions" },
  { organ: "HAND",           status: "IMPLEMENTED", notes: "Action dispatcher with allowlist (allowlist empty)" },
  { organ: "VOICE_GATE",     status: "IMPLEMENTED", notes: "Wake/sleep toggle, mute, listening indicator" },
  { organ: "BRAIN",          status: "ABSENT",      notes: "Cognition — not installed" },
  { organ: "WILL",           status: "ABSENT",      notes: "Goal formation, planning — not installed" },
  { organ: "JUDGMENT",       status: "ABSENT",      notes: "Evaluation, preference, selection — not installed" }
];

// Seed the OrganStatus table if empty. Called on page mount.
export async function seedOrgansIfEmpty() {
  try {
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
  } catch (e) {
    console.error("Failed to seed organs:", e);
  }
}

// Update last_invoked timestamp for a named organ
export async function markInvoked(organName) {
  try {
    const organs = await OrganStatus.filter({ organ: organName });
    if (organs && organs.length > 0) {
      await OrganStatus.update(organs[0].id, {
        last_invoked: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error(`Failed to mark ${organName} invoked:`, e);
  }
}
