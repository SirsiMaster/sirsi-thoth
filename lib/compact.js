// 𓁟 Thoth — Compact Engine
// Ported from internal/thoth/compact.go

const fs = require('fs');
const path = require('path');
const { findLastEntryNumber } = require('./sync');

const SESSION_DECISIONS_HEADER = '## Session Decisions';
const DEFAULT_MAX_KEEP = 20;

function compact(repoRoot, summary, opts = {}) {
    if (!summary || !summary.trim()) throw new Error('thoth compact: summary required');

    const thothDir = path.join(repoRoot, '.thoth');
    if (!fs.existsSync(thothDir)) throw new Error('thoth compact: .thoth directory not found — run thoth-init first');

    const memoryPath = path.join(thothDir, 'memory.yaml');
    const journalPath = path.join(thothDir, 'journal.md');

    appendSessionDecisions(memoryPath, summary);
    appendCompactEntry(journalPath, summary);

    const maxAge = opts.maxAge || 0;
    let maxKeep = opts.maxKeep || 0;
    if (maxAge === 0 && maxKeep === 0) maxKeep = DEFAULT_MAX_KEEP;
    if (maxAge > 0 || maxKeep > 0) {
        pruneJournal(repoRoot, { maxAge, maxKeep });
    }
}

function appendSessionDecisions(memoryPath, summary) {
    let content = fs.readFileSync(memoryPath, 'utf8');
    const datestamp = new Date().toISOString().split('T')[0];

    const lines = summary.trim().split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => l.replace(/^- /, ''))
        .map(l => `# ${datestamp}: ${l}`);

    const newContent = lines.join('\n');

    if (content.includes(SESSION_DECISIONS_HEADER)) {
        const idx = content.indexOf(SESSION_DECISIONS_HEADER);
        const afterHeader = idx + SESSION_DECISIONS_HEADER.length;
        content = content.slice(0, afterHeader) + '\n' + newContent + content.slice(afterHeader);
    } else {
        content = content.trimEnd() + '\n\n' + SESSION_DECISIONS_HEADER + '\n' + newContent + '\n';
    }

    fs.writeFileSync(memoryPath, content);
}

function appendCompactEntry(journalPath, summary) {
    const entryNum = findLastEntryNumber(journalPath) + 1;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].slice(0, 5);

    let entry = `\n## Entry ${String(entryNum).padStart(3, '0')} — ${date} ${time} — Session Compact (COMPACT)\n\n`;
    entry += '> Persisted via `thoth compact` before context compression.\n\n';
    entry += '**Decisions**:\n';

    for (const line of summary.trim().split('\n')) {
        const l = line.trim();
        if (l) entry += `- ${l.replace(/^- /, '')}\n`;
    }
    entry += '\n---\n';

    fs.appendFileSync(journalPath, entry);
}

function pruneJournal(repoRoot, opts = {}) {
    const journalPath = path.join(repoRoot, '.thoth', 'journal.md');
    if (!fs.existsSync(journalPath)) return 0;

    const content = fs.readFileSync(journalPath, 'utf8');

    const firstEntry = content.match(/^## Entry \d+/m);
    if (!firstEntry) return 0;

    const header = content.slice(0, firstEntry.index);
    const entriesSection = content.slice(firstEntry.index);

    const entryRegex = /## Entry (\d+) — (\d{4}-\d{2}-\d{2})/g;
    const entryStarts = [];
    let m;
    while ((m = entryRegex.exec(entriesSection)) !== null) {
        entryStarts.push({ index: m.index, num: parseInt(m[1]), date: new Date(m[2]) });
    }

    if (entryStarts.length === 0) return 0;

    const entries = entryStarts.map((e, i) => ({
        ...e,
        text: entriesSection.slice(e.index, i + 1 < entryStarts.length ? entryStarts[i + 1].index : undefined),
    }));

    const now = new Date();
    let kept = entries;
    let removed = 0;

    if (opts.maxAge > 0) {
        const cutoff = new Date(now.getTime() - opts.maxAge * 24 * 60 * 60 * 1000);
        const before = kept.length;
        kept = kept.filter(e => e.date >= cutoff);
        removed += before - kept.length;
    }

    if (opts.maxKeep > 0 && kept.length > opts.maxKeep) {
        const excess = kept.length - opts.maxKeep;
        removed += excess;
        kept = kept.slice(excess);
    }

    if (removed === 0) return 0;

    fs.writeFileSync(journalPath, header + kept.map(e => e.text).join(''));
    return removed;
}

module.exports = { compact, pruneJournal };
