# Contributing to ProCityHub

## Genesis X Brain

The Genesis X model is a falsification harness, not a production system. Contributions should maintain the epistemic boundaries:

1. **Do not** add claims of AGI, consciousness, or new physics.
2. **Do not** remove or weaken the `EpistemicBoundary` dataclass.
3. **Do** add test coverage for any new mathematical function.
4. **Do** keep the self-test passing on all supported Python versions.

## JARVIS Body

The body-without-brain architecture is governed by Directive BASE44_001. Contributions to the body must:

1. **Never** add `InvokeLLM` or any LLM call.
2. **Never** add hardcoded canned responses.
3. **Never** bypass `brainAdapter.js` as the sole cognition seam.
4. **Never** pre-populate the action allowlist.
5. **Do** render organ status from the `OrganStatus` entity, not from hardcoded lists.

## Pull Requests

- Keep commits atomic.
- Reference the directive number in commit messages (e.g., `BASE44_001: add EAR organ`).
- Tests must pass on Python 3.9–3.12.
