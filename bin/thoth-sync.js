#!/usr/bin/env node
// 𓁟 thoth-sync — Sync .thoth/memory.yaml and journal.md
// Usage: thoth-sync [--since "48 hours ago"]

const path = require('path');
const { sync, syncJournal } = require('../lib/sync');

const args = process.argv.slice(2);
const sinceIdx = args.indexOf('--since');
const since = sinceIdx >= 0 && args[sinceIdx + 1] ? args[sinceIdx + 1] : '24 hours ago';

// Find repo root by walking up from cwd
const fs = require('fs');
let root = process.cwd();
while (!fs.existsSync(path.join(root, '.thoth'))) {
    const parent = path.dirname(root);
    if (parent === root) { console.error('No .thoth/ found. Run thoth-init first.'); process.exit(1); }
    root = parent;
}

try {
    console.log(`𓁟 Thoth Sync — ${root}`);
    const facts = sync(root);
    const commits = syncJournal(root, since);
    console.log(`  Memory updated: modules=${facts.moduleCount} tests=${facts.testCount} lines=~${facts.lineCount}`);
    if (commits > 0) console.log(`  Journal: ${commits} commits processed`);
    console.log('  𓆄 Memory synced.');
} catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}
