import { ActionLog } from '@/api/entities';

// The allowlist is EMPTY by directive BASE44_001 §7.
// Adding entries is a separate directive. Do not pre-populate.
// Do not add a UI control that lets the allowlist be edited from inside the running app.
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

  // This branch is unreachable while the allowlist is empty.
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
