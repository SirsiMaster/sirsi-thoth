# 𓁟 Thoth

**Persistent Knowledge System for AI-Assisted Development**

[![License: MIT](https://img.shields.io/badge/License-MIT-C8A951?style=flat)](LICENSE)
[![npm](https://img.shields.io/badge/npm-sirsi--thoth-CB3837?style=flat&logo=npm)](https://www.npmjs.com/package/sirsi-thoth)
[![Part of Sirsi Pantheon](https://img.shields.io/badge/Sirsi-Pantheon-1A1A5E?style=flat)](https://github.com/SirsiMaster)

> *"Thoth invents writing so that knowledge survives the death of the scribe."*

---

## The Problem

Large Language Models have **no persistent memory**. Every conversation starts blank. When an AI assistant works on a codebase, it must re-read thousands of lines of source code to rebuild context — wasting tokens, time, and money. The *reasoning* behind decisions is lost between sessions.

This creates a cycle of re-discovery. The AI makes the same mistakes, asks the same questions, and rediscovers the same architecture every time it touches the project.

## The Solution

Thoth is a **three-layer knowledge system** that gives AI assistants structured memory across sessions:

| Layer | File | Purpose | Read When |
|:------|:-----|:--------|:----------|
| **𓁟 Memory** | `.thoth/memory.yaml` | Compressed project state (~100 lines) | Every session, first |
| **𓁟 Journal** | `.thoth/journal.md` | Timestamped reasoning and insights | When WHY matters |
| **𓁟 Artifacts** | `.thoth/artifacts/` | Deep analysis, audits, benchmarks | On-demand by topic |

## Quick Start

### Option 1: CLI (recommended)
```bash
npx thoth-init
```

Auto-detects your project language (Go, TypeScript, Python, Rust, Java), scans architecture, counts source lines, scaffolds `.thoth/`, and **automatically injects Thoth into your AI coding tools** — Cursor, Windsurf, Claude Code, Gemini, and Copilot.

No MCP server. No complex setup. Just a one-line rule that tells the AI: *"read `.thoth/memory.yaml` first."*

Non-interactive mode for CI/scripts:
```bash
npx thoth-init --yes
```

### Option 2: Manual
```bash
mkdir -p .thoth/artifacts
touch .thoth/memory.yaml .thoth/journal.md
```

Then populate `memory.yaml`:
```yaml
# 𓁟 Thoth — Project Memory
# Read this FIRST before any source files.

## Identity
project: my-project
language: TypeScript
version: 1.0.0

## Architecture Quick Reference
# src/           — application source
# tests/         — test suite
# docs/          — documentation

## Critical Design Decisions
# 1. Next.js App Router for server components
# 2. Drizzle ORM for type-safe database access

## Known Limitations
# - No WebSocket support yet
# - OAuth only supports Google provider

## Recent Changes
# 2026-03-22: Initial Thoth setup

## File Map
# .thoth/memory.yaml  — THIS FILE
# .thoth/journal.md   — engineering journal
```

---

## Measured Impact

Benchmarked across 4 real production codebases (428,000+ lines):

| Project | Source Lines | Thoth Lines | Reduction |
|:--------|:------------|:------------|:----------|
| sirsi-anubis (Go) | 14,589 | 85 | **99.4%** |
| assiduous (React) | 160,897 | ~100 | **99.9%** |
| FinalWishes (Next.js) | 96,514 | ~100 | **99.9%** |
| SirsiNexusApp (TS) | 155,817 | ~100 | **99.9%** |
| **Total** | **427,817** | **~385** | **99.9%** |

**In dollar terms** (Claude Sonnet at ~$3/million tokens):
- Without Thoth: ~50,000 tokens per session start = **$0.15/session**
- With Thoth: ~1,000 tokens = **$0.003/session**
- **50× cost reduction** on initial context loading

---

## How It Works

### Layer 1: Memory (WHAT)
```
.thoth/memory.yaml
  ├─ Project identity, version, stats
  ├─ Architecture quick reference
  ├─ Critical design decisions (numbered, with rationale)
  ├─ Known limitations (what's broken, what's incomplete)
  ├─ Recent changes (most recent first)
  └─ File map of important paths
  → ~100 lines. Replaces reading 10,000+ lines of source.
```

### Layer 2: Journal (WHY)
```
.thoth/journal.md
  ├─ Timestamped decision entries
  ├─ Context that triggered each decision
  ├─ Alternatives considered
  ├─ Results and outcomes
  └─ Meta-observations and patterns
  → Running commentary. Institutional knowledge.
```

### Layer 3: Artifacts (DEEP)
```
.thoth/artifacts/
  ├─ Benchmark results
  ├─ Platform audits
  ├─ Security reviews
  ├─ Design documents
  └─ Historical walkthroughs
  → Reference material. Read when diving deep.
```

---

### Automatic (via `npx thoth-init`)
`thoth-init` detects which tools you use and creates or updates the right rules file:

| Tool | File | What happens |
|:-----|:-----|:-------------|
| **Cursor** | `.cursorrules` | Created or appended |
| **Windsurf** | `.windsurfrules` | Created or appended |
| **Claude Code** | `CLAUDE.md` + `.agent/workflows/session-start.md` | Created or appended |
| **Gemini** | `.gemini/style.md` | Created or appended |
| **Copilot** | `.github/copilot-instructions.md` | Created or appended |

If the file already exists, Thoth appends its instruction. If it doesn't, Thoth creates it. If Thoth is already present, it skips. Idempotent and non-destructive.

### Manual
For any AI tool that reads a rules or system prompt file, add this:
```
At the start of every conversation, read .thoth/memory.yaml before reading any source files.
This file is the project's compressed state (~100 lines) and replaces reading thousands of lines of code.
When reasoning matters, also read .thoth/journal.md for decision history.
After making significant changes, update both files.
```

### Advanced: MCP Server

Thoth ships its own MCP server with 5 tools. Start it with `thoth-mcp` and configure your IDE:

```json
{ "mcpServers": { "thoth": { "command": "thoth-mcp" } } }
```

**MCP Tools:** `thoth_read_memory`, `thoth_read_journal`, `thoth_sync`, `thoth_compact`, `thoth_status`

---

## Part of Sirsi Pantheon

Thoth is standalone — but it's part of [Sirsi Pantheon](https://sirsi.ai/pantheon), an infrastructure intelligence platform with 12 modules. Each module owns one domain.

| Deity | Domain |
|:------|:-------|
| **𓁟 Thoth** | System-level persistent memory — *this repo* |
| **𓃣 Anubis** | Infrastructure hygiene, ghost detection, dedup |
| **𓆄 Ma'at** | Quality gates, coverage, lint, canon |
| **𓁐 Isis** | Health diagnostics, network safety, remediation |
| **𓂀 Horus** | Code graph, workstation dashboard |
| **𓇽 Seba** | Hardware profiling, topology, fleet discovery |
| **𓁹 Osiris** | Checkpoints, risk assessment |
| **𓁆 Seshat** | Knowledge grafting, cross-platform sync |
| **𓁯 Net** | Scope weaving, ADR alignment |
| **𓇶 Ra** | Fleet orchestration, enterprise policy |
| **⚡ RTK** | Output filtering, token reduction |
| **🏛️ Vault** | Context sandbox, FTS5 code search |

Install the full Pantheon: `brew tap SirsiMaster/tools && brew install sirsi-pantheon`

Thoth works independently. It's just files — YAML and Markdown. Any AI assistant that can read files can use Thoth.

---

## Philosophy

1. **Memory is cheaper than re-discovery.** 100 lines of structured YAML saves reading 10,000+ lines of source.
2. **Reasoning outlives the decision.** The Journal captures WHY, not just WHAT.
3. **Depth on demand.** Not every session needs benchmark data. Artifacts exist for when you need to go deep.
4. **The AI is the scribe.** After every significant change, the AI updates Memory and writes a Journal entry.
5. **Human-readable, AI-optimized.** YAML and Markdown — readable by both humans and LLMs. No proprietary formats.
6. **Zero dependencies.** No CLI required. No server required. Just files in your repo.

---

## License

MIT License — free and open source. Use Thoth in any project, commercial or otherwise.

## Origin

Thoth was developed during the [Sirsi Pantheon](https://github.com/SirsiMaster/sirsi-pantheon) project (March 2026) when AI assistants were spending ~80% of their context window re-reading unchanged source files. The three-layer system cut session startup context by 98%+ across 4 production codebases totaling 428,000 lines of code.

Named after the Egyptian god of knowledge, writing, and wisdom — the keeper of all records and inventor of hieroglyphics.

---

*𓁟 Knowledge that survives the death of the scribe.*
