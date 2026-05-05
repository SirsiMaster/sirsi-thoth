// 𓁟 Thoth MCP Server — JSON-RPC 2.0 over stdio
// Standalone MCP server for AI IDE integration.
// Serves: thoth_read_memory, thoth_sync, thoth_compact, thoth_status

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { sync, syncJournal } = require('./sync');
const { compact } = require('./compact');
const { readSafe } = require('./detect');

const SERVER_NAME = 'sirsi-thoth';
const SERVER_VERSION = require('../package.json').version;

const TOOLS = [
    {
        name: 'thoth_read_memory',
        description: "Read the project's .thoth/memory.yaml for instant context. Call this at conversation start to understand the project without reading source files. Returns architecture, decisions, stats, and file map.",
        inputSchema: {
            type: 'object',
            properties: {
                project_path: { type: 'string', description: 'Absolute path to the project root. Defaults to cwd.' },
            },
        },
    },
    {
        name: 'thoth_read_journal',
        description: "Read the engineering journal (.thoth/journal.md). Contains timestamped decision entries — the WHY behind every decision.",
        inputSchema: {
            type: 'object',
            properties: {
                project_path: { type: 'string', description: 'Absolute path to the project root. Defaults to cwd.' },
                last_n: { type: 'number', description: 'Return only the last N entries. Defaults to all.' },
            },
        },
    },
    {
        name: 'thoth_sync',
        description: "Sync project memory — discovers codebase facts (module count, test count, line count) and appends recent git commits to the engineering journal.",
        inputSchema: {
            type: 'object',
            properties: {
                project_path: { type: 'string', description: 'Absolute path to the project root. Defaults to cwd.' },
                since: { type: 'string', description: 'Git log timeframe for journal sync. Defaults to "24 hours ago".' },
            },
        },
    },
    {
        name: 'thoth_compact',
        description: "Persist session decisions before context compression. Appends decisions to memory.yaml and creates a journal entry.",
        inputSchema: {
            type: 'object',
            properties: {
                project_path: { type: 'string', description: 'Absolute path to the project root. Defaults to cwd.' },
                summary: { type: 'string', description: 'Session decisions to persist (one per line).' },
            },
            required: ['summary'],
        },
    },
    {
        name: 'thoth_status',
        description: "Check Thoth memory health — existence of .thoth/ files, last sync date, entry count, token estimate.",
        inputSchema: {
            type: 'object',
            properties: {
                project_path: { type: 'string', description: 'Absolute path to the project root. Defaults to cwd.' },
            },
        },
    },
];

