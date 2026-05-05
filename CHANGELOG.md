# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-05-05

### Added
- `thoth-mcp` — standalone MCP server (JSON-RPC 2.0 over stdio) with 5 tools
- `thoth-sync` — CLI command to sync memory.yaml and journal.md from filesystem + git
- `thoth-compact` — CLI command to persist session decisions before context compression
- `lib/detect.js` — project detection for Go, TypeScript, Python, Rust, Java, Swift
- `lib/sync.js` — memory sync engine (ported from Pantheon's Go implementation)
- `lib/compact.js` — session compact + journal pruning (ported from Go)
- `lib/mcp-server.js` — MCP protocol handler serving 5 tools

### Changed
- Package renamed: `thoth-init` → `sirsi-thoth`
- Package is now the canonical Thoth implementation (Pantheon delegates to it)
- Updated deity table to full 12-module Pantheon roster

### MCP Tools
- `thoth_read_memory` — read .thoth/memory.yaml + recent journal entries
- `thoth_read_journal` — read engineering journal with optional last-N filter
- `thoth_sync` — trigger memory + journal sync
- `thoth_compact` — persist decisions before context compression
- `thoth_status` — check .thoth/ health, freshness, token estimates

## [1.0.0] — 2026-03-22

### Added
- `thoth-init` — interactive project scaffolder (`npx thoth-init`)
- Three-layer knowledge system: memory.yaml, journal.md, artifacts/
- Auto-detection for Go, TypeScript/JavaScript, Python, Rust
- IDE injection: Cursor, Windsurf, Claude Code, Gemini, Copilot
- Claude Code session workflow (.agent/workflows/session-start.md)
- Non-interactive mode (`--yes` flag)
