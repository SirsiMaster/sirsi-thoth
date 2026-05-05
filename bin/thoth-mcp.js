#!/usr/bin/env node
// 𓁟 thoth-mcp — Start the Thoth MCP server (JSON-RPC 2.0 over stdio)
// Usage: thoth-mcp
// Configure in your IDE: { "mcpServers": { "thoth": { "command": "thoth-mcp" } } }

require('../lib/mcp-server').run();
