# CLAUDE.md — AI Influencer Generate

## Project Overview

AI Influencer content generation platform — automated pipeline for creating AI-generated influencer content (images, videos, captions, schedules).

## Tech Stack

<!-- Update this section once stack is confirmed -->
- TBD (detect from first implementation task)

## Development Workflow

This project uses the **claude-code-harness** Plan → Work → Review cycle.

1. **Plan**: `/harness-plan` — break down tasks into Plans.md
2. **Work**: `/harness-work` — implement tasks autonomously
3. **Review**: `/harness-review` — quality and security review
4. **Sync**: `/harness-sync` — verify alignment between plan and implementation

## Key Commands

| Command | Purpose |
|---------|---------|
| `/harness-plan` | Add tasks to Plans.md |
| `/harness-work` | Implement tasks from Plans.md |
| `/harness-review` | Review code quality |
| `/harness-sync` | Check plan vs. implementation drift |

## Project Structure

```
.
├── CLAUDE.md         # This file
├── Plans.md          # Task backlog
├── .claude/
│   ├── settings.json # Claude Code permissions
│   └── agent-memory/ # Agent persistent memory
└── src/              # Source code (TBD)
```

## Memory / SSOT

- `.claude/agent-memory/decisions.md` — architectural decisions
- `.claude/agent-memory/patterns.md` — reusable patterns
