#!/usr/bin/env node
// 𓁟 thoth-compact — Persist session decisions before context compression
// Usage: thoth-compact -s "Use interface providers for Ka"
// Usage: echo "decision text" | thoth-compact

const fs = require('fs');
const path = require('path');
const { compact } = require('../lib/compact');

const args = process.argv.slice(2);
const summaryIdx = args.indexOf('-s');
let summary = summaryIdx >= 0 && args[summaryIdx + 1] ? args[summaryIdx + 1] : '';

// Find repo root
let root = process.cwd();
while (!fs.existsSync(path.join(root, '.thoth'))) {
    const parent = path.dirname(root);
    if (parent === root) { console.error('No .thoth/ found. Run thoth-init first.'); process.exit(1); }
    root = parent;
}

if (!summary && !process.stdin.isTTY) {
    // Read from stdin
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
        run(root, data.trim());
    });
} else if (summary) {
    run(root, summary);
} else {
    console.error('Usage: thoth-compact -s "decisions..." or pipe via stdin');
    process.exit(1);
}

function run(repoRoot, text) {
    try {
        console.log(`𓁟 Thoth Compact — ${repoRoot}`);
        compact(repoRoot, text);
        console.log('  𓆄 Session decisions persisted to .thoth/');
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}