function resolveRoot(projectPath) {
    if (projectPath) return path.resolve(projectPath);
    // Walk up from cwd looking for .thoth/
    let dir = process.cwd();
    while (true) {
        if (fs.existsSync(path.join(dir, '.thoth'))) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return process.cwd();
}

function handleTool(name, args) {
    const root = resolveRoot(args.project_path);

    switch (name) {
        case 'thoth_read_memory': {
            const memory = readSafe(path.join(root, '.thoth', 'memory.yaml'));
            if (!memory) return textResult('No .thoth/memory.yaml found. Run `npx thoth-init` to create one.', true);
            let result = `# Project Memory (${root})\n\n${memory}`;
            const journal = readSafe(path.join(root, '.thoth', 'journal.md'));
            if (journal) {
                // Include last 2 entries for context
                const entries = journal.split(/(?=^## Entry)/m);
                const last = entries.slice(-3).join('');
                result += `\n\n# Recent Journal Entries\n\n${last}`;
            }
            return textResult(result, false);
        }

        case 'thoth_read_journal': {
            const journal = readSafe(path.join(root, '.thoth', 'journal.md'));
            if (!journal) return textResult('No .thoth/journal.md found.', true);
            if (args.last_n) {
                const entries = journal.split(/(?=^## Entry)/m);
                const header = entries[0];
                const lastN = entries.slice(-args.last_n);
                return textResult(header + lastN.join(''), false);
            }
            return textResult(journal, false);
        }

        case 'thoth_sync': {
            try {
                const facts = sync(root);
                const commits = syncJournal(root, args.since || '24 hours ago');
                return textResult(`Thoth sync complete.\n- Memory updated: ${root}/.thoth/memory.yaml\n- Journal: ${commits} commits processed\n- Modules: ${facts.moduleCount}, Tests: ${facts.testCount}, Lines: ~${facts.lineCount}`, false);
            } catch (err) {
                return textResult(`Thoth sync failed: ${err.message}`, true);
            }
        }

        case 'thoth_compact': {
            try {
                compact(root, args.summary);
                return textResult(`Session decisions persisted to ${root}/.thoth/`, false);
            } catch (err) {
                return textResult(`Thoth compact failed: ${err.message}`, true);
            }
        }

        case 'thoth_status': {
            const thothDir = path.join(root, '.thoth');
            const exists = fs.existsSync(thothDir);
            if (!exists) return textResult(`No .thoth/ directory at ${root}. Run \`npx thoth-init\` to create one.`, true);

            const memory = readSafe(path.join(thothDir, 'memory.yaml'));
            const journal = readSafe(path.join(thothDir, 'journal.md'));
            const memoryLines = memory ? memory.split('\n').length : 0;
            const journalEntries = journal ? (journal.match(/^## Entry/gm) || []).length : 0;
            const lastUpdated = memory ? (memory.match(/# Last updated: (.+)/)?.[1] || 'unknown') : 'unknown';
            const hasArtifacts = fs.existsSync(path.join(thothDir, 'artifacts'));

            let status = `𓁟 Thoth Status — ${root}\n\n`;
            status += `Memory:    ${memoryLines} lines (${memory ? 'OK' : 'MISSING'})\n`;
            status += `Journal:   ${journalEntries} entries (${journal ? 'OK' : 'MISSING'})\n`;
            status += `Artifacts: ${hasArtifacts ? 'OK' : 'MISSING'}\n`;
            status += `Last sync: ${lastUpdated}\n`;
            status += `Est. tokens: ~${Math.round(memoryLines * 4)} (memory) + ~${Math.round(journalEntries * 200)} (journal)`;

            return textResult(status, false);
        }

        default:
            return textResult(`Unknown tool: ${name}`, true);
    }
}

function textResult(text, isError) {
    return { content: [{ type: 'text', text }], isError: isError || false };
}

// ── JSON-RPC 2.0 stdio transport ──
function run() {
    const rl = readline.createInterface({ input: process.stdin, terminal: false });
    let buffer = '';

    process.stderr.write(`${SERVER_NAME} v${SERVER_VERSION} MCP server started (stdio)\n`);

    rl.on('line', (line) => {
        buffer += line;
        let msg;
        try { msg = JSON.parse(buffer); } catch { return; } // incomplete JSON, accumulate
        buffer = '';

        const response = handleMessage(msg);
        if (response) {
            process.stdout.write(JSON.stringify(response) + '\n');
        }
    });

    rl.on('close', () => process.exit(0));
}

function handleMessage(msg) {
    const { id, method, params } = msg;

    switch (method) {
        case 'initialize':
            return jsonrpc(id, {
                protocolVersion: '2024-11-05',
                capabilities: { tools: {} },
                serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            });

        case 'notifications/initialized':
            return null; // no response needed

        case 'tools/list':
            return jsonrpc(id, { tools: TOOLS });

        case 'tools/call': {
            const { name, arguments: args } = params || {};
            try {
                const result = handleTool(name, args || {});
                return jsonrpc(id, result);
            } catch (err) {
                return jsonrpc(id, textResult(`Error: ${err.message}`, true));
            }
        }

        case 'ping':
            return jsonrpc(id, {});

        default:
            if (id !== undefined) {
                return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
            }
            return null;
    }
}

function jsonrpc(id, result) {
    return { jsonrpc: '2.0', id, result };
}

module.exports = { run, handleTool, TOOLS };
