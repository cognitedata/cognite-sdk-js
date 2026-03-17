#!/usr/bin/env bash
set -euo pipefail

# Execute loop: run Claude Code to implement kanban tasks one by one.
# Picks from todo (then backlog), moves to in-progress, runs Claude to solve, Claude moves to done.
# Git/gh allowed — Claude will implement, test, and commit.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

unset ANTHROPIC_API_KEY

# Ensure kanban board exists
if ! kanban-md board --compact 2>/dev/null; then
  echo "No kanban board. Run ./run-discovery-claude-loop.sh first."
  exit 1
fi

# Extract task ID from compact line (e.g. "#1 [todo/high] Title..." -> 1)
get_next_task_id() {
  # Prefer todo, then backlog; sort by priority desc (high first)
  local result
  result=$(kanban-md list --compact --status todo --sort priority -r -n 1 2>/dev/null)
  if [[ -n "$result" ]]; then
    echo "$result"
    return
  fi
  kanban-md list --compact --status backlog --sort priority -r -n 1 2>/dev/null
}

while true; do
  TASK_LINE=$(get_next_task_id)
  if [[ -z "$TASK_LINE" ]]; then
    echo "No tasks in todo or backlog. Done."
    break
  fi

  # First field is #ID; strip # for use
  TASK_ID="${TASK_LINE%% *}"
  TASK_ID="${TASK_ID#\#}"

  echo "=========================================="
  echo "Picking task #$TASK_ID"
  kanban-md move "$TASK_ID" in-progress

  TASK_DETAILS=$(kanban-md show "$TASK_ID")

  PROMPT="You are implementing a single kanban task for the cognite-sdk-js SDK. Read AGENTS.md for context.

TASK #$TASK_ID:
$TASK_DETAILS

RULES:
- Implement the improvement described in the task. Keep changes minimal and focused.
- Run tests: yarn test (or yarn test in the relevant package if scope is narrow).
- When done, run: kanban-md move $TASK_ID done
- Git: you MAY commit (exactly one commit per task). Add individual files only (never git add . or git add -a). Use feat: or fix: prefix in commit messages.
- Git: you must NEVER push. Do not use git reset. Do not force push.

Complete this task, then stop. Do not pick additional tasks."

  echo "Running Claude on task #$TASK_ID (may take a few minutes)..."
  claude -p \
    --dangerously-skip-permissions \
    --disallowedTools "Bash(git*push*)" \
    --max-turns 50 \
    "$PROMPT"
done
