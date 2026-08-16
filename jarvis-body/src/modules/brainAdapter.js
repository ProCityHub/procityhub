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
