# Project Agent Guidelines: x-kindel-interface

<!--
This file defines the project-level agent instructions and operating guidelines for x-kindel-interface.
It aligns all autonomous and assistive agents (AGY, OpenCode, Claude/Copilot) with the repository's
architecture, tools, research workflows, and execution environments.
-->

## 1. Project Overview & Philosophy

`x-kindel-interface` is an exploratory research and development project building an e-ink and Kindle-friendly interface for browsing X (Twitter).
- **Core Product Objective**:
  - Page-by-page tweet navigation (paginated deck, zero continuous scroll).
  - Optimized for Kindle e-ink display constraints: high contrast, readable typography, generous spacing, and minimal partial DOM updates/screen flashing.
- **R&D Code Quality**:
  - No backward-compatibility burden: keep the codebase clean, lean, and modern.
  - One clear way: always design and expose a single, direct, unambiguous way to accomplish each task.
  - Local-first & isolated: all agent configurations, skills, and memory remain repository-local. Never depend on machine-global or user-level state.

---

## 2. Core Coding Principles

Every agent operating in this repository must strictly adhere to the following principles:

1. **Context Headers**: Every code file must begin with 3–4 lines of commentary explaining how the file fits into the broader system architecture and workflow.
2. **Outside-In Clarity**: Code is a medium of human communication. Structure, types, and identifiers must unambiguously explain what is happening to someone encountering the file for the first time.
3. **Strict Uniformity of Names**: One concept, one name. Maintain identical naming across services, helpers, tests, and CLI entry points. Never introduce synonyms for existing domain concepts.
4. **Gentle, Minimal Diff Refactoring**: Modify code with care. Never refactor or rewrite files or patterns outside the explicit scope of the task.
5. **Simplicity Over Cleverness**: Code must be straightforward and elegant. Avoid tricks, implicit magic, and clever workarounds.
6. **Live Execution & Observability (Ground Truth)**:
   - **Never use hardcoded mock data** in exploration scripts, notebooks, or evaluation loops.
   - All transformations must run through real code paths, live models/APIs, and authentic inputs.
7. **Integration & CLI Over Unit Tests**:
   - Prioritize verification via live CLI runs, interactive tool calls, and end-to-end integration flows.
   - Do not generate isolated, trivial unit tests (`pytest`/`unittest`) unless specifically instructed.
8. **Always Verify Assembled Code**: When a feature or script is assembled, execute and verify it before proceeding or concluding.

---

## 3. Code-as-Tools Paradigm

In research and exploration, write modular, composable tools rather than rigid single-purpose pipelines:

- **Functions as Tools**: Each function must do one meaningful unit of work, receive explicit arguments, and return concrete Python/JSON objects (never printed text or exit codes).
- **Dual Paradigm**:
  - **Notebooks (`.ipynb`) for Humans**: Provide narrative markdown, self-contained setups, rich visual representations, and step-by-step intuition.
  - **REPL / CLI for Agents**: Provide thin command interfaces and importable functions allowing agents to inspect in-memory variables and drive evaluations directly.
- **Load-Bearing Documentation**: Document every tool thoroughly:
  - Exact purpose and usage context (**when to reach for it**).
  - Parameter definitions and units.
  - Return structure.
  - Known assumptions and edge cases it explicitly does *not* handle.
- **Thin Composition**: Scripts and workflows should read like high-level experiment descriptions that compose existing tools.
- **Stage-by-Stage Visualization**: Provide dedicated visual helpers for core stages (HTML diffs, ANSI terminals, or comparison tables).

---

## 4. Repository & Directory Conventions

- **Agent Guidelines**: This file (`AGENTS.md`) is the canonical, repository-level guidelines file.
- **Skills**: Source skills live in `.agents/skills/<skill-name>/SKILL.md`.
- **MCP Servers**: Project-local MCP servers and scripts live beside their respective skills (e.g. `.agents/skills/<skill-name>/mcp-server.py`).
- **Experiments**:
  - `experiments/readme.md`: Master index cataloging all experiments with concise summaries.
  - `experiments/<topic>/index.md`: Topic overview, hypotheses, and logs.
  - `experiments/<topic>/<experiment_name>.md`: Detailed run log, measurements, and conclusions.
- **Secrets Management**: Never commit API keys or credentials. Use environment variables loaded at runtime or placeholders like `<set-outside-git>`.

---

## 5. Environment & Execution Guidelines

- **WSL2 Environment**: The system runs under Linux (Ubuntu WSL2) without GPU acceleration (`--disable-gpu`).
- **Browser Automation (`/browser`)**:
  - Headless Chrome is located at `~/.local/bin/google-chrome` (with supporting shared libraries in `~/.local/lib/chrome-libs/`).
  - Remote debugging is active on port `9222`.
  - The DevTools port file is maintained at `~/.config/google-chrome/DevToolsActivePort`.
  - Service management script: `.agents/skills/wsl-headless-browser/scripts/launch-chrome.sh {start|stop|status}`.
