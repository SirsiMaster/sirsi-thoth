# 𓁟 Thoth

**Persistent Knowledge System for AI-Assisted Development**

[![License: MIT](https://img.shields.io/badge/License-MIT-C8A951?style=flat)](LICENSE)
[![npm](https://img.shields.io/badge/npm-thoth--init-CB3837?style=flat&logo=npm)](https://www.npmjs.com/package/thoth-init)
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

Auto-detects your project language (Go, TypeScript, Python, Rust, Java), scans architecture, counts source lines, and scaffolds `.thoth/` with a starter memory file.

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

## AI Workflow Integration

### Claude Code / Antigravity
Add to `.agent/workflows/session-start.md`:
```markdown
## Step 1: Read Thoth memory (ALWAYS)
Read .thoth/memory.yaml first. This gives you full project context.

## Step 2: Read journal (when reasoning matters)
Read .thoth/journal.md for decision history.
```

### Cursor / Windsurf
Add to `.cursorrules` or `.windsurfrules`:
```
At the start of every conversation, read .thoth/memory.yaml before reading any source files.
This file contains the compressed project state and replaces reading thousands of lines of code.
```

### Gemini / .gemini rules
Add to `.gemini/rules.md`:
```
ALWAYS read .thoth/memory.yaml at the start of every session.
This is the project's persistent memory — architecture, decisions, limitations.
```

### MCP Integration (via Anubis)
When running with [Sirsi Anubis](https://github.com/SirsiMaster/sirsi-anubis), Thoth is exposed as an MCP tool:
```json
{
  "name": "thoth_read_memory",
  "description": "Read the project's Thoth memory file for instant context"
}
```

AI IDEs can call this tool at session start to automatically load project context.

---

## Part of the Sirsi Pantheon

Thoth is an independent, standalone tool — but it's part of a family of Egyptian-themed developer tools by [Sirsi Technologies](https://github.com/SirsiMaster):

| Deity | Tool | Domain |
|:------|:-----|:-------|
| **𓁟 Thoth** | **sirsi-thoth** | AI persistent memory — *this repo* |
| **𓂀 Anubis** | [sirsi-anubis](https://github.com/SirsiMaster/sirsi-anubis) | Infrastructure hygiene — weigh, judge, purify |
| **☀️ Ra** | *coming via SirsiNexus* | Enterprise fleet hygiene + policy enforcement |

Thoth works without Anubis. It's just files — YAML and Markdown. Any AI assistant that can read files can use Thoth. The Anubis MCP integration is a convenience layer, not a dependency.

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

Thoth was developed during the [Sirsi Anubis](https://github.com/SirsiMaster/sirsi-anubis) project (March 2026) when AI assistants were spending ~80% of their context window re-reading unchanged source files. The three-layer system cut session startup context by 98%+ across 4 production codebases totaling 428,000 lines of code.

Named after the Egyptian god of knowledge, writing, and wisdom — the keeper of all records and inventor of hieroglyphics.

---

*𓁟 Knowledge that survives the death of the scribe.*
