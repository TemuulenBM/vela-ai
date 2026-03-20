#!/bin/bash
INPUT=$(cat)

# Prevent infinite loop — if stop hook already active, skip
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

echo "⚠️ STOP CHECK — Before finishing, verify:
1. VERIFICATION: If you wrote/changed code, did you run tests or demonstrate it works?
2. LESSONS: If the user corrected your work, did you update tasks/lessons.md?
3. ELEGANCE: For non-trivial changes, is the solution clean and not hacky?

If any of these are missing, complete them now before finishing."
exit 0
